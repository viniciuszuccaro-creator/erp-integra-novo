// Regra-Mãe 3: Extraído de useContextoGrupoEmpresa.jsx — query das empresas ativas do grupo (com fallback de cache em 429)
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useEmpresasDoGrupo(grupoAtual, contexto) {
  const { data: empresasDoGrupo = [] } = useQuery({
    queryKey: ['empresas-grupo', grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return [];
      try {
        const empresas = await base44.entities.Empresa.filter({
          grupo_id: grupoAtual.id,
          status: 'Ativa'
        });
        try { sessionStorage.setItem(`empresas_grupo_${grupoAtual.id}`, JSON.stringify(empresas || [])); } catch (e) { console.error('[lib] catch:', e); }
        return empresas || [];
      } catch (error) {
        if (error?.status === 429 || error?.response?.status === 429 || String(error?.message || '').includes('Rate limit')) {
          try { return JSON.parse(sessionStorage.getItem(`empresas_grupo_${grupoAtual.id}`) || '[]'); } catch { return []; }
        }
        throw error;
      }
    },
    enabled: !!grupoAtual && contexto === 'grupo',
    staleTime: 15000,
    gcTime: 300000,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return empresasDoGrupo;
}