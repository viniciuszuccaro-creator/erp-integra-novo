import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { obterEstatisticasAutomacao } from '@/components/lib/useFluxoPedido';

export function useFechamentoPedidos(empresaId) {
  const { filterInContext } = useContextoVisual();
  const [estatisticasIA, setEstatisticasIA] = useState(null);

  useEffect(() => {
    obterEstatisticasAutomacao(empresaId, 7).then(stats => setEstatisticasIA(stats));
  }, [empresaId]);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaId],
    queryFn: () => filterInContext('Pedido', { ...(empresaId ? { empresa_id: empresaId } : {}) }, '-created_date', 100),
    initialData: [],
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes', empresaId],
    queryFn: () => filterInContext('MovimentacaoEstoque', { ...(empresaId ? { empresa_id: empresaId } : {}) }, '-created_date', 100),
    initialData: [],
  });

  const { data: contas = [] } = useQuery({
    queryKey: ['contas-receber', empresaId],
    queryFn: () => filterInContext('ContaReceber', { ...(empresaId ? { empresa_id: empresaId } : {}) }, '-created_date', 100),
    initialData: [],
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaId],
    queryFn: () => filterInContext('Entrega', { ...(empresaId ? { empresa_id: empresaId } : {}) }, '-created_date', 100),
    initialData: [],
  });

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 7);

  const pedidosRecentes = pedidos.filter(p => new Date(p.created_date) >= dataLimite);

  const pedidosFechados = pedidosRecentes.filter(p =>
    p.status === 'Pronto para Faturar' || p.status === 'Faturado' || p.status === 'Em Expedição'
  );

  const pedidosComAutomacao = pedidosFechados.filter(p => p.observacoes_internas?.includes('[AUTOMAÇÃO'));
  const taxaAutomacao = pedidosFechados.length > 0 ? (pedidosComAutomacao.length / pedidosFechados.length) * 100 : 0;

  const movimentacoesAutomaticas = movimentacoes.filter(m => m.responsavel === 'Sistema Automático' && new Date(m.created_date) >= dataLimite);
  const contasAutomaticas = contas.filter(c => c.origem_tipo === 'pedido' && new Date(c.created_date) >= dataLimite);
  const entregasAutomaticas = entregas.filter(e => new Date(e.created_date) >= dataLimite);

  const pedidosProntosFechar = pedidos.filter(p =>
    p.status === 'Rascunho' && (p.itens_revenda?.length > 0 || p.itens_armado_padrao?.length > 0)
  );

  return {
    estatisticasIA, pedidosFechados, pedidosComAutomacao, pedidosRecentes,
    movimentacoesAutomaticas, contasAutomaticas, entregasAutomaticas,
    pedidosProntosFechar, taxaAutomacao,
  };
}