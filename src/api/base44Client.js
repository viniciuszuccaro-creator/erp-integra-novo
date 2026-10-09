import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { localBase44, localApiUser as localOnlyUser } from './localBase44Client';
import { installFunctionsFallback } from './functionsFallback';

const { appId, serverUrl, token, functionsVersion } = appParams;
const apiKey = import.meta.env.VITE_BASE44_API_KEY;
export const isLocalOnlyMode = import.meta.env.VITE_LOCAL_ONLY === 'true';

export const isApiKeyMode = isLocalOnlyMode || !!apiKey;
export const localApiUser = isLocalOnlyMode ? localOnlyUser : {
  id: 'local-api-key-user',
  email: 'local-api@erp-integra.local',
  full_name: 'Usuario Local API',
  role: 'admin',
  pode_operar_em_grupo: true,
  pode_ver_todas_empresas: true,
  empresas_vinculadas: [],
  grupos_vinculados: []
};

//Create a client with authentication required only when the app is not in local-only mode.
const remoteBase44 = isLocalOnlyMode ? null : createClient({
  appId,
  serverUrl,
  token,
  headers: apiKey ? { api_key: apiKey } : undefined,
  functionsVersion,
  requiresAuth: false
});

export const base44 = isLocalOnlyMode ? localBase44 : remoteBase44;

// Regra-Mãe 2: fallback de leitura — backend functions (402/404) caem para consultas diretas
if (!isLocalOnlyMode) installFunctionsFallback(base44);

if (!isLocalOnlyMode && isApiKeyMode && base44?.auth) {
  const originalUpdateMe = base44.auth.updateMe?.bind(base44.auth);
  base44.auth.me = async () => localApiUser;
  base44.auth.isAuthenticated = async () => true;
  base44.auth.updateMe = async (updates = {}) => {
    Object.assign(localApiUser, updates);
    try {
      if (updates.contexto_atual) localStorage.setItem('contexto_atual', updates.contexto_atual);
      if (updates.empresa_atual_id) localStorage.setItem('empresa_atual_id', updates.empresa_atual_id);
      if (updates.grupo_atual_id) localStorage.setItem('group_atual_id', updates.grupo_atual_id);
    } catch {}
    return originalUpdateMe ? localApiUser : localApiUser;
  };
}