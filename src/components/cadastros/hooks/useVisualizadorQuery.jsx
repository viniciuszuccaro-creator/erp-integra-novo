import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const UNSORTABLE_BACKEND = new Set(["contatos","documentos","locais_entrega","lotes","itens"]);

export default function useVisualizadorQuery({
  ENTITY, readFilter, sortField, sortDir, page, pageSize,
  debouncedSearch, empresaId, groupId, contextoValido, canViewCadastro,
  lastGoodData, everLoadedRef,
}) {
  const backendSortField = UNSORTABLE_BACKEND.has(sortField) ? "updated_date" : sortField;

  // P2: empresaId e groupId já estão na key — readFilter é derivado deles, não precisa ser serializado separado
  const queryKey = useMemo(
    () => ["viz-v33", ENTITY, sortField, sortDir, page, pageSize, debouncedSearch, empresaId ?? null, groupId ?? null],
    [ENTITY, sortField, sortDir, page, pageSize, debouncedSearch, empresaId, groupId]
  );

  const { data: rawItems, isFetching, isError, status } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!ENTITY) return [];
      const res = await base44.functions.invoke("entityListSorted", {
        entityName: ENTITY,
        filter: readFilter,
        search: debouncedSearch?.trim() || undefined,
        sortField: backendSortField,
        sortDirection: sortDir,
        limit: pageSize,
        skip: (page - 1) * pageSize,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    retryDelay: (attempt) => Math.min(800 * (attempt + 1), 3000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev !== undefined ? prev : [],
    // P2: só executa quando há contexto multiempresa válido E permissão
    enabled: !!ENTITY && contextoValido && canViewCadastro,
  });

  const items = useMemo(() => {
    const arr = Array.isArray(rawItems) ? rawItems : [];
    if (arr.length > 0) {
      lastGoodData.current = arr;
      everLoadedRef.current = true;
      return arr;
    }
    if (lastGoodData.current.length > 0) {
      if (isFetching || status === 'pending') return lastGoodData.current;
      if (isError) return lastGoodData.current;
    }
    everLoadedRef.current = true;
    lastGoodData.current = [];
    return [];
  }, [rawItems, isFetching, isError, status]);

  return { items, isFetching, isError, status, queryKey };
}