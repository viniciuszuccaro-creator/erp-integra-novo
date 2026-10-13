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
  'nome', 'razao_social', 'nome_fantasia', 'nome_completo', 'descricao', 'titulo', 'codigo',
  'nome_cargo', 'nome_departamento', 'nome_turno', 'nome_rota', 'nome_modelo',
  'nome_perfil', 'nome_do_grupo', 'nome_api', 'nome_canal', 'nome_intent',
  'nome_job', 'nome_webhook', 'nome_evento', 'nome_condicao', 'nome_grupo',
  'nome_marca', 'nome_conta', 'sigla', 'placa', 'codigo_banco', 'cpf_cnpj',
];

export function buildSearchFilter(filter, search) {
  const term = String(search || '').trim();
  if (!term) return filter || {};
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const or = SEARCH_FIELDS.map(f => ({ [f]: { $regex: escaped, $options: 'i' } }));
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

// Leituras interativas têm prioridade sobre contagens; uma recusa pausa toda a fila.
const MAX_CONCURRENT = 4;
const START_INTERVAL_MS = 120;
let active = 0;
let nextStart = 0;
let pausedUntil = 0;
let pumpTimer = null;
const queue = [];
function pump() {
  clearTimeout(pumpTimer);
  if (!queue.length || active >= MAX_CONCURRENT) return;
  const wait = Math.max(nextStart, pausedUntil) - Date.now();
  if (wait > 0) { pumpTimer = setTimeout(pump, wait); return; }
  queue.sort((a, b) => b.priority - a.priority);
  const { task, resolve, reject } = queue.shift();
  active++;
  nextStart = Date.now() + START_INTERVAL_MS;
  Promise.resolve().then(task).then(resolve, reject).finally(() => { active--; pump(); });
  pump();
}
function schedule(task, priority = 1) {
  return new Promise((resolve, reject) => { queue.push({ task, resolve, reject, priority }); pump(); });
}
function isRateLimited(e) {
  return (e?.response?.status || e?.status) === 429 || /rate limit/i.test(errText(e));
}
async function withRetry(fn, priority = 1) {
  for (let attempt = 0; ; attempt++) {
    try { return await schedule(fn, priority); }
    catch (e) {
      if (!isRateLimited(e) || attempt >= 3) throw e;
      const retryAfter = e?.response?.headers?.['retry-after'];
      const retryMs = Number(retryAfter) * 1000 || Math.max(0, Date.parse(retryAfter) - Date.now()) || 0;
      pausedUntil = Math.max(pausedUntil, Date.now() + Math.max(retryMs, 2000 * 2 ** attempt));
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
            const p = withRetry(() => fn.apply(h, args), method === 'count' || method === 'aggregate' ? 0 : 1);
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
    pending = withRetry(() => me(), 2);
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

  // As quatro leituras usam o SDK autenticado diretamente, sem sondagens bloqueadas.
  // Escritas continuam no fluxo original; permissões e auditoria não são substituídas.
  base44.functions.invoke = async (functionName, payload = {}) => {
    if (!isReadFn(functionName)) return invoke(functionName, payload);
    const e = new Error(`Leitura indisponível para ${payload.entityName || functionName}`);

      // entityListSorted → filtro direto + ordenação + paginação (skip/limit)
      if (functionName === 'entityListSorted') {
        const { entityName, filter, search, sortField, sortDirection, limit = 50, skip = 0 } = payload;
        const api = base44.entities?.[entityName];
        if (!api) throw e;
        const sf = (!sortField || sortField === 'id') ? 'created_date' : sortField;
        const sort = `${sortDirection === 'desc' ? '-' : ''}${sf}`;
        const finalFilter = buildSearchFilter(filter, search);
        // Contrato legado por offset: o servidor pagina, sem baixar o prefixo da coleção.
        const arr = await api.filter(finalFilter, sort, Number(limit) || 50, Math.max(0, Number(skip) || 0));
        return { data: arr };
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
            const entityName = typeof item === 'string' ? item : item?.entityName || item?.name;
            const api = base44.entities?.[entityName];
            if (!api?.count) throw e;
            counts[entityName] = await api.count(item?.filter || {});
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
  };
}