/**
 * DashboardResumoTab — conteúdo principal da aba "Resumo" do Dashboard.
 * Extraído de pages/Dashboard para reduzir tamanho do arquivo.
 */
import React, { Suspense } from "react";
import { createPageUrl } from "@/utils";
import { Trophy, AlertCircle } from "lucide-react";
import DashboardCommandCenter from "@/components/dashboard/DashboardCommandCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


import ProtectedSection from "@/components/security/ProtectedSection";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import DashboardStickyKpis from "@/components/dashboard/DashboardStickyKpis";
import StatsSection from "@/components/dashboard/StatsSection";
import KPIsOperacionaisSection from "@/components/dashboard/KPIsOperacionaisSection";
import SecondaryKPIsSection from "@/components/dashboard/SecondaryKPIsSection";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopProdutosStatusPeriodoSection from "@/components/dashboard/TopProdutosStatusPeriodoSection";
import AdvancedAnalysisSection from "@/components/dashboard/AdvancedAnalysisSection";
import QuickAccessModulesGrid from "@/components/dashboard/QuickAccessModulesGrid";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import WidgetEstoqueCritico from "@/components/estoque/WidgetEstoqueCritico";
import PedidosResumoPanel from "@/components/dashboard/PedidosResumoPanel";
import DashboardKPIsComparativosWidget from "@/components/dashboard/DashboardKPIsComparativosWidget";
import DashboardMarketplaceWidget from "@/components/dashboard/DashboardMarketplaceWidget";
import ConciliacaoIAWidget from "@/components/financeiro/ConciliacaoIAWidget";
import CRMScoreDashboard from "@/components/crm/CRMScoreDashboard";
import DashboardBI3DWidget from "@/components/dashboard/DashboardBI3DWidget";
import DashboardAutomacaoFluxosWidget from "@/components/dashboard/DashboardAutomacaoFluxosWidget";
import RastreamentoGPSWidget from "@/components/logistica/RastreamentoGPSWidget";
import ApontamentoProdutoMobileWidget from "@/components/producao/ApontamentoProdutoMobileWidget";
import ComplianceISO27001Widget from "@/components/administracao-sistema/ComplianceISO27001Widget";
import ContratosEletronicosWidget from "@/components/contratos/ContratosEletronicosWidget";
import DashboardSaudeWidget from "@/components/dashboard/DashboardSaudeWidget";
import DashboardForecastWidget from "@/components/dashboard/DashboardForecastWidget";
import DashboardVendasPrevisaoWidget from "@/components/dashboard/DashboardVendasPrevisaoWidget";
import DashboardIAInsightsPanel from "@/components/dashboard/DashboardIAInsightsPanel";
import DashboardEstoquePrevisoesWidget from "@/components/dashboard/DashboardEstoquePrevisoesWidget";

const DashboardPerformance = React.lazy(() => import("@/components/sistema/DashboardPerformance"));
const GamificacaoOperacoes = React.lazy(() => import("../dashboard/GamificacaoOperacoes"));
const MapaTempoRealLazy = React.lazy(() => import("@/components/expedicao/MapaTempoReal"));

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
      {/* Sticky KPIs */}
      <DashboardStickyKpis
        pedidos={[]}
        pedidosPendentes={pedidosPendentes}
        pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
        produtosBaixoEstoque={produtosBaixoEstoque}
      />

      {/* KPIs Principais */}
      <div className="flex flex-col gap-4 w-full">
        <div className="overflow-auto">
          <StatsSection statsCards={statsCards} empresaId={empresaId} />
        </div>
        <div className="overflow-auto">
          <KPIsOperacionaisSection kpis={kpisOperacionais} />
        </div>
      </div>

      <SecondaryKPIsSection kpis={kpiCards} />

      {/* Mapa em tempo real */}
      <ProtectedSection module="Expedição" action="ver" hideInstead>
        <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
          <CardContent className="p-0 overflow-hidden rounded-md">
            <Suspense fallback={<div className="h-40 bg-slate-100 animate-pulse" />}>
              <MapaTempoRealLazy />
            </Suspense>
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
      <WidgetEstoqueCritico
        preds14Count={(previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length}
        preds30Count={(previsoesIA30?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length}
        count={produtosBaixoEstoque}
        onNavigate={() => onDrillDown(createPageUrl("Estoque"))}
      />

      {/* Gráficos + Top Produtos */}
      <div className="flex flex-col gap-4">
        <div className="overflow-auto">
          <ChartsSection vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} />
        </div>
        <div className="overflow-auto">
          <TopProdutosStatusPeriodoSection topProdutos={topProdutos} dadosVendasStatus={dadosVendasStatus} COLORS={COLORS} />
        </div>
      </div>

      {/* Widgets de BI */}
      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPIsComparativosWidget />
          <DashboardMarketplaceWidget />
          {canSeeCRM && <CRMScoreDashboard />}
          {canSeeFinanceiro && <ConciliacaoIAWidget />}
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DashboardBI3DWidget />
          <DashboardAutomacaoFluxosWidget />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RastreamentoGPSWidget />
          <ApontamentoProdutoMobileWidget />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComplianceISO27001Widget />
          <ContratosEletronicosWidget />
        </div>
      </ErrorBoundary>

      {/* IA */}
      <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardSaudeWidget />
          <DashboardForecastWidget />
          <DashboardVendasPrevisaoWidget />
          <DashboardIAInsightsPanel />
        </div>
      </ErrorBoundary>

      {/* Gráficos Avançados */}
      <AdvancedAnalysisSection
        vendasPorMes={vendasPorMesData}
        top5Clientes={top5ClientesData}
        statusPedidos={statusPedidosDataAll}
        fluxoCaixaMensal={fluxoCaixaMensalData}
        COLORS={COLORS}
      />

      {/* Command Center — compacto */}
      <ProtectedSection module="Sistema" action="ver" hideInstead>
        <DashboardCommandCenter ccMetrics={ccMetrics} botMetrics={botMetrics} />
      </ProtectedSection>

      <ProtectedSection module="Sistema" action="ver" hideInstead>
        <Suspense fallback={<div className="h-32 rounded bg-slate-100 animate-pulse" />}>
          <DashboardPerformance />
        </Suspense>
      </ProtectedSection>

      {canSeeEstoque && (
        <DashboardEstoquePrevisoesWidget previsoesIA={previsoesIA} loadingPrevIA={loadingPrevIA} />
      )}

      <QuickAccessModulesGrid modules={quickAccess} onClick={onDrillDown} />
      <FinancialSummary receitasPendentes={receitasPendentes} despesasPendentes={despesasPendentes} fluxoCaixa={fluxoCaixa} />

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Rankings de Performance
        </h2>
        <Suspense fallback={<div className="h-32 rounded bg-slate-100 animate-pulse" />}>
          <GamificacaoOperacoes />
        </Suspense>
      </div>
    </div>
  );
}