import { DollarSign, Users, ShoppingCart, Package, Truck, UserCircle, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Hook extraído de Dashboard.jsx (Regra-Mãe regra 3).
 * Centraliza a construção dos arrays de KPIs (críticos, operacionais e quick-access).
 */
export function useDashboardKPIs({
  totalVendas, fluxoCaixa, pedidosPeriodo, receitasPendentes, despesasPendentes,
  produtosBaixoEstoque, taxaInadimplencia, valorVencido,
  otd, entregasNoPrazo, entregasConcluidas, pesoProduzido, opsConcluidasCount,
  clientesAtivos, totalColaboradoresDash, entregasPendentes, pedidos,
  contasReceber, contasPagar, canSeeComercial, canSeeEstoque, canSeeExpedicao, canSeeFinanceiro,
  handleDrillDown,
  // Vol 3.3: Contagens server-side precisas (não limitadas a DASHBOARD_LIST_LIMIT)
  pedidosTotalCount, contasReceberPendentesCount, contasPagarPendentesCount
}) {
  const statsCards = [
    {
      title: "Vendas do Período",
      value: `R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${pedidosPeriodo.length} pedidos`,
      icon: DollarSign, color: "from-green-500 to-green-600", bgColor: "bg-green-50", textColor: "text-green-600",
      drillDown: () => handleDrillDown("/comercial")
    },
    {
      title: "Fluxo de Caixa",
      value: `R$ ${fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${fluxoCaixa >= 0 ? 'Positivo' : 'Negativo'}`,
      icon: DollarSign, color: fluxoCaixa >= 0 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600",
      bgColor: fluxoCaixa >= 0 ? "bg-emerald-50" : "bg-orange-50", textColor: fluxoCaixa >= 0 ? "text-emerald-600" : "text-orange-600",
      drillDown: () => handleDrillDown("/financeiro")
    },
    {
      title: "Contas a Receber Pendentes",
      value: `R$ ${receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${contasReceberPendentesCount != null ? contasReceberPendentesCount : (contasReceber || []).filter(c => c?.status === 'Pendente').length} títulos pendentes`,
      icon: AlertCircle, color: receitasPendentes > 0 ? "from-orange-500 to-orange-600" : "from-green-500 to-green-600",
      bgColor: receitasPendentes > 0 ? "bg-orange-50" : "bg-green-50", textColor: receitasPendentes > 0 ? "text-orange-600" : "text-green-600",
      drillDown: () => handleDrillDown("/financeiro")
    },
    {
      title: "Contas a Pagar Pendentes",
      value: `R$ ${despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${contasPagarPendentesCount != null ? contasPagarPendentesCount : (contasPagar || []).filter(c => c?.status === 'Pendente').length} títulos pendentes`,
      icon: AlertCircle, color: despesasPendentes > 0 ? "from-orange-500 to-orange-600" : "from-green-500 to-green-600",
      bgColor: despesasPendentes > 0 ? "bg-orange-50" : "bg-green-50", textColor: despesasPendentes > 0 ? "text-orange-600" : "text-green-600",
      drillDown: () => handleDrillDown("/financeiro")
    },
    {
      title: "Estoque Crítico",
      value: produtosBaixoEstoque, subtitle: "produtos com baixo estoque",
      icon: AlertCircle, color: produtosBaixoEstoque > 0 ? "text-red-600" : "text-green-600",
      bgColor: produtosBaixoEstoque > 0 ? "bg-red-50" : "bg-green-50",
      drillDown: () => handleDrillDown("/estoque")
    },
    {
      title: "Taxa Inadimplência",
      value: `${taxaInadimplencia}%`,
      subtitle: `R$ ${valorVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vencido`,
      icon: AlertCircle, color: taxaInadimplencia > 5 ? "from-red-500 to-red-600" : "from-green-500 to-green-600",
      bgColor: taxaInadimplencia > 5 ? "bg-red-50" : "bg-green-50", textColor: taxaInadimplencia > 5 ? "text-red-600" : "text-green-600",
      drillDown: () => handleDrillDown("/financeiro")
    }
  ];

  const kpisOperacionais = [
    { title: "OTD (On-Time)", value: `${otd}%`, subtitle: `${entregasNoPrazo.length}/${entregasConcluidas.length} entregas`, icon: CheckCircle, color: otd >= 90 ? "text-green-600" : otd >= 70 ? "text-orange-600" : "text-red-600", bgColor: otd >= 90 ? "bg-green-50" : otd >= 70 ? "bg-orange-50" : "bg-red-50", drillDown: () => handleDrillDown("/expedicao") },
    { title: "Peso Produzido", value: `${pesoProduzido.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`, subtitle: `${opsConcluidasCount} OPs concluídas`, icon: Package, color: "text-indigo-600", bgColor: "bg-indigo-50", drillDown: () => handleDrillDown("/producao") },
    { title: "Clientes Ativos", value: clientesAtivos, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", drillDown: () => handleDrillDown("/comercial") },
    { title: "Colaboradores", value: totalColaboradoresDash, icon: UserCircle, color: "text-pink-600", bgColor: "bg-pink-50", drillDown: () => handleDrillDown("/rh") },
    { title: "Entregas Pendentes", value: entregasPendentes, icon: Truck, color: "text-orange-600", bgColor: "bg-orange-50", drillDown: () => handleDrillDown("/expedicao") },
    { title: "Total Pedidos", value: pedidosTotalCount != null ? pedidosTotalCount : pedidos.length, icon: ShoppingCart, color: "text-cyan-600", bgColor: "bg-cyan-50", drillDown: () => handleDrillDown("/comercial") }
  ];

  const quickAccessBase = [
    { title: "Comercial e Vendas", description: "Gestão de Clientes e Vendas", icon: ShoppingCart, color: "from-purple-500 to-purple-600", url: "/comercial", count: pedidosPeriodo.length },
    { title: "Estoque e Almoxarifado", description: "Produtos e Movimentações", icon: Package, color: "from-indigo-500 to-indigo-600", url: "/estoque", count: produtosBaixoEstoque > 0 ? produtosBaixoEstoque : null, alert: produtosBaixoEstoque > 0 },
    { title: "Expedição e Logística", description: "Entregas e Logística", icon: Truck, color: "from-orange-500 to-orange-600", url: "/expedicao", count: entregasPendentes },
    { title: "Financeiro e Contábil", description: "Contas e Fluxo de Caixa", icon: DollarSign, color: "from-green-500 to-green-600", url: "/financeiro", count: null },
  ];

  const quickAccess = quickAccessBase.filter((m) => (
    (m.title.includes('Comercial') && canSeeComercial) ||
    (m.title.includes('Estoque') && canSeeEstoque) ||
    (m.title.includes('Expedição') && canSeeExpedicao) ||
    (m.title.includes('Financeiro') && canSeeFinanceiro)
  ));

  return { statsCards, kpisOperacionais, quickAccess };
}

export default useDashboardKPIs;