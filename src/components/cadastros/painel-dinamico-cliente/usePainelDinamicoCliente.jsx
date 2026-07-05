import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook extraído do PainelDinamicoCliente (Regra-Mãe P1).
 * Centraliza queries multi-tenant (filterInContext) e cálculos derivados.
 * Garante que nenhuma consulta rode sem contexto explícito de grupo/empresa (P2).
 */
export default function usePainelDinamicoCliente(cliente, isOpen) {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-cliente', cliente?.id, contextoKey],
    queryFn: () => filterInContext('Pedido', { cliente_id: cliente.id }, '-data_pedido', 10),
    enabled: !!cliente?.id && isOpen && !!contextoKey && !!grupoAtual?.id,
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-cliente', cliente?.id, contextoKey],
    queryFn: () => filterInContext('Entrega', { cliente_id: cliente.id }, '-created_date', 5),
    enabled: !!cliente?.id && isOpen && !!contextoKey && !!grupoAtual?.id,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-cliente', cliente?.id, contextoKey],
    queryFn: () => filterInContext('ContaReceber', { cliente_id: cliente.id }, '-data_vencimento', 5),
    enabled: !!cliente?.id && isOpen && !!contextoKey && !!grupoAtual?.id,
  });

  const totalEmAberto = contasReceber
    .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const totalVendas = pedidos
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  return {
    pedidos,
    entregas,
    contasReceber,
    totalEmAberto,
    totalVendas,
  };
}