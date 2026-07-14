import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Service Worker script responder (same-origin). Registers as /functions/pwaSw
// Returns JS with basic offline caching (app shell) + SW lifecycle helpers.
Deno.serve(async (req) => {
  try {
    // Allow HEAD for liveness checks
    if (req.method === 'HEAD') {
      return new Response(null, { status: 200, headers: { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } });
    }

    const url = new URL(req.url);
    // Only serve JS for GET
    if (req.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Versão estática incrementada — muda o hash e força o browser a descartar o SW antigo
    const SW_VERSION = 'v' + Math.floor(Date.now() / 60000); // muda a cada minuto de deploy
    const swCode = `
      // SW Version: ${SW_VERSION}
      const CACHE_NAME = 'zuccaro-app-cache-${SW_VERSION}';

      self.addEventListener('install', (event) => {
        // Ativa imediatamente sem esperar tab fechar
        event.waitUntil(self.skipWaiting());
      });

      self.addEventListener('activate', (event) => {
        // Remove TODOS os caches antigos para garantir que código novo seja servido
        event.waitUntil(
          caches.keys()
            .then((keys) => Promise.all(keys.map(k => caches.delete(k))))
            .then(() => self.clients.claim())
        );
      });

      // NETWORK-FIRST para tudo — garante que atualizações do GitHub sejam refletidas imediatamente
      // Fallback para cache apenas quando offline
      self.addEventListener('fetch', (event) => {
        const req = event.request;
        const url = new URL(req.url);

        // Não intercepta requests de API/functions
        if (url.pathname.startsWith('/functions/') || url.pathname.startsWith('/api/')) return;

        // Network-first: tenta rede, cai para cache offline
        event.respondWith(
          fetch(req)
            .then((res) => {
              if (res && res.status === 200) {
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
              }
              return res;
            })
            .catch(() => caches.match(req))
        );
      });

      // Ativação imediata ao receber mensagem
      self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
        }
      });
    `;

    return new Response(swCode, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      },
    });
  } catch (error) {
    return new Response(`/* SW error: ${error?.message || error} */`, { status: 500, headers: { 'Content-Type': 'application/javascript', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } });
  }
});