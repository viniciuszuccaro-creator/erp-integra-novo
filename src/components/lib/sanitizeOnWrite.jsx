// Global sanitization utility for form payloads (XSS-safe best-effort)
// + Trava Global de Unicidade (Regra-Mãe §5c: validação dupla em ações sensíveis)
import { base44 } from "@/api/base44Client";
import { ENTITY_CODE_FIELD } from "@/components/cadastros/config/entityCodeFields";

// Entidades que NÃO possuem group_id no schema (catálogos globais)
const NO_SCOPE_STAMP = new Set(['GrupoEmpresarial', 'MoedaIndice']);

// Valores inválidos para descrição/nome
const INVALID_DESC_VALUES = new Set([
  '', ' ', '  ', '.', '-', '_', 'teste', 'test', 'sem nome', 'sem descricao',
  'novo', 'nova', 'n/a', 'na', 'null', 'undefined', 'xxx', '...',
  'novo registro', 'novo cadastro', 'sem descricao',
]);

// Mapeamento entidade → campos de descrição/nome candidatos (ordem de prioridade)
const DESC_FIELDS_BY_ENTITY = {
  Produto: ['descricao', 'descricao_completa'],
  Servico: ['descricao', 'codigo_servico'],
  TabelaPreco: ['nome', 'descricao'],
  UnidadeMedida: ['codigo', 'nome_completo', 'sigla'],
  PlanoDeContas: ['nome_conta', 'codigo'],
  CentroCusto: ['descricao', 'codigo'],
  Banco: ['nome_banco', 'codigo_banco'],
  Veiculo: ['placa'],
  ModeloDocumento: ['nome_modelo', 'tipo_documento'],
  Marca: ['nome_marca'],
  SegmentoCliente: ['nome_segmento', 'descricao'],
  RegiaoAtendimento: ['nome_regiao', 'descricao'],
  GrupoProduto: ['nome_grupo', 'codigo', 'natureza'],
  KitProduto: ['nome_kit', 'codigo', 'descricao'],
  SetorAtividade: ['nome', 'descricao', 'codigo'],
  PerfilAcesso: ['nome_perfil', 'descricao'],
  Cargo: ['nome_cargo', 'codigo'],
  Departamento: ['nome_departamento', 'codigo'],
  Turno: ['nome_turno', 'codigo'],
  CondicaoComercial: ['nome_condicao', 'codigo'],
  Empresa: ['razao_social', 'nome_fantasia'],
  GrupoEmpresarial: ['nome_do_grupo', 'razao_social_grupo', 'cnpj_grupo'],
  TipoFrete: ['nome', 'codigo'],
  LocalEstoque: ['nome', 'codigo', 'tipo'],
  RotaPadrao: ['nome_rota', 'codigo'],
  TipoDespesa: ['nome', 'categoria'],
  MoedaIndice: ['nome', 'codigo'],
  OperadorCaixa: ['usuario_nome', 'codigo_operador'],
  FormaPagamento: ['descricao', 'tipo', 'codigo'],
  TabelaFiscal: ['nome_regra', 'cenario_operacao'],
  CentroResultado: ['nome', 'codigo'],
  ConfiguracaoDespesaRecorrente: ['descricao'],
  ApiExterna: ['nome_api', 'descricao'],
  ChatbotCanal: ['nome_canal', 'descricao'],
  ChatbotIntent: ['nome_intent', 'descricao'],
  JobAgendado: ['nome_job', 'descricao'],
  Webhook: ['nome_webhook', 'descricao'],
  GatewayPagamento: ['nome', 'provedor', 'descricao'],
  EventoNotificacao: ['nome_evento', 'descricao', 'tipo_evento'],
  ConfiguracaoNFe: ['provedor', 'ambiente', 'observacoes', 'descricao'],
  CatalogoWeb: ['produto_id', 'categoria_navegacao'],
  Representante: ['nome'],
  ContatoB2B: ['nome_completo'],
  Motorista: ['nome_completo'],
  Transportadora: ['razao_social'],
  Fornecedor: ['nome', 'razao_social'],
  Cliente: ['nome', 'razao_social'],
  Colaborador: ['nome_completo'],
};

