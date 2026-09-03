// Regra-Mãe 3: Extraído de useContextoGrupoEmpresa.jsx — mutações de troca de contexto (grupo/empresa) com RBAC e auditoria
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44, isApiKeyMode, isLocalOnlyMode } from "@/api/base44Client";
import { CONTEXTO_CACHE_KEY } from "./contextoCache";

export function useTrocasContexto({
  user,
  setUser,
  setContexto,
  setGrupoAtual,
  setEmpresaAtual,
  queryClient,
}) {
  const isRemoteApiKeyMode = isApiKeyMode && !isLocalOnlyMode;

  const trocarParaGrupo = useMutation({
    mutationFn: async (grupoId) => {
      if (isRemoteApiKeyMode) {
        const grupos = await base44.entities.GrupoEmpresarial.filter({ id: grupoId });
        return grupos[0] || null;
      }

      // V21.7 FIX: Verificar se usuário tem acesso ao grupo
      const temAcesso = user?.role === 'admin' ||
        user?.grupos_vinculados?.some(v => v.grupo_id === grupoId && v.ativo);

      if (!temAcesso) {
        throw new Error("Você não tem acesso a este grupo. Configure os vínculos em Cadastros > Acesso.");
      }

      await base44.auth.updateMe({
        contexto_atual: 'grupo',
        grupo_atual_id: grupoId
      });

      const grupos = await base44.entities.GrupoEmpresarial.filter({ id: grupoId });
      const grupo = grupos[0];

      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: 'Troca de Contexto',
        modulo: 'Sistema',
        descricao: `Mudou para contexto de GRUPO: ${grupo?.nome_do_grupo || grupoId}`,
        grupo_id: grupoId,
        data_hora: new Date().toISOString()
      });

      return grupo;
    },
    onSuccess: (grupo) => {
      setContexto('grupo');
      setGrupoAtual(grupo);
      setEmpresaAtual(null);
      setUser((prev) => prev ? { ...prev, contexto_atual: 'grupo', grupo_atual_id: grupo?.id || prev.grupo_atual_id } : prev);
      try { localStorage.setItem('contexto_atual', 'grupo'); } catch (e) { console.error('[lib] catch:', e); }
      try { if (grupo?.id) localStorage.setItem('group_atual_id', grupo.id); } catch (e) { console.error('[lib] catch:', e); }
      try { sessionStorage.removeItem(CONTEXTO_CACHE_KEY); } catch (e) { console.error('[lib] catch:', e); }
      queryClient.invalidateQueries();
      // Evitar reload completo; atualizar queries e deixar GuardRails liberar
    },
    onError: (error) => {
      // V21.7: Mostrar erro amigável
      console.error("Erro ao trocar grupo:", error);
      toast.error(error.message);
    }
  });

  const trocarParaEmpresa = useMutation({
    mutationFn: async (empresaId) => {
      if (isRemoteApiKeyMode) {
        const empresas = await base44.entities.Empresa.filter({ id: empresaId });
        return empresas[0] || null;
      }

      // V21.7 FIX: Verificar se usuário tem acesso à empresa
      const temAcesso = user?.role === 'admin' ||
        user?.empresas_vinculadas?.some(v => v.empresa_id === empresaId && v.ativo);

      if (!temAcesso) {
        throw new Error("Você não tem acesso a esta empresa. Configure os vínculos em Cadastros > Acesso.");
      }

      await base44.auth.updateMe({
        contexto_atual: 'empresa',
        empresa_atual_id: empresaId
      });

      const empresas = await base44.entities.Empresa.filter({ id: empresaId });
      const empresa = empresas[0];

      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: 'Troca de Contexto',
        modulo: 'Sistema',
        descricao: `Mudou para contexto de EMPRESA: ${empresa?.nome_fantasia || empresa?.razao_social || empresaId}`,
        empresa_id: empresaId,
        data_hora: new Date().toISOString()
      });

      return empresa;
    },
    onSuccess: (empresa) => {
      setContexto('empresa');
      setEmpresaAtual(empresa);
      setUser((prev) => prev ? { ...prev, contexto_atual: 'empresa', empresa_atual_id: empresa?.id || prev.empresa_atual_id } : prev);
      try { localStorage.setItem('contexto_atual', 'empresa'); } catch (e) { console.error('[lib] catch:', e); }
      try { if (empresa?.id) localStorage.setItem('empresa_atual_id', empresa.id); } catch (e) { console.error('[lib] catch:', e); }
      try { sessionStorage.removeItem(CONTEXTO_CACHE_KEY); } catch (e) { console.error('[lib] catch:', e); }
      queryClient.invalidateQueries();
      // Sem reload completo
    },
    onError: (error) => {
      // V21.7: Mostrar erro amigável
      console.error("Erro ao trocar empresa:", error);
      toast.error(error.message);
    }
  });

  return { trocarParaGrupo, trocarParaEmpresa };
}