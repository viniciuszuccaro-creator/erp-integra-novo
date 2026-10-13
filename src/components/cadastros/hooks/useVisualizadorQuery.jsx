import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44, isLocalOnlyMode } from '@/api/base44Client';
import { buildSearchFilter } from '@/api/functionsFallback';

const UNSORTABLE_BACKEND = new Set(['contatos','documentos','locais_entrega','lotes','itens']);
export default function useVisualizadorQuery({
  ENTITY, readFilter, sortField, sortDir, page, pageSize, debouncedSearch,
  empresaId, groupId, contextoValido, canViewCadastro, lastGoodData, everLoadedRef,
}) {
  const sort = `${sortDir === 'desc' ? '-' : ''}${UNSORTABLE_BACKEND.has(sortField) ? 'updated_date' : sortField === 'id' ? 'created_date' : sortField}`;
  const filter = buildSearchFilter(readFilter, debouncedSearch);
  const scope = JSON.stringify([ENTITY, empresaId, groupId, filter, sort, pageSize]);
  const cursorsRef = useRef({ scope, positions: new Map([[0, undefined]]) });
  if (cursorsRef.current.scope !== scope) cursorsRef.current = { scope, positions: new Map([[0, undefined]]) };
  const queryKey = ['viz-v33', ENTITY, scope, page];
  const { data, isFetching, isError, status } = useQuery({
    queryKey,
    queryFn: async () => {
      if (isLocalOnlyMode) {
        const res = await base44.functions.invoke('entityListSorted', {
          entityName: ENTITY, filter, sortField: sort.replace(/^-/, ''), sortDirection: sortDir,
          limit: pageSize, skip: (page - 1) * pageSize,
        });
        return { items: res.data, has_more: res.data.length === pageSize };
      }
      const api = base44.entities[ENTITY];
      const positions = cursorsRef.current.positions;
      const target = (page - 1) * pageSize;
      if (target === 0) { positions.clear(); positions.set(0, undefined); }
      let offset = Math.max(...[...positions.keys()].filter(n => n <= target));
      let cursor = positions.get(offset);
      // Saltos (incluindo Última): consulta apenas IDs para obter o cursor de destino.
      // Próxima/Anterior reutilizam os cursores existentes, sem baixar páginas anteriores.
      while (offset < target) {
        const skipped = await api.filter(filter, { sort, limit: Math.min(1000, target - offset), cursor, fields: ['id'] });
        if (!skipped.items.length || !skipped.has_more) return { items: [], has_more: false };
        offset += skipped.items.length;
        cursor = skipped.next_cursor;
        positions.set(offset, cursor);
      }
      const result = await api.filter(filter, { sort, limit: pageSize, cursor });
      if (result.has_more) positions.set(target + result.items.length, result.next_cursor);
      return result;
    },
    staleTime: 120_000, gcTime: 600_000, retry: 0,
    refetchOnWindowFocus: false,
    enabled: !!ENTITY && contextoValido && canViewCadastro,
  });
  const items = data?.items || [];
  useEffect(() => {
    lastGoodData.current = data?.items || [];
    everLoadedRef.current = data !== undefined;
  }, [data, scope, page, lastGoodData, everLoadedRef]);
  return { items, isFetching, isError, status, queryKey, hasMore: data?.has_more };
}