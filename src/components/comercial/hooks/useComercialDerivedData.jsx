import { safeArray, safeNumber, isClienteAtivo, isPedidoValidoParaVenda } from "@/components/comercial/utils/comercialSafeData";

const STATUS_ENTREGA = ['Aprovado', 'Pronto para Faturar', 'Faturamento Parcial', 'Faturado', 'Em Expedição', 'Em Trânsito'];
const STATUS_RETIRADA = ['Aprovado', 'Pronto para Faturar', 'Faturamento Parcial', 'Faturado', 'Pronto para Retirada'];

export default function useComercialDerivedData({ pedidos = [], clientes = [], pedidosExternos = [] }) {
  const listaPedidos = safeArray(pedidos);
  const listaClientes = safeArray(clientes);
  const listaPedidosExternos = safeArray(pedidosExternos);
  const pedidosExternosPendentes = listaPedidosExternos.filter((p) => p?.status_importacao === 'A Validar').length;
  const pedidosValidos = listaPedidos.filter((p) => isPedidoValidoParaVenda(p));
  const totalVendas = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.valor_total), 0);
  const ticketMedio = pedidosValidos.length > 0 ? totalVendas / pedidosValidos.length : 0;
  const clientesAtivos = listaClientes.filter((c) => isClienteAtivo(c)).length;
  const pedidosPendentesAprovacao = listaPedidos.filter((p) => p?.status_aprovacao === 'pendente').length;
  const pedidosEntrega = listaPedidos.filter((p) => (p?.tipo_frete === 'CIF' || p?.tipo_frete === 'FOB') && STATUS_ENTREGA.includes(p?.status)).length;
  const pedidosRetirada = listaPedidos.filter((p) => p?.tipo_frete === 'Retirada' && STATUS_RETIRADA.includes(p?.status)).length;

  // Vol 5.1: KPIs de faturamento e peso
  const valorFaturado = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.valor_faturado), 0);
  const valorPendenteFaturamento = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.valor_pendente_faturamento), 0);
  const pesoTotalVendido = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.peso_total_kg), 0);
  const pesoFaturado = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.peso_faturado_kg), 0);
  const pedidosFaturados = pedidosValidos.filter((p) => p?.status === 'Faturado').length;
  const pedidosFaturamentoParcial = pedidosValidos.filter((p) => p?.status === 'Faturamento Parcial').length;
  const pedidosCancelados = listaPedidos.filter((p) => p?.status === 'Cancelado').length;

  // Vol 5.1: Margem (usa custo_medio dos itens quando disponível)
  let custoTotalEstimado = 0;
  let custoTotalFaturado = 0;
  for (const p of pedidosValidos) {
    const tiposItem = ['itens_revenda', 'itens_armado_padrao', 'itens_corte_dobra'];
    const fatorFaturado = totalVendas > 0 ? safeNumber(p?.valor_faturado) / safeNumber(p?.valor_total, 1) : 0;
    for (const tipo of tiposItem) {
      const itens = p?.[tipo] || [];
      for (const item of itens) {
        const qtd = safeNumber(item?.quantidade);
        const custo = safeNumber(item?.custo_unitario || item?.custo_medio);
        custoTotalEstimado += qtd * custo;
        custoTotalFaturado += qtd * custo * fatorFaturado;
      }
    }
  }
  const margemBruta = totalVendas - custoTotalEstimado;
  const margemPercentual = totalVendas > 0 ? (margemBruta / totalVendas) * 100 : 0;
  const margemFaturada = valorFaturado - custoTotalFaturado;

  // V21.4: Análise de etapas de entrega/faturamento parcial
  const totalEtapasEntrega = pedidosValidos.reduce((sum, p) => sum + safeArray(p?.etapas_entrega).length, 0);
  const etapasFaturadas = pedidosValidos.reduce(
    (sum, p) => sum + safeArray(p?.etapas_entrega).filter(e => e?.faturada).length, 0
  );
  const etapasPendentes = totalEtapasEntrega - etapasFaturadas;
  const valorMedioPorEtapa = totalEtapasEntrega > 0 ? valorFaturado / totalEtapasEntrega : 0;

  // V21.4: Análise de produção vinculada
  const pedidosComProducao = pedidosValidos.filter(
    p => safeArray(p?.itens_armado_padrao).length > 0 || safeArray(p?.itens_corte_dobra).length > 0
  ).length;
  const pedidosSomenteRevenda = pedidosValidos.filter(
    p => safeArray(p?.itens_armado_padrao).length === 0 && safeArray(p?.itens_corte_dobra).length === 0
  ).length;

  // V21.4: Análise de faturamento
  const percentualFaturado = totalVendas > 0 ? (valorFaturado / totalVendas) * 100 : 0;
  const pesoPendenteFaturamento = pesoTotalVendido - pesoFaturado;
  const ticketFaturado = pedidosFaturados > 0 ? valorFaturado / pedidosFaturados : 0;

  // V21.4: Análise de entrega
  const pedidosEmProducao = pedidosValidos.filter(p => p?.status === 'Em Produção').length;
  const pedidosProntoFaturar = pedidosValidos.filter(p => p?.status === 'Pronto para Faturar').length;
  const pedidosEmExpedicao = pedidosValidos.filter(p => p?.status === 'Em Expedição').length;
  const pedidosEmTransito = pedidosValidos.filter(p => p?.status === 'Em Trânsito').length;
  const pedidosEntregues = pedidosValidos.filter(p => p?.status === 'Entregue').length;

  // V21.4: Análise de quantidades por tipo de item
  const tiposItem = ['itens_revenda', 'itens_armado_padrao', 'itens_corte_dobra'];
  const quantidadesPorTipo = tiposItem.reduce((acc, tipo) => {
    const qtd = pedidosValidos.reduce((sum, p) => {
      const itens = safeArray(p?.[tipo]);
      return sum + itens.reduce((s, i) => s + safeNumber(i?.quantidade), 0);
    }, 0);
    const valor = pedidosValidos.reduce((sum, p) => {
      const itens = safeArray(p?.[tipo]);
      return sum + itens.reduce((s, i) => s + safeNumber(i?.valor_total), 0);
    }, 0);
    acc[tipo] = { quantidade: qtd, valor, ticket: qtd > 0 ? valor / qtd : 0 };
    return acc;
  }, {});
  const quantidadeTotalItens = tiposItem.reduce((sum, tipo) => sum + quantidadesPorTipo[tipo].quantidade, 0);

  // V21.4: Margem por tipo de item
  const margemPorTipo = tiposItem.reduce((acc, tipo) => {
    let custo = 0, receita = 0;
    for (const p of pedidosValidos) {
      const itens = safeArray(p?.[tipo]);
      for (const item of itens) {
        const qtd = safeNumber(item?.quantidade);
        const custoItem = safeNumber(item?.custo_unitario || item?.custo_medio);
        const preco = safeNumber(item?.valor_total || (item?.preco_unitario * qtd));
        custo += qtd * custoItem;
        receita += preco;
      }
    }
    acc[tipo] = { receita, custo, margem: receita - custo, margemPercent: receita > 0 ? ((receita - custo) / receita) * 100 : 0 };
    return acc;
  }, {});

  // V21.4: Performance de entrega (taxa de sucesso)
  const totalPedidosFinalizados = pedidosEntregues + pedidosCancelados;
  const taxaEntregaSucesso = totalPedidosFinalizados > 0 ? (pedidosEntregues / totalPedidosFinalizados) * 100 : 0;
  const taxaCancelamento = pedidosValidos.length > 0 ? (pedidosCancelados / (pedidosValidos.length + pedidosCancelados)) * 100 : 0;

  // V21.4: Funil de status (pipeline visual)
  const funilStatus = [
    { status: 'Rascunho', count: listaPedidos.filter(p => p?.status === 'Rascunho').length },
    { status: 'Aguardando Aprovação', count: listaPedidos.filter(p => p?.status === 'Aguardando Aprovação').length },
    { status: 'Aprovado', count: listaPedidos.filter(p => p?.status === 'Aprovado').length },
    { status: 'Em Produção', count: pedidosEmProducao },
    { status: 'Pronto para Faturar', count: pedidosProntoFaturar },
    { status: 'Faturado', count: pedidosFaturados },
    { status: 'Em Expedição', count: pedidosEmExpedicao },
    { status: 'Em Trânsito', count: pedidosEmTransito },
    { status: 'Entregue', count: pedidosEntregues },
    { status: 'Cancelado', count: pedidosCancelados },
  ];

  return {
    pedidosExternosPendentes,
    totalVendas,
    ticketMedio,
    clientesAtivos,
    pedidosPendentesAprovacao,
    pedidosEntrega,
    pedidosRetirada,
    // Vol 5.1: KPIs ampliados
    valorFaturado,
    valorPendenteFaturamento,
    pesoTotalVendido,
    pesoFaturado,
    pesoPendenteFaturamento,
    pedidosFaturados,
    pedidosFaturamentoParcial,
    pedidosCancelados,
    margemBruta,
    margemPercentual,
    margemFaturada,
    // V21.4: Análise de etapas
    totalEtapasEntrega,
    etapasFaturadas,
    etapasPendentes,
    valorMedioPorEtapa,
    // V21.4: Análise de produção
    pedidosComProducao,
    pedidosSomenteRevenda,
    // V21.4: Análise de faturamento
    percentualFaturado,
    ticketFaturado,
    // V21.4: Análise de entrega
    pedidosEmProducao,
    pedidosProntoFaturar,
    pedidosEmExpedicao,
    pedidosEmTransito,
    pedidosEntregues,
    // V21.4: Análise de quantidades por tipo
    quantidadesPorTipo,
    quantidadeTotalItens,
    // V21.4: Margem por tipo de item
    margemPorTipo,
    // V21.4: Performance de entrega
    taxaEntregaSucesso,
    taxaCancelamento,
    // V21.4: Funil de status
    funilStatus,
  };
}