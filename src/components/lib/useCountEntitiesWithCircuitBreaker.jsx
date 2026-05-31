/**
 * useCountEntitiesWithCircuitBreaker v1.0
 * Hook que conta entidades com proteção contra 429s
 * Regra-Mãe: não deixar UI congelar, debounce + circuit breaker
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const DEBOUNCE_MS = 500;
const MAX_FAILURES = 3;
const CIRCUIT_TIMEOUT = 60000; // 60s quando abre

export default function useCountEntitiesWithCircuitBreaker() {
  const [counts, setCounts] = useState({});
  const [circuitState, setCircuitState] = useState('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const debounceRef = useRef(null);
  const circuitRef = useRef({ state: 'CLOSED', failureCount: 0, nextAttempt: null });

  // Sincronizar com localStorage para compartilhar estado
  useEffect(() => {
    const syncCircuitState = () => {
      const stored = JSON.parse(localStorage.getItem('circuitBreakerState') || '{}');
      if (stored.state) {
        circuitRef.current = stored;
        setCircuitState(stored.state);
        setFailureCount(stored.failureCount);
      }
    };

    syncCircuitState();
    const interval = setInterval(syncCircuitState, 500);
    return () => clearInterval(interval);
  }, []);

  const persistCircuitState = (state, failureCount, nextAttempt) => {
    const data = { state, failureCount, nextAttempt };
    localStorage.setItem('circuitBreakerState', JSON.stringify(data));
    setCircuitState(state);
    setFailureCount(failureCount);
  };

  const countEntity = useCallback(async (entityName) => {
    // Se circuit aberto, retornar último valor conhecido
    if (circuitRef.current.state === 'OPEN') {
      const now = Date.now();
      if (now < circuitRef.current.nextAttempt) {
        return counts[entityName] || 0;
      }
      // Tentar reconectar (HALF_OPEN)
      persistCircuitState('HALF_OPEN', circuitRef.current.failureCount, null);
    }

    try {
      const result = await base44.functions.invoke('countEntitiesOptimized', { 
        entities: [entityName] 
      });
      
      const count = result?.data?.[entityName] || 0;
      setCounts(prev => ({ ...prev, [entityName]: count }));

      // Reset em sucesso
      if (circuitRef.current.state === 'HALF_OPEN') {
        persistCircuitState('CLOSED', 0, null);
      }

      return count;
    } catch (err) {
      const status = err?.response?.status;
      const newFailureCount = circuitRef.current.failureCount + 1;

      // Log do erro
      try {
        await base44.entities.AuditLog.create({
          usuario: (await base44.auth.me()).full_name,
          acao: 'Erro',
          modulo: 'Sistema',
          tipo_auditoria: 'erro',
          entidade: 'RateLimitError',
          descricao: `Erro ao contar ${entityName}: status=${status}`,
          dados_novos: { failureCount: newFailureCount },
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      if (status === 429 && newFailureCount >= MAX_FAILURES) {
        const nextAttempt = Date.now() + CIRCUIT_TIMEOUT;
        persistCircuitState('OPEN', newFailureCount, nextAttempt);
      } else {
        persistCircuitState(circuitRef.current.state, newFailureCount, circuitRef.current.nextAttempt);
      }

      return counts[entityName] || 0;
    }
  }, [counts]);

  const countAllEntities = useCallback(async (entities) => {
    // Debounce: aguardar 500ms antes de fazer requisição
    clearTimeout(debounceRef.current);
    
    return new Promise(resolve => {
      debounceRef.current = setTimeout(async () => {
        if (circuitRef.current.state === 'OPEN') {
          const now = Date.now();
          if (now < circuitRef.current.nextAttempt) {
            resolve(counts);
            return;
          }
          persistCircuitState('HALF_OPEN', circuitRef.current.failureCount, null);
        }

        try {
          const result = await base44.functions.invoke('countEntitiesOptimized', { 
            entities 
          });
          
          const newCounts = result?.data || {};
          setCounts(newCounts);

          if (circuitRef.current.state === 'HALF_OPEN') {
            persistCircuitState('CLOSED', 0, null);
          }

          resolve(newCounts);
        } catch (err) {
          const status = err?.response?.status;
          const newFailureCount = circuitRef.current.failureCount + 1;

          if (status === 429 && newFailureCount >= MAX_FAILURES) {
            const nextAttempt = Date.now() + CIRCUIT_TIMEOUT;
            persistCircuitState('OPEN', newFailureCount, nextAttempt);
          } else {
            persistCircuitState(circuitRef.current.state, newFailureCount, circuitRef.current.nextAttempt);
          }

          resolve(counts);
        }
      }, DEBOUNCE_MS);
    });
  }, [counts]);

  return {
    counts,
    circuitState,
    failureCount,
    countEntity,
    countAllEntities,
  };
}