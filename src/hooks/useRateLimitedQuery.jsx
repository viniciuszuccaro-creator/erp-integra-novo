import { useQuery } from '@tanstack/react-query';
import { throttledFunctionCall } from '@/lib/rateLimitThrottle';

/**
 * Hook para queries com proteção contra rate limit
 * Automaticamente throttle requisições para evitar 429
 */
export function useRateLimitedQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    ...options,
    queryKey,
    queryFn: async () => {
      // Executa com throttle
      return throttledFunctionCall(() => queryFn());
    },
    // Fallback para erro de rate limit
    retry: (failureCount, error) => {
      if (error?.status === 429 || error?.response?.status === 429) {
        return failureCount < 2; // Retenta 2x máximo
      }
      return failureCount < (options.retry || 1);
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s...
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    }
  });
}