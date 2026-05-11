import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useContextoVisual } from '@/components/lib/useContextoVisual'; // Updated import path
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  Truck,
  UserCircle,
  ArrowRight,
  AlertCircle,
  Box,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  Percent,
  Trophy,
  Activity,
  Shield,
  FileText,
  MessageCircle
  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie, // Recharts PieChart component, aliased to avoid conflict with Lucide icon
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
const PainelOperacoes3D = React.lazy(() => import("../components/dashboard/PainelOperacoes3D"));
const GamificacaoOperacoes = React.lazy(() => import("../components/dashboard/GamificacaoOperacoes"));
const DashboardTempoReal = React.lazy(() => import('../components/dashboard/DashboardTempoReal'));
const DashboardOperacionalBI = React.lazy(() => import("@/components/dashboard/DashboardOperacionalBI"));
import MapaTempoReal from "@/components/expedicao/MapaTempoReal";
const DashboardPerformance = React.lazy(() => import("@/components/sistema/DashboardPerformance"));
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DashboardTabsNav from "@/components/dashboard/DashboardTabsNav";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import usePermissions from "@/components/lib/usePermissions";
const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem")); // kept for backward-compat (not used directly here)
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import KPIsOperacionaisSection from "@/components/dashboard/KPIsOperacionaisSection";
import SecondaryKPIsSection from "@/components/dashboard/SecondaryKPIsSection";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopProdutosStatusPeriodoSection from "@/components/dashboard/TopProdutosStatusPeriodoSection";
import AdvancedAnalysisSection from "@/components/dashboard/AdvancedAnalysisSection";
import QuickAccessModulesGrid from "@/components/dashboard/QuickAccessModulesGrid";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import WidgetEstoqueCritico from "@/components/estoque/WidgetEstoqueCritico";
import DashboardStabilityNotice from "@/components/dashboard/DashboardStabilityNotice";
import DashboardStickyKpis from "@/components/dashboard/DashboardStickyKpis";
import PedidosResumoPanel from "@/components/dashboard/PedidosResumoPanel";
import ResizableRow from "@/components/dashboard/ResizableRow";
import { ResizablePanelGroup as PanelGroup, ResizablePanel as Panel, ResizableHandle as PanelResizeHandle } from "@/components/ui/resizable";
import useDashboardDerivedData from "@/components/dashboard/hooks/useDashboardDerivedData";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_REFETCH_INTERVAL_MS, dashboardQueryDefaults } from "@/components/dashboard/config/dashboardQueryConfig";


