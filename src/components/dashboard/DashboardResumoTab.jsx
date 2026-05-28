/**
 * DashboardResumoTab — conteúdo principal do Dashboard.
 * Todos os widgets pesados são lazy + isolados em ErrorBoundary
 * para evitar conflitos de Portal (removeChild/insertBefore).
 */
import React, { Suspense, memo } from "react";
import { createPageUrl } from "@/utils";
import { Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

// Componentes leves — importados diretamente
import DashboardStickyKpis from "@/components/dashboard/DashboardStickyKpis";
import StatsSection from "@/components/dashboard/StatsSection";
import KPIsOperacionaisSection from "@/components/dashboard/KPIsOperacionaisSection";
import SecondaryKPIsSection from "@/components/dashboard/SecondaryKPIsSection";
import QuickAccessModulesGrid from "@/components/dashboard/QuickAccessModulesGrid";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import PedidosResumoPanel from "@/components/dashboard/PedidosResumoPanel";
import ProtectedSection from "@/components/security/ProtectedSection";

// Todos os widgets pesados (com Portals) são lazy para isolamento limpo de montagem
const ChartsSection                = React.lazy(() => import("@/components/dashboard/ChartsSection"));
const TopProdutosStatusPeriodoSection = React.lazy(() => import("@/components/dashboard/TopProdutosStatusPeriodoSection"));
const AdvancedAnalysisSection      = React.lazy(() => import("@/components/dashboard/AdvancedAnalysisSection"));
const WidgetEstoqueCritico         = React.lazy(() => import("@/components/estoque/WidgetEstoqueCritico"));
const DashboardCommandCenter       = React.lazy(() => import("@/components/dashboard/DashboardCommandCenter"));
const DashboardPerformance         = React.lazy(() => import("@/components/sistema/DashboardPerformance"));
const GamificacaoOperacoes         = React.lazy(() => import("@/components/dashboard/GamificacaoOperacoes"));
const MapaTempoReal                = React.lazy(() => import("@/components/expedicao/MapaTempoReal"));
const DashboardEstoquePrevisoesWidget = React.lazy(() => import("@/components/dashboard/DashboardEstoquePrevisoesWidget"));

// Widgets BI — cada um isolado
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

// Skeleton genérico
const Skel = ({ h = 32 }) => <div className={`h-${h} rounded bg-slate-100 animate-pulse w-full`} />;

// Widget wrapper: lazy + ErrorBoundary + Suspense isolado — evita Portal cross-contamination
const W = memo(({ children, h = 32 }) => (
  <ErrorBoundary>
    <Suspense fallback={<Skel h={h} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
));

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
  onDrillDown,
  empresaId,
}) {
  return (
    <div className="w-full h-full overflow-y-auto space-y-6 mt-4">

      {/* Sticky KPIs — leve, sem Portal */}
      <DashboardStickyKpis
        pedidos={[]}
        pedidosPendentes={pedidosPendentes}
        pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
        produtosBaixoEstoque={produtosBaixoEstoque}
      />

      {/* KPIs principais */}
      <div className="flex flex-col gap-4 w-full">
        <div className="overflow-auto">
          <StatsSection statsCards={statsCards} empresaId={empresaId} />
        </div>
        <div className="overflow-auto">
          <KPIsOperacionaisSection kpis={kpisOperacionais} />
        </div>
      </div>

      <SecondaryKPIsSection kpis={kpiCards} />

      {/* Mapa tempo real */}
      <ProtectedSection module="Expedição" action="ver" hideInstead>
        <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
          <CardContent className="p-0 overflow-hidden rounded-md">
            <W h={40}><MapaTempoReal /></W>
          </CardContent>
        </Card>
      </ProtectedSection>

      {/* Pedidos resumo */}
      <PedidosResumoPanel
        pedidosRecentes={pedidosRecentes}
        pedidosPendentes={pedidosPendentes}
        pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
        onVerTodos={() => onDrillDown(createPageUrl("Comercial"))}
      />

      {/* Anomalias Financeiras */}
      {canSeeFinanceiro && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Anomalias Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnomIA ? (
              <div className="h-8 rounded bg-slate-100 animate-pulse" />
            ) : (() => {
              const list = anomaliasIA?.details || [];
              if (!list.length) return <p className="text-sm text-slate-500">Nenhuma anomalia detectada.</p>;
              const resumo = list.reduce((acc, i) => { acc[i.severity || "baixo"] = (acc[i.severity || "baixo"] || 0) + 1; return acc; }, {});
              return (
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge className="bg-red-100 text-red-700">Alta: {resumo.alto || 0}</Badge>
                  <Badge className="bg-amber-100 text-amber-700">Média: {resumo.medio || 0}</Badge>
                  <Badge variant="outline">Baixa: {resumo.baixo || 0}</Badge>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Estoque Crítico */}
      <W h={24}>
        <WidgetEstoqueCritico
          preds14Count={(previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length}
          preds30Count={(previsoesIA30?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length}
          count={produtosBaixoEstoque}
          onNavigate={() => onDrillDown(createPageUrl("Estoque"))}
        />
      </W>

      {/* Gráficos 30 dias + 7 dias */}
      <W h={48}>
        <ChartsSection vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} />
      </W>

      {/* Top Produtos + Status */}
      <W h={48}>
        <TopProdutosStatusPeriodoSection topProdutos={topProdutos} dadosVendasStatus={dadosVendasStatus} COLORS={COLORS} />
      </W>

      {/* Widgets BI — cada um no seu próprio W para Portal isolation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <W h={40}><DashboardKPIsComparativosWidget /></W>
        <W h={40}><DashboardMarketplaceWidget /></W>
        {canSeeCRM && <W h={40}><CRMScoreDashboard /></W>}
        {canSeeFinanceiro && <W h={40}><ConciliacaoIAWidget /></W>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <W h={40}><DashboardBI3DWidget /></W>
        <W h={40}><DashboardAutomacaoFluxosWidget /></W>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <W h={40}><RastreamentoGPSWidget /></W>
        <W h={40}><ApontamentoProdutoMobileWidget /></W>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <W h={40}><ComplianceISO27001Widget /></W>
        <W h={40}><ContratosEletronicosWidget /></W>
      </div>

      {/* IA Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <W h={40}><DashboardSaudeWidget /></W>
        <W h={40}><DashboardForecastWidget /></W>
        <W h={40}><DashboardVendasPrevisaoWidget /></W>
        <W h={40}><DashboardIAInsightsPanel /></W>
      </div>

      {/* Análise Avançada */}
      <W h={64}>
        <AdvancedAnalysisSection
          vendasPorMes={vendasPorMesData}
          top5Clientes={top5ClientesData}
          statusPedidos={statusPedidosDataAll}
          fluxoCaixaMensal={fluxoCaixaMensalData}
          COLORS={COLORS}
        />
      </W>

      {/* Command Center */}
      <ProtectedSection module="Sistema" action="ver" hideInstead>
        <W h={32}><DashboardCommandCenter ccMetrics={ccMetrics} botMetrics={botMetrics} /></W>
      </ProtectedSection>

      <ProtectedSection module="Sistema" action="ver" hideInstead>
        <W h={32}><DashboardPerformance /></W>
      </ProtectedSection>

      {canSeeEstoque && (
        <W h={32}>
          <DashboardEstoquePrevisoesWidget previsoesIA={previsoesIA} loadingPrevIA={loadingPrevIA} />
        </W>
      )}

      <QuickAccessModulesGrid modules={quickAccess} onClick={onDrillDown} />
      <FinancialSummary receitasPendentes={receitasPendentes} despesasPendentes={despesasPendentes} fluxoCaixa={fluxoCaixa} />

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Rankings de Performance
        </h2>
        <W h={32}><GamificacaoOperacoes /></W>
      </div>

    </div>
  );
}