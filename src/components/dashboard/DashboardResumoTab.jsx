/**
 * DashboardResumoTab — conteúdo principal do Dashboard.
 * Cada widget pesado é lazy + tem seu próprio ErrorBoundary+Suspense com key estável.
 * Isso evita os erros de Portal DOM (removeChild/insertBefore) do React.
 */
import React, { Suspense, memo, useCallback } from "react";
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

// ─── Stable widget slot — NEVER pass dynamic children, use render prop via Component ─
// Each slot is a distinct named component so React sees stable fiber identity.
function Slot({ Component, fallbackH = 32, componentProps = {} }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Skel h={fallbackH} />}>
        <Component {...componentProps} />
      </Suspense>
    </ErrorBoundary>
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
      <Slot key="sticky-kpis" Component={DashboardStickyKpis} fallbackH={12} componentProps={{
        pedidos: [],
        pedidosPendentes,
        pedidosAguardandoAprovacao,
        produtosBaixoEstoque,
      }} />

      {/* Stats principais */}
      <Slot key="stats" Component={StatsSection} fallbackH={24} componentProps={{ statsCards, empresaId }} />

      {/* KPIs operacionais */}
      <Slot key="kpis-ops" Component={KPIsOperacionaisSection} fallbackH={20} componentProps={{ kpis: kpisOperacionais }} />

      {/* KPIs secundários */}
      <Slot key="kpis-sec" Component={SecondaryKPIsSection} fallbackH={16} componentProps={{ kpis: kpiCards }} />

      {/* Mapa tempo real */}
      {canSeeExpedicao !== false && (
        <Card key="mapa-card" className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
          <CardContent className="p-0 overflow-hidden rounded-md">
            <Slot key="mapa" Component={MapaTempoReal} fallbackH={40} />
          </CardContent>
        </Card>
      )}

      {/* Pedidos resumo */}
      <Slot key="pedidos-resumo" Component={PedidosResumoPanel} fallbackH={24} componentProps={{
        pedidosRecentes,
        pedidosPendentes,
        pedidosAguardandoAprovacao,
        onVerTodos: () => onDrillDown(createPageUrl("Comercial")),
      }} />

      {/* Anomalias Financeiras */}
      {canSeeFinanceiro && (
        <Card key="anomalias-card" className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Anomalias Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnomIA ? (
              <div className="h-8 rounded bg-slate-100 animate-pulse" />
            ) : !anomList.length ? (
              <p className="text-sm text-slate-500">Nenhuma anomalia detectada.</p>
            ) : (
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge className="bg-red-100 text-red-700">Alta: {anomResumo.alto || 0}</Badge>
                <Badge className="bg-amber-100 text-amber-700">Média: {anomResumo.medio || 0}</Badge>
                <Badge variant="outline">Baixa: {anomResumo.baixo || 0}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estoque Crítico */}
      <Slot key="estoque-critico" Component={WidgetEstoqueCritico} fallbackH={20} componentProps={{
        preds14Count: preds14,
        preds30Count: preds30,
        count: produtosBaixoEstoque,
        onNavigate: () => onDrillDown(createPageUrl("Estoque")),
      }} />

      {/* Gráficos 30d + 7d */}
      <Slot key="charts" Component={ChartsSection} fallbackH={48} componentProps={{
        vendasUltimos30Dias,
        fluxo7Dias,
      }} />

      {/* Top Produtos + Status */}
      <Slot key="top-produtos" Component={TopProdutosStatusPeriodoSection} fallbackH={48} componentProps={{
        topProdutos,
        dadosVendasStatus,
        COLORS,
      }} />

      {/* Widgets BI row 1 */}
      <div key="bi-row1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Slot key="kpis-comp" Component={DashboardKPIsComparativosWidget} fallbackH={40} />
        <Slot key="marketplace" Component={DashboardMarketplaceWidget} fallbackH={40} />
        {canSeeCRM && <Slot key="crm-score" Component={CRMScoreDashboard} fallbackH={40} />}
        {canSeeFinanceiro && <Slot key="conciliacao" Component={ConciliacaoIAWidget} fallbackH={40} />}
      </div>

      {/* Widgets BI row 2 */}
      <div key="bi-row2" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot key="bi-3d" Component={DashboardBI3DWidget} fallbackH={40} />
        <Slot key="automacao" Component={DashboardAutomacaoFluxosWidget} fallbackH={40} />
      </div>

      {/* Widgets BI row 3 */}
      <div key="bi-row3" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot key="gps" Component={RastreamentoGPSWidget} fallbackH={40} />
        <Slot key="apontamento" Component={ApontamentoProdutoMobileWidget} fallbackH={40} />
      </div>

      {/* Widgets BI row 4 */}
      <div key="bi-row4" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slot key="compliance" Component={ComplianceISO27001Widget} fallbackH={40} />
        <Slot key="contratos" Component={ContratosEletronicosWidget} fallbackH={40} />
      </div>

      {/* IA Widgets */}
      <div key="ia-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Slot key="saude" Component={DashboardSaudeWidget} fallbackH={40} />
        <Slot key="forecast" Component={DashboardForecastWidget} fallbackH={40} />
        <Slot key="vendas-prev" Component={DashboardVendasPrevisaoWidget} fallbackH={40} />
        <Slot key="ia-insights" Component={DashboardIAInsightsPanel} fallbackH={40} />
      </div>

      {/* Análise Avançada */}
      <Slot key="advanced" Component={AdvancedAnalysisSection} fallbackH={64} componentProps={{
        vendasPorMes: vendasPorMesData,
        top5Clientes: top5ClientesData,
        statusPedidos: statusPedidosDataAll,
        fluxoCaixaMensal: fluxoCaixaMensalData,
        COLORS,
      }} />

      {/* Command Center */}
      <Slot key="command-center" Component={DashboardCommandCenter} fallbackH={32} componentProps={{ ccMetrics, botMetrics }} />

      {/* Performance */}
      <Slot key="performance" Component={DashboardPerformance} fallbackH={32} />

      {/* Previsões Estoque */}
      {canSeeEstoque && (
        <Slot key="prev-estoque" Component={DashboardEstoquePrevisoesWidget} fallbackH={32} componentProps={{
          previsoesIA,
          loadingPrevIA,
        }} />
      )}

      {/* Quick Access */}
      <Slot key="quick-access" Component={QuickAccessModulesGrid} fallbackH={24} componentProps={{
        modules: quickAccess,
        onClick: onDrillDown,
      }} />

      {/* Financial Summary */}
      <Slot key="financial-summary" Component={FinancialSummary} fallbackH={20} componentProps={{
        receitasPendentes,
        despesasPendentes,
        fluxoCaixa,
      }} />

      {/* Rankings */}
      <div key="rankings">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Rankings de Performance
        </h2>
        <Slot key="gamificacao" Component={GamificacaoOperacoes} fallbackH={32} />
      </div>

    </div>
  );
}