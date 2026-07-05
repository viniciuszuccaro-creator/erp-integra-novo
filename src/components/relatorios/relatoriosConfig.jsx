import React from "react";
import { BarChart3, Activity, Users, Package, AlertCircle, MapPin, FileText } from "lucide-react";

const DREComparativo = React.lazy(() => import("@/components/relatorios/DREComparativo"));
const FluxoCaixaProjetado = React.lazy(() => import("@/components/relatorios/FluxoCaixaProjetado"));
const RentabilidadeCliente = React.lazy(() => import("@/components/relatorios/RentabilidadeCliente"));
const RentabilidadeProduto = React.lazy(() => import("@/components/relatorios/RentabilidadeProduto"));
const DashboardInadimplencia = React.lazy(() => import("@/components/relatorios/DashboardInadimplencia"));
const RelatorioVendasPorRegiao = React.lazy(() => import("@/components/relatorios/RelatorioVendasPorRegiao"));
const DashboardCanaisOrigem = React.lazy(() => import("@/components/cadastros/DashboardCanaisOrigem"));
const RelatorioPedidosPorOrigem = React.lazy(() => import("@/components/relatorios/RelatorioPedidosPorOrigem"));

/**
 * Config extraída de Relatorios.jsx (Regra-Mãe regra 3).
 * Define os arrays de relatórios estratégicos e predefinidos.
 */
export const relatoriosEstrategicos = [
  { id: 'dre-comparativo', titulo: 'DRE Comparativo Multi-períodos', descricao: 'Análise comparativa de resultados (3, 6 ou 12 meses)', icone: BarChart3, cor: 'text-blue-600', component: DREComparativo },
  { id: 'fluxo-caixa', titulo: 'Fluxo de Caixa Projetado', descricao: 'Projeção de entradas e saídas (6 meses)', icone: Activity, cor: 'text-cyan-600', component: FluxoCaixaProjetado },
  { id: 'rentabilidade-cliente', titulo: 'Rentabilidade por Cliente', descricao: 'Top 20 clientes mais rentáveis com score', icone: Users, cor: 'text-green-600', component: RentabilidadeCliente },
  { id: 'rentabilidade-produto', titulo: 'Rentabilidade por Produto', descricao: 'Análise de margem e curva ABC', icone: Package, cor: 'text-purple-600', component: RentabilidadeProduto },
  { id: 'inadimplencia', titulo: 'Dashboard de Inadimplência', descricao: 'Score de risco e previsão de recebimento', icone: AlertCircle, cor: 'text-red-600', component: DashboardInadimplencia },
  { id: 'vendas-regiao', titulo: 'Vendas por Região de Atendimento', descricao: 'Análise geográfica de desempenho comercial com metas e métricas', icone: MapPin, cor: 'text-indigo-600', component: RelatorioVendasPorRegiao },
  { id: 'pedidos-origem', titulo: 'Análise de Canais de Origem', descricao: 'Performance, conversão e ROI por canal de venda (ERP, Site, Chatbot, etc.)', icone: Activity, cor: 'text-cyan-600', component: DashboardCanaisOrigem },
  { id: 'origem-detalhado', titulo: 'Relatório Detalhado por Origem', descricao: 'Lista completa de pedidos filtrados por origem com métricas', icone: FileText, cor: 'text-purple-600', component: RelatorioPedidosPorOrigem }
];

export const buildRelatoriosPredefinidos = (relatorioVendasPorCliente) => [
  {
    id: 'vendas-cliente', titulo: 'Vendas por Cliente', descricao: 'Ranking de clientes por faturamento',
    icone: Users, cor: 'text-blue-600',
    getData: () => relatorioVendasPorCliente, tipo: 'bar', valorKey: 'valor_total', nomeKey: 'cliente'
  }
];

export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];