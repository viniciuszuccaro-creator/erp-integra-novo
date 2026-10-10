/**
 * functionsFallback.js — Fallback central de leitura quando as backend functions
 * estão indisponíveis (HTTP 402 — plano sem backend functions / 404 — handler ausente)
 * + governador de tráfego (fila + nova tentativa em "Rate limit exceeded").
 *
 * Regra-Mãe 2: melhoria no existente — intercepta base44.functions.invoke APENAS para
 * as funções de leitura (entityListSorted, countEntities, countEntitiesOptimized,
 * getEntityRecord) e substitui por consultas diretas ao banco via SDK. Nenhuma função
 * de escrita é substituída (entityGuard, nfeActions, whatsappSend etc. continuam falhando alto).
 */
const SEARCH_FIELDS = [
  'nome', 'razao_social', 'nome_fantasia', 'nome_completo',
  'descricao', 'titulo', 'codigo',
];

function buildSearchFilter(filter, search) {
  const term = (search || '').trim();
  if (!term) return filter || {};
  const or = SEARCH_FIELDS.map(f => ({ [f]: { $regex: term, $options: 'i' } }));
  return { $and: [filter || {}, { $or: or }] };
}

function errText(e) { return String(e?.response?.data?.message || e?.message || ''); }

function isBlockedByPlan(e) {
  const status = e?.response?.status || e?.status;
  return status === 402 || /status code 402/.test(String(e?.message || '')) || /functions? (are )?blocked/i.test(errText(e));
}

function isUnavailable(e) {
  const status = e?.response?.status || e?.status;
  if (status === 404 || /status code 404/.test(String(e?.message || ''))) return true;
  return isBlockedByPlan(e);
}

// Funções somente-leitura que podem cair para consulta SDK direta sem risco
const READ_FUNCTIONS = new Set(['entityListSorted', 'countEntities', 'countEntitiesOptimized', 'getEntityRecord']);
function isReadFn(fn) { return READ_FUNCTIONS.has(fn); }

