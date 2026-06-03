/**
 * useCountEntitiesWithCircuitBreaker v2.0
 * Circuit breaker com backoff exponencial real:
 *  - CLOSED → normal
 *  - HALF_OPEN → teste após cooldown
 *  - OPEN → serve cache, bloqueia novas chamadas
 * Backoff: 800ms → 1.6s → 3.2s (exponencial) antes de abrir circuit
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const DEBOUNCE_MS = 600;
const MAX_FAILURES = 3;
const CIRCUIT_TIMEOUT_MS = 60_000; // 60s OPEN
const BACKOFF_BASE_MS = 800;       // backoff exponencial base

// Cache de resultados (IDB-lite via localStorage)
function readCache(key) {
  try { return JSON.parse(localStorage.getItem(`cb_cache_${key}`) || 'null'); } catch { return null; }
}
function writeCache(key, value) {
  try { localStorage.setItem(`cb_cache_${key}`, JSON.stringify({ v: value, ts: Date.now() })); } catch {}
}

// Estado do circuit breaker persistido
function readCBState() {
  try { return JSON.parse(localStorage.getItem('circuitBreakerState') || '{}'); } catch { return {}; }
}
function writeCBState(state, failureCount, nextAttempt) {
  try { localStorage.setItem('circuitBreakerState', JSON.stringify({ state, failureCount, nextAttempt })); } catch {}
}

export default function useCountEntitiesWithCircuitBreaker() {
  const [counts, setCounts] = useState({});
  const [circuitState, setCircuitState] = useState('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const debounceRef = useRef(null);
  const circuitRef = useRef({ state: 'CLOSED', failureCount: 0, nextAttempt: null });

  // Sync do circuit state (a cada 1s)
  useEffect(() => {
    const sync = () => {
      const stored = readCBState();
      if (stored.state && stored.state !== circuitRef.current.state) {
        circuitRef.current = stored;
        setCircuitState(stored.state || 'CLOSED');
        setFailureCount(stored.failureCount || 0);
      }
    };
    sync();
    const iv = setInterval(sync, 1000);
    return () => clearInterval(iv);
  }, []);

  const applyFailure = useCallback((statusCode) => {
    const cb = circuitRef.current;
    const newCount = (cb.failureCount || 0) + 1;

    if (statusCode === 429 || (statusCode >= 500 && newCount >= MAX_FAILURES)) {
      // Abre o circuit
      const nextAttempt = Date.now() + CIRCUIT_TIMEOUT_MS;
      const next = { state: 'OPEN', failureCount: newCount, nextAttempt };
      circuitRef.current = next;
      writeCBState('OPEN', newCount, nextAttempt);
      setCircuitState('OPEN');
      setFailureCount(newCount);
    } else {
      const next = { ...cb, failureCount: newCount };
      circuitRef.current = next;
      writeCBState(cb.state || 'CLOSED', newCount, cb.nextAttempt);
      setFailureCount(newCount);
    }
  }, []);

  const resetCircuit = useCallback(() => {
    const next = { state: 'CLOSED', failureCount: 0, nextAttempt: null };
    circuitRef.current = next;
    writeCBState('CLOSED', 0, null);
    setCircuitState('CLOSED');
    setFailureCount(0);
  }, []);

  // Backoff exponencial antes de disparar a chamada
  const withBackoff = useCallback(async (fn, attempt = 0) => {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if ((status === 429 || status >= 500) && attempt < 3) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, attempt); // 800 → 1600 → 3200
        await new Promise(r => setTimeout(r, delay));
        return withBackoff(fn, attempt + 1);
      }
      throw err;
    }
  }, []);

  const countAllEntities = useCallback(async (entities = []) => {
    clearTimeout(debounceRef.current);

    return new Promise(resolve => {
      debounceRef.current = setTimeout(async () => {
        const cb = circuitRef.current;

        // OPEN: verifica se pode tentar (HALF_OPEN)
        if (cb.state === 'OPEN') {
          const now = Date.now();
          if (now < (cb.nextAttempt || 0)) {
            // Serve do cache
            const cached = {};
            for (const e of entities) {
              const c = readCache(e);
              cached[e] = c?.v ?? counts[e] ?? 0;
            }
            resolve(cached);
            return;
          }
          // Pode tentar de novo
          const next = { ...cb, state: 'HALF_OPEN' };
          circuitRef.current = next;
          writeCBState('HALF_OPEN', cb.failureCount, null);
          setCircuitState('HALF_OPEN');
        }

        try {
          const result = await withBackoff(() =>
            base44.functions.invoke('countEntitiesOptimized', { entities })
          );
          const newCounts = result?.data || {};
          setCounts(newCounts);

          // Persiste no cache
          for (const [k, v] of Object.entries(newCounts)) writeCache(k, v);

          // Sucesso: fecha circuit
          resetCircuit();
          resolve(newCounts);
        } catch (err) {
          const status = err?.response?.status || err?.status;
          applyFailure(status);

          // Serve do cache
          const cached = {};
          for (const e of entities) {
            const c = readCache(e);
            cached[e] = c?.v ?? counts[e] ?? 0;
          }
          resolve(cached);
        }
      }, DEBOUNCE_MS);
    });
  }, [counts, withBackoff, applyFailure, resetCircuit]);

  const countEntity = useCallback(async (entityName) => {
    const result = await countAllEntities([entityName]);
    return result[entityName] ?? 0;
  }, [countAllEntities]);

  // Info do circuit para UI
  const circuitInfo = (() => {
    const cb = circuitRef.current;
    if (cb.state === 'OPEN') {
      const rem = Math.max(0, Math.round(((cb.nextAttempt || 0) - Date.now()) / 1000));
      return { state: 'OPEN', label: `OPEN — ${rem}s para reativar`, color: 'text-red-600' };
    }
    if (cb.state === 'HALF_OPEN') return { state: 'HALF_OPEN', label: 'HALF_OPEN — testando', color: 'text-amber-600' };
    return { state: 'CLOSED', label: 'CLOSED — normal', color: 'text-green-600' };
  })();

  return {
    counts,
    circuitState,
    failureCount,
    circuitInfo,
    countEntity,
    countAllEntities,
    resetCircuit,
  };
}