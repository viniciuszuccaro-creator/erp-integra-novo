import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { idbGet, idbSet } from "@/components/lib/useIndexedDBCache";

// In-flight dedupe + tiny backoff for 429 on entityListSorted
const __elsInflight = (typeof window !== 'undefined' ? (window.__elsInflight || (window.__elsInflight = new Map())) : new Map());
const __elsCache = (typeof window !== 'undefined' ? (window.__elsCache || (window.__elsCache = new Map())) : new Map());
const __elsLastCallAt = (typeof window !== 'undefined' ? (window.__elsLastCallAt || (window.__elsLastCallAt = new Map())) : new Map());
const __elsCooldownUntil = (typeof window !== 'undefined' ? (window.__elsCooldownUntil || (window.__elsCooldownUntil = new Map())) : new Map());
const __elsEntityBusy = (typeof window !== 'undefined' ? (window.__elsEntityBusy || (window.__elsEntityBusy = new Map())) : new Map());
const __elsStrikeCount = (typeof window !== 'undefined' ? (window.__elsStrikeCount || (window.__elsStrikeCount = new Map())) : new Map());
const __elsGlobalState = (typeof window !== 'undefined' ? (window.__elsGlobalState || (window.__elsGlobalState = { busy: false, lastCallAt: 0, cooldownUntil: 0 })) : { busy: false, lastCallAt: 0, cooldownUntil: 0 });

// Stable stringify (sorted keys) to avoid cache misses when object key order changes
function stableStringify(value) {
  const seen = new WeakSet();
  const stringify = (val) => {
    if (val && typeof val === 'object') {
      if (seen.has(val)) return '"[circular]"';
      seen.add(val);
      if (Array.isArray(val)) return '[' + val.map(stringify).join(',') + ']';
      const keys = Object.keys(val).sort();
      return '{' + keys.map(k => JSON.stringify(k) + ':' + stringify(val[k])).join(',') + '}';
    }
    return JSON.stringify(val);
  };
  return stringify(value);
}

export default function useEntityListSorted(entityName, criterios = {}, options = {}) {
  const { getFiltroContexto } = useContextoVisual();
  const {
    sortField = undefined,
    sortDirection = undefined,
    limit = undefined,
    campo = "empresa_id",
    page = 1,
    pageSize = 100,
  } = options || {};

  const filtroContextOutside = getFiltroContexto(campo, true);

  // Best default sort: last user choice -> per-entity default -> updated_date desc
  const DEFAULT_SORTS = {
    Produto: { field: 'descricao', direction: 'asc' },
    Cliente: { field: 'nome', direction: 'asc' },
    Fornecedor: { field: 'nome', direction: 'asc' },
    Pedido: { field: 'data_pedido', direction: 'desc' },
    ContaPagar: { field: 'data_vencimento', direction: 'asc' },
    ContaReceber: { field: 'data_vencimento', direction: 'asc' },
    OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
    CentroCusto: { field: 'codigo', direction: 'asc' },
    PlanoDeContas: { field: 'codigo', direction: 'asc' },
    PlanoContas: { field: 'codigo', direction: 'asc' },
    User: { field: 'full_name', direction: 'asc' }
  };

  let finalSortField = sortField;
  let finalSortDirection = sortDirection;
  if (!finalSortField || !finalSortDirection) {
    try {
      const last = JSON.parse(localStorage.getItem(`sort_${entityName}`) || 'null');
      const sf = last?.sortField ?? last?.field;
      const sd = last?.sortDirection ?? last?.direction;
      if (sf && sd) {
        finalSortField = sf;
        finalSortDirection = sd;
      }
    } catch (_) { console.error('[lib] catch:', _); }
    if (!finalSortField || !finalSortDirection) {
      finalSortField = DEFAULT_SORTS[entityName]?.field || 'updated_date';
      finalSortDirection = DEFAULT_SORTS[entityName]?.direction || 'desc';
    }
  }

  // Decide filtro final sem "estreitar" o $or vindo do caller (evita AND indevido)
  const hasOr = !!(criterios && criterios.$or && Array.isArray(criterios.$or) && criterios.$or.length);
  const hasCtxInCriterios = Boolean(
    (criterios && (criterios.group_id || criterios[campo])) || hasOr
  );
  const filtroFinal = hasCtxInCriterios ? { ...criterios } : { ...criterios, ...filtroContextOutside };
  const enabledFlag = Boolean(
    (filtroFinal && (filtroFinal.group_id || filtroFinal[campo] || filtroFinal.$or)) ||
    (filtroContextOutside && (filtroContextOutside.group_id || filtroContextOutside[campo]))
  );

  // Chave estável da query para SWR placeholderData + IDB
  const cacheKey = stableStringify({ entityName, filtroFinal, finalSortField, finalSortDirection, limit, page, pageSize });
  const idbKey = `els_${entityName}_${cacheKey}`.slice(0, 200);

  // Fase 3: carrega IDB de forma assíncrona no ref para placeholder síncrono
  const idbRef = useRef(undefined);
  useEffect(() => {
    idbGet(idbKey).then((v) => { if (Array.isArray(v)) idbRef.current = v; }).catch(() => {});
  }, [idbKey]);

  return useQuery({
    queryKey: ["entityListSorted", entityName, stableStringify(filtroFinal || {}), finalSortField, finalSortDirection, limit, page, pageSize],
    queryFn: async () => {
      const filtro = filtroFinal;
      const effLimit = Math.max(1, Math.min((typeof limit === 'number' && limit > 0) ? limit : pageSize, 500));
      const effSkip = (typeof page === 'number' && typeof pageSize === 'number') ? Math.max(0, (Math.max(1, page) - 1) * pageSize) : 0;
      const key = stableStringify({ entityName, filtro, finalSortField, finalSortDirection, limit: effLimit, skip: effSkip });

      // Dedupe: se já há uma chamada em voo para essa query exata, aguarda ela
      if (__elsInflight.has(key)) return __elsInflight.get(key);

      const exec = async () => {
        try {
          // SDK DIRETO — sem overhead de função backend serverless
          const api = base44.entities?.[entityName];
          if (!api?.filter) return [];

          const sortPrefix = finalSortDirection === 'asc' ? '' : '-';
          const sortParam = `${sortPrefix}${finalSortField}`;
          const rows = await api.filter(filtro, sortParam, effLimit, effSkip);
          const out = Array.isArray(rows) ? rows : [];

          __elsCache.set(key, out);
          __elsCache.set(cacheKey, out);
          idbSet(idbKey, out, 10 * 60 * 1000).catch(() => {});
          return out;
        } catch (_) {
          // Fallback: cache em memória → IDB
          if (__elsCache.has(key)) return __elsCache.get(key);
          try {
            const idbFallback = await idbGet(idbKey);
            if (Array.isArray(idbFallback)) return idbFallback;
          } catch (_2) { console.error('[lib] catch:', _2); }
          return [];
        }
      };

      const p = exec().finally(() => __elsInflight.delete(key));
      __elsInflight.set(key, p);
      return p;
    },
    staleTime: 15_000,
    gcTime: 300_000,
    placeholderData: (prev) => {
      if (prev !== undefined) return prev;
      if (__elsCache.has(cacheKey)) return __elsCache.get(cacheKey);
      if (idbRef.current !== undefined) return idbRef.current;
      return undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
    enabled: enabledFlag,
  });
}