export default function Dashboard() {
  const navigate = useNavigate();
  const { empresaAtual, estaNoGrupo, grupoAtual, filterInContext, getFiltroContexto, alternarContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const canSeeFinanceiro = hasPermission('Financeiro', null, 'ver');
  const canSeeCRM = hasPermission('CRM', null, 'ver');
  const canSeeComercial = hasPermission('Comercial', null, 'ver');
  const canSeeEstoque = hasPermission('Estoque', null, 'ver');
  const canSeeExpedicao = hasPermission('Expedição', null, 'ver');
  const canSeeRH = hasPermission('RH', null, 'ver');
  const canSeeCompras = hasPermission('Compras', null, 'ver');
  const canSeeProducao = hasPermission('Produção', null, 'ver');

  const [periodo, setPeriodo] = useState(() => {
    try {
      return localStorage.getItem('dashboard_periodo') || "mes";
    } catch (e) {
      // Handle potential localStorage errors (e.g., security settings, full storage)
      console.warn("Could not access localStorage for 'dashboard_periodo':", e);
      return "mes"; // Fallback to default
    }
  });

  // Removed visualizacao state as it's replaced by Tabs
  const dashboardTabsPermitidas = ["resumo"];
  const [activeTab, setActiveTab] = useState("resumo");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Dashboard_tab'); } catch {} }
    setActiveTab(dashboardTabsPermitidas.includes(initial) ? initial : "resumo");
  }, []);
  const handleTabChange = (value) => {
    const nextTab = dashboardTabsPermitidas.includes(value) ? value : "resumo";
    setActiveTab(nextTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nextTab);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Dashboard_tab', nextTab); } catch {}
  }; // New state for active tab

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_periodo', periodo);
    } catch (e) {
      // Ignore localStorage errors, as state will still hold the value
      console.warn("Could not save 'dashboard_periodo' to localStorage:", e);
    }
  }, [periodo]);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const queryClient = useQueryClient();
  const hasContextoAtivo = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);
  const refetchInterval = (empresaAtual?.id || estaNoGrupo) ? ((activeTab === 'resumo' && autoRefresh) ? DASHBOARD_REFETCH_INTERVAL_MS : false) : false; // evita zero-dados sem contexto

  const { data: pedidos = [] } = useQuery({
      enabled: Boolean(canSeeComercial && hasContextoAtivo),
      queryKey: ['pedidos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('Pedido', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: contasReceber = [] } = useQuery({
      enabled: Boolean(canSeeFinanceiro && hasContextoAtivo),
      queryKey: ['contasReceber', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('ContaReceber', {}, '-data_vencimento', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: contasPagar = [] } = useQuery({
      enabled: Boolean(canSeeFinanceiro && hasContextoAtivo),
      queryKey: ['contasPagar', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('ContaPagar', {}, '-data_vencimento', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: entregas = [] } = useQuery({
      enabled: Boolean(canSeeExpedicao && hasContextoAtivo),
      queryKey: ['entregas', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('Entrega', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: colaboradores = [] } = useQuery({
      enabled: Boolean(canSeeRH && hasContextoAtivo),
      queryKey: ['colaboradores', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('Colaborador', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: produtos = [] } = useQuery({
      enabled: Boolean(canSeeEstoque && hasContextoAtivo),
      queryKey: ['produtos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('Produto', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: totalProdutos = 0 } = useQuery({
    enabled: Boolean(hasContextoAtivo && canSeeEstoque),
    queryKey: ['produtos-count-dash', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_id');
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Produto',
          filter: filtro
        });
        return response.data?.count || produtos.length;
      } catch {
        return produtos.length;
      }
    },
    staleTime: 300000,
    retry: false,
  });

  const { data: clientes = [] } = useQuery({
      enabled: Boolean(canSeeCRM && hasContextoAtivo),
      queryKey: ['clientes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('Cliente', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: totalClientes = 0 } = useQuery({
    enabled: Boolean(hasContextoAtivo && canSeeCRM),
    queryKey: ['clientes-count', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_id', true);
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: filtro
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 300000,
    retry: false,
  });

  const { data: totalColaboradoresDash = 0 } = useQuery({
    enabled: Boolean(hasContextoAtivo && canSeeRH),
    queryKey: ['colaboradores-count-dash', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_alocada_id', true);
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Colaborador',
          filter: filtro
        });
        return response.data?.count || colaboradores.length;
      } catch {
        return colaboradores.length;
      }
    },
    staleTime: 300000,
    retry: false,
  });

  const { data: ordensProducao = [] } = useQuery({
      enabled: Boolean(canSeeProducao && hasContextoAtivo),
      queryKey: ['ordensProducao', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('OrdemProducao', {}, '-data_emissao', DASHBOARD_LIST_LIMIT);
      },
    ...dashboardQueryDefaults,
    refetchInterval
  });

  const { data: notasFiscais = [] } = useQuery({
      enabled: Boolean((canSeeFinanceiro || hasPermission('Fiscal', null, 'ver') || canSeeComercial) && hasContextoAtivo),
      queryKey: ['notasFiscais', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('NotaFiscal', {}, '-created_date', DASHBOARD_LIST_LIMIT);
      },
    refetchInterval,
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const nfAutorizadas = (notasFiscais || []).filter(n => n?.status === 'Autorizada').length;

  const { data: cobrancas = [] } = useQuery({
      enabled: Boolean(canSeeFinanceiro && hasContextoAtivo),
      queryKey: ['cobrancas', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
        return await filterInContext('ContaReceber', {}, '-data_vencimento', DASHBOARD_LIST_LIMIT);
      },
    refetchInterval,
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const cobrancasPagas = (cobrancas || []).filter(c => (c?.status === 'Recebido') || (c?.status_cobranca === 'paga')).length;

  const {
     pedidosPeriodo,
    totalVendas,
    ticketMedio,
    receitasPendentes,
    despesasPendentes,
    fluxoCaixa,
    produtosBaixoEstoque,
    colaboradoresAtivos,
    clientesAtivos,
    taxaConversao,
    entregasPendentes,
    otd,
    entregasNoPrazo,
    entregasConcluidas,
    pesoProduzido,
    aproveitamentoBarra,
    taxaInadimplencia,
    valorVencido,
    dadosVendasStatus,
    vendasUltimos30Dias,
    fluxo7Dias,
    topProdutos,
    vendasPorMesData,
    top5ClientesData,
    statusPedidosDataAll,
    fluxoCaixaMensalData,
  } = useDashboardDerivedData({
    pedidos,
    contasReceber,
    contasPagar,
    entregas,
    ordensProducao,
    colaboradores,
    clientes,
    produtos,
    periodo,
  });

  // Pedidos - listas rápidas (recentes/pendentes/aprovação)
  const pedidosRecentes = (pedidos || []).slice(0, 8);
  const pedidosPendentes = (pedidos || []).filter(p => ['Rascunho','Em Produção','Pronto para Faturar','Em Expedição'].includes(p?.status)).slice(0, 8);
  const pedidosAguardandoAprovacao = (pedidos || []).filter(p => (p?.status_aprovacao === 'pendente') || (p?.status === 'Aguardando Aprovação')).slice(0, 8);


  // Dados e gráficos agora são providos por useDashboardDerivedData()

  const { data: previsoesIA = {}, isLoading: loadingPrevIA } = useQuery({
    queryKey: ['iaPrevEstoque14', empresaAtual?.id, grupoAtual?.id, periodo],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return { previsoes: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros,
        previsao_estoque: { enabled: true, horizon_days: 14 }
      });
      return res?.data || { previsoes: [] };
    },
    staleTime: 120000,
    enabled: Boolean(canSeeEstoque && hasContextoAtivo)
  });

  const { data: previsoesIA30 = {} } = useQuery({
    queryKey: ['iaPrevEstoque30', empresaAtual?.id, grupoAtual?.id, periodo],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return { previsoes: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros,
        previsao_estoque: { enabled: true, horizon_days: 30 }
      });
      return res?.data || { previsoes: [] };
    },
    staleTime: 120000,
    enabled: Boolean(canSeeEstoque && hasContextoAtivo)
  });

  const { data: anomaliasIA = {}, isLoading: loadingAnomIA } = useQuery({
    queryKey: ['iaAnomaliasFinanceiro', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return { details: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', { filtros });
      return res?.data || { details: [] };
    },
    staleTime: 120000,
    enabled: Boolean(canSeeFinanceiro && hasContextoAtivo)
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Command Center metrics (24h window) from AuditLog
  const { data: ccMetrics = { errors: 0, funcs: 0, secAlerts: 0 } } = useQuery({
    enabled: Boolean(hasContextoAtivo),
    queryKey: ['command-center', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog.filter({}, '-data_hora', 500);
      const within = (logs || []).filter(l => {
        const t = new Date(l?.data_hora || l?.created_date || Date.now()).getTime();
        return t >= since;
      });
      const str = (l) => `${l?.descricao || ''} ${l?.mensagem_erro || ''} ${l?.acao || ''}`;
      const errors = within.filter(l => /erro|error|failed|rejeit/i.test(str(l))).length;
      const funcs = within.filter(l => l?.entidade === 'Function' && l?.acao === 'Execução').length;
      const secAlerts = within.filter(l => (l?.tipo_auditoria || '').toLowerCase() === 'seguranca').length;
      return { errors, funcs, secAlerts };
    },
    staleTime: 180000,
  });

  // KPIs Chatbot / SLA últimas 24h
  const { data: botMetrics = { chats: 0, sla_ok: 0, sla_total: 0 } } = useQuery({
    enabled: Boolean(hasContextoAtivo),
    queryKey: ['bot-metrics-24h', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const items = await filterInContext('ChatbotInteracao', {}, '-created_date', 500);
      const within = (items || []).filter(i => new Date(i?.created_date || Date.now()).getTime() >= since);
      const sla = within.reduce((acc, i) => {
        const ms = Number(i?.tempo_primeira_resposta_ms || 0);
        if (!isNaN(ms)) { acc.total++; if (ms <= 60000) acc.ok++; }
        return acc;
      }, { ok: 0, total: 0 });
      return { chats: within.length, sla_ok: sla.ok, sla_total: sla.total };
    },
    staleTime: 180000,
  });

  // Assinaturas realtime locais (reforço) para invalidar KPIs do Dashboard
  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return;
    const subs = [];
    const add = (api, key) => { if (!api?.subscribe) return; const un = api.subscribe(() => {
      try { queryClient.invalidateQueries({ queryKey: [key] }); } catch (_) {}
    }); subs.push(un); };
    add(base44.entities?.Pedido, 'pedidos');
    add(base44.entities?.ContaReceber, 'contasReceber');
    add(base44.entities?.ContaPagar, 'contasPagar');
    add(base44.entities?.Entrega, 'entregas');
    add(base44.entities?.Produto, 'produtos');
    add(base44.entities?.Cliente, 'clientes');
    add(base44.entities?.OrdemProducao, 'ordensProducao');
    add(base44.entities?.NotaFiscal, 'notasFiscais');
    return () => { subs.forEach(u => { try { u && u(); } catch (_) {} }); };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo]);

  // Pré-computos para seções avançadas (evita recalcular em cada render de subcomponente)
  // Pré-cálculos fornecidos pelo hook useDashboardDerivedData

  // DRILL-DOWN - Função para navegar ao clicar em KPI
  const handleDrillDown = (rota) => {
    navigate(rota);
  };

  const statsCards = [
    {
      title: "Vendas do Período",
      value: `R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${pedidosPeriodo.length} pedidos`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Ticket Médio",
      value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "por pedido",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Fluxo de Caixa",
      value: `R$ ${fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${fluxoCaixa >= 0 ? 'Positivo' : 'Negativo'}`,
      icon: DollarSign,
      color: fluxoCaixa >= 0 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600",
      bgColor: fluxoCaixa >= 0 ? "bg-emerald-50" : "bg-orange-50",
      textColor: fluxoCaixa >= 0 ? "text-emerald-600" : "text-orange-600",
      link: createPageUrl("Financeiro"),
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    },
    {
      title: "Taxa de Conversão",
      value: `${taxaConversao}%`,
      subtitle: "vendas/clientes",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    }
  ];

  // NOVOS KPIs OPERACIONAIS (Cards)
  const opsConcluidasCount = (ordensProducao || []).filter(op => ["Concluída","Concluido","Concluida","Concluído","Finalizada","Finalizado","Encerrada","Encerrado","Pronto"].includes(op?.status)).length;
  const kpisOperacionais = [
    {
      title: "OTD (On-Time)",
      value: `${otd}%`,
      subtitle: `${entregasNoPrazo.length}/${entregasConcluidas.length} entregas`,
      icon: CheckCircle,
      color: otd >= 90 ? "text-green-600" : otd >= 70 ? "text-orange-600" : "text-red-600",
      bgColor: otd >= 90 ? "bg-green-50" : otd >= 70 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Expedicao"))
    },
    {
      title: "Peso Produzido",
      value: `${pesoProduzido.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`,
      subtitle: `${opsConcluidasCount} OPs concluídas`,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      drillDown: () => handleDrillDown(createPageUrl("Producao"))
    },
    {
      title: "Aproveitamento",
      value: `${aproveitamentoBarra}%`,
      subtitle: "aproveitamento de barra",
      icon: Percent,
      color: aproveitamentoBarra >= 90 ? "text-green-600" : aproveitamentoBarra >= 80 ? "text-orange-600" : "text-red-600",
      bgColor: aproveitamentoBarra >= 90 ? "bg-green-50" : aproveitamentoBarra >= 80 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Producao"))
    },
    {
      title: "Inadimplência",
      value: `${taxaInadimplencia}%`,
      subtitle: `R$ ${valorVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vencido`,
      icon: AlertCircle,
      color: taxaInadimplencia < 5 ? "text-green-600" : taxaInadimplencia < 10 ? "text-orange-600" : "text-red-600",
      bgColor: taxaInadimplencia < 5 ? "bg-green-50" : taxaInadimplencia < 10 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    }
  ];

  const kpiCards = [
    {
      title: "Clientes Ativos",
      value: clientesAtivos,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Produtos Cadastrados",
      value: totalProdutos,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      drillDown: () => handleDrillDown(createPageUrl("Estoque"))
    },
    {
      title: "Colaboradores",
      value: totalColaboradoresDash,
      icon: UserCircle,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      drillDown: () => handleDrillDown(createPageUrl("RH"))
    },
    {
      title: "Entregas Pendentes",
      value: entregasPendentes,
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      drillDown: () => handleDrillDown(createPageUrl("Expedicao"))
    },
    {
      title: "Estoque Baixo",
      value: produtosBaixoEstoque,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      alert: produtosBaixoEstoque > 0,
      drillDown: () => handleDrillDown(createPageUrl("Estoque"))
    },
    {
      title: "Total Pedidos",
      value: pedidos.length,
      icon: ShoppingCart,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "NF-e Autorizadas",
      value: nfAutorizadas,
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      drillDown: () => handleDrillDown(createPageUrl("Fiscal"))
    },
    {
      title: "Cobranças Pagas",
      value: cobrancasPagas,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    }
  ];

  const quickAccessBase = [
    {
      title: "Comercial e Vendas",
      description: "Gestão de Clientes e Vendas",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      url: createPageUrl("Comercial"),
      count: pedidosPeriodo.length
    },
    {
      title: "Estoque e Almoxarifado",
      description: "Produtos e Movimentações",
      icon: Box,
      color: "from-indigo-500 to-indigo-600",
      url: createPageUrl("Estoque"),
      count: produtosBaixoEstoque > 0 ? produtosBaixoEstoque : null,
      alert: produtosBaixoEstoque > 0
    },
    {
      title: "Expedição e Logística",
      description: "Entregas e Logística",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      url: createPageUrl("Expedicao"),
      count: entregasPendentes
    },
    {
      title: "Financeiro e Contábil",
      description: "Contas e Fluxo de Caixa",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      url: createPageUrl("Financeiro"),
      count: null
    },
  ];

  const quickAccess = quickAccessBase.filter((m) => (
    (m.title.includes('Comercial') && canSeeComercial) ||
    (m.title.includes('Estoque') && canSeeEstoque) ||
    (m.title.includes('Expedição') && canSeeExpedicao) ||
    (m.title.includes('Financeiro') && canSeeFinanceiro)
  ));

  return (
    <ProtectedSection module="Dashboard" action="ver">
    <div className="w-full h-full min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-hidden p-6 space-y-6">
      <DashboardHeader
        empresaAtual={empresaAtual}
        estaNoGrupo={estaNoGrupo}
        grupoAtual={grupoAtual}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        periodo={periodo}
        setPeriodo={setPeriodo}
      />

      <DashboardStabilityNotice hasContextoAtivo={hasContextoAtivo} activeTab={activeTab} />

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Unificado em Resumo Geral */}
        <div className="hidden" />





        <TabsContent value="resumo" className="w-full h-full overflow-y-auto space-y-6 mt-6">
          {/* Sticky KPIs principais */}
          <DashboardStickyKpis
            pedidos={pedidos}
            pedidosPendentes={pedidosPendentes}
            pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
            produtosBaixoEstoque={produtosBaixoEstoque}
          />
          <PanelGroup direction="vertical" className="gap-2 flex-1 w-full h-full">
            <Panel defaultSize={50} minSize={30} className="overflow-auto">
              {/* KPIs Principais + Widget Canais */}
              <StatsSection statsCards={statsCards} empresaId={empresaAtual?.id} />
            </Panel>
            <PanelResizeHandle className="h-1 bg-slate-200 rounded" />
            <Panel defaultSize={50} minSize={20} className="overflow-auto">
              {/* NOVOS KPIs OPERACIONAIS */}
              <KPIsOperacionaisSection kpis={kpisOperacionais} />
            </Panel>
          </PanelGroup>

          {/* KPIs Secundários */}
          <SecondaryKPIsSection kpis={kpiCards} />

          {/* Tempo Real - Mapa em card dentro do Dashboard unificado */}
          <div className="mt-4">
            <ProtectedSection module="Expedição" action="ver" hideInstead>
              <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
                <CardContent>
                  <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
                    <MapaTempoReal />
                  </Suspense>
                </CardContent>
              </Card>
            </ProtectedSection>
          </div>

          {canSeeComercial && (
            <PedidosResumoPanel
              pedidosRecentes={pedidosRecentes}
              pedidosPendentes={pedidosPendentes}
              pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
              onVerTodos={() => handleDrillDown(createPageUrl('Comercial'))}
            />
          )}


          {/* Anomalias Financeiras (IA) – hiperpersonalização por role */}
          {canSeeFinanceiro && (
            <Card className="bg-white/80 backdrop-blur-sm mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Anomalias Financeiras Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnomIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const list = anomaliasIA?.details || [];
                    if (!list.length) return <p className="text-sm text-slate-600">Nenhuma anomalia relevante.</p>;
                    const resumo = list.reduce((acc, i) => { acc[i.severity || 'baixo'] = (acc[i.severity || 'baixo'] || 0) + 1; return acc; }, {});
                    return (
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge className="bg-red-100 text-red-700">Alta: {resumo.alto || 0}</Badge>
                        <Badge className="bg-amber-100 text-amber-700">Média: {resumo.medio || 0}</Badge>
                        <Badge variant="outline">Baixa: {resumo.baixo || 0}</Badge>
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          {/* Estoque Crítico */}
          <WidgetEstoqueCritico 
            preds14Count={(previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo').length}
            preds30Count={(previsoesIA30?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo').length}
            count={produtosBaixoEstoque}
            onNavigate={() => handleDrillDown(createPageUrl("Estoque"))}
          />

          {/* Gráficos + Top Produtos (redimensionável) */}
          <PanelGroup direction="vertical" className="gap-2 min-h-[420px]">
            <Panel defaultSize={55} minSize={30} className="overflow-auto">
              <ChartsSection vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} />
            </Panel>
            <PanelResizeHandle className="w-1 bg-slate-200 rounded" />
            <Panel defaultSize={45} minSize={20} className="overflow-auto">
              <TopProdutosStatusPeriodoSection topProdutos={topProdutos} dadosVendasStatus={dadosVendasStatus} COLORS={COLORS} />
            </Panel>
          </PanelGroup>

          {/* GRÁFICOS AVANÇADOS */}
          <AdvancedAnalysisSection
            vendasPorMes={vendasPorMesData}
            top5Clientes={top5ClientesData}
            statusPedidos={statusPedidosDataAll}
            fluxoCaixaMensal={fluxoCaixaMensalData}
            COLORS={COLORS}
          />

          {/* Command Center (Executivo) - sem criar módulo novo, visível a quem tem Sistema */}
          <ProtectedSection module="Sistema" action="ver" hideInstead>
            <Card className="bg-white/80 backdrop-blur-sm mt-4">
              <CardHeader>
                <CardTitle>Command Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="p-4 rounded-md border border-slate-200 bg-white/70 backdrop-blur shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Erros (24h)</div>
                      <div className="text-2xl font-bold">{ccMetrics?.errors ?? 0}</div>
                    </div>
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white/70 backdrop-blur shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Jobs/Automations</div>
                      <div className="text-2xl font-bold">{ccMetrics?.funcs ?? 0}</div>
                    </div>
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white/70 backdrop-blur shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Integrações</div>
                      <div className="text-2xl font-bold">OK</div>
                    </div>
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white/70 backdrop-blur shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Segurança</div>
                      <div className="text-2xl font-bold">{ccMetrics?.secAlerts ?? 0}</div>
                    </div>
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="p-4 rounded-md border border-slate-200 bg-white/70 backdrop-blur shadow-md flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Chatbot (24h)</div>
                      <div className="text-xs text-slate-500">SLA 1ª resp.</div>
                      <div className="text-2xl font-bold">{botMetrics?.chats ?? 0} / {botMetrics?.sla_total ?? 0} • {botMetrics?.sla_total ? Math.round(100*(botMetrics.sla_ok/(botMetrics.sla_total||1))) : 0}%</div>
                    </div>
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ProtectedSection>

          <ProtectedSection module="Sistema" action="ver" hideInstead>
            <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}> 
              <DashboardPerformance />
            </Suspense>
          </ProtectedSection>

          {/* Previsões de Estoque (IA) - visível apenas para quem vê Estoque */}
          {canSeeEstoque && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Previsões de Estoque (14 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPrevIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const preds = (previsoesIA?.previsoes || [])
                      .filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo')
                      .sort((a, b) => (a.dias_cobertura ?? 999) - (b.dias_cobertura ?? 999))
                      .slice(0, 8);
                    if (!preds.length) return <p className="text-sm text-slate-600">Sem riscos relevantes no horizonte.</p>;
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {preds.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-[340px]">{p.descricao}</div>
                              <div className="text-xs text-slate-500">Cobertura: {p.dias_cobertura ?? '-'} dias • Demanda/dia: {p.demanda_dia_estimada ?? '-'} {p.preco_previsto != null && (<span className="ml-2">• Preço previsto: R$ {p.preco_previsto}</span>)}</div>
                            </div>
                            <Badge className={p.risco_ruptura === 'alto' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {String(p.risco_ruptura || '').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          {/* Módulos de Acesso Rápido */}
          {/* Previsões de Estoque (IA) - visível apenas para quem vê Estoque */}
          <ProtectedSection module="Estoque" action="ver" hideInstead>
          {canSeeEstoque && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Previsões de Estoque (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPrevIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const preds = (previsoesIA30?.previsoes || [])
                      .filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo')
                      .sort((a, b) => (a.dias_cobertura ?? 999) - (b.dias_cobertura ?? 999))
                      .slice(0, 8);
                    if (!preds.length) return <p className="text-sm text-slate-600">Sem riscos relevantes no horizonte.</p>;
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {preds.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-[340px]">{p.descricao}</div>
                              <div className="text-xs text-slate-500">Cobertura: {p.dias_cobertura ?? '-'} dias • Demanda/dia: {p.demanda_dia_estimada ?? '-'} {p.preco_previsto != null && (<span className="ml-2">• Preço previsto: R$ {p.preco_previsto}</span>)}</div>
                            </div>
                            <Badge className={p.risco_ruptura === 'alto' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {String(p.risco_ruptura || '').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          </ProtectedSection>

          {/* Módulos de Acesso Rápido */}
          <QuickAccessModulesGrid modules={quickAccess} onClick={handleDrillDown} />

          {/* Resumo Financeiro */}
          <FinancialSummary receitasPendentes={receitasPendentes} despesasPendentes={despesasPendentes} fluxoCaixa={fluxoCaixa} />

          {/* NOVO: Gamificação */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Rankings de Performance
            </h2>
            <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
              <GamificacaoOperacoes />
            </Suspense>
          </div>

          {/* Placeholder or replacement if PainelOperacoes3D was still intended for "resumo" tab */}
          {/* If PainelOperacoes3D should be nested within the "Resumo Geral" tab and not a separate view,
              it would go here, possibly conditionally or within a different section.
              Based on the outline, it's removed from the main switch. */}
          {/* Example: <PainelOperacoes3D empresaId={null} grupoId={null} /> */}
        </TabsContent>
      </Tabs>
      </ErrorBoundary>
      </div>
    </div>
  </ProtectedSection>
  );
}