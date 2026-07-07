import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * countEntities V6 — CORREÇÃO DEFINITIVA DE CONTAGEM INFLADA
 *
 * PROBLEMA CORRIGIDO:
 * - EXPAND_SET com empresa_id NÃO inclui mais { empresa_id: null } (causava contar TODOS os legados)
 * - Catálogos simples sem campo empresa_id contam global (Banco, FormaPagamento, etc.)
 * - Entidades com escopo (Empresa, Departamento, etc.) respeitam empresa_id/group_id
 * - Produto NÃO inclui compartilhado_grupo: true ao filtrar por empresa específica (duplicaria)
 */

// Entidades que têm campo empresa_id/empresa_dona_id/empresa_alocada_id e devem ser filtradas
const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora', 'Colaborador', 'Produto']);

// Campo principal de empresa por entidade
const EMPRESA_CAMPO = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};
const getCampo = (name) => EMPRESA_CAMPO[name] || 'empresa_id';

// Catálogos puros sem escopo de empresa (contam global — são dados de referência)
const PURE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'TabelaFiscal', 'TabelaPrecoItem', 'CentroOperacao',
]);

// Catálogos simples (podem ter empresa_id/group_id mas também podem ser globais)
const SIMPLE_CATALOG = new Set([
  'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
  'ConfiguracaoDespesaRecorrente',
]);

// Cache TTL
const COUNT_CACHE = new Map();
const TTL = 30_000;

function cacheKey(name, filter) {
  try { return `${name}:${JSON.stringify(filter, Object.keys(filter).sort())}`; }
  catch (_) { return `${name}:nokey`; }
}

async function fastCount(base44, entityName, filter) {
  const key = cacheKey(entityName, filter || {});
  const cached = COUNT_CACHE.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.count;

  let count = 0;
  try {
    const rows = await base44.asServiceRole.entities[entityName].filter(filter || {}, '-id', 9999, 0);
    count = Array.isArray(rows) ? rows.length : 0;
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || (typeof status === 'number' && status >= 500)) {
      return cached?.count || 0;
    }
  }

  COUNT_CACHE.set(key, { count, ts: Date.now() });
  return count;
}

async function buildFilter(base44, entityName, rawFilter) {
  const empresaId = rawFilter?.empresa_id || null;
  const groupId = rawFilter?.group_id || null;
  const campo = getCampo(entityName);

  // Sem escopo → filtro vazio (conta global — só acontece para catálogos puros)
  if (!empresaId && !groupId) return {};

  // Contexto de empresa específica
  if (empresaId && !groupId) {
    if (EXPAND_SET.has(entityName)) {
      // Conta apenas registros que pertencem a esta empresa (campo principal)
      // NÃO inclui empresa_id: null (legados) — isso inflaria a contagem
      const conds = [{ [campo]: empresaId }];
      // Inclui registros compartilhados com esta empresa
      conds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
      if (campo !== 'empresa_id') conds.push({ empresa_id: empresaId });
      return { $or: conds };
    }
    // Demais entidades com empresa_id
    return { [campo]: empresaId };
  }

  // Contexto de grupo — expande para todas as empresas do grupo + órfãos
  if (groupId && !empresaId) {
    try {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, '-id', 200);
      const ids = (empresas || []).map(e => e.id).filter(Boolean);

      if (EXPAND_SET.has(entityName)) {
        const conds = [{ group_id: groupId }, { empresa_id: null, group_id: null }];
        if (ids.length > 0) conds.push({ [campo]: { $in: ids } });
        if (campo !== 'empresa_id' && ids.length > 0) conds.push({ empresa_id: { $in: ids } });
        return { $or: conds };
      }

      // Demais entidades: filtra pelo group_id direto, empresa dentro do grupo, ou órfãos
      const conds = [{ group_id: groupId }, { empresa_id: null, group_id: null }];
      if (ids.length > 0) conds.push({ [campo]: { $in: ids } });
      return { $or: conds };
    } catch (_) {
      return { group_id: groupId };
    }
  }

  return rawFilter || {};
}

async function countOne(base44, payload) {
  const { entityName, filter = {} } = payload || {};
  if (!entityName) return { entityName, count: 0 };

  // Se o filtro já contém $or ou $and (filtro de contexto complexo do frontend),
  // usa-o diretamente sem reconstruir — garante que contagem bate com a tabela
  if (filter.$or || filter.$and) {
    return { entityName, count: await fastCount(base44, entityName, filter) };
  }

  // Catálogos puros — sem escopo, sempre global
  if (PURE_CATALOG.has(entityName)) {
    return { entityName, count: await fastCount(base44, entityName, {}) };
  }

  // Catálogos simples sem filtro explícito — conta global
  if (SIMPLE_CATALOG.has(entityName) && !filter.empresa_id && !filter.group_id) {
    return { entityName, count: await fastCount(base44, entityName, {}) };
  }

  const finalFilter = await buildFilter(base44, entityName, filter);
  return { entityName, count: await fastCount(base44, entityName, finalFilter) };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const entitiesBatch = Array.isArray(body?.entities) ? body.entities : null;

    if (entitiesBatch && entitiesBatch.length > 0) {
      const counts = {};
      const WINDOW = 5;
      const DELAY = 300;

      for (let i = 0; i < entitiesBatch.length; i += WINDOW) {
        const slice = entitiesBatch.slice(i, i + WINDOW);
        const results = await Promise.allSettled(
          slice.map(payload => countOne(base44, payload || {}))
        );
        results.forEach((r, idx) => {
          const payload = slice[idx] || {};
          if (r.status === 'fulfilled' && r.value?.entityName != null) {
            counts[r.value.entityName] = r.value.count;
          } else if (payload?.entityName) {
            counts[payload.entityName] = 0;
          }
        });
        if (i + WINDOW < entitiesBatch.length) {
          await new Promise(r => setTimeout(r, DELAY));
        }
      }

      return Response.json({ counts });
    }

    // Modo single
    const single = await countOne(base44, {
      entityName: body?.entityName,
      filter: body?.filter || {}
    });
    return Response.json({ count: single.count, entityName: single.entityName });

  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});