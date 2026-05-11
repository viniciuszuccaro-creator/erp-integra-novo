import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Entidades com campo empresas_compartilhadas_ids — precisam de $or expandido
const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora', 'Colaborador', 'Produto']);

const SIMPLE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
  'TabelaPrecoItem', 'CentroOperacao', 'ConfiguracaoDespesaRecorrente',
]);

function normalizeSharedFilter(f) {
  if (!f || typeof f !== 'object') return f || {};
  let out = { ...f };
  if ('empresas_compartilhadas_ids' in out && typeof out.empresas_compartilhadas_ids === 'string') {
    out.empresas_compartilhadas_ids = { $in: [out.empresas_compartilhadas_ids] };
  }
  if (Array.isArray(out.$or)) {
    out.$or = out.$or.map(cond => {
      if (cond?.empresas_compartilhadas_ids && typeof cond.empresas_compartilhadas_ids === 'string') {
        return { ...cond, empresas_compartilhadas_ids: { $in: [cond.empresas_compartilhadas_ids] } };
      }
      return cond;
    });
  }
  return out;
}

async function expandGroupFilter(base44, entityName, f) {
  const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
    : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');

  // Caso 1: entidades do EXPAND_SET com empresa_id — inclui legados + compartilhados
  if (EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or) {
    const { empresa_id, ...rest } = f;
    const orConds = [
      { [ctxCampo]: empresa_id },
      { empresas_compartilhadas_ids: { $in: [empresa_id] } },
    ];
    // Para Produto: inclui produtos do grupo compartilhados
    if (entityName === 'Produto') {
      orConds.push({ compartilhado_grupo: true });
    } else {
      orConds.push({ empresa_id: null }); // registros legados sem empresa
    }
    if (ctxCampo !== 'empresa_id') orConds.push({ empresa_id });
    return { ...rest, $or: orConds };
  }

  // Caso 2: demais entidades com empresa_id — inclui legados
  if (!EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or && !f?.group_id) {
    const { empresa_id, ...rest } = f;
    return { ...rest, $or: [{ empresa_id }, { empresa_id: null }] };
  }

  if (f?.$or && f?.group_id) {
    const { group_id, ...rest } = f;
    return { ...rest, $or: [...f.$or, { group_id }] };
  }

  if (f?.group_id && !f?.$or && !f?.empresa_id && !f?.empresa_dona_id && !f?.empresa_alocada_id) {
    try {
      const groupId = f.group_id;
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, '-id', 200);
      const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
      const rest = { ...f };
      delete rest.group_id;
      if (EXPAND_SET.has(entityName)) {
        const orConds = [
          { [ctxCampo]: { $in: empresasIds } },
          ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
          { empresas_compartilhadas_ids: { $in: empresasIds } },
          { group_id: groupId },
        ];
        if (entityName !== 'Produto') orConds.push({ empresa_id: null }); // legados
        if (entityName === 'Produto') orConds.push({ compartilhado_grupo: true });
        return { ...rest, $or: orConds };
      }
      return { ...rest, $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }, { empresa_id: null }] };
    } catch (_) { /* fallback */ }
  }
  return f;
}

/**
 * fastCount V2 — contagem eficiente com retry automático em 429
 * Estratégia: páginas de 500 com delay progressivo.
 * Primeira page: sem delay. Pages seguintes: delay crescente.
 */
const COUNT_CACHE = new Map();
const COUNT_CACHE_TTL_MS = 5 * 60 * 1000;

function stableCacheKey(entityName, finalFilter) {
  try { return `${entityName}:${JSON.stringify(finalFilter || {}, Object.keys(finalFilter || {}).sort())}`; }
  catch (_) { return `${entityName}:${Date.now()}`; }
}

async function fastCount(base44, entityName, finalFilter) {
  const PAGE = 1000;
  const MAX_PAGES = 1; // modo proteção: 1 chamada por entidade para evitar rate limit
  const key = stableCacheKey(entityName, finalFilter);
  const cached = COUNT_CACHE.get(key);
  if (cached && Date.now() - cached.ts < COUNT_CACHE_TTL_MS) return cached.count;

  let total = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    let batch = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, '-id', PAGE, page * PAGE);
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if (status === 429) {
          if (cached) return cached.count;
          await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)));
        } else {
          batch = [];
          break;
        }
      }
    }

    const n = Array.isArray(batch) ? batch.length : 0;
    total += n;
    if (n < PAGE) break;
  }

  COUNT_CACHE.set(key, { count: total, ts: Date.now() });
  return total;
}

async function countOne(base44, user, payload) {
  const { entityName, filter = {} } = payload || {};
  if (!entityName) return { entityName, count: 0 };

  const isSimple = SIMPLE_CATALOG.has(entityName);
  const hasOr = Array.isArray(filter?.$or) && filter.$or.length > 0;
  const scopeProvided = filter?.empresa_id || filter?.group_id || filter?.empresa_dona_id || filter?.empresa_alocada_id || hasOr;

  // Entidades simples (catálogos) não precisam de escopo — retorna contagem total
  if (isSimple) {
    const simpleCount = await fastCount(base44, entityName, {});
    return { entityName, count: simpleCount };
  }

  // Sem escopo → conta total global (badges indicativos); dados protegidos via entityListSorted
  if (!scopeProvided) {
    const totalCount = await fastCount(base44, entityName, {});
    return { entityName, count: totalCount };
  }

  let finalFilter = normalizeSharedFilter({ ...filter });

  // Expande group_id mesmo quando $or já foi enviado (garante expansão de empresas)
  if (!isSimple) {
    finalFilter = await expandGroupFilter(base44, entityName, finalFilter);
  }

  const count = await fastCount(base44, entityName, finalFilter);
  return { entityName, count };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { }

    const entitiesBatch = Array.isArray(body?.entities) ? body.entities : null;

    // MODO LOTE: { entities: [{ entityName, filter }, ...] }
    // Processa em modo serial protegido para evitar rajadas e erro 429
    if (entitiesBatch && entitiesBatch.length > 0) {
    const counts = {};
    const WINDOW = 1;
    const DELAY_BETWEEN_WINDOWS = 900;

      for (let i = 0; i < entitiesBatch.length; i += WINDOW) {
        const slice = entitiesBatch.slice(i, i + WINDOW);
        const results = await Promise.allSettled(
          slice.map(payload => countOne(base44, user, payload || {}))
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
          await new Promise(r => setTimeout(r, DELAY_BETWEEN_WINDOWS));
        }
      }

      return Response.json({ counts });
    }

    // MODO SINGLE
    const single = await countOne(base44, user, {
      entityName: body?.entityName,
      filter: body?.filter || {}
    });

    if (single.error) {
      return Response.json(single, { status: single.error === 'escopo_obrigatorio' ? 400 : 500 });
    }
    return Response.json({ count: single.count, entityName: single.entityName });

  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});