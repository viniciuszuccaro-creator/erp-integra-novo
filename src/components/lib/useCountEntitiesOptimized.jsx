/**
 * useCountEntitiesOptimized v2.0
 * Hook de contagem com Circuit Breaker integrado
 * Regra-Mãe: resilência + multi-empresas
 */
import { useCallback, useMemo } from 'react';
import { useContextoVisual } from './useContextoVisual';
import useCountEntitiesWithCircuitBreaker from './useCountEntitiesWithCircuitBreaker';

export default function useCountEntitiesOptimized(entityNames = []) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { counts, circuitState, countAllEntities } = useCountEntitiesWithCircuitBreaker();

  // Memoizar lista de entidades
  const memoizedEntities = useMemo(() => {
    if (!Array.isArray(entityNames)) return [];
    return entityNames.filter(Boolean);
  }, [entityNames.join(',')]);

  // Callback para carregar contagens
  const loadCounts = useCallback(async () => {
    if (memoizedEntities.length === 0) return {};
    
    // Validação de contexto (multiempresa)
    if ((contexto === 'empresa' && !empresaAtual?.id) || (contexto !== 'grupo' && !empresaAtual?.id && !grupoAtual?.id)) {
      return {};
    }

    return await countAllEntities(memoizedEntities);
  }, [memoizedEntities, empresaAtual?.id, grupoAtual?.id, contexto, countAllEntities]);

  return {
    counts: useMemo(() => {
      // Se circuit aberto, retornar valores em cache
      if (circuitState === 'OPEN') {
        return Object.fromEntries(
          memoizedEntities.map(e => [e, counts[e] || 0])
        );
      }
      return counts;
    }, [counts, memoizedEntities, circuitState]),
    circuitState,
    loadCounts,
    isProtected: circuitState === 'OPEN',
  };
}