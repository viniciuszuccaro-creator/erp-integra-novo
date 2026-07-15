/**
 * getEntityRecord — busca registros de entidade por ID ou filtro genérico.
 * V4: com cache in-memory (TTL 3min) para evitar rate limits.
 *   - Por ID: { entityName, id }
 *   - Por filtro: { entityName, filter, limit, sortField }
 * Usa asServiceRole para garantir acesso sem filtros de contexto (multiempresa).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CACHE = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

function cacheKey(body) {
  try { return JSON.stringify({ e: body.entityName, i: body.id, f: body.filter, l: body.limit }); }
  catch (_) { return String(body.entityName) + String(body.id); }
}

function fromCache(key) {
  const c = CACHE.get(key);
  if (!c) return null;
  if (Date.now() - c.ts > CACHE_TTL) { CACHE.delete(key); return null; }
  return c.data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { console.error('[getEntityRecord] catch:', _); }

    const { entityName, id, filter, limit, sortField, nocache } = body;
    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    const api = base44.asServiceRole.entities[entityName];
    if (!api) {
      return Response.json({ error: `Entidade "${entityName}" não encontrada` }, { status: 404 });
    }

    const ck = cacheKey(body);

    // MODO 1: busca por ID
    if (id) {
      const cached = !nocache ? fromCache(ck) : null;
      if (cached) return Response.json(cached);

      let record = null;
      if (typeof api.get === 'function') {
        try { record = await api.get(id); } catch (_) { console.error('[getEntityRecord] catch:', _); }
      }
      if (!record && typeof api.filter === 'function') {
        try {
          const res = await api.filter({ id }, '-updated_date', 1);
          if (Array.isArray(res) && res.length > 0) record = res[0];
        } catch (_) { console.error('[getEntityRecord] catch:', _); }
      }
      if (!record) return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
      const resp = { record, _ts: Date.now() };
      CACHE.set(ck, { data: resp, ts: Date.now() });
      return Response.json(resp);
    }

    // MODO 2: busca por filtro genérico (para ConfiguracaoSistema e outros)
    if (filter && typeof filter === 'object') {
      const cached = !nocache ? fromCache(ck) : null;
      if (cached) return Response.json(cached);

      const maxLimit = Math.min(Number(limit) || 50, 500);
      const sort = sortField || '-updated_date';
      if (typeof api.filter === 'function') {
        const res = await api.filter(filter, sort, maxLimit);
        const data = Array.isArray(res) ? res : [];
        const resp = { data, _ts: Date.now() };
        CACHE.set(ck, { data: resp, ts: Date.now() });
        return Response.json(resp);
      }
    }

    return Response.json({ error: 'Parâmetros insuficientes: forneça id ou filter' }, { status: 400 });
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429) {
      return Response.json({ error: 'Rate limit — tente em instantes', _ts: Date.now() }, { status: 429 });
    }
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});