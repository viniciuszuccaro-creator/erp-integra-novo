import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ENTITY_CODE_FIELD } from "@/components/cadastros/config/entityCodeFields";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

// Re-exporta para compatibilidade com importadores existentes
export { ENTITY_CODE_FIELD };

// P3 (item 3): valores inválidos para descrição/nome
const INVALID_DESC_VALUES = new Set([
  '', ' ', '  ', '.', '-', '_', 'teste', 'test', 'sem nome', 'sem descricao',
  'novo', 'nova', 'n/a', 'na', 'null', 'undefined', 'xxx', '...',
  'novo registro', 'novo cadastro', 'sem descricao',
]);

// P3 (item 3): extrai o melhor campo de descrição/nome da entidade
function getDescricaoField(formData, ENTITY) {
  const DESC_FIELDS_BY_ENTITY = {
    Produto: ['descricao', 'descricao_completa'],
    Servico: ['descricao'],
    TabelaPreco: ['nome', 'descricao'],
    UnidadeMedida: ['sigla', 'descricao'],
    PlanoDeContas: ['nome_conta', 'nome', 'codigo'],
    CentroCusto: ['descricao', 'codigo'],
    Banco: ['nome_banco', 'codigo_banco'],
    Veiculo: ['placa'],
    ModeloDocumento: ['nome_modelo', 'tipo_documento'],
    Marca: ['nome_marca'],
    SegmentoCliente: ['nome_segmento', 'descricao'],
    RegiaoAtendimento: ['nome_regiao', 'descricao'],
    GrupoProduto: ['nome', 'descricao'],
    KitProduto: ['nome_kit', 'descricao'],
    SetorAtividade: ['nome_setor', 'descricao'],
    PerfilAcesso: ['nome_perfil', 'descricao'],
    Cargo: ['nome_cargo', 'nome', 'descricao'],
    Departamento: ['nome', 'descricao'],
    Turno: ['nome'],
    Empresa: ['razao_social', 'nome_fantasia'],
    GrupoEmpresarial: ['nome', 'descricao'],
    TipoFrete: ['descricao', 'codigo'],
    LocalEstoque: ['nome', 'descricao'],
    RotaPadrao: ['nome_rota', 'descricao'],
    TipoDespesa: ['nome', 'descricao'],
    MoedaIndice: ['sigla', 'descricao'],
    OperadorCaixa: ['nome', 'descricao'],
    FormaPagamento: ['nome', 'descricao'],
    CondicaoComercial: ['nome', 'descricao'],
    TabelaFiscal: ['nome', 'descricao'],
    CentroResultado: ['descricao', 'codigo'],
    ConfiguracaoDespesaRecorrente: ['nome', 'descricao'],
    ApiExterna: ['nome_api', 'descricao'],
    ChatbotCanal: ['nome_canal', 'descricao'],
    ChatbotIntent: ['nome_intent', 'descricao'],
    JobAgendado: ['nome_job', 'descricao'],
    Webhook: ['nome_webhook', 'descricao'],
    GatewayPagamento: ['nome_gateway', 'descricao'],
    EventoNotificacao: ['nome', 'descricao'],
    ConfiguracaoNFe: ['descricao'],
    CatalogoWeb: ['nome', 'descricao'],
    Representante: ['nome'],
    ContatoB2B: ['nome'],
    Motorista: ['nome'],
    Transportadora: ['razao_social'],
    Fornecedor: ['nome', 'razao_social'],
    Cliente: ['nome', 'razao_social'],
    Colaborador: ['nome_completo'],
  };
  const fields = DESC_FIELDS_BY_ENTITY[ENTITY] || ['nome', 'razao_social', 'descricao', 'nome_marca', 'nome_segmento', 'nome_regiao', 'nome_perfil', 'nome_banco', 'nome_rota', 'nome_kit', 'nome_setor', 'nome_canal', 'nome_intent', 'nome_job', 'nome_webhook', 'nome_api', 'nome_gateway', 'sigla', 'titulo', 'placa', 'codigo'];
  for (const f of fields) {
    if (formData[f] && String(formData[f]).trim()) return { field: f, value: String(formData[f]).trim() };
  }
  return null;
}