/**
 * Extrai o melhor campo de descrição/nome da entidade do formData.
 * @returns {field, value} ou null
 */
export function getDescricaoField(formData, entityName) {
  const fields = DESC_FIELDS_BY_ENTITY[entityName] ||
    ['nome', 'razao_social', 'descricao', 'nome_marca', 'nome_segmento', 'nome_regiao',
     'nome_perfil', 'nome_banco', 'nome_rota', 'nome_kit', 'nome_setor', 'nome_canal',
     'nome_intent', 'nome_job', 'nome_webhook', 'nome_api', 'nome_gateway', 'sigla',
     'titulo', 'placa', 'codigo'];
  for (const f of fields) {
    if (formData[f] && String(formData[f]).trim()) return { field: f, value: String(formData[f]).trim() };
  }
  return null;
}

/**
 * Valida se a descrição/nome é válida (não vazia, não genérica).
 * @returns mensagem de erro ou null se OK
 */
export function validarDescricao(formData, entityName) {
  const desc = getDescricaoField(formData, entityName);
  if (!desc) return '⚠️ Descrição/Nome é obrigatória. Preencha um nome ou descrição válida antes de salvar.';
  const normalized = desc.value.toLowerCase().trim();
  if (INVALID_DESC_VALUES.has(normalized)) return `⚠️ O valor "${desc.value}" não é uma descrição válida. Use um nome real e significativo.`;
  if (normalized.length < 2) return '⚠️ A descrição deve ter pelo menos 2 caracteres válidos.';
  return null;
}

/**
 * Adiciona escopo multiempresa ao filtro de duplicidade.
 */
function withScope(filter, entityName, groupId, empresaId) {
  const scoped = { ...filter };
  if (NO_SCOPE_STAMP.has(entityName)) return scoped;
  if (groupId) scoped.group_id = groupId;
  else if (empresaId) scoped.empresa_id = empresaId;
  return scoped;
}

/**
 * Busca duplicatas via SDK filter direto (fail-closed: bloqueia se não conseguir verificar).
 * @returns array de duplicatas (excluindo currentId)
 */
async function findDuplicates(entityName, filter, groupId, empresaId, currentId) {
  const scoped = withScope(filter, entityName, groupId, empresaId);
  try {
    const results = await base44.entities[entityName].filter(scoped, 'created_date', 10);
    return (results || []).filter(r => r.id !== currentId);
  } catch (e) {
    throw new Error(`⚠️ Não foi possível verificar duplicidade (${e.message || 'erro desconhecido'}). O salvamento foi bloqueado para evitar duplicatas. Tente novamente em alguns segundos.`);
  }
}

/**
 * TRAVA GLOBAL DE UNICIDADE (Regra-Mãe §5c)
 * Verifica se o registro tem código ou descrição/nome duplicados antes de salvar.
 * Fail-closed: se não conseguir verificar, BLOQUEIA o salvamento.
 *
 * @param {string} entityName - Nome da entidade (ex: 'Produto', 'TabelaPreco')
 * @param {object} formData - Dados do formulário
 * @param {object} opts - { groupId, empresaId, currentId, isEdit }
 * @returns {Promise<string|null>} - mensagem de erro ou null se OK
 */
