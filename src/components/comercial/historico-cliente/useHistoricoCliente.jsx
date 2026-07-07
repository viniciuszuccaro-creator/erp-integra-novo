import { useEffect, useState } from 'react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useRLSQuery from '@/components/lib/useRLSQuery';

export function useHistoricoCliente(formData) {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const [produtosFrequentes, setProdutosFrequentes] = useState([]);
  const [analisando, setAnalisando] = useState(false);
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidosAnteriores = [] } = useRLSQuery('Pedido', { cliente_id: formData.cliente_id }, '-data_pedido', 50, { enabled: !!formData.cliente_id });
  const { data: contasReceber = [] } = useRLSQuery('ContaReceber', { cliente_id: formData.cliente_id }, '-data_vencimento', 20, { enabled: !!formData.cliente_id });
  const { data: entregas = [] } = useRLSQuery('Entrega', { cliente_id: formData.cliente_id }, '-created_date', 20, { enabled: !!formData.cliente_id });
  const { data: notasFiscais = [] } = useRLSQuery('NotaFiscal', { cliente_fornecedor_id: formData.cliente_id }, '-data_emissao', 20, { enabled: !!formData.cliente_id });

  useEffect(() => {
    if (pedidosAnteriores.length === 0) return;
    setAnalisando(true);
    const mapaProdutos = {};

    pedidosAnteriores.forEach(pedido => {
      (pedido.itens_revenda || []).forEach(item => {
        const key = item.produto_id || item.descricao;
        if (!mapaProdutos[key]) {
          mapaProdutos[key] = { produto_id: item.produto_id, descricao: item.descricao, quantidade_total: 0, valor_total: 0, frequencia: 0, ultima_compra: pedido.data_pedido, preco_medio: 0 };
        }
        mapaProdutos[key].quantidade_total += item.quantidade || 0;
        mapaProdutos[key].valor_total += item.valor_item || 0;
        mapaProdutos[key].frequencia += 1;
        if (pedido.data_pedido > mapaProdutos[key].ultima_compra) mapaProdutos[key].ultima_compra = pedido.data_pedido;
      });
      (pedido.itens_armado_padrao || []).forEach(item => {
        const key = item.peca_id || item.descricao_peca;
        if (!mapaProdutos[key]) {
          mapaProdutos[key] = { produto_id: item.peca_id, descricao: item.descricao_peca, quantidade_total: 0, valor_total: 0, frequencia: 0, ultima_compra: pedido.data_pedido, tipo: 'Armado' };
        }
        mapaProdutos[key].quantidade_total += item.quantidade || 0;
        mapaProdutos[key].valor_total += item.preco_venda_total || 0;
        mapaProdutos[key].frequencia += 1;
      });
    });

    const top20 = Object.values(mapaProdutos)
      .sort((a, b) => b.quantidade_total - a.quantidade_total)
      .slice(0, 20)
      .map(p => ({ ...p, preco_medio: p.quantidade_total > 0 ? p.valor_total / p.quantidade_total : 0 }));

    setProdutosFrequentes(top20);
    setAnalisando(false);
  }, [pedidosAnteriores]);

  const totalPedidos = pedidosAnteriores.length;
  const valorTotalHistorico = pedidosAnteriores.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const ticketMedio = totalPedidos > 0 ? valorTotalHistorico / totalPedidos : 0;
  const pedidosEntregues = pedidosAnteriores.filter(p => p.status === 'Entregue').length;
  const taxaEntrega = totalPedidos > 0 ? (pedidosEntregues / totalPedidos) * 100 : 0;
  const contasPagas = contasReceber.filter(c => c.status === 'Recebido').length;
  const contasAtrasadas = contasReceber.filter(c => c.status === 'Atrasado').length;

  return {
    pedidosAnteriores, contasReceber, entregas, notasFiscais,
    produtosFrequentes, analisando,
    totalPedidos, valorTotalHistorico, ticketMedio, taxaEntrega, contasPagas, contasAtrasadas,
  };
}