// Central de Vendas 360 — orçamentos e pedidos do contexto (grupo/empresa) via useRLSQuery
import { useEffect, useState } from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const ESPERA_BUSCA_MS = 400;

export default function useCentral360Data({ enabled = true, busca = '' } = {}) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  // Busca universal com escopo de servidor: espera a digitação parar antes de consultar
  const [termo, setTermo] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setTermo(String(busca || '').trim()), ESPERA_BUSCA_MS);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: orcamentos = [], isLoading, refetch } = useRLSQuery(
    'OrcamentoCliente',
    {},
    '-created_date',
    100,
    { staleTime: 30000, enabled: enabled && contextoValido, search: termo }
  );

  // Pedidos além dos já carregados pela página — só quando há termo de busca
  const { data: pedidosBusca = [], isLoading: buscandoPedidos, refetch: refetchPedidosBusca } = useRLSQuery(
    'Pedido',
    {},
    '-created_date',
    100,
    { staleTime: 30000, enabled: enabled && contextoValido && termo.length > 0, search: termo }
  );

  const refetchTudo = async () => {
    await refetch();
    await refetchPedidosBusca?.();
  };

  return {
    orcamentos: Array.isArray(orcamentos) ? orcamentos : [],
    pedidosBusca: Array.isArray(pedidosBusca) ? pedidosBusca : [],
    buscando: termo.length > 0,
    isLoading: isLoading || (termo.length > 0 && buscandoPedidos),
    refetch: refetchTudo,
    empresaAtual,
    grupoAtual,
    contextoValido,
  };
}