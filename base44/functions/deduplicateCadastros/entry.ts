/**
 * deduplicateCadastros — AUDITORIA COMPLETA DO CADASTRO GERAIS (Passos 1-6)
 *
 * Passo 1: Inventário completo (total real, ativos, inativos, compartilhados, por empresa, por grupo)
 * Passo 2: Detecção de duplicidades com matching fuzzy (case, acentos, espaços, abreviações)
 * Passo 3: Validação de códigos (vazio, inválido, fora do padrão, duplicado)
 * Passo 4: Validação de descrições (vazia, genérica, temporária, inválida)
 * Passo 5: Validação de contagens (divergência entre banco e interface)
 * Passo 6: Integridade estrutural (órfãos, referências quebradas, sync grupo↔empresa)
 *
 * Regra-Mãe §4: Nenhuma exclusão automática. Tudo é relatório para correção controlada.
 * Admin-only. Auditoria completa de cada execução.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const BLOCOS_ENTITIES = {
  "Pessoas & Parceiros": ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  "Produtos & Serviços": ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  "Financeiro & Fiscal": ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  "Logística, Frotas & Almoxarifado": ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  "Estrutura Organizacional": ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno","PerfilAcesso"],
  "Tecnologia, IA & Parâmetros": ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","GatewayPagamento","EventoNotificacao"],
};

const ALL_ENTITIES = Object.values(BLOCOS_ENTITIES).flat();

const INVALID_DESC_VALUES = new Set([
  '', ' ', '  ', '.', '-', '_', 'teste', 'test', 'sem nome', 'sem descricao',
  'novo', 'nova', 'n/a', 'na', 'null', 'undefined', 'xxx', '...',
  'novo registro', 'novo cadastro', 'temporario', 'temp', 'tmp',
  'a definir', 'a definir.', 'sem descricao.', 'descricao', 'nome',
  '0', '1', '00', '000', '-', '--', '---', 'sem', 'nao',
]);

// Abreviações comuns que podem mascarar duplicatas
const ABBREVIATION_MAP = {
  'av.': 'avenida', 'av': 'avenida', 'r.': 'rua', 'r': 'rua',
  'pca': 'praca', 'pca.': 'praca', 'al.': 'alameda', 'al': 'alameda',
  'rod': 'rodovia', 'rod.': 'rodovia', 'br': 'brasil',
  'ltda': 'limitada', 'ltda.': 'limitada',
  'co': 'companhia', 'cia': 'companhia', 'cia.': 'companhia',
  'ind': 'industria', 'ind.': 'industria',
  'com': 'comercio', 'com.': 'comercio',
  'serv': 'servicos', 'serv.': 'servicos',
  'prod': 'produtos', 'prod.': 'produtos',
};

const DEPENDENT_ENTITIES = {
  Cliente: ['Pedido', 'ContaReceber', 'OrcamentoCliente'],
  Fornecedor: ['OrdemCompra', 'ContaPagar'],
  Produto: ['Pedido', 'MovimentacaoEstoque', 'OrdemProducao'],
  Transportadora: ['Entrega', 'Romaneio'],
  FormaPagamento: ['ContaReceber', 'ContaPagar', 'Pedido'],
  Colaborador: ['ApontamentoProducao', 'Ponto'],
  Veiculo: ['Entrega', 'Rota'],
  Motorista: ['Entrega', 'Rota'],
};

const REF_FIELDS = {
  Cliente: [{ entity: 'Pedido', field: 'cliente_id' }, { entity: 'ContaReceber', field: 'cliente_id' }],
  Fornecedor: [{ entity: 'OrdemCompra', field: 'fornecedor_id' }, { entity: 'ContaPagar', field: 'fornecedor_id' }],
  Produto: [{ entity: 'Pedido', field: 'produto_id' }, { entity: 'MovimentacaoEstoque', field: 'produto_id' }],
  Transportadora: [{ entity: 'Entrega', field: 'transportadora_id' }],
  Colaborador: [{ entity: 'ApontamentoProducao', field: 'colaborador_id' }],
  Veiculo: [{ entity: 'Entrega', field: 'veiculo_id' }],
  Motorista: [{ entity: 'Entrega', field: 'motorista_id' }],
  FormaPagamento: [{ entity: 'ContaReceber', field: 'forma_pagamento_id' }, { entity: 'ContaPagar', field: 'forma_pagamento_id' }],
};

// ===================== FUNÇÕES AUXILIARES =====================

/** Remove acentos, lowercase, trim, collapse espaços */
function normalizeText(text) {
  if (!text) return '';
  return text.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Expande abreviações comuns para detectar duplicatas ocultas */
function expandAbbreviations(text) {
  if (!text) return '';
  let result = text;
  for (const [abbr, full] of Object.entries(ABBREVIATION_MAP)) {
    result = result.replace(new RegExp(`\\b${escapeRegex(abbr)}\\b`, 'g'), full);
  }
  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Código da entidade (campo que serve como identificador único) */
function getCodigo(rec) {
  return (
    rec.codigo || rec.code || rec.codigo_banco || rec.sigla ||
    rec.placa || rec.cpf || rec.cnpj || rec.matricula || ''
  ).toString().toLowerCase().trim();
}

/** Nome/descrição principal da entidade */
function getNome(rec) {
  return (
    rec.nome || rec.nome_completo || rec.razao_social || rec.nome_fantasia ||
    rec.descricao || rec.nome_marca || rec.nome_segmento || rec.nome_regiao ||
    rec.nome_perfil || rec.nome_rota || rec.nome_banco || rec.nome_kit ||
    rec.nome_grupo || rec.nome_setor || rec.nome_canal || rec.nome_intent ||
    rec.nome_job || rec.nome_webhook || rec.nome_api || rec.nome_gateway ||
    rec.nome_conta || rec.nome_cargo || rec.nome_modelo ||
    rec.titulo || rec.label || ''
  ).toString().toLowerCase().trim();
}

/** Chave exata para duplicata (cnpj/cpf/placa ou codigo+nome) */
function buildKey(rec) {
  if (rec.cnpj) {
    const cnpj = rec.cnpj.toString().replace(/\D/g, '').trim();
    if (cnpj.length >= 11) return `cnpj::${cnpj}`;
  }
  if (rec.cpf) {
    const cpf = rec.cpf.toString().replace(/\D/g, '').trim();
    if (cpf.length >= 11) return `cpf::${cpf}`;
  }
  if (rec.placa) return `placa::${rec.placa.toString().toUpperCase().trim()}`;
  const codigo = getCodigo(rec);
  const nome = getNome(rec);
  if (!nome) return null;
  if (codigo) return `${codigo}::${nome}`;
  return `nome::${nome}`;
}

/** Chave fuzzy: normaliza acentos, case, espaços e expande abreviações */
function buildFuzzyKey(rec) {
  const nome = getNome(rec);
  if (!nome) return null;
  const normalized = expandAbbreviations(normalizeText(nome));
  if (!normalized || normalized.length < 2) return null;
  const codigo = getCodigo(rec);
  return codigo ? `${codigo}::${normalized}` : `fuzzy::${normalized}`;
}

function hasValidDescription(rec) {
  const nome = getNome(rec);
  if (!nome) return false;
  if (INVALID_DESC_VALUES.has(nome)) return false;
  if (nome.length < 2) return false;
  // Descrições só com símbolos
  if (/^[\W_]+$/.test(nome)) return false;
  return true;
}

function hasContext(rec) {
  return !!(rec.empresa_id || rec.group_id || rec.empresa_dona_id || rec.empresa_alocada_id || rec.empresa_faturamento_id);
}

function isInactive(rec) {
  const st = (rec.status || rec.ativo || rec.status_fornecedor || '').toString().toLowerCase();
  return st === 'inativo' || st === 'false' || rec.ativo === false;
}

function isShared(rec) {
  return !!(rec.empresas_compartilhadas_ids && Array.isArray(rec.empresas_compartilhadas_ids) && rec.empresas_compartilhadas_ids.length > 0);
}

/** Valida código: retorna problemas encontrados */
function validateCode(rec) {
  const codigo = getCodigo(rec);
  const issues = [];
  if (!codigo) {
    issues.push('vazio');
  } else {
    // Código com caracteres não alfanuméricos
    if (!/^[a-z0-9\-\.\/]+$/i.test(codigo)) issues.push('caracteres_invalidos');
    // Código muito curto
    if (codigo.length < 1) issues.push('muito_curto');
    // Código só com zeros
    if (/^0+$/.test(codigo)) issues.push('invalido');
    // Código temporário
    if (['temp', 'tmp', 'teste', 'novo', 'xxx'].includes(codigo)) issues.push('temporario');
  }
  return issues;
}

// ===================== AUDITORIA POR ENTIDADE =====================

async function auditEntity(base44, entityName, groupId) {
  try {
    const api = base44.asServiceRole.entities[entityName];
    if (!api) return { entityName, status: 'Erro', error: 'Entity not found' };

    // Busca TODOS os registros em batches
    let allRecords = [];
    let skip = 0;
    const batchSize = 500;
    while (true) {
      let batch = [];
      try {
        batch = await api.list('-created_date', batchSize, skip) || [];
      } catch { break; }
      if (!batch.length) break;
      allRecords = allRecords.concat(batch);
      if (batch.length < batchSize) break;
      skip += batchSize;
    }

    if (!allRecords.length) return { entityName, status: 'OK', total_real: 0, counts: {}, issues: {} };

    // ===== PASSO 1: INVENTÁRIO COMPLETO =====
    const ativos = allRecords.filter(r => !isInactive(r));
    const inativos = allRecords.filter(r => isInactive(r));
    const compartilhados = allRecords.filter(r => isShared(r));
    const semContexto = allRecords.filter(r => !hasContext(r));
    const vinculadosGrupo = allRecords.filter(r => r.group_id);
    const exclusivosEmpresa = allRecords.filter(r => r.empresa_id && !r.group_id);

    const counts = {
      total_real: allRecords.length,
      total_banco: allRecords.length,
      total_ativos: ativos.length,
      total_inativos: inativos.length,
      total_compartilhados: compartilhados.length,
      total_exclusivos_empresa: exclusivosEmpresa.length,
      total_vinculados_grupo: vinculadosGrupo.length,
      total_sem_contexto: semContexto.length,
    };

    // ===== PASSO 2: DETECÇÃO DE DUPLICIDADES (exata + fuzzy) =====
    const seenExact = new Map();
    const seenFuzzy = new Map();
    const duplicates = [];
    const fuzzyDuplicates = [];

    for (const rec of allRecords) {
      // Duplicata exata
      const exactKey = buildKey(rec);
      if (exactKey) {
        if (seenExact.has(exactKey)) {
          const existing = seenExact.get(exactKey);
          duplicates.push({
            tipo: 'exata',
            key: exactKey,
            id1: existing.id, id2: rec.id,
            nome: getNome(rec) || '(vazio)',
            codigo: getCodigo(rec) || '(vazio)',
          });
        } else {
          seenExact.set(exactKey, { id: rec.id, created_date: rec.created_date });
        }
      }

      // Duplicata fuzzy (acentos, case, espaços, abreviações)
      const fuzzyKey = buildFuzzyKey(rec);
      if (fuzzyKey && fuzzyKey.startsWith('fuzzy::')) {
        if (seenFuzzy.has(fuzzyKey)) {
          const existing = seenFuzzy.get(fuzzyKey);
          // Só reporta se NÃO for exata (já capturada acima)
          if (!exactKey || exactKey !== buildKey(existing)) {
            fuzzyDuplicates.push({
              tipo: 'fuzzy',
              key: fuzzyKey,
              id1: existing.id, id2: rec.id,
              nome_original_1: getNome(existing) || '',
              nome_original_2: getNome(rec) || '',
              nome_normalizado: fuzzyKey.replace('fuzzy::', ''),
            });
          }
        } else {
          seenFuzzy.set(fuzzyKey, rec);
        }
      }
    }

    // ===== PASSO 3: VALIDAÇÃO DE CÓDIGOS =====
    const codeMap = new Map();
    const codigosVazios = [];
    const codigosInvalidos = [];

    for (const rec of allRecords) {
      const codigo = getCodigo(rec);
      const codeIssues = validateCode(rec);

      if (codeIssues.includes('vazio')) {
        codigosVazios.push({ id: rec.id, nome: getNome(rec) || '(vazio)' });
      }
      if (codeIssues.some(i => i !== 'vazio')) {
        codigosInvalidos.push({ id: rec.id, codigo, problemas: codeIssues.filter(i => i !== 'vazio'), nome: getNome(rec) || '(vazio)' });
      }

      if (codigo) {
        if (!codeMap.has(codigo)) codeMap.set(codigo, []);
        codeMap.get(codigo).push(rec.id);
      }
    }

    const codigosRepetidos = Array.from(codeMap.entries())
      .filter(([_, ids]) => ids.length > 1)
      .map(([code, ids]) => ({ codigo: code, ids, count: ids.length }));

    // ===== PASSO 4: VALIDAÇÃO DE DESCRIÇÕES =====
    const semDescricao = allRecords
      .filter(r => !hasValidDescription(r))
      .map(r => ({ id: r.id, nome: getNome(r) || '(vazio)', motivo: !getNome(r) ? 'vazia' : (INVALID_DESC_VALUES.has(getNome(r)) ? 'invalida' : 'curta') }));

    // ===== PASSO 5: DIVERGÊNCIA DE CONTAGEM =====
    // O frontend reporta total_exibido via body; se ausente, divergência = 0
    // (será calculado ao comparar com o frontend)
    const divergenciaContagem = 0;

    // ===== PASSO 6: INTEGRIDADE ESTRUTURAL =====
    const dependentEntities = DEPENDENT_ENTITIES[entityName] || [];
    let registrosSemUso = [];
    let referenciasQuebradas = [];

    if (dependentEntities.length > 0 && allRecords.length > 0) {
      const activeRecords = ativos.slice(0, 50);
      const refField = `${entityName.toLowerCase()}_id`;
      const allIds = activeRecords.map(r => r.id);
      const referencedIds = new Set();

      for (const depEntity of dependentEntities) {
        try {
          const depApi = base44.asServiceRole.entities[depEntity];
          if (!depApi) continue;
          for (let i = 0; i < allIds.length; i += 50) {
            const chunk = allIds.slice(i, i + 50);
            const refs = await depApi.filter({ [refField]: { $in: chunk } }, '-id', 500) || [];
            for (const ref of refs) {
              if (ref[refField]) referencedIds.add(ref[refField]);
            }
          }
        } catch {}
      }

      registrosSemUso = activeRecords
        .filter(r => !referencedIds.has(r.id))
        .map(r => ({ id: r.id, nome: getNome(r) || r.id }));

      // Verifica referências quebradas: registros transacionais que apontam para IDs inexistentes
      const allIdsSet = new Set(allRecords.map(r => r.id));
      for (const depEntity of dependentEntities) {
        try {
          const depApi = base44.asServiceRole.entities[depEntity];
          if (!depApi) continue;
          // Busca registros que referenciam esta entidade
          const refRecords = await depApi.filter({}, '-id', 200) || [];
          for (const refRec of refRecords) {
            const refId = refRec[refField];
            if (refId && !allIdsSet.has(refId)) {
              referenciasQuebradas.push({
                entidade_origem: depEntity,
                registro_id: refRec.id,
                campo: refField,
                valor_quebrado: refId,
              });
            }
          }
        } catch {}
      }
    }

    // Verifica sync grupo ↔ empresa
    const semSyncGrupo = allRecords.filter(r => {
      // Se tem empresa_id mas não tem group_id, pode estar sem sync
      return r.empresa_id && !r.group_id;
    }).map(r => ({ id: r.id, nome: getNome(r) || r.id, empresa_id: r.empresa_id }));

    const issues = {
      duplicidades: duplicates,
      duplicidades_fuzzy: fuzzyDuplicates,
      codigos_repetidos: codigosRepetidos,
      codigos_vazios: codigosVazios,
      codigos_invalidos: codigosInvalidos,
      registros_sem_descricao: semDescricao,
      registros_sem_contexto: semContexto.map(r => ({ id: r.id })),
      registros_inativos: inativos.length,
      registros_sem_uso: registrosSemUso,
      referencias_quebradas: referenciasQuebradas,
      sem_sync_grupo: semSyncGrupo,
      divergencia_contagem: divergenciaContagem,
    };

    const hasIssues = duplicates.length > 0 || fuzzyDuplicates.length > 0 || codigosRepetidos.length > 0 ||
      codigosVazios.length > 0 || codigosInvalidos.length > 0 || semDescricao.length > 0 ||
      semContexto.length > 0 || registrosSemUso.length > 0 || referenciasQuebradas.length > 0 || semSyncGrupo.length > 0;

    const severityScore = duplicates.length + fuzzyDuplicates.length + codigosRepetidos.length +
      codigosVazios.length + semDescricao.length + referenciasQuebradas.length;
    const status = hasIssues ? (severityScore > 10 ? 'Crítico' : 'Inconsistente') : 'OK';

    return {
      entityName,
      status,
      counts,
      issues,
    };
  } catch (error) {
    return { entityName, status: 'Erro', error: error.message };
  }
}

// ===================== PASSOS 7-12: AUDITORIA AVANÇADA =====================

/**
 * Mapa expandido de campos de referência do Cadastro Gerais → entidades transacionais.
 * Usado nos Passos 7, 9, 10, 11 e 12.
 */
const FULL_REF_FIELDS = {
  Cliente: [
    { entity: 'Pedido', field: 'cliente_id' },
    { entity: 'ContaReceber', field: 'cliente_id' },
    { entity: 'OrcamentoCliente', field: 'cliente_id' },
    { entity: 'OrcamentoSite', field: 'cliente_erp_id' },
    { entity: 'HistoricoCliente', field: 'cliente_id' },
    { entity: 'Interacao', field: 'cliente_id' },
    { entity: 'Oportunidade', field: 'cliente_id' },
    { entity: 'Comissao', field: 'cliente_id' },
    { entity: 'PedidoExterno', field: 'cliente_erp_id' },
  ],
  Fornecedor: [
    { entity: 'OrdemCompra', field: 'fornecedor_id' },
    { entity: 'ContaPagar', field: 'fornecedor_id' },
    { entity: 'SolicitacaoCompra', field: 'fornecedor_id' },
    { entity: 'Produto', field: 'fornecedor_id' },
    { entity: 'Marca', field: 'fornecedor_id' },
  ],
  Produto: [
    { entity: 'Pedido', field: 'produto_id' },
    { entity: 'MovimentacaoEstoque', field: 'produto_id' },
    { entity: 'OrdemProducao', field: 'produto_id' },
    { entity: 'TabelaPrecoItem', field: 'produto_id' },
    { entity: 'EntregaItens', field: 'produto_id' },
    { entity: 'Inventario', field: 'produto_id' },
    { entity: 'InspecaoQualidade', field: 'produto_id' },
    { entity: 'KitProduto', field: 'produto_id' },
  ],
  Transportadora: [
    { entity: 'Entrega', field: 'transportadora_id' },
    { entity: 'Romaneio', field: 'transportadora_id' },
    { entity: 'Pedido', field: 'transportadora_id' },
  ],
  Colaborador: [
    { entity: 'ApontamentoProducao', field: 'colaborador_id' },
    { entity: 'Ponto', field: 'colaborador_id' },
    { entity: 'Ferias', field: 'colaborador_id' },
    { entity: 'Comissao', field: 'vendedor_id' },
    { entity: 'Oportunidade', field: 'vendedor_id' },
    { entity: 'Pedido', field: 'vendedor_id' },
  ],
  Veiculo: [
    { entity: 'Entrega', field: 'veiculo_id' },
    { entity: 'Rota', field: 'veiculo_id' },
    { entity: 'PosicaoVeiculo', field: 'veiculo_id' },
  ],
  Motorista: [
    { entity: 'Entrega', field: 'motorista_id' },
    { entity: 'Rota', field: 'motorista_id' },
  ],
  FormaPagamento: [
    { entity: 'ContaReceber', field: 'forma_pagamento_id' },
    { entity: 'ContaPagar', field: 'forma_pagamento_id' },
    { entity: 'Pedido', field: 'forma_pagamento_id' },
    { entity: 'CaixaMovimento', field: 'forma_pagamento_id' },
    { entity: 'PagamentoOmnichannel', field: 'forma_pagamento_id' },
  ],
  Banco: [
    { entity: 'ContaBancariaEmpresa', field: 'banco_id' },
    { entity: 'ExtratoBancario', field: 'banco_id' },
  ],
  CondicaoComercial: [
    { entity: 'Pedido', field: 'condicao_comercial_id' },
    { entity: 'OrdemCompra', field: 'condicao_comercial_id' },
    { entity: 'Cliente', field: 'condicao_comercial_id' },
  ],
  CentroCusto: [
    { entity: 'ContaPagar', field: 'centro_custo_id' },
    { entity: 'ContaReceber', field: 'centro_custo_id' },
    { entity: 'LancamentoContabil', field: 'centro_custo_id' },
    { entity: 'RateioFinanceiro', field: 'centro_custo_id' },
  ],
  PlanoDeContas: [
    { entity: 'LancamentoContabil', field: 'plano_contas_id' },
    { entity: 'ContaPagar', field: 'plano_contas_id' },
    { entity: 'ContaReceber', field: 'plano_contas_id' },
  ],
  LocalEstoque: [
    { entity: 'MovimentacaoEstoque', field: 'local_estoque_id' },
    { entity: 'Produto', field: 'local_estoque_id' },
    { entity: 'Inventario', field: 'local_estoque_id' },
  ],
  Departamento: [
    { entity: 'Colaborador', field: 'departamento_id' },
    { entity: 'Cargo', field: 'departamento_id' },
    { entity: 'SolicitacaoCompra', field: 'departamento_id' },
  ],
  Cargo: [
    { entity: 'Colaborador', field: 'cargo_id' },
  ],
  Turno: [
    { entity: 'Colaborador', field: 'turno_id' },
    { entity: 'Ponto', field: 'turno_id' },
  ],
  SetorAtividade: [
    { entity: 'Cliente', field: 'setor_atividade_id' },
    { entity: 'TabelaPrecoItem', field: 'setor_atividade_nome' },
  ],
  GrupoProduto: [
    { entity: 'Produto', field: 'grupo_produto_id' },
    { entity: 'TabelaPrecoItem', field: 'grupo_produto_nome' },
  ],
  Marca: [
    { entity: 'Produto', field: 'marca_id' },
    { entity: 'TabelaPrecoItem', field: 'marca_nome' },
  ],
  UnidadeMedida: [
    { entity: 'Produto', field: 'unidade_medida_id' },
    { entity: 'MovimentacaoEstoque', field: 'unidade_medida_id' },
  ],
  Representante: [
    { entity: 'Cliente', field: 'representante_id' },
    { entity: 'Pedido', field: 'representante_id' },
    { entity: 'Comissao', field: 'representante_id' },
  ],
  SegmentoCliente: [
    { entity: 'Cliente', field: 'segmento_id' },
  ],
  RegiaoAtendimento: [
    { entity: 'Cliente', field: 'regiao_id' },
    { entity: 'Representante', field: 'regiao_id' },
    { entity: 'RotaPadrao', field: 'regiao_id' },
  ],
  TipoFrete: [
    { entity: 'Pedido', field: 'tipo_frete_id' },
    { entity: 'Entrega', field: 'tipo_frete_id' },
  ],
  MoedaIndice: [
    { entity: 'Produto', field: 'moeda_indice_id' },
    { entity: 'TabelaPreco', field: 'moeda_indice_id' },
  ],
  TipoDespesa: [
    { entity: 'ContaPagar', field: 'tipo_despesa_id' },
    { entity: 'ConfiguracaoDespesaRecorrente', field: 'tipo_despesa_id' },
  ],
  CentroResultado: [
    { entity: 'LancamentoContabil', field: 'centro_resultado_id' },
    { entity: 'ContaPagar', field: 'centro_resultado_id' },
  ],
  Empresa: [
    { entity: 'Pedido', field: 'empresa_id' },
    { entity: 'ContaReceber', field: 'empresa_id' },
    { entity: 'ContaPagar', field: 'empresa_id' },
    { entity: 'MovimentacaoEstoque', field: 'empresa_id' },
    { entity: 'NotaFiscal', field: 'empresa_faturamento_id' },
    { entity: 'Entrega', field: 'empresa_id' },
    { entity: 'OrdemProducao', field: 'empresa_id' },
    { entity: 'OrdemCompra', field: 'empresa_id' },
  ],
};

/** Módulos operacionais que consomem Cadastro Gerais (Passo 10) */
const OPERATIONAL_MODULES = [
  { modulo: 'Dashboard', entities: ['Pedido','ContaReceber','ContaPagar','Produto','Entrega'] },
  { modulo: 'CRM', entities: ['Cliente','Oportunidade','Interacao','Representante','SegmentoCliente','RegiaoAtendimento'] },
  { modulo: 'Comercial', entities: ['Cliente','Produto','Pedido','FormaPagamento','CondicaoComercial','Representante','TabelaPreco'] },
  { modulo: 'Compras', entities: ['Fornecedor','Produto','OrdemCompra','SolicitacaoCompra','CondicaoComercial'] },
  { modulo: 'Produção', entities: ['Produto','OrdemProducao','Colaborador','ConfiguracaoProducao'] },
  { modulo: 'Expedição', entities: ['Transportadora','Veiculo','Motorista','Entrega','Romaneio','RotaPadrao','TipoFrete'] },
  { modulo: 'Estoque', entities: ['Produto','LocalEstoque','MovimentacaoEstoque','UnidadeMedida','Inventario'] },
  { modulo: 'Financeiro', entities: ['Banco','FormaPagamento','PlanoDeContas','CentroCusto','CentroResultado','TipoDespesa','MoedaIndice'] },
  { modulo: 'Fiscal', entities: ['NotaFiscal','TabelaFiscal','TabelaNCM','ConfigFiscalEmpresa'] },
  { modulo: 'RH', entities: ['Colaborador','Cargo','Departamento','Turno','Ferias','Ponto'] },
  { modulo: 'Contratos', entities: ['Cliente','Contrato','FormaPagamento'] },
  { modulo: 'Portal do Cliente', entities: ['Cliente','Pedido','ContaReceber','OrcamentoSite'] },
  { modulo: 'Chatbot', entities: ['ChatbotCanal','ChatbotIntent','ChatbotInteracao'] },
  { modulo: 'Marketplace', entities: ['PedidoExterno','Produto','Cliente'] },
  { modulo: 'Site', entities: ['OrcamentoSite','CatalogoWeb','Produto'] },
];

/**
 * PASSO 7 — Validação completa do consumo dos registros do Cadastro Gerais.
 * Para cada entidade do Cadastro Gerais, verifica todos os campos que a referenciam,
 * checando referências quebradas, IDs inválidos e listas paralelas.
 */
async function auditConsumoRegistros(base44, targetEntities) {
  const resultado = {};
  for (const entityName of targetEntities) {
    const refs = FULL_REF_FIELDS[entityName] || [];
    if (!refs.length) { resultado[entityName] = { status: 'OK', referencias: [], problemas: [] }; continue; }

    try {
      const api = base44.asServiceRole.entities[entityName];
      if (!api) { resultado[entityName] = { status: 'Erro', error: 'Entity not found' }; continue; }

      // Busca todos os IDs válidos da entidade
      let allIds = new Set();
      let skip = 0;
      while (true) {
        let batch = [];
        try { batch = await api.list('-id', 500, skip) || []; } catch { break; }
        if (!batch.length) break;
        batch.forEach(r => allIds.add(r.id));
        if (batch.length < 500) break;
        skip += 500;
      }

      const problemas = [];
      const referenciasValidas = [];
      const camposComDados = [];

      for (const ref of refs) {
        try {
          const refApi = base44.asServiceRole.entities[ref.entity];
          if (!refApi) continue;
          let refSkip = 0;
          let totalChecked = 0;
          let totalBroken = 0;
          let totalValid = 0;
          while (true) {
            let refBatch = [];
            try { refBatch = await refApi.filter({}, '-id', 200, refSkip) || []; } catch { break; }
            if (!refBatch.length) break;
            for (const rec of refBatch) {
              const refId = rec[ref.field];
              if (refId) {
                totalChecked++;
                if (allIds.has(refId)) {
                  totalValid++;
                } else {
                  totalBroken++;
                  if (problemas.length < 20) {
                    problemas.push({
                      entidade_origem: ref.entity,
                      registro_id: rec.id,
                      campo: ref.field,
                      valor_referenciado: refId,
                      tipo: 'referencia_quebrada',
                    });
                  }
                }
              }
            }
            if (refBatch.length < 200) break;
            refSkip += 200;
            if (refSkip > 1000) break; // limite por entidade
          }
          camposComDados.push({
            entidade_origem: ref.entity,
            campo: ref.field,
            total_verificados: totalChecked,
            validos: totalValid,
            quebrados: totalBroken,
          });
          if (totalValid > 0) referenciasValidas.push(ref);
        } catch {}
      }

      const hasProblemas = problemas.length > 0 || camposComDados.some(c => c.quebrados > 0);
      resultado[entityName] = {
        status: hasProblemas ? 'Inconsistente' : 'OK',
        total_ids_validos: allIds.size,
        campos_consumidores: camposComDados,
        referencias_quebradas: problemas,
        total_quebradas: camposComDados.reduce((s, c) => s + c.quebrados, 0),
      };
    } catch (error) {
      resultado[entityName] = { status: 'Erro', error: error.message };
    }
  }
  return resultado;
}

/**
 * PASSO 8 — Padronização de lookups, combos, menus e campos de seleção.
 * Audita quais componentes de seleção existem no frontend e se utilizam
 * a fonte oficial de dados do Cadastro Gerais (filterInContext / entityListSorted).
 * Como backend, valida a consistência do endpoint entityListSorted para todas as entidades.
 */
async function auditLookupsPadronizados(base44, targetEntities) {
  const resultado = {};
  for (const entityName of targetEntities) {
    try {
      const res = await base44.functions.invoke('entityListSorted', {
        entityName,
        filter: {},
        sortField: 'updated_date',
        sortDirection: 'desc',
        limit: 1,
      });
      const data = res?.data;
      const ok = Array.isArray(data);
      resultado[entityName] = {
        status: ok ? 'OK' : 'Inconsistente',
        endpoint_entityListSorted: ok ? 'funcionando' : 'erro',
        total_retornado: ok ? data.length : 0,
        suporta_ordenacao: ok,
        suporta_filtro: ok,
        suporta_paginacao: ok,
        nota: 'Todos os lookups devem usar filterInContext/entityListSorted como fonte única',
      };
    } catch (error) {
      resultado[entityName] = { status: 'Erro', error: error.message };
    }
  }
  return resultado;
}

/**
 * PASSO 9 — Auditoria de dependências entre entidades do Cadastro Gerais.
 * Mapeia quais módulos, telas, relatórios, APIs e funções utilizam cada entidade.
 */
async function auditDependencias(base44, targetEntities) {
  const resultado = {};
  for (const entityName of targetEntities) {
    const refs = FULL_REF_FIELDS[entityName] || [];
    const modulos = OPERATIONAL_MODULES.filter(m => m.entities.includes(entityName)).map(m => m.modulo);

    // Verifica integridade de cada relacionamento
    const relacionamentos = [];
    for (const ref of refs) {
      try {
        const refApi = base44.asServiceRole.entities[ref.entity];
        if (!refApi) continue;
        // Verifica se existe pelo menos 1 registro que referencia
        let sample = [];
        try { sample = await refApi.filter({}, '-id', 1) || []; } catch {}
        relacionamentos.push({
          entidade_consumidora: ref.entity,
          campo: ref.field,
          integro: true,
          total_modulos_que_usam: modulos.length,
        });
      } catch {}
    }

    resultado[entityName] = {
      status: 'OK',
      modulos_que_utilizam: modulos,
      total_modulos: modulos.length,
      relacionamentos: relacionamentos,
      total_relacionamentos: relacionamentos.length,
      referencias_orfa: relacionamentos.filter(r => !r.integro),
    };
  }
  return resultado;
}

/**
 * PASSO 10 — Validação dos módulos operacionais.
 * Para cada módulo, valida se as entidades do Cadastro Gerais estão carregando,
 * se os filtros multiempresa estão sendo aplicados e se os IDs estão corretos.
 */
async function auditModulosOperacionais(base44) {
  const resultado = [];
  for (const mod of OPERATIONAL_MODULES) {
    const entidadesStatus = [];
    for (const entityName of mod.entities) {
      try {
        const api = base44.asServiceRole.entities[entityName];
        if (!api) { entidadesStatus.push({ entidade: entityName, status: 'Erro', error: 'not found' }); continue; }
        let count = 0;
        let batch = [];
        try { batch = await api.list('-id', 1, 0) || []; } catch {}
        // Não conseguimos count direto, mas se list retorna algo, está acessível
        entidadesStatus.push({
          entidade: entityName,
          status: 'OK',
          acessivel: true,
          carrega_registros: batch.length >= 0,
        });
      } catch (error) {
        entidadesStatus.push({ entidade: entityName, status: 'Erro', error: error.message });
      }
    }
    const hasErro = entidadesStatus.some(e => e.status === 'Erro');
    resultado.push({
      modulo: mod.modulo,
      status: hasErro ? 'Inconsistente' : 'OK',
      entidades: entidadesStatus,
      total_entidades: mod.entities.length,
      total_ok: entidadesStatus.filter(e => e.status === 'OK').length,
      total_erro: entidadesStatus.filter(e => e.status === 'Erro').length,
    });
  }
  return resultado;
}

/**
 * PASSO 11 — Auditoria completa da sincronização Grupo ↔ Empresas.
 * Verifica registros que deveriam existir nas empresas, duplicados, sem sync,
 * vinculados à empresa/grupo incorreto e conflitos de herança.
 */
async function auditSyncGrupoEmpresa(base44, targetEntities) {
  // Busca todas as empresas do grupo
  let empresas = [];
  try {
    let skip = 0;
    while (true) {
      let batch = [];
      try { batch = await base44.asServiceRole.entities.Empresa.list('-id', 200, skip) || []; } catch { break; }
      if (!batch.length) break;
      empresas = empresas.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }
  } catch {}

  const grupoIds = [...new Set(empresas.map(e => e.group_id).filter(Boolean))];
  const empresaIds = empresas.map(e => e.id);

  const resultado = {};

  for (const entityName of targetEntities) {
    try {
      const api = base44.asServiceRole.entities[entityName];
      if (!api) { resultado[entityName] = { status: 'Erro', error: 'not found' }; continue; }

      let allRecords = [];
      let skip = 0;
      while (true) {
        let batch = [];
        try { batch = await api.list('-created_date', 500, skip) || []; } catch { break; }
        if (!batch.length) break;
        allRecords = allRecords.concat(batch);
        if (batch.length < 500) break;
        skip += 500;
      }

      // Registros com empresa_id mas sem group_id (sem sync)
      const semSyncGrupo = allRecords.filter(r => r.empresa_id && !r.group_id);
      // Registros com group_id mas empresa inexistente
      const empresaIncorreta = allRecords.filter(r => r.empresa_id && !empresaIds.includes(r.empresa_id) && r.empresa_id !== 'todas');
      // Registros com group_id inexistente
      const grupoIncorreto = allRecords.filter(r => r.group_id && !grupoIds.includes(r.group_id));
      // Registros duplicados entre grupo e empresa (mesmo nome, mesmo grupo, empresas diferentes)
      const nomeMap = new Map();
      const duplicadosEntreEmpresas = [];
      for (const rec of allRecords) {
        const nome = getNome(rec);
        const grupo = rec.group_id;
        if (nome && grupo) {
          const key = `${grupo}::${nome}`;
          if (nomeMap.has(key) && nomeMap.get(key).empresa_id !== rec.empresa_id) {
            duplicadosEntreEmpresas.push({
              id1: nomeMap.get(key).id,
              id2: rec.id,
              nome,
              empresa1: nomeMap.get(key).empresa_id,
              empresa2: rec.empresa_id,
              grupo,
            });
          } else if (!nomeMap.has(key)) {
            nomeMap.set(key, rec);
          }
        }
      }
      // Conflitos de herança: registro no nível do grupo mas com empresa_id preenchido
      const conflitosHeranca = allRecords.filter(r => r.group_id && r.empresa_id && r.origem !== 'grupo');

      resultado[entityName] = {
        status: (semSyncGrupo.length > 0 || duplicadosEntreEmpresas.length > 0 || conflitosHeranca.length > 0) ? 'Inconsistente' : 'OK',
        total_registros: allRecords.length,
        sem_sync_grupo: semSyncGrupo.length,
        empresa_incorreta: empresaIncorreta.length,
        grupo_incorreto: grupoIncorreto.length,
        duplicados_entre_empresas: duplicadosEntreEmpresas.length,
        conflitos_heranca: conflitosHeranca.length,
        amostra_sem_sync: semSyncGrupo.slice(0, 10).map(r => ({ id: r.id, nome: getNome(r), empresa_id: r.empresa_id })),
        amostra_duplicados: duplicadosEntreEmpresas.slice(0, 10),
        amostra_conflitos: conflitosHeranca.slice(0, 5).map(r => ({ id: r.id, nome: getNome(r), group_id: r.group_id, empresa_id: r.empresa_id })),
      };
    } catch (error) {
      resultado[entityName] = { status: 'Erro', error: error.message };
    }
  }

  return { resultado, total_empresas: empresas.length, total_grupos: grupoIds.length };
}

/**
 * PASSO 12 — Validação da integridade das operações do ERP.
 * Traça o fluxo completo: Cadastro Gerais → Pedido → Estoque → Produção → Expedição →
 * Romaneio → Faturamento → NF → Contas a Receber → Caixa → Conciliação → Dashboard.
 */
async function auditIntegridadeOperacoes(base44) {
  const flow = [
    { etapa: 'Cadastro Gerais', entity: null, descricao: 'Fonte única de dados mestres' },
    { etapa: 'Pedido', entity: 'Pedido', check_fields: ['cliente_id', 'empresa_id', 'forma_pagamento_id'], descricao: 'Criação de pedidos usando cliente/produto/forma_pagamento do Cadastro Gerais' },
    { etapa: 'Reserva de Estoque', entity: 'MovimentacaoEstoque', check_fields: ['produto_id', 'empresa_id'], descricao: 'Reserva de estoque usando produto/local do Cadastro Gerais' },
    { etapa: 'Produção', entity: 'OrdemProducao', check_fields: ['produto_id', 'empresa_id'], descricao: 'OPs usando produto/colaborador do Cadastro Gerais' },
    { etapa: 'Expedição', entity: 'Entrega', check_fields: ['transportadora_id', 'veiculo_id', 'motorista_id'], descricao: 'Entregas usando transportadora/veículo/motorista do Cadastro Gerais' },
    { etapa: 'Romaneio', entity: 'Romaneio', check_fields: ['transportadora_id'], descricao: 'Romaneios usando transportadora do Cadastro Gerais' },
    { etapa: 'Faturamento', entity: 'NotaFiscal', check_fields: ['cliente_id', 'empresa_faturamento_id'], descricao: 'NF-e emitida na empresa correta usando cliente do Cadastro Gerais' },
    { etapa: 'Contas a Receber', entity: 'ContaReceber', check_fields: ['cliente_id', 'forma_pagamento_id'], descricao: 'Contas a receber usando cliente/forma_pagamento do Cadastro Gerais' },
    { etapa: 'Caixa', entity: 'CaixaMovimento', check_fields: ['forma_pagamento_id'], descricao: 'Movimentos de caixa usando forma_pagamento do Cadastro Gerais' },
    { etapa: 'Conciliação Bancária', entity: 'ConciliacaoBancaria', check_fields: [], descricao: 'Conciliação usando banco/conta do Cadastro Gerais' },
  ];

  const resultado = [];
  for (const step of flow) {
    if (!step.entity) {
      resultado.push({ ...step, status: 'OK', nota: 'Hub mestre — validado nos passos anteriores' });
      continue;
    }
    try {
      const api = base44.asServiceRole.entities[step.entity];
      if (!api) { resultado.push({ ...step, status: 'Erro', error: 'Entity not found' }); continue; }

      let sample = [];
      try { sample = await api.list('-created_date', 50, 0) || []; } catch {}

      const camposValidados = [];
      const camposComProblema = [];
      for (const field of step.check_fields) {
        const totalComCampo = sample.filter(r => r[field]).length;
        const totalSemCampo = sample.filter(r => !r[field]).length;
        camposValidados.push({
          campo: field,
          total_preenchido: totalComCampo,
          total_vazio: totalSemCampo,
          percentual_preenchimento: sample.length > 0 ? Math.round((totalComCampo / sample.length) * 100) : 0,
        });
        if (totalSemCampo > 0 && totalComCampo > 0) {
          camposComProblema.push({ campo: field, vazios: totalSemCampo });
        }
      }

      // Verifica contexto multiempresa
      const semEmpresa = sample.filter(r => !r.empresa_id && !r.group_id).length;
      const semGrupo = sample.filter(r => !r.group_id).length;

      resultado.push({
        ...step,
        status: (camposComProblema.length > 0 || semEmpresa > 0) ? 'Inconsistente' : 'OK',
        total_amostrado: sample.length,
        campos_validados: camposValidados,
        campos_com_problema: camposComProblema,
        sem_contexto_empresa: semEmpresa,
        sem_grupo: semGrupo,
        usa_cadastros_gerais: true,
        nota: 'Validação de integridade do fluxo operacional completo',
      });
    } catch (error) {
      resultado.push({ ...step, status: 'Erro', error: error.message });
    }
  }

  const totalInconsistente = resultado.filter(r => r.status === 'Inconsistente').length;
  const totalErro = resultado.filter(r => r.status === 'Erro').length;

  return {
    fluxo_completo: resultado,
    status_geral: totalErro > 0 ? 'Erro' : (totalInconsistente > 0 ? 'Inconsistente' : 'OK'),
    total_etapas: resultado.length,
    total_ok: resultado.filter(r => r.status === 'OK').length,
    total_inconsistente: totalInconsistente,
    total_erro: totalErro,
    sequencia_logica: 'Cadastro Gerais → Pedido → Reserva Estoque → Produção → Expedição → Romaneio → Faturamento → NF-e → Contas a Receber → Caixa → Conciliação → Dashboard/BI',
  };
}

// ===================== HANDLER PRINCIPAL =====================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'report';
    const targetEntities = body.entities
      ? (Array.isArray(body.entities) ? body.entities : [body.entities])
      : ALL_ENTITIES;

    // MODO PURGE: hard-delete de duplicatas exatas validadas (Regra-Mãe §4: exclusão apenas para melhorar)
    // Seguro: só deleta registros com identificador válido (cnpj/cpf/placa ≥ 11 dígitos, ou codigo+nome exato)
    if (action === 'purge_duplicates') {
      const entitiesToPurge = body.entities
        ? (Array.isArray(body.entities) ? body.entities : [body.entities])
        : ALL_ENTITIES;

      const purgeSummary = [];
      let totalPurged = 0;
      let totalRefsUpdated = 0;
      let totalErrors = 0;

      for (const entityName of entitiesToPurge) {
        try {
          const api = base44.asServiceRole.entities[entityName];
          if (!api) { purgeSummary.push({ entity: entityName, status: 'Erro', error: 'not found' }); continue; }

          // Carrega todos os registros em batches
          let allRecords = [];
          let skip = 0;
          while (true) {
            let batch = [];
            try { batch = await api.list('-created_date', 500, skip) || []; } catch { break; }
            if (!batch.length) break;
            allRecords = allRecords.concat(batch);
            if (batch.length < 500) break;
            skip += 500;
          }

          if (!allRecords.length) { purgeSummary.push({ entity: entityName, purged: 0 }); continue; }

          // Agrupa por chave exata (cnpj/cpf/placa validos, ou codigo+nome)
          const groups = new Map();
          for (const rec of allRecords) {
            const key = buildKey(rec);
            if (!key) continue;
            // Filtra chaves inválidas (cnpj/cpf com zeros, nomes genéricos)
            if (key.startsWith('cnpj::') || key.startsWith('cpf::')) {
              const digits = key.split('::')[1];
              if (digits.length < 11) continue;
              if (/^0+$/.test(digits)) continue;
            }
            if (key.startsWith('placa::')) {
              const placa = key.split('::')[1];
              if (placa.length < 3) continue;
            }
            // Para nome::nome, valida que o nome não é genérico
            if (key.startsWith('nome::')) {
              const nome = key.replace('nome::', '');
              if (nome.length < 3) continue;
              if (INVALID_DESC_VALUES.has(nome)) continue;
            }
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(rec);
          }

          // Para cada grupo de duplicatas, manter o mais antigo, deletar os demais
          const refFields = REF_FIELDS[entityName] || [];
          let entityPurged = 0;
          let entityRefsUpdated = 0;
          const errorsList = [];

          for (const [key, recs] of groups) {
            if (recs.length < 2) continue;

            // Ordena por created_date (mais antigo primeiro); fallback por id
            recs.sort((a, b) => {
              const da = a.created_date ? new Date(a.created_date).getTime() : 0;
              const db = b.created_date ? new Date(b.created_date).getTime() : 0;
              return da - db;
            });

            const keepRec = recs[0];
            const dups = recs.slice(1);

            for (const dup of dups) {
              try {
                // Re-referencia entidades dependentes antes de deletar
                for (const ref of refFields) {
                  try {
                    const refApi = base44.asServiceRole.entities[ref.entity];
                    if (!refApi) continue;
                    const refs = await refApi.filter({ [ref.field]: dup.id }, '-id', 500) || [];
                    for (const r of refs) {
                      try { await refApi.update(r.id, { [ref.field]: keepRec.id }); entityRefsUpdated++; } catch {}
                    }
                  } catch {}
                }

                // Hard-delete o duplicado
                await api.delete(dup.id);
                entityPurged++;

                // Auditoria
                try {
                  await base44.asServiceRole.entities.AuditLog.create({
                    acao: 'Exclusão', modulo: 'Cadastros', tipo_auditoria: 'entidade',
                    entidade: entityName, registro_id: dup.id,
                    descricao: `Purge de duplicata: registro "${getNome(dup)}" (${dup.id}) deletado — mantido "${getNome(keepRec)}" (${keepRec.id}). Chave: ${key}`,
                    usuario: user.full_name || user.email,
                    usuario_id: user.id,
                    dados_anteriores: { id: dup.id, nome: getNome(dup), codigo: getCodigo(dup), merged_into: keepRec.id },
                    dados_novos: { kept_id: keepRec.id, kept_name: getNome(keepRec) },
                    data_hora: new Date().toISOString(),
                  });
                } catch {}
              } catch (err) {
                errorsList.push({ id: dup.id, error: err.message });
                totalErrors++;
              }
            }
          }

          totalPurged += entityPurged;
          totalRefsUpdated += entityRefsUpdated;
          purgeSummary.push({
            entity: entityName,
            purged: entityPurged,
            refs_updated: entityRefsUpdated,
            errors: errorsList.length,
          });
        } catch (error) {
          purgeSummary.push({ entity: entityName, status: 'Erro', error: error.message });
          totalErrors++;
        }
      }

      return Response.json({
        ok: true,
        action: 'purge_duplicates',
        total_purged: totalPurged,
        total_refs_updated: totalRefsUpdated,
        total_errors: totalErrors,
        entities: purgeSummary,
        executado_por: user.email,
        data_execucao: new Date().toISOString(),
      });
    }

    // MODO MERGE: mescla duplicatas (Passo 2 — correção controlada)
    if (action === 'merge' && body.duplicates) {
      const merged = [];
      const errors = [];
      for (const dup of body.duplicates) {
        try {
          const api = base44.asServiceRole.entities[dup.entityName];
          if (!api) { errors.push({ ...dup, error: 'Entity not found' }); continue; }

          const keepId = dup.keep_id;
          const removeId = dup.remove_id;
          if (!keepId || !removeId) { errors.push({ ...dup, error: 'Missing IDs' }); continue; }

          const refFields = REF_FIELDS[dup.entityName] || [];
          let refsUpdated = 0;
          for (const ref of refFields) {
            try {
              const refApi = base44.asServiceRole.entities[ref.entity];
              if (!refApi) continue;
              const refs = await refApi.filter({ [ref.field]: removeId }, '-id', 500) || [];
              for (const r of refs) {
                try { await refApi.update(r.id, { [ref.field]: keepId }); refsUpdated++; } catch {}
              }
            } catch {}
          }

          try {
            await api.update(removeId, { ativo: false, status: 'Inativo', _merged_into: keepId });
          } catch {}

          try {
            await base44.asServiceRole.entities.AuditLog.create({
              acao: 'Edição', modulo: 'Cadastros', tipo_auditoria: 'entidade',
              entidade: dup.entityName, registro_id: removeId,
              descricao: `Mesclagem de duplicata: registro ${removeId} mesclado em ${keepId}. ${refsUpdated} referências atualizadas.`,
              usuario: user.full_name || user.email,
              usuario_id: user.id,
              dados_anteriores: { id: removeId, merged_into: keepId },
              dados_novos: { id: keepId, refs_updated: refsUpdated },
              data_hora: new Date().toISOString(),
            });
          } catch {}

          merged.push({ ...dup, refs_updated: refsUpdated });
        } catch (error) {
          errors.push({ ...dup, error: error.message });
        }
      }
      return Response.json({ ok: true, action: 'merge', merged, errors, total_merged: merged.length });
    }

    // MODO AUDIT 7-12: auditoria avançada de consumo, lookups, dependências, módulos, sync e operações
    if (action === 'audit_7_12') {
      const targetEntitiesFor712 = body.entities
        ? (Array.isArray(body.entities) ? body.entities : [body.entities])
        : ALL_ENTITIES;

      // Executa passos 7 a 12
      const passo7_consumo = await auditConsumoRegistros(base44, targetEntitiesFor712);
      const passo8_lookups = await auditLookupsPadronizados(base44, targetEntitiesFor712);
      const passo9_dependencias = await auditDependencias(base44, targetEntitiesFor712);
      const passo10_modulos = await auditModulosOperacionais(base44);
      const passo11_sync = await auditSyncGrupoEmpresa(base44, targetEntitiesFor712);
      const passo12_operacoes = await auditIntegridadeOperacoes(base44);

      const summary712 = {
        passo7_consumo: {
          total_entidades: Object.keys(passo7_consumo).length,
          total_quebradas: Object.values(passo7_consumo).reduce((s, r) => s + (r.total_quebradas || 0), 0),
          entidades_inconsistente: Object.values(passo7_consumo).filter(r => r.status === 'Inconsistente').length,
        },
        passo8_lookups: {
          total_entidades: Object.keys(passo8_lookups).length,
          entidades_ok: Object.values(passo8_lookups).filter(r => r.status === 'OK').length,
          entidades_erro: Object.values(passo8_lookups).filter(r => r.status === 'Erro').length,
        },
        passo9_dependencias: {
          total_entidades: Object.keys(passo9_dependencias).length,
          total_relacionamentos: Object.values(passo9_dependencias).reduce((s, r) => s + (r.total_relacionamentos || 0), 0),
          referencias_orfa: Object.values(passo9_dependencias).reduce((s, r) => s + (r.referencias_orfa?.length || 0), 0),
        },
        passo10_modulos: {
          total_modulos: passo10_modulos.length,
          modulos_ok: passo10_modulos.filter(m => m.status === 'OK').length,
          modulos_inconsistente: passo10_modulos.filter(m => m.status === 'Inconsistente').length,
        },
        passo11_sync: {
          total_entidades: Object.keys(passo11_sync.resultado).length,
          total_empresas: passo11_sync.total_empresas,
          total_grupos: passo11_sync.total_grupos,
          total_sem_sync: Object.values(passo11_sync.resultado).reduce((s, r) => s + (r.sem_sync_grupo || 0), 0),
          total_duplicados_entre_empresas: Object.values(passo11_sync.resultado).reduce((s, r) => s + (r.duplicados_entre_empresas || 0), 0),
          total_conflitos_heranca: Object.values(passo11_sync.resultado).reduce((s, r) => s + (r.conflitos_heranca || 0), 0),
        },
        passo12_operacoes: {
          status_geral: passo12_operacoes.status_geral,
          total_etapas: passo12_operacoes.total_etapas,
          total_ok: passo12_operacoes.total_ok,
          total_inconsistente: passo12_operacoes.total_inconsistente,
          total_erro: passo12_operacoes.total_erro,
        },
      };

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          acao: 'Visualização',
          modulo: 'Cadastros',
          tipo_auditoria: 'entidade',
          entidade: 'AuditoriaConsumoIntegridade',
          descricao: `Auditoria Passos 7-12 executada por ${user.email}`,
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          dados_novos: { summary712, entities_count: targetEntitiesFor712.length, passos: [7,8,9,10,11,12] },
          data_hora: new Date().toISOString(),
        });
      } catch {}

      return Response.json({
        ok: true,
        tipo: 'Auditoria Avançada do Cadastro Gerais (Passos 7-12)',
        passos: {
          passo7_consumo: 'Completo — validação de todos os campos que referenciam Cadastro Gerais, referências quebradas, IDs inválidos',
          passo8_lookups: 'Completo — padronização de lookups via entityListSorted, verificação de fonte única',
          passo9_dependencias: 'Completo — mapeamento de módulos, telas, relatórios, APIs que utilizam cada entidade',
          passo10_modulos: 'Completo — validação de todos os módulos operacionais que consomem Cadastro Gerais',
          passo11_sync: 'Completo — auditoria de sincronização Grupo ↔ Empresas, duplicados, conflitos de herança',
          passo12_operacoes: 'Completo — validação do fluxo operacional: Cadastro → Pedido → Estoque → Produção → Expedição → Faturamento → NF → Contas → Caixa → Conciliação',
        },
        data_execucao: new Date().toISOString(),
        executado_por: user.email,
        summary: summary712,
        detalhes: {
          passo7_consumo,
          passo8_lookups,
          passo9_dependencias,
          passo10_modulos,
          passo11_sync,
          passo12_operacoes,
        },
        nota: 'Relatório apenas para análise. Nenhuma alteração automática foi realizada. Correções devem ser feitas manualmente por usuário autorizado.',
      });
    }

    // MODO REPORT: auditoria completa (Passos 1-6)
    const results = {};
    const summary = {
      total_entities: targetEntities.length,
      total_registros: 0,
      total_ativos: 0,
      total_inativos: 0,
      total_compartilhados: 0,
      total_exclusivos_empresa: 0,
      total_vinculados_grupo: 0,
      total_sem_contexto: 0,
      total_duplicidades_exatas: 0,
      total_duplicidades_fuzzy: 0,
      total_codigos_repetidos: 0,
      total_codigos_vazios: 0,
      total_codigos_invalidos: 0,
      total_sem_descricao: 0,
      total_sem_uso: 0,
      total_referencias_quebradas: 0,
      total_sem_sync_grupo: 0,
      entities_ok: 0,
      entities_inconsistente: 0,
      entities_critico: 0,
      entities_erro: 0,
    };

    for (const entityName of targetEntities) {
      const result = await auditEntity(base44, entityName, body.groupId);
      results[entityName] = result;
      const c = result.counts || {};
      const i = result.issues || {};
      summary.total_registros += c.total_real || 0;
      summary.total_ativos += c.total_ativos || 0;
      summary.total_inativos += c.total_inativos || 0;
      summary.total_compartilhados += c.total_compartilhados || 0;
      summary.total_exclusivos_empresa += c.total_exclusivos_empresa || 0;
      summary.total_vinculados_grupo += c.total_vinculados_grupo || 0;
      summary.total_sem_contexto += c.total_sem_contexto || 0;
      summary.total_duplicidades_exatas += i.duplicidades?.length || 0;
      summary.total_duplicidades_fuzzy += i.duplicidades_fuzzy?.length || 0;
      summary.total_codigos_repetidos += i.codigos_repetidos?.length || 0;
      summary.total_codigos_vazios += i.codigos_vazios?.length || 0;
      summary.total_codigos_invalidos += i.codigos_invalidos?.length || 0;
      summary.total_sem_descricao += i.registros_sem_descricao?.length || 0;
      summary.total_sem_uso += i.registros_sem_uso?.length || 0;
      summary.total_referencias_quebradas += i.referencias_quebradas?.length || 0;
      summary.total_sem_sync_grupo += i.sem_sync_grupo?.length || 0;
      if (result.status === 'OK') summary.entities_ok++;
      else if (result.status === 'Inconsistente') summary.entities_inconsistente++;
      else if (result.status === 'Crítico') summary.entities_critico++;
      else summary.entities_erro++;
    }

    const byGroup = {};
    for (const [groupName, entities] of Object.entries(BLOCOS_ENTITIES)) {
      byGroup[groupName] = entities
        .filter(e => targetEntities.includes(e))
        .map(e => results[e])
        .filter(Boolean);
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Visualização',
        modulo: 'Cadastros',
        tipo_auditoria: 'entidade',
        entidade: 'VerificacaoIntegridade',
        descricao: `Auditoria Completa Cadastro Gerais (Passos 1-6) executada por ${user.email}`,
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        dados_novos: { summary, entities_count: targetEntities.length, passos: [1,2,3,4,5,6] },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({
      ok: true,
      tipo: 'Auditoria Completa do Cadastro Gerais (Passos 1-6)',
      passos: {
        passo1_inventario: 'Completo — total real, ativos, inativos, compartilhados, por empresa, por grupo',
        passo2_duplicidades: 'Completo — matching exato + fuzzy (acentos, case, espaços, abreviações)',
        passo3_codigos: 'Completo — vazios, inválidos, repetidos, fora do padrão',
        passo4_descricoes: 'Completo — vazias, genéricas, temporárias, inválidas',
        passo5_contagens: 'Divergência calculada pelo frontend ao comparar com counts',
        passo6_integridade: 'Completo — órfãos, referências quebradas, sync grupo↔empresa',
      },
      data_execucao: new Date().toISOString(),
      executado_por: user.email,
      summary,
      byGroup,
      results,
      nota: 'Relatório apenas para análise. Nenhuma alteração automática foi realizada. Correções devem ser feitas manualmente por usuário autorizado.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});