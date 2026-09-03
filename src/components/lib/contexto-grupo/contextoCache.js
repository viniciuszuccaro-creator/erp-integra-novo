// Regra-Mãe 3: Extraído de useContextoGrupoEmpresa.jsx — cache sessionStorage do contexto grupo/empresa
export const CONTEXTO_CACHE_KEY = 'contexto_grupo_empresa_cache_v1';
export const CONTEXTO_CACHE_TTL_MS = 5 * 60 * 1000;

export function readContextoCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CONTEXTO_CACHE_KEY) || 'null');
    if (cached?.ts && Date.now() - cached.ts < CONTEXTO_CACHE_TTL_MS) return cached;
  } catch (e) { console.error('[lib] catch:', e); }
  return null;
}

export function writeContextoCache(data) {
  try { sessionStorage.setItem(CONTEXTO_CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() })); } catch (e) { console.error('[lib] catch:', e); }
}