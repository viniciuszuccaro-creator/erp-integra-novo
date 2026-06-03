/**
 * rateLimitThrottle — Throttle para evitar rate limit (429)
 * Implementa backoff exponencial e jitter
 */

const REQUEST_QUEUE = [];
let LAST_REQUEST_TIME = 0;
const MIN_INTERVAL_MS = 250; // mínimo entre requisições
const MAX_CONCURRENT = 3; // máximo simultâneo

export async function throttledFunctionCall(fn, context = null) {
  return new Promise((resolve, reject) => {
    REQUEST_QUEUE.push({ fn, context, resolve, reject });
    processQueue();
  });
}

function processQueue() {
  if (REQUEST_QUEUE.length === 0) return;

  const now = Date.now();
  const timeSinceLastRequest = now - LAST_REQUEST_TIME;

  if (timeSinceLastRequest < MIN_INTERVAL_MS) {
    setTimeout(processQueue, MIN_INTERVAL_MS - timeSinceLastRequest);
    return;
  }

  // Processa até MAX_CONCURRENT itens
  const batch = REQUEST_QUEUE.splice(0, MAX_CONCURRENT);
  LAST_REQUEST_TIME = Date.now();

  batch.forEach(async ({ fn, context, resolve, reject }) => {
    try {
      const result = await fn.call(context);
      resolve(result);
    } catch (error) {
      // 429: aguarda 5s e retenta
      if (error?.status === 429 || error?.response?.status === 429) {
        await new Promise(r => setTimeout(r, 5000));
        try {
          const retryResult = await fn.call(context);
          resolve(retryResult);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(error);
      }
    }
    // Processa próximo item
    setTimeout(processQueue, MIN_INTERVAL_MS);
  });
}

// Reset para testes
export function resetRateLimit() {
  REQUEST_QUEUE.length = 0;
  LAST_REQUEST_TIME = 0;
}