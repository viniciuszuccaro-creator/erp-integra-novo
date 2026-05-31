/**
 * CircuitBreakerConfig v1.0
 * Proteção contra 429s com retry exponencial
 * Regra-Mãe: prevenir sobrecarga, manter performance
 */

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN. Retry in ${(this.nextAttempt - Date.now()) / 1000}s`);
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure(err) {
    this.failureCount++;
    
    if (err?.response?.status === 429) {
      // Rate limit: esperar mais tempo
      this.nextAttempt = Date.now() + this.timeout * 2;
    } else if (err?.response?.status >= 500) {
      // Erro servidor: esperar 1 timeout
      this.nextAttempt = Date.now() + this.timeout;
    } else {
      // Outro erro: falhar rápido
      this.nextAttempt = Date.now() + this.timeout / 2;
    }

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Exportar singleton para uso global
export const countEntitiesCircuitBreaker = new CircuitBreaker(3, 30000);
export const propagationCircuitBreaker = new CircuitBreaker(2, 60000);

export default CircuitBreaker;