import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useContextoVisual } from '@/components/lib/useContextoVisual';
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
  PieChart as RechartsPie,
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

import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import usePermissions from "@/components/lib/usePermissions";
import useDashboardDerivedData from "@/components/dashboard/hooks/useDashboardDerivedData";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_REFETCH_INTERVAL_MS, dashboardQueryDefaults } from "@/components/dashboard/config/dashboardQueryConfig";

// Lazy-loaded components (must be after all static imports)
const PainelOperacoes3D = React.lazy(() => import("../components/dashboard/PainelOperacoes3D"));
const GamificacaoOperacoes = React.lazy(() => import("../components/dashboard/GamificacaoOperacoes"));
const DashboardTempoReal = React.lazy(() => import('../components/dashboard/DashboardTempoReal'));
const DashboardOperacionalBI = React.lazy(() => import("@/components/dashboard/DashboardOperacionalBI"));
const MapaTempoReal = React.lazy(() => import("@/components/expedicao/MapaTempoReal"));
const DashboardPerformance = React.lazy(() => import("@/components/sistema/DashboardPerformance"));
const DashboardTabsNav = React.lazy(() => import("@/components/dashboard/DashboardTabsNav"));
const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem"));
const DashboardHeader = React.lazy(() => import("@/components/dashboard/DashboardHeader"));
const DashboardContextoBanner = React.lazy(() => import("@/components/dashboard/DashboardContextoBanner"));
const DashboardMultiempresaBar = React.lazy(() => import("@/components/dashboard/DashboardMultiempresaBar"));
const DashboardEssentialKPIs = React.lazy(() => import("@/components/dashboard/DashboardEssentialKPIs"));
const DashboardEstoquePrevisoesWidget = React.lazy(() => import("@/components/dashboard/DashboardEstoquePrevisoesWidget"));
const StatsSection = React.lazy(() => import("@/components/dashboard/StatsSection"));
const KPIsOperacionaisSection = React.lazy(() => import("@/components/dashboard/KPIsOperacionaisSection"));
const SecondaryKPIsSection = React.lazy(() => import("@/components/dashboard/SecondaryKPIsSection"));
const ChartsSection = React.lazy(() => import("@/components/dashboard/ChartsSection"));
const TopProdutosStatusPeriodoSection = React.lazy(() => import("@/components/dashboard/TopProdutosStatusPeriodoSection"));
const AdvancedAnalysisSection = React.lazy(() => import("@/components/dashboard/AdvancedAnalysisSection"));
const QuickAccessModulesGrid = React.lazy(() => import("@/components/dashboard/QuickAccessModulesGrid"));
const FinancialSummary = React.lazy(() => import("@/components/dashboard/FinancialSummary"));
const WidgetEstoqueCritico = React.lazy(() => import("@/components/estoque/WidgetEstoqueCritico"));
const DashboardStabilityNotice = React.lazy(() => import("@/components/dashboard/DashboardStabilityNotice"));
const DashboardStickyKpis = React.lazy(() => import("@/components/dashboard/DashboardStickyKpis"));
const DashboardForecastWidget = React.lazy(() => import("@/components/dashboard/DashboardForecastWidget"));
const DashboardIAInsightsPanel = React.lazy(() => import("@/components/dashboard/DashboardIAInsightsPanel"));
const DashboardSaudeWidget = React.lazy(() => import("@/components/dashboard/DashboardSaudeWidget"));
const DashboardVendasPrevisaoWidget = React.lazy(() => import("@/components/dashboard/DashboardVendasPrevisaoWidget"));
const DashboardKPIsComparativosWidget = React.lazy(() => import("@/components/dashboard/DashboardKPIsComparativosWidget"));
const DashboardMarketplaceWidget = React.lazy(() => import("@/components/dashboard/DashboardMarketplaceWidget"));
const ConciliacaoIAWidget = React.lazy(() => import("@/components/financeiro/ConciliacaoIAWidget"));
const CRMScoreDashboard = React.lazy(() => import("@/components/crm/CRMScoreDashboard"));
const DashboardBI3DWidget = React.lazy(() => import("@/components/dashboard/DashboardBI3DWidget"));
const DashboardAutomacaoFluxosWidget = React.lazy(() => import("@/components/dashboard/DashboardAutomacaoFluxosWidget"));
const RastreamentoGPSWidget = React.lazy(() => import("@/components/logistica/RastreamentoGPSWidget"));
const ApontamentoProdutoMobileWidget = React.lazy(() => import("@/components/producao/ApontamentoProdutoMobileWidget"));
const ComplianceISO27001Widget = React.lazy(() => import("@/components/administracao-sistema/ComplianceISO27001Widget"));
const ContratosEletronicosWidget = React.lazy(() => import("@/components/contratos/ContratosEletronicosWidget"));
const PedidosResumoPanel = React.lazy(() => import("@/components/dashboard/PedidosResumoPanel"));
const ResizableRow = React.lazy(() => import("@/components/dashboard/ResizableRow"));
const DashboardResumoTab = React.lazy(() => import("@/components/dashboard/DashboardResumoTab"));


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
  const refetchInterval = (empresaAtual?.id || estaNoGrupo) ? (autoRefresh ? DASHBOARD_REFETCH_INTERVAL_MS : false) : false; // evita zero-dados sem contexto

  const { data: pedidos = [] } = useQuery({
       enabled: Boolean(canSeeComercial && hasContextoAtivo),
       queryKey: ['pedidos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
       queryFn: async () => {
         if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
         // Se em modo grupo sem empresa, agregar dados do grupo inteiro
         if (estaNoGrupo && grupoAtual?.id && !empresaAtual?.id) {
           return await base44.entities.Pedido.filter({ group_id: grupoAtual.id }, '-created_date', DASHBOARD_LIST_LIMIT);
         }
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
         if (estaNoGrupo && grupoAtual?.id && !empresaAtual?.id) {
           return await base44.entities.ContaReceber.filter({ group_id: grupoAtual.id }, '-data_vencimento', DASHBOARD_LIST_LIMIT);
         }
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
         if (estaNoGrupo && grupoAtual?.id && !empresaAtual?.id) {
           return await base44.entities.Produto.filter({ group_id: grupoAtual.id }, '-created_date', DASHBOARD_LIST_LIMIT);
         }
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
        // Filtro simples: o backend expande corretamente sem duplicação
        const filtro = grupoAtual?.id && !empresaAtual?.id
          ? { group_id: grupoAtual.id }
          : empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Produto',
          filter: filtro
        });
        return response.data?.count || produtos.length;
      } catch {
        return produtos.length;
      }
    },
    staleTime: 60000,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: clientes = [] } = useQuery({
       enabled: Boolean(canSeeCRM && hasContextoAtivo),
       queryKey: ['clientes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
       queryFn: async () => {
         if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return [];
         if (estaNoGrupo && grupoAtual?.id && !empresaAtual?.id) {
           return await base44.entities.Cliente.filter({ group_id: grupoAtual.id }, '-created_date', DASHBOARD_LIST_LIMIT);
         }
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
        // Filtro simples: o backend expande corretamente sem duplicação
        const filtro = grupoAtual?.id && !empresaAtual?.id
          ? { group_id: grupoAtual.id }
          : empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: filtro
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 60000,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: totalColaboradoresDash = 0 } = useQuery({
    enabled: Boolean(hasContextoAtivo && canSeeRH),
    queryKey: ['colaboradores-count-dash', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        // Filtro simples: o backend mapeia empresa_id → empresa_alocada_id para Colaborador
        const filtro = grupoAtual?.id && !empresaAtual?.id
          ? { group_id: grupoAtual.id }
          : empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Colaborador',
          filter: filtro
        });
        return response.data?.count || colaboradores.length;
      } catch {
        return colaboradores.length;
      }
    },
    staleTime: 60000,
    retry: 1,
    retryDelay: 1000,
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
    staleTime: 600000,
    enabled: Boolean(canSeeEstoque && hasContextoAtivo && autoRefresh)
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
    staleTime: 600000,
    enabled: Boolean(canSeeEstoque && hasContextoAtivo && autoRefresh)
  });

  const { data: anomaliasIA = {}, isLoading: loadingAnomIA } = useQuery({
    queryKey: ['iaAnomaliasFinanceiro', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return { details: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', { filtros });
      return res?.data || { details: [] };
    },
    staleTime: 600000,
    enabled: Boolean(canSeeFinanceiro && hasContextoAtivo && autoRefresh)
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
      <Suspense fallback={<div className="h-12 w-full bg-slate-100 rounded animate-pulse" />}>
      <div key={`dashboard-header-${hasContextoAtivo}`} suppressHydrationWarning>
        <DashboardHeader
          empresaAtual={empresaAtual}
          estaNoGrupo={estaNoGrupo}
          grupoAtual={grupoAtual}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          periodo={periodo}
          setPeriodo={setPeriodo}
        />
        <DashboardContextoBanner />
        <DashboardMultiempresaBar />
        <DashboardEssentialKPIs
          totalVendas={totalVendas}
          taxaInadimplencia={taxaInadimplencia}
          valorVencido={valorVencido}
          entregasPendentes={entregasPendentes}
          produtosBaixoEstoque={produtosBaixoEstoque}
          otd={otd}
        />
      </div>
      <DashboardStabilityNotice hasContextoAtivo={hasContextoAtivo} />
      </Suspense>

      <ErrorBoundary key={`dashboard-main-${hasContextoAtivo}`}>
      <Suspense fallback={<div className="h-96 w-full bg-slate-100 rounded animate-pulse" />}>
        <DashboardResumoTab
          statsCards={statsCards}
          kpisOperacionais={kpisOperacionais}
          kpiCards={kpiCards}
          quickAccess={quickAccess}
          pedidosRecentes={pedidosRecentes}
          pedidosPendentes={pedidosPendentes}
          pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
          produtosBaixoEstoque={produtosBaixoEstoque}
          receitasPendentes={receitasPendentes}
          despesasPendentes={despesasPendentes}
          fluxoCaixa={fluxoCaixa}
          vendasUltimos30Dias={vendasUltimos30Dias}
          fluxo7Dias={fluxo7Dias}
          topProdutos={topProdutos}
          dadosVendasStatus={dadosVendasStatus}
          vendasPorMesData={vendasPorMesData}
          top5ClientesData={top5ClientesData}
          statusPedidosDataAll={statusPedidosDataAll}
          fluxoCaixaMensalData={fluxoCaixaMensalData}
          COLORS={COLORS}
          anomaliasIA={anomaliasIA}
          loadingAnomIA={loadingAnomIA}
          previsoesIA={previsoesIA}
          previsoesIA30={previsoesIA30}
          loadingPrevIA={loadingPrevIA}
          ccMetrics={ccMetrics}
          botMetrics={botMetrics}
          canSeeFinanceiro={canSeeFinanceiro}
          canSeeCRM={canSeeCRM}
          canSeeEstoque={canSeeEstoque}
          onDrillDown={handleDrillDown}
          empresaId={empresaAtual?.id}
        />
      </Suspense>
      </ErrorBoundary>
      </div>
    </div>
  </ProtectedSection>
  );
}