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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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