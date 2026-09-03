// Regra-Mãe 3: Extraído de useContextoGrupoEmpresa.jsx — carregamento inicial do contexto (grupo/empresa) com cache e deduplicação
import { base44, isApiKeyMode, isLocalOnlyMode, localApiUser } from "@/api/base44Client";
import { readContextoCache, writeContextoCache } from "./contextoCache";

let contextoLoadPromise = null;

export function criarCarregadorContextoInicial({
  setUser, setContexto, setGrupoAtual, setEmpresaAtual, setIsLoadingContexto
}) {
  const isRemoteApiKeyMode = isApiKeyMode && !isLocalOnlyMode;

  const carregarGrupoPorIdOuPadrao = async (currentUser) => {
    const grupoId = currentUser?.grupo_atual_id || currentUser?.grupo_padrao_id || localStorage.getItem('group_atual_id');
    if (grupoId) {
      const grupos = await base44.entities.GrupoEmpresarial.filter({ id: grupoId });
      if (grupos[0]) {
        setGrupoAtual(grupos[0]);
        try { localStorage.setItem('group_atual_id', grupos[0].id); } catch (e) { console.error('[lib] catch:', e); }
        return grupos[0];
      }
    }

    if (isRemoteApiKeyMode || currentUser?.role === 'admin') {
      const todos = await base44.entities.GrupoEmpresarial.list();
      const ativo = todos.find(g => g.status === 'Ativo') || todos[0];
      if (ativo) {
        setGrupoAtual(ativo);
        try { localStorage.setItem('group_atual_id', ativo.id); } catch (e) { console.error('[lib] catch:', e); }
        return ativo;
      }
    }

    return null;
  };

  const carregarContextoInicial = async () => {
    setIsLoadingContexto(true);
    const cached = readContextoCache();
    if (cached?.user) {
      setUser(cached.user);
      setContexto(cached.contexto || 'empresa');
      setGrupoAtual(cached.grupoAtual || null);
      setEmpresaAtual(cached.empresaAtual || null);
      setIsLoadingContexto(false);
      return;
    }

    if (contextoLoadPromise) {
      const data = await contextoLoadPromise;
      setUser(data.user || null);
      setContexto(data.contexto || 'empresa');
      setGrupoAtual(data.grupoAtual || null);
      setEmpresaAtual(data.empresaAtual || null);
      setIsLoadingContexto(false);
      return;
    }

    contextoLoadPromise = (async () => {
      let loadedUser = null;
      let loadedGrupo = null;
      let loadedEmpresa = null;
      let loadedContexto = 'empresa';
      try {
        const currentUser = isRemoteApiKeyMode ? localApiUser : await base44.auth.me();
        loadedUser = currentUser;
        setUser(currentUser);

      // Detecta contexto: prioridade user.contexto_atual, senão localStorage
      const ctxPersistido = (() => {
        try { return localStorage.getItem('contexto_atual'); } catch { return null; }
      })();
      const ctx = currentUser.contexto_atual || ctxPersistido || 'empresa';
      loadedContexto = ctx;
      setContexto(ctx);
      try { localStorage.setItem('contexto_atual', ctx); } catch (e) { console.error('[lib] catch:', e); }

      if (ctx === 'grupo') {
        // Tenta user > localStorage
        loadedGrupo = await carregarGrupoPorIdOuPadrao(currentUser);
      } else {
        // Mesmo no contexto Empresa, manter o Grupo ativo para herança de configurações.
        loadedGrupo = await carregarGrupoPorIdOuPadrao(currentUser);

        const empresaId = currentUser.empresa_atual_id || currentUser.empresa_padrao_id || localStorage.getItem('empresa_atual_id');
        if (empresaId) {
          const empresas = await base44.entities.Empresa.filter({ id: empresaId });
          if (empresas[0]) {
            loadedEmpresa = empresas[0];
            setEmpresaAtual(empresas[0]);
          } else if (isRemoteApiKeyMode || currentUser?.role === 'admin') {
            const todasEmpresas = await base44.entities.Empresa.list();
            const ativa = todasEmpresas.find(e => e.status === 'Ativa') || todasEmpresas[0];
            if (ativa) {
              loadedEmpresa = ativa;
              setEmpresaAtual(ativa);
              try { localStorage.setItem('empresa_atual_id', ativa.id); } catch (e) { console.error('[lib] catch:', e); }
            }
          }
        } else if (isRemoteApiKeyMode || currentUser?.role === 'admin') {
          const empresas = await base44.entities.Empresa.list();
          const ativa = empresas.find(e => e.status === 'Ativa') || empresas[0];
          if (ativa) {
            loadedEmpresa = ativa;
            setEmpresaAtual(ativa);
            try { localStorage.setItem('empresa_atual_id', ativa.id); } catch (e) { console.error('[lib] catch:', e); }
          }
        }
      }
      const data = { user: loadedUser, contexto: loadedContexto, grupoAtual: loadedGrupo, empresaAtual: loadedEmpresa };
      writeContextoCache(data);
      return data;
    } catch (error) {
      if (String(error?.message || '').includes('Rate limit') || error?.status === 429 || error?.response?.status === 429) {
        const stale = readContextoCache();
        if (stale) return stale;
      } else {
        console.error("Erro ao carregar contexto:", error);
      }
      if (isRemoteApiKeyMode) {
        const fallback = { user: localApiUser, contexto: 'empresa', grupoAtual: null, empresaAtual: null };
        setUser(localApiUser);
        setContexto('empresa');
        return fallback;
      }
      return { user: null, contexto: 'empresa', grupoAtual: null, empresaAtual: null };
    }
    })();

    try {
      const data = await contextoLoadPromise;
      setUser(data.user || null);
      setContexto(data.contexto || 'empresa');
      setGrupoAtual(data.grupoAtual || null);
      setEmpresaAtual(data.empresaAtual || null);
    } finally {
      contextoLoadPromise = null;
      setIsLoadingContexto(false);
    }
  };

  return carregarContextoInicial;
}