/**
 * Re-exporta do hook central v5 — AGORA com fallback para useCountEntitiesOptimized (Ciclo 26)
 * Mantém compatibilidade com importadores legados
 */
import useCountEntitiesOptimized from "@/components/lib/useCountEntitiesOptimized";

// Wrapper compatível: converte API useCountEntitiesOptimized para forma legada useEntityCounts
function useEntityCounts(entities = []) {
  const { counts, circuitState } = useCountEntitiesOptimized(entities);
  return {
    total: Object.values(counts).reduce((s, n) => s + (n || 0), 0),
    counts,
    isLoading: circuitState === 'LOADING',
    circuitState,
  };
}

export { useEntityCounts as default, useEntityCounts, buildContextFilter, SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";