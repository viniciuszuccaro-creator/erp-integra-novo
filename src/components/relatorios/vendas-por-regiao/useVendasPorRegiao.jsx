import { useMemo } from 'react';

export function useVendasPorRegiao(regioes, pedidos, clientes, periodoSelecionado, vendedorSelecionado) {
  const dadosPorRegiao = useMemo(() => {
    const hoje = new Date();
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodoSelecionado));

    const pedidosFiltrados = pedidos.filter(p => {
      const dataPedido = new Date(p.data_pedido);
      return dataPedido >= dataLimite && (vendedorSelecionado === 'todos' || p.vendedor_id === vendedorSelecionado) && p.status !== 'Cancelado';
    });

    const dados = regioes.map(regiao => {
      const clientesDaRegiao = clientes.filter(c => c.regiao_atendimento_id === regiao.id);
      const pedidosDaRegiao = pedidosFiltrados.filter(p => clientesDaRegiao.some(c => c.id === p.cliente_id));
      const valorTotal = pedidosDaRegiao.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      const quantidadePedidos = pedidosDaRegiao.length;

      return {
        id: regiao.id,
        nome: regiao.nome_regiao,
        tipo: regiao.tipo_regiao,
        cor: regiao.cor_identificacao,
        totalClientes: clientesDaRegiao.length,
        quantidadePedidos,
        valorTotal,
        ticketMedio: quantidadePedidos > 0 ? valorTotal / quantidadePedidos : 0,
        metaMensal: regiao.comercial?.meta_vendas_mensal || 0,
        percentualMeta: regiao.comercial?.meta_vendas_mensal > 0 ? (valorTotal / regiao.comercial.meta_vendas_mensal) * 100 : 0,
      };
    });

    return dados.sort((a, b) => b.valorTotal - a.valorTotal);
  }, [regioes, pedidos, clientes, periodoSelecionado, vendedorSelecionado]);

  const totaisGerais = useMemo(() => dadosPorRegiao.reduce((acc, regiao) => ({
    totalClientes: acc.totalClientes + regiao.totalClientes,
    totalPedidos: acc.totalPedidos + regiao.quantidadePedidos,
    totalVendas: acc.totalVendas + regiao.valorTotal,
  }), { totalClientes: 0, totalPedidos: 0, totalVendas: 0 }), [dadosPorRegiao]);

  return { dadosPorRegiao, totaisGerais };
}