// ── Governador de tráfego: rajadas de consultas saem em fila (evita "Rate limit exceeded") ──
const MAX_CONCURRENT = 6;
let active = 0;
const queue = [];
function pump() {
  while (active < MAX_CONCURRENT && queue.length) {
    const { task, resolve, reject } = queue.shift();
    active++;
    Promise.resolve().then(task).then(resolve, reject).finally(() => { active--; pump(); });
  }
}
function schedule(task) {
  return new Promise((resolve, reject) => { queue.push({ task, resolve, reject }); pump(); });
}
function isRateLimited(e) {
  const status = e?.response?.status || e?.status;
  return status === 429 || /rate limit/i.test(errText(e));
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// Cada tentativa volta para a fila — o slot fica livre durante a espera
async function withRetry(fn, attempts = 4) {
  for (let i = 0; ; i++) {
    try { return await schedule(fn); }
    catch (e) {
      if (!isRateLimited(e) || i >= attempts) throw e;
      await sleep(1000 * 2 ** i + Math.random() * 400);
    }
  }
}

// Leituras de entidades: fila + nova tentativa + junção de chamadas idênticas simultâneas
const READ_METHODS = new Set(['list', 'filter', 'get', 'count', 'aggregate']);
function installEntitiesGovernor(base44) {
  const original = base44.entities;
  const inflight = new Map();
  base44.entities = new Proxy(original, {
    get(target, name) {
      const handler = target[name];
      if (!handler || typeof name !== 'string' || typeof handler !== 'object') return handler;
      return new Proxy(handler, {
        get(h, method) {
          const fn = h[method];
          if (typeof fn !== 'function') return fn;
          if (!READ_METHODS.has(method)) return fn.bind(h);
          return (...args) => {
            let key = null;
            try { key = `${name}.${method}:${JSON.stringify(args)}`; } catch { key = null; }
            if (key && inflight.has(key)) return inflight.get(key);
            const p = withRetry(() => fn.apply(h, args));
            if (key) { inflight.set(key, p); p.finally(() => inflight.delete(key)).catch(() => {}); }
            return p;
          };
        },
      });
    },
  });
}

// Usuário logado: mesma proteção (várias telas pedem ao mesmo tempo no carregamento)
function installAuthRetry(base44) {
  if (typeof base44?.auth?.me !== 'function') return;
  const me = base44.auth.me.bind(base44.auth);
  let pending = null;
  base44.auth.me = () => {
    if (pending) return pending;
    pending = withRetry(() => me());
    pending.finally(() => { pending = null; }).catch(() => {});
    return pending;
  };
}

export function installFunctionsFallback(base44) {
  if (!base44?.functions?.invoke || base44.__functionsFallbackInstalled) return;
  base44.__functionsFallbackInstalled = true;
  installEntitiesGovernor(base44);
  installAuthRetry(base44);
  const invoke = base44.functions.invoke.bind(base44.functions);

  // Plano sem backend functions (402): não repete a chamada bloqueada em cada consulta
  // (economiza 1 requisição por leitura); revalida a cada 5 minutos.
  let blockedError = null;
  let blockedUntil = 0;

  base44.functions.invoke = async (functionName, payload = {}) => {
    try {
      if (blockedError && Date.now() < blockedUntil) throw blockedError;
      return await invoke(functionName, payload);
    } catch (e) {
      if (e !== blockedError && isBlockedByPlan(e)) { blockedError = e; blockedUntil = Date.now() + 5 * 60 * 1000; }
      // Fallback para as funções de LEITURA em QUALQUER falha (402/404/timeout/erro de forma):
      // o pior caso é a consulta direta também falhar e propagar o erro original.
      if (!isReadFn(functionName) && !isUnavailable(e)) throw e;

      // entityListSorted → filtro direto + ordenação + paginação (skip/limit)
      if (functionName === 'entityListSorted') {
        const { entityName, filter, search, sortField, sortDirection, limit = 50, skip = 0 } = payload;
        const api = base44.entities?.[entityName];
        if (!api) throw e;
        const sf = (!sortField || sortField === 'id') ? 'created_date' : sortField;
        const sort = `${sortDirection === 'desc' ? '-' : ''}${sf}`;
        const finalFilter = buildSearchFilter(filter, search);
        const upTo = (Number(skip) || 0) + (Number(limit) || 50);
        const page = await api.filter(finalFilter, { sort, limit: upTo });
        const arr = Array.isArray(page?.items) ? page.items : (Array.isArray(page) ? page : []);
        return { data: arr.slice(Number(skip) || 0, upTo) };
      }

      // getEntityRecord → { data: [registro] } (contrato original: array)
      if (functionName === 'getEntityRecord') {
        const { entityName, filter, limit = 1 } = payload;
        const api = base44.entities?.[entityName];
        if (!api) throw e;
        const page = await api.filter(filter || {}, { limit: Number(limit) || 1 });
        const arr = Array.isArray(page?.items) ? page.items : (Array.isArray(page) ? page : []);
        return { data: arr };
      }

      // countEntities → count direto por entidade (batch: {entities:[{entityName, filter}]} ou único)
      if (functionName === 'countEntities' || functionName === 'countEntitiesOptimized') {
        if (Array.isArray(payload?.entities)) {
          const counts = {};
          await Promise.all(payload.entities.map(async (item) => {
            const entityName = item?.entityName || item?.name;
            const api = base44.entities?.[entityName];
            if (!api?.count) { counts[entityName] = 0; return; }
            try { counts[entityName] = await api.count(item.filter || {}); }
            catch { counts[entityName] = 0; }
          }));
          // Contrato original da função: { data: { counts: { entidade: n } } }
          return { data: { counts } };
        }
        const api = base44.entities?.[payload?.entityName];
        if (!api?.count) throw e;
        const n = await api.count(payload.filter || {});
        return { data: { count: n, total: n } };
      }

      throw e;
    }
  };
}