// Global Network Guard - Fase 1 (Blindagem Multiempresa)
// Injeta automaticamente o header x-company-id em TODAS as chamadas fetch do mesmo domínio.
// Mantém compatibilidade com o SDK Base44 (que usa fetch sob o capô).

(function initNetworkGuard() {
  if (typeof window === 'undefined') return;
  if (window.__networkGuardInitialized) return;
  window.__networkGuardInitialized = true;

  const originalFetch = window.fetch;

  function getEmpresaAtualId() {
    try {
      // Mantemos compatível com useContextoVisual (usa localStorage 'empresa_atual_id')
      const empresaId = localStorage.getItem('empresa_atual_id');
      return empresaId || null;
    } catch {
      return null;
    }
  }

  function getContextoAtual() {
    try {
      return localStorage.getItem('contexto_atual') || 'empresa';
    } catch {
      return 'empresa';
    }
  }

  function getGroupAtualId() {
    try {
      const groupId = localStorage.getItem('group_atual_id');
      return groupId || null;
    } catch {
      return null;
    }
  }

  window.fetch = async function(input, init) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;
    
    async function attemptFetch(retryCount = 0) {
      try {
        const empresaId = getEmpresaAtualId();

        // Resolve URL absoluta para checar se é mesmo domínio
        const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        const fullUrl = new URL(urlStr, window.location.origin);

        // Só injeta em chamadas do mesmo domínio (inclui SDK/entities/functions)
        const isSameOrigin = fullUrl.origin === window.location.origin;

        if (isSameOrigin) {
          // Normaliza headers preservando existentes
          const headers = new Headers((init && init.headers) || (typeof input !== 'string' && input && input.headers) || {});
          const contexto = getContextoAtual();
          const groupId = getGroupAtualId();
          if (empresaId) {
            headers.set('x-company-id', empresaId);
            headers.set('X-Company-ID', empresaId);
          }
          if (contexto === 'grupo' && groupId) {
            headers.set('x-tenant-id', groupId);
            headers.set('X-Tenant-ID', groupId);
            headers.set('x-group-id', groupId);
            headers.set('X-Group-ID', groupId);
          } else if (empresaId) {
            headers.set('x-tenant-id', empresaId);
            headers.set('X-Tenant-ID', empresaId);
          }
          headers.set('x-scope', contexto);
          headers.set('X-Scope', contexto);

          // Reconstrói init preservando método/body/etc
          const nextInit = {
            ...init,
            headers,
            signal: init?.signal || AbortSignal.timeout(30000) // timeout de 30s
          };

          const response = await originalFetch(input, nextInit);

          // Repetição apenas em leituras: repetir POST/PUT/PATCH/DELETE após 5xx
          // podia gravar o mesmo registro duas vezes (duplicidade silenciosa).
          const method = String(nextInit.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
          const idempotent = method === 'GET' || method === 'HEAD';

          // Se a resposta for 5xx (erro de servidor) e ainda temos retries, tenta novamente
          if (idempotent && response.status >= 500 && response.status < 600 && retryCount < MAX_RETRIES) {
            console.warn(`Erro ${response.status}, tentando novamente... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
            return attemptFetch(retryCount + 1);
          }
          
          return response;
        }

        return originalFetch(input, init);
      } catch (error) {
        // Network Error ou timeout - tenta retry somente em leituras (escrita segura)
        const msgMethod = String(init?.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
        const msgIdempotent = msgMethod === 'GET' || msgMethod === 'HEAD';
        if (msgIdempotent && (error.name === 'TypeError' || error.name === 'AbortError') && retryCount < MAX_RETRIES) {
          console.warn(`Network Error, tentando novamente... (${retryCount + 1}/${MAX_RETRIES})`, error.message);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
          return attemptFetch(retryCount + 1);
        }
        
        // Se já esgotamos os retries ou é outro tipo de erro, repassa
        throw error;
      }
    }
    
    return attemptFetch();
  };
})();