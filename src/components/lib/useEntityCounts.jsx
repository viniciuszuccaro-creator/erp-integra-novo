// Contagens individuais compartilhadas entre cartões e tabelas; falhas não viram zero.
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { base44, isLocalOnlyMode } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import { buildContextFilter } from '@/components/lib/contexto/filterInContextFactory';
export { buildContextFilter, SIMPLE_CATALOG } from '@/components/lib/contexto/filterInContextFactory';

export const entityCountKey = (entityName, filter) => ['viz-count-v2', entityName, JSON.stringify(filter)];
const countCacheKey = (entityName, filter) => `viz-count-cache:${entityName}:${JSON.stringify(filter)}`;
// Cache local do último valor conhecido: badges/totais aparecem instantaneamente
// na abertura da página e a contagem real é atualizada em segundo plano.
function readCountCache(entityName, filter) {
  try {
    const v = JSON.parse(localStorage.getItem(countCacheKey(entityName, filter)) || '{}')?.v;
    return Number.isFinite(v) ? v : undefined;
  } catch { return undefined; }
}
export async function countEntityRecords(entityName, filter) {
  const n = isLocalOnlyMode
    ? (await base44.functions.invoke('countEntities', { entityName, filter })).data.count
    : await base44.entities[entityName].count(filter);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Contagem inválida de ${entityName}`);
  try { localStorage.setItem(countCacheKey(entityName, filter), JSON.stringify({ v: n, t: Date.now() })); } catch {}
  return n;
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual, empresasDoGrupo, isLoading: contextLoading } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const names = [...new Set((Array.isArray(entities) ? entities : [entities]).filter(Boolean))];
  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;
  const ready = !contextLoading && !!(groupId || empresaId);
  const allowed = names.map(e => hasPermission('Cadastros', e, 'visualizar') || hasPermission('Cadastros', null, 'visualizar'));
  const allowedKey = allowed.join(',');
  const filters = names.map(e => buildContextFilter(e, empresaId, groupId, empresasDoGrupo));
  // Sem escalonamento próprio: a fila global de leituras (functionsFallback,
  // MAX_CONCURRENT + retries de 429) já pacifica as ~49 consultas. Dois
  // limitadores em série somavam ~1,5s artificiais de atraso nas contagens.
  const entitiesKey = names.join(',');
  const queries = useQueries({ queries: names.map((e, i) => ({
    queryKey: entityCountKey(e, filters[i]),
    queryFn: () => countEntityRecords(e, filters[i]),
    enabled: ready && allowed[i],
    initialData: readCountCache(e, filters[i]),
    initialDataUpdatedAt: 0, // valor em cache visível já; recarrega em segundo plano
    staleTime: 300_000, gcTime: 600_000,
    refetchOnWindowFocus: false, retry: 0,
  })) });
  useEffect(() => {
    if (!ready || !names.length) return;
    const timers = new Map();
    const unsubs = names.map((name, i) => allowed[i] ? base44.entities[name].subscribe(() => {
      clearTimeout(timers.get(name));
      timers.set(name, setTimeout(() => queryClient.invalidateQueries({
        queryKey: ['viz-count-v2', name],
        refetchType: document.hidden ? 'none' : 'active',
      }), 500));
    }) : null).filter(Boolean);
    return () => { timers.forEach(clearTimeout); unsubs.forEach(unsub => unsub()); };
  }, [entitiesKey, groupId, empresaId, ready, allowedKey, queryClient]);
  const counts = Object.fromEntries(names.map((name, i) => [name, allowed[i] ? queries[i].data : 0]));
  const complete = names.every((name, i) => !allowed[i] || Number.isFinite(counts[name]));
  const total = complete ? names.reduce((n, name) => n + (counts[name] ?? 0), 0) : undefined;
  const isLoading = names.length > 0 && (!ready || queries.some((q, i) => allowed[i] && q.isPending));
  return { counts, total, isLoading, isError: queries.some(q => q.isError),
    refetch: () => Promise.all(queries.filter((_, i) => allowed[i] && ready).map(q => q.refetch())) };
}
export default useEntityCounts;