export async function checkGlobalUniqueness(entityName, formData, { groupId, empresaId, currentId, isEdit } = {}) {
  if (!entityName || !formData) return null;

  // 0. Validar descrição antes de tudo
  const erroDesc = validarDescricao(formData, entityName);
  if (erroDesc) return erroDesc;

  const codeField = ENTITY_CODE_FIELD[entityName] || 'codigo';
  const codeValue = formData[codeField] || formData.codigo || formData.sigla || formData.codigo_banco || null;

  // 1. Verificação por CÓDIGO (codigo, sigla, codigo_banco, etc.)
  if (codeValue && String(codeValue).trim()) {
    const codeStr = String(codeValue).trim();
    const conflitos = await findDuplicates(entityName, { [codeField]: codeStr }, groupId, empresaId, currentId);
    if (conflitos.length > 0) {
      const conflito = conflitos[0];
      const label = conflito.nome || conflito.razao_social || conflito.descricao || conflito.sigla || conflito.id;
      return `⚠️ Código "${codeValue}" já está em uso pelo registro "${label}". Não é permitido duplicar códigos.`;
    }
  }

  // 2. Verificação por PLACA (Veiculo)
  const placaRaw = formData.placa ? String(formData.placa).toUpperCase().trim() : '';
  if (placaRaw.length >= 3) {
    const conflitos = await findDuplicates(entityName, { placa: formData.placa }, groupId, empresaId, currentId);
    if (conflitos.length > 0) {
      return `⚠️ Placa "${placaRaw}" já cadastrada no veículo "${conflitos[0].modelo || conflitos[0].id}". Não é permitido duplicar placas.`;
    }
  }

  // 3. Verificação por CNPJ/CPF (pessoas e empresas)
  const cnpjClean = formData.cnpj ? String(formData.cnpj).replace(/\D/g, '') : '';
  const cpfClean = formData.cpf ? String(formData.cpf).replace(/\D/g, '') : '';
  const fiscalOr = [];
  if (cnpjClean.length >= 14) fiscalOr.push({ cnpj: formData.cnpj });
  if (cpfClean.length >= 11) fiscalOr.push({ cpf: formData.cpf });
  if (fiscalOr.length) {
    const conflitoFilter = fiscalOr.length > 1 ? { $or: fiscalOr } : fiscalOr[0];
    const conflitos = await findDuplicates(entityName, conflitoFilter, groupId, empresaId, currentId);
    if (conflitos.length > 0) {
      const c = conflitos[0];
      const label = c.nome || c.razao_social || c.cnpj || c.id;
      const docType = cnpjClean.length >= 14 ? 'CNPJ' : 'CPF';
      return `⚠️ ${docType} já cadastrado no registro "${label}". Não é permitido duplicar.`;
    }
  }

  // 4. Verificação por NOME/DESCRIÇÃO exato (case-insensitive)
  //    Executada sempre (mesmo com CNPJ/CPF) para Cadastros Gerais — Regra-Mãe: cadastros únicos
  const descInfo = getDescricaoField(formData, entityName);
  if (descInfo) {
    const nomeLimpo = descInfo.value.toLowerCase().trim();
    if (nomeLimpo.length >= 2 && !INVALID_DESC_VALUES.has(nomeLimpo)) {
      const conflitos = await findDuplicates(entityName, {
        [descInfo.field]: { $regex: `^${nomeLimpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }, groupId, empresaId, currentId);
      if (conflitos.length > 0) {
        const c = conflitos[0];
        const label = c.nome || c.razao_social || c.descricao || c.sigla || c.id;
        return `⚠️ Já existe um registro com o nome "${label}". Não é permitido duplicar nomes/descrições.`;
      }
    }
  }

  return null;
}

export function sanitizeOnWrite(input) {
  const cleanString = (s) => {
    let out = String(s);
    out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    out = out.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
    out = out.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
    out = out.replace(/javascript:\s*/gi, '');
    return out.trim();
  };
  const walk = (val) => {
    if (typeof val === 'string') return cleanString(val);
    if (Array.isArray(val)) return val.map(walk);
    if (val && typeof val === 'object') {
      const o = {};
      for (const [k, v] of Object.entries(val)) o[k] = walk(v);
      return o;
    }
    return val;
  };
  return walk(input);
}