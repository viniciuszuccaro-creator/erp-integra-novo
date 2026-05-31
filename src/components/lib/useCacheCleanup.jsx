/**
 * useCacheCleanup v1.0
 * Limpeza automática e inteligente de cache
 * Regra-Mãe: performance + multi-empresas
 */
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContextoVisual } from './useContextoVisual';

const CACHE_TTL = {
  'entities': 600000,      // 10 min
  'counts': 300000,        // 5 min
  'performance': 900000,   // 15 min
};

export default function useCacheCleanup() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const cleanupOldCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const now = Date.now();

    cache.getAll().forEach(query => {
      const queryKey = query.queryKey;
      const state = query.getState();
      
      // Determinar tipo de cache
      let ttl = CACHE_TTL.entities;
      if (queryKey[0] === 'counts') ttl = CACHE_TTL.counts;
      if (queryKey[0]?.includes('Latency')) ttl = CACHE_TTL.performance;

      // Remover se expirado
      if (state.dataUpdatedAt && (now - state.dataUpdatedAt) > ttl) {
        queryClient.removeQueries({ queryKey });
      }
    });

    // Limpar localStorage de circuit breaker antigo
    try {
      const cbState = JSON.parse(localStorage.getItem('circuitBreakerState') || '{}');
      if (cbState.nextAttempt && cbState.nextAttempt < now) {
        localStorage.removeItem('circuitBreakerState');
      }
    } catch (_) {}

    // Limpar sort prefs antigas
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('sort_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.lastUsed && (now - data.lastUsed) > 2592000000) { // 30 dias
            localStorage.removeItem(key);
          }
        } catch (_) {}
      }
    }
  }, [queryClient]);

  // Executar limpeza periodicamente
  useEffect(() => {
    cleanupOldCache();
    const interval = setInterval(cleanupOldCache, 600000); // A cada 10 min
    return () => clearInterval(interval);
  }, [cleanupOldCache]);

  // Limpeza quando mudar de empresa
  useEffect(() => {
    // Limpar queries da empresa anterior
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          typeof key[1] === 'string' && 
          key[1] !== empresaAtual?.id
        );
      }
    });
  }, [empresaAtual?.id, queryClient]);

  return { cleanupOldCache };
}