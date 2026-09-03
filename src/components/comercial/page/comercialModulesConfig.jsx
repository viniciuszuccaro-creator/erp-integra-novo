// Regra-Mãe 3: Extraído de src/pages/Comercial.jsx — grid de módulos do Comercial (lazy) com props e badges
import React from "react";
import { Users, ShoppingCart, FileText, TrendingUp, ShieldCheck, Truck, Package } from "lucide-react";

const ClientesTab = React.lazy(() => import("../ClientesTab"));
const PedidosTab = React.lazy(() => import("../PedidosTab"));
const ComissoesTab = React.lazy(() => import("../ComissoesTab"));
const NotasFiscaisTab = React.lazy(() => import("../NotasFiscaisTab"));
const TabelasPrecoTab = React.lazy(() => import("../TabelasPrecoTab"));
const CentralAprovacoesManager = React.lazy(() => import("../CentralAprovacoesManager"));
const PedidosEntregaTab = React.lazy(() => import("../PedidosEntregaTab"));
const PedidosRetiradaTab = React.lazy(() => import("../PedidosRetiradaTab"));
const MonitoramentoCanaisRealtime = React.lazy(() => import("../MonitoramentoCanaisRealtime"));

export function buildComercialModules({
  clientes,
  pedidos,
  empresas,
  comissoes,
  notasFiscais,
  tabelasPreco,
  pedidosEntrega,
  pedidosRetirada,
  pedidosPendentesAprovacao,
  onCreatePedido,
  onEditPedido,
}) {
  return [
    {
      title: 'Clientes',
      sectionKey: 'Clientes',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'blue',
      component: ClientesTab,
      windowTitle: ' Clientes',
      width: 1500,
      height: 850,
      props: { clientes }
    },
    {
      title: 'Pedidos',
      sectionKey: 'Pedidos',
      description: 'Orçamentos e vendas',
      icon: ShoppingCart,
      color: 'purple',
      component: PedidosTab,
      windowTitle: ' Pedidos',
      width: 1500,
      height: 850,
      props: { pedidos, clientes, empresas, onCreatePedido, onEditPedido }
    },
    {
      title: 'Logística Entrega',
      description: 'CIF e FOB',
      icon: Truck,
      color: 'blue',
      component: PedidosEntregaTab,
      windowTitle: ' Logística de Entrega',
      width: 1400,
      height: 800,
      badge: pedidosEntrega > 0 ? `${pedidosEntrega}` : null
    },
    {
      title: 'Pedidos Retirada',
      sectionKey: 'Pedidos Retirada',
      description: 'Cliente retira',
      icon: Package,
      color: 'green',
      component: PedidosRetiradaTab,
      windowTitle: ' Pedidos p/ Retirada',
      width: 1400,
      height: 800,
      badge: pedidosRetirada > 0 ? `${pedidosRetirada}` : null
    },
    {
      title: 'Comissões',
      description: 'Vendedores e indicadores',
      icon: TrendingUp,
      color: 'green',
      component: ComissoesTab,
      windowTitle: 'Comissões',
      width: 1400,
      height: 800,
      props: { comissoes, pedidos, empresas }
    },
    {
      title: 'Notas Fiscais',
      sectionKey: 'Notas Fiscais',
      description: 'NF-e emitidas',
      icon: FileText,
      color: 'indigo',
      component: NotasFiscaisTab,
      windowTitle: ' Notas Fiscais',
      width: 1500,
      height: 850,
      props: { notasFiscais, pedidos, clientes }
    },
    {
      title: 'Aprovações',
      description: 'Descontos hierárquicos',
      icon: ShieldCheck,
      color: 'orange',
      component: CentralAprovacoesManager,
      windowTitle: 'Aviso: Central de Aprovações',
      width: 1400,
      height: 800,
      badge: pedidosPendentesAprovacao > 0 ? `${pedidosPendentesAprovacao} pendentes` : null
    },
    {
      title: 'Tabelas de Preço',
      description: 'Gestão de preços',
      icon: TrendingUp,
      color: 'indigo',
      component: TabelasPrecoTab,
      windowTitle: ' Tabelas de Preço',
      width: 1400,
      height: 800,
      props: { tabelasPreco }
    },
    {
      title: 'Canais Realtime',
      sectionKey: 'Canais Realtime',
      description: 'Monitoramento de origem',
      icon: TrendingUp,
      color: 'cyan',
      component: MonitoramentoCanaisRealtime,
      windowTitle: ' Canais em Tempo Real',
      width: 1300,
      height: 750,
      props: { autoRefresh: true }
    }
  ];
}