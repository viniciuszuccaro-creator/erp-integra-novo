/**
 * DashboardResumoTab — conteúdo principal do Dashboard.
 * Cada widget pesado é lazy + tem seu próprio ErrorBoundary+Suspense com key estável.
 * Isso evita os erros de Portal DOM (removeChild/insertBefore) do React.
 */
import React, { Suspense } from "react";
import { createPageUrl } from "@/utils";
import { Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

// ─── Lazy imports ────────────────────────────────────────────────────────────
const ChartsSection                   = React.lazy(() => import("@/components/dashboard/ChartsSection"));
const TopProdutosStatusPeriodoSection = React.lazy(() => import("@/components/dashboard/TopProdutosStatusPeriodoSection"));
const AdvancedAnalysisSection         = React.lazy(() => import("@/components/dashboard/AdvancedAnalysisSection"));
const WidgetEstoqueCritico            = React.lazy(() => import("@/components/estoque/WidgetEstoqueCritico"));
const DashboardCommandCenter          = React.lazy(() => import("@/components/dashboard/DashboardCommandCenter"));
const DashboardPerformance            = React.lazy(() => import("@/components/sistema/DashboardPerformance"));
const GamificacaoOperacoes            = React.lazy(() => import("@/components/dashboard/GamificacaoOperacoes"));
const MapaTempoReal                   = React.lazy(() => import("@/components/expedicao/MapaTempoReal"));
const DashboardEstoquePrevisoesWidget = React.lazy(() => import("@/components/dashboard/DashboardEstoquePrevisoesWidget"));
const DashboardKPIsComparativosWidget = React.lazy(() => import("@/components/dashboard/DashboardKPIsComparativosWidget"));
const DashboardMarketplaceWidget      = React.lazy(() => import("@/components/dashboard/DashboardMarketplaceWidget"));
const CRMScoreDashboard               = React.lazy(() => import("@/components/crm/CRMScoreDashboard"));
const ConciliacaoIAWidget             = React.lazy(() => import("@/components/financeiro/ConciliacaoIAWidget"));
const DashboardBI3DWidget             = React.lazy(() => import("@/components/dashboard/DashboardBI3DWidget"));
const DashboardAutomacaoFluxosWidget  = React.lazy(() => import("@/components/dashboard/DashboardAutomacaoFluxosWidget"));
const RastreamentoGPSWidget           = React.lazy(() => import("@/components/logistica/RastreamentoGPSWidget"));
const ApontamentoProdutoMobileWidget  = React.lazy(() => import("@/components/producao/ApontamentoProdutoMobileWidget"));
const ComplianceISO27001Widget        = React.lazy(() => import("@/components/administracao-sistema/ComplianceISO27001Widget"));
const ContratosEletronicosWidget      = React.lazy(() => import("@/components/contratos/ContratosEletronicosWidget"));
const DashboardSaudeWidget            = React.lazy(() => import("@/components/dashboard/DashboardSaudeWidget"));
const DashboardForecastWidget         = React.lazy(() => import("@/components/dashboard/DashboardForecastWidget"));
const DashboardVendasPrevisaoWidget   = React.lazy(() => import("@/components/dashboard/DashboardVendasPrevisaoWidget"));
const DashboardIAInsightsPanel        = React.lazy(() => import("@/components/dashboard/DashboardIAInsightsPanel"));
const DashboardStickyKpis             = React.lazy(() => import("@/components/dashboard/DashboardStickyKpis"));
const StatsSection                    = React.lazy(() => import("@/components/dashboard/StatsSection"));
const KPIsOperacionaisSection         = React.lazy(() => import("@/components/dashboard/KPIsOperacionaisSection"));
const SecondaryKPIsSection            = React.lazy(() => import("@/components/dashboard/SecondaryKPIsSection"));
const QuickAccessModulesGrid          = React.lazy(() => import("@/components/dashboard/QuickAccessModulesGrid"));
const FinancialSummary                = React.lazy(() => import("@/components/dashboard/FinancialSummary"));
const PedidosResumoPanel              = React.lazy(() => import("@/components/dashboard/PedidosResumoPanel"));

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skel = ({ h = 32 }) => (
  <div style={{ height: `${h * 4}px` }} className="rounded bg-slate-100 animate-pulse w-full" />
);

// ─── Stable widget slot ───────────────────────────────────────────────────────
// Wrapping ErrorBoundary+Suspense inside a single <div> ensures React always
// sees exactly ONE DOM child regardless of loading/resolved state, eliminating
// removeChild / insertBefore fiber mismatches.
function Slot({ Component, fallbackH = 32, componentProps = {} }) {
  return (
    <div className="w-full">
      <ErrorBoundary>
        <Suspense fallback={<Skel h={fallbackH} />}>
          <Component {...componentProps} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardResumoTab({
  statsCards,
  kpisOperacionais,
  kpiCards,
  quickAccess,
  pedidosRecentes,
  pedidosPendentes,
  pedidosAguardandoAprovacao,
  produtosBaixoEstoque,
  receitasPendentes,
  despesasPendentes,
  fluxoCaixa,
  vendasUltimos30Dias,
  fluxo7Dias,
  topProdutos,
  dadosVendasStatus,
  vendasPorMesData,
  top5ClientesData,
  statusPedidosDataAll,
  fluxoCaixaMensalData,
  COLORS,
  anomaliasIA,
  loadingAnomIA,
  previsoesIA,
  previsoesIA30,
  loadingPrevIA,
  ccMetrics,
  botMetrics,
  canSeeFinanceiro,
  canSeeCRM,
  canSeeEstoque,
  canSeeExpedicao,
  canSeeAdmin,
  onDrillDown,
  empresaId,
}) {
  const preds14 = (previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length;
  const preds30 = (previsoesIA30?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length;

  const anomList  = anomaliasIA?.details || [];
  const anomResumo = anomList.reduce((acc, i) => {
    acc[i.severity || "baixo"] = (acc[i.severity || "baixo"] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full space-y-6 mt-4">

      {/* Sticky KPIs */}
      <Slot Component={DashboardStickyKpis} fallbackH={12} componentProps={{
        pedidos: [],
        pedidosPendentes,
        pedidosAguardandoAprovacao,
        produtosBaixoEstoque,
      }} />

      {/* Stats principais */}
      <Slot Component={StatsSection} fallbackH={24} componentProps={{ statsCards, empresaId }} />

      {/* KPIs operacionais */}
      <Slot Component={KPIsOperacionaisSection} fallbackH={20} componentProps={{ kpis: kpisOperacionais }} />

      {/* KPIs secundários */}
      <Slot Component={SecondaryKPIsSection} fallbackH={16} componentProps={{ kpis: kpiCards }} />

      {/* Mapa tempo real — container always mounted to keep stable DOM anchor */}
      <div style={{ display: canSeeExpedicao === false ? 'none' : undefined }}>
        <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
          <CardContent className="p-0 overflow-hidden rounded-md">
            <div><Slot Component={MapaTempoReal} fallbackH={40} /></div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos resumo */}
      <Slot Component={PedidosResumoPanel} fallbackH={24} componentProps={{
        pedidosRecentes,
        pedidosPendentes,
        pedidosAguardandoAprovacao,
        onVerTodos: () => onDrillDown(createPageUrl("Comercial")),
      }} />

      {/* Anomalias Financeiras — container always mounted */}
      <div key="anomalias-card" style={{ display: canSeeFinanceiro ? undefined : 'none' }}>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Anomalias Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: loadingAnomIA ? undefined : 'none' }} className="h-8 rounded bg-slate-100 animate-pulse" />
            <p style={{ display: (!loadingAnomIA && !anomList.length) ? undefined : 'none' }} className="text-sm text-slate-500">Nenhuma anomalia detectada.</p>
            <div style={{ display: (!loadingAnomIA && anomList.length > 0) ? undefined : 'none' }} className="flex flex-wrap gap-2 text-sm">
              <Badge className="bg-red-100 text-red-700">Alta: {anomResumo.alto || 0}</Badge>
              <Badge className="bg-amber-100 text-amber-700">Média: {anomResumo.medio || 0}</Badge>
              <Badge variant="outline">Baixa: {anomResumo.baixo || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estoque Crítico */}
      <Slot Component={WidgetEstoqueCritico} fallbackH={20} componentProps={{
        preds14Count: preds14,
        preds30Count: preds30,
        count: produtosBaixoEstoque,
        onNavigate: () => onDrillDown(createPageUrl("Estoque")),
      }} />

      {/* Gráficos 30d + 7d */}
      <Slot Component={ChartsSection} fallbackH={48} componentProps={{
        vendasUltimos30Dias,
        fluxo7Dias,
      }} />

      {/* Top Produtos + Status */}
      <Slot Component={TopProdutosStatusPeriodoSection} fallbackH={48} componentProps={{
        topProdutos,
        dadosVendasStatus,
        COLORS,
      }} />

      {/* Widgets BI row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Slot Component={DashboardKPIsComparativosWidget} fallbackH={40} />
        <Slot Component={DashboardMarketplaceWidget} fallbackH={40} />
        {canSeeCRM && <Slot Component={CRMScoreDashboard} fallbackH={40} />}
        {canSeeFinanceiro && <Slot Component={ConciliacaoIAWidget} fallbackH={40} />}
      </div>

      {/* Widgets BI row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot Component={DashboardBI3DWidget} fallbackH={40} />
        <Slot Component={DashboardAutomacaoFluxosWidget} fallbackH={40} />
      </div>

      {/* Widgets BI row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot Component={RastreamentoGPSWidget} fallbackH={40} />
        <Slot Component={ApontamentoProdutoMobileWidget} fallbackH={40} />
      </div>

      {/* Widgets BI row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot Component={ComplianceISO27001Widget} fallbackH={40} />
        <Slot Component={ContratosEletronicosWidget} fallbackH={40} />
      </div>

      {/* IA Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Slot Component={DashboardSaudeWidget} fallbackH={40} />
        <Slot Component={DashboardForecastWidget} fallbackH={40} />
        <Slot Component={DashboardVendasPrevisaoWidget} fallbackH={40} />
        <Slot Component={DashboardIAInsightsPanel} fallbackH={40} />
      </div>

      {/* Análise Avançada */}
      <Slot Component={AdvancedAnalysisSection} fallbackH={64} componentProps={{
        vendasPorMes: vendasPorMesData,
        top5Clientes: top5ClientesData,
        statusPedidos: statusPedidosDataAll,
        fluxoCaixaMensal: fluxoCaixaMensalData,
        COLORS,
      }} />

      {/* Command Center */}
      <Slot Component={DashboardCommandCenter} fallbackH={32} componentProps={{ ccMetrics, botMetrics }} />

      {/* Performance */}
      <Slot Component={DashboardPerformance} fallbackH={32} />

      {/* Previsões Estoque — conditionally rendered, not CSS-hidden */}
      {canSeeEstoque && (
        <Slot Component={DashboardEstoquePrevisoesWidget} fallbackH={32} componentProps={{
          previsoesIA,
          loadingPrevIA,
        }} />
      )}

      {/* Quick Access */}
      <Slot Component={QuickAccessModulesGrid} fallbackH={24} componentProps={{
        modules: quickAccess,
        onClick: onDrillDown,
      }} />

      {/* Financial Summary */}
      <Slot Component={FinancialSummary} fallbackH={20} componentProps={{
        receitasPendentes,
        despesasPendentes,
        fluxoCaixa,
      }} />

      {/* Rankings */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Rankings de Performance
        </h2>
        <Slot Component={GamificacaoOperacoes} fallbackH={32} />
      </div>

    </div>
  );
}