/**
 * realtimeMultiplexer.js — Regra-Mãe 2/3 (melhoria no existente, refatorado em módulo)
 *
 * Um único canal de tempo real por entidade, compartilhado por todos os hooks que
 * assinam a mesma entidade. Antes, Cadastros (~49 contagens) + o barramento de
 * invalidação (~117 entidades) + as tabelas do visualizador abriam canais paralelos
 * para a mesma entidade, multiplicando conexões e retrabalho de eventos.
 *
 * Comportamento preservado: cada assinante continua recebendo os eventos e o
 * cancelamento devolve a função de unsubscribe, como no SDK original.
 */
export function installRealtimeMultiplexer(base44) {
  if (!base44?.entities || base44.__realtimeMultiplexerInstalled) return;
  base44.__realtimeMultiplexerInstalled = true;

  const original = base44.entities;
  const channels = new Map(); // entityName -> { unsubscribe, listeners:Set }

  base44.entities = new Proxy(original, {
    get(target, name) {
      const handler = target[name];
      if (!handler || typeof name !== 'string' || typeof handler !== 'object') return handler;

      return new Proxy(handler, {
        get(h, method) {
          const fn = h[method];
          if (typeof fn !== 'function') return fn;
          if (method !== 'subscribe') return fn;

          // Assinatura multiplexada: um canal por entidade, N ouvintes
          return (listener) => {
            if (typeof listener !== 'function') return () => {};
            let channel = channels.get(name);
            if (!channel) {
              const listeners = new Set();
              let unsubscribe = null;
              try {
                unsubscribe = fn.call(h, (event) => {
                  listeners.forEach((l) => { try { l(event); } catch { /* ouvinte isolado */ } });
                });
              } catch {
                return () => {};
              }
              channel = { unsubscribe, listeners };
              channels.set(name, channel);
            }
            channel.listeners.add(listener);

            return () => {
              const current = channels.get(name);
              if (!current) return;
              current.listeners.delete(listener);
              if (current.listeners.size === 0) {
                try { current.unsubscribe?.(); } catch { /* canal já encerrado */ }
                channels.delete(name);
              }
            };
          };
        },
      });
    },
  });
}

export default installRealtimeMultiplexer;