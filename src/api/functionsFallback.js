/**
 * functionsFallback.js — Fallback central de leitura quando as backend functions
 * estão indisponíveis (HTTP 402 — plano sem backend functions / 404 — handler ausente).
 *
 * Regra-Mãe 2: melhoria no existente — intercepta base44.functions.invoke APENAS para
 * as funções de leitura (entityListSorted, countEntities, countEntitiesOptimized) e
 * substitui por consultas diretas ao banco via SDK. Nenhuma função de escrita é
 * substituída (entityGuard, nfeActions, whatsappSend etc. continuam falhando alto).
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

function isUnavailable(e) {
  const status = e?.response?.status || e?.status;
  if (status === 402 || status === 404) return true;
  if (/status code (402|404)/.test(String(e?.message || ''))) return true;
  if (/functions? (are )?blocked/i.test(String(e?.response?.data?.message || ''))) return true;
  return false;
}

// Funções somente-leitura que podem cair para consulta SDK direta sem risco
const READ_FUNCTIONS = new Set(['entityListSorted', 'countEntities', 'countEntitiesOptimized', 'getEntityRecord']);
function isReadFn(fn) { return READ_FUNCTIONS.has(fn); }

export function installFunctionsFallback(base44) {
  if (!base44?.functions?.invoke || base44.__functionsFallbackInstalled) return;
  base44.__functionsFallbackInstalled = true;
  const invoke = base44.functions.invoke.bind(base44.functions);

  base44.functions.invoke = async (functionName, payload = {}) => {
    try {
      return await invoke(functionName, payload);
    } catch (e) {
      // Fallback para as funções de LEITURA em QUALQUER falha (402/404/timeout/erro de forma):
      // o pior caso é a consulta direta também falhar e propagar o erro original.
      if (!isReadFn(functionName) && !isUnavailable(e)) throw e;

      // entityListSorted → filtro direto + ordenação + paginação (skip/limit) no cliente
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