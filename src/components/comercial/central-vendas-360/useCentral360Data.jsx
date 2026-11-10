// Central de Vendas 360 — orçamentos do contexto (grupo/empresa) via useRLSQuery
import useRLSQuery from '@/components/lib/useRLSQuery';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function useCentral360Data({ enabled = true } = {}) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: orcamentos = [], isLoading, refetch } = useRLSQuery(
    'OrcamentoCliente',
    {},
    '-created_date',
    100,
    { staleTime: 30000, enabled: enabled && contextoValido }
  );

  return {
    orcamentos: Array.isArray(orcamentos) ? orcamentos : [],
    isLoading,
    refetch,
    empresaAtual,
    grupoAtual,
    contextoValido,
  };
}