// P3 (item 3): valida se a descrição é válida (não vazia, não genérica)
function validarDescricao(formData, ENTITY) {
  const desc = getDescricaoField(formData, ENTITY);
  if (!desc) return '⚠️ Descrição/Nome é obrigatória. Preencha um nome ou descrição válida antes de salvar.';
  const normalized = desc.value.toLowerCase().trim();
  if (INVALID_DESC_VALUES.has(normalized)) return `⚠️ O valor "${desc.value}" não é uma descrição válida. Use um nome real e significativo.`;
  if (normalized.length < 2) return '⚠️ A descrição deve ter pelo menos 2 caracteres válidos.';
  return null;
}

// P3: auditoria silenciosa (não bloqueia)
async function auditarAcao({ acao, ENTITY, registroId, empresaId, groupId, dadosAntes, dadosDepois, descricao }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.AuditLog.create({
      acao,
      modulo: 'Cadastros',
      tipo_auditoria: 'entidade',
      entidade: ENTITY,
      registro_id: registroId || null,
      descricao: descricao || `${acao} em ${ENTITY}`,
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      empresa_id: empresaId || null,
      group_id: groupId || null,
      dados_anteriores: dadosAntes || null,
      dados_novos: dadosDepois || null,
      data_hora: new Date().toISOString(),
    });
  } catch { /* auditoria nunca bloqueia */ }
}

export default function useVisualizadorCRUD({
  ENTITY, editItem, empresaId, groupId, isSimple,
  canCreateCadastro, canEditCadastro, canDeleteCadastro,
  createInContext, updateInContext, deleteInContext,
  handleCloseForm, setIsSaving,
  readFilter, setNextCode,
}) {
  const checkDuplicate = useCallback(async (formData, isEdit, currentId) => {
    // P3 (item 3): validar descrição antes de tudo
    const erroDesc = validarDescricao(formData, ENTITY);
    if (erroDesc) return erroDesc;

    const codeField = ENTITY_CODE_FIELD[ENTITY] || 'codigo';
    const codeValue = formData[codeField] || formData.codigo || formData.sigla || formData.codigo_banco || null;

    if (codeValue && String(codeValue).trim()) {
      // P3 (item 4): uniqueness de código — busca GLOBAL (sem restrição de escopo)
      // Duplicatas podem existir em registros legados sem empresa_id/group_id
      const codeStr = String(codeValue).trim();
      const codeFilter = { [codeField]: codeStr };
      try {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY, filter: codeFilter,
          sortField: "created_date", sortDirection: "asc", limit: 10, skip: 0,
        });
        const conflitos = (Array.isArray(res?.data) ? res.data : []).filter(r => r.id !== currentId);
        if (conflitos.length > 0) {
          const conflito = conflitos[0];
          const label = conflito.nome || conflito.razao_social || conflito.descricao || conflito.sigla || conflito.id;
          return `⚠️ Código "${codeValue}" já está em uso pelo registro "${label}". Não é permitido duplicar códigos.`;
        }
      } catch { /* não bloqueia */ }
    }

    // P3 (item 3): verificar duplicidade por NOME/DESCRIÇÃO no mesmo escopo
    // Só verifica nome quando a entidade NÃO tem CNPJ/CPF (nome é o identificador principal)
    const _cnpjRaw = formData.cnpj ? String(formData.cnpj).replace(/\D/g,'') : '';
    const _cpfRaw  = formData.cpf  ? String(formData.cpf).replace(/\D/g,'')  : '';
    const descInfo = getDescricaoField(formData, ENTITY);
    if (descInfo && !_cnpjRaw && !_cpfRaw) {
      const nomeLimpo = descInfo.value.toLowerCase().trim();
      if (nomeLimpo.length >= 2 && !INVALID_DESC_VALUES.has(nomeLimpo)) {
        // Busca GLOBAL (sem restrição de escopo) — duplicatas podem existir em qualquer escopo
        const nameFilter = { [descInfo.field]: { $regex: `^${nomeLimpo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } };
        try {
          const res2 = await base44.functions.invoke("entityListSorted", {
            entityName: ENTITY, filter: nameFilter,
            sortField: "created_date", sortDirection: "asc", limit: 10, skip: 0,
          });
          const conflitos2 = (Array.isArray(res2?.data) ? res2.data : []).filter(r => r.id !== currentId);
          if (conflitos2.length > 0) {
            const label2 = conflitos2[0].nome || conflitos2[0].razao_social || conflitos2[0].descricao || conflitos2[0].sigla || conflitos2[0].id;
            return `⚠️ Já existe um registro com o nome "${label2}". Não é permitido duplicar nomes/descrições.`;
          }
        } catch { /* não bloqueia */ }
      }
    }

    const cnpjClean = _cnpjRaw;
    const cpfClean  = _cpfRaw;
    const fiscalOr  = [];
    if (cnpjClean.length >= 14) fiscalOr.push({ cnpj: formData.cnpj });
    if (cpfClean.length  >= 11) fiscalOr.push({ cpf: formData.cpf });
    if (fiscalOr.length) {
      try {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY, filter: fiscalOr.length > 1 ? { $or: fiscalOr } : fiscalOr[0],
          sortField: "created_date", sortDirection: "asc", limit: 5, skip: 0,
        });
        const conflito = (Array.isArray(res?.data) ? res.data : []).find(r => r.id !== currentId);
        if (conflito) {
          const label = conflito.nome || conflito.razao_social || conflito.cnpj || conflito.id;
          const docType = cnpjClean.length >= 14 ? 'CNPJ' : 'CPF';
          return `⚠️ ${docType} já cadastrado no registro "${label}". Não é permitido duplicar.`;
        }
      } catch { /* não bloqueia */ }
    }
    return null;
  }, [ENTITY, empresaId, groupId]);

  const fetchNextCode = useCallback(async (rf) => {
    const codeField = ENTITY_CODE_FIELD[ENTITY];
    if (!codeField) return;
    try {
      const res = await base44.functions.invoke("entityListSorted", {
        entityName: ENTITY, filter: rf,
        sortField: codeField, sortDirection: "desc", limit: 1, skip: 0,
      });
      const last = Array.isArray(res?.data) && res.data[0];
      const n = last ? parseInt(String(last[codeField]).replace(/\D/g,''), 10) : 0;
      setNextCode(String(isNaN(n) ? 1 : n + 1).padStart(3, '0'));
    } catch { setNextCode(null); }
  }, [ENTITY, setNextCode]);

  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (!canDeleteCadastro) throw new Error("Sem permissão para excluir.");
      if (formData.id) {
        const dadosAntes = { id: formData.id, ...formData };
        try { await deleteInContext(ENTITY, formData.id); } catch (_) {}
        auditarAcao({ acao: 'Exclusão', ENTITY, registroId: formData.id, empresaId, groupId, dadosAntes, descricao: `Exclusão via formulário: ${ENTITY}` });
      }
      handleCloseForm(true);
      return;
    }
    if (editItem?.id && !canEditCadastro) throw new Error("Sem permissão para editar.");
    if (!editItem?.id && !canCreateCadastro) throw new Error("Sem permissão para criar.");

    // P2: validar contexto multiempresa antes de salvar — lança para exibição inline no modal
    if (!isSimple && !empresaId && !groupId) {
      throw new Error("⚠️ Selecione uma empresa ou grupo antes de salvar.");
    }

    setIsSaving(true);
    try {
      // P2: sanitização + injeção de contexto multiempresa
      let clean = sanitizeOnWrite({ ...formData });
      delete clean._action;
      if (!isSimple) {
        if (!clean.empresa_id && empresaId) clean.empresa_id = empresaId;
        if (!clean.group_id  && groupId)   clean.group_id   = groupId;
      }
      // P3: verificar duplicata antes de salvar
      const erroDuplicata = await checkDuplicate(clean, !!(editItem?.id), editItem?.id);
      if (erroDuplicata) {
        setIsSaving(false);
        throw new Error(erroDuplicata);
      }
      if (editItem?.id) {
        await updateInContext(ENTITY, editItem.id, clean, "empresa_id");
        auditarAcao({ acao: 'Edição', ENTITY, registroId: editItem.id, empresaId, groupId, dadosAntes: editItem, dadosDepois: clean });
      } else {
        const criado = await createInContext(ENTITY, clean, "empresa_id");
        auditarAcao({ acao: 'Criação', ENTITY, registroId: criado?.id, empresaId, groupId, dadosDepois: clean });
      }
      handleCloseForm(true);
    } catch (e) {
      // Relança para que o formulário possa exibir o erro inline
      throw e;
    } finally { setIsSaving(false); }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple, canCreateCadastro, canEditCadastro, canDeleteCadastro, createInContext, updateInContext, deleteInContext, checkDuplicate, setIsSaving]);

  return { fetchNextCode, handlePersistSubmit, checkDuplicate };
}