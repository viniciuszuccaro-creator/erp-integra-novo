/**
 * DashboardResumoTab — conteúdo principal do Dashboard.
 * Simplificado: apenas widgets essenciais para visão operacional rápida.
 */
import React, { Suspense } from "react";
import { createPageUrl } from "@/utils";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

// ─── Widgets essenciais ──────────────────────────────────────────────────────
const StatsSection              = React.lazy(() => import("@/components/dashboard/StatsSection"));
const KPIsOperacionaisSection   = React.lazy(() => import("@/components/dashboard/KPIsOperacionaisSection"));
const SecondaryKPIsSection      = React.lazy(() => import("@/components/dashboard/SecondaryKPIsSection"));
const ChartsSection             = React.lazy(() => import("@/components/dashboard/ChartsSection"));
const PedidosResumoPanel        = React.lazy(() => import("@/components/dashboard/PedidosResumoPanel"));
const FinancialSummary          = React.lazy(() => import("@/components/dashboard/FinancialSummary"));
const QuickAccessModulesGrid    = React.lazy(() => import("@/components/dashboard/QuickAccessModulesGrid"));
const WidgetEstoqueCritico      = React.lazy(() => import("@/components/estoque/WidgetEstoqueCritico"));
const DashboardAcoesRapidas     = React.lazy(() => import("@/components/dashboard/DashboardAcoesRapidas"));
const DashboardIAInsightsStrip  = React.lazy(() => import("@/components/dashboard/DashboardIAInsightsStrip"));
const DashboardMetasProgress    = React.lazy(() => import("@/components/dashboard/DashboardMetasProgress"));

const Skel = ({ h = 32 }) => (
  <div style={{ height: `${h * 4}px` }} className="rounded bg-slate-100 animate-pulse w-full" />
);

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
  onDrillDown,
  empresaId,
}) {
  const preds14 = (previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo").length;
  const anomList = anomaliasIA?.details || [];
  const anomResumo = anomList.reduce((acc, i) => {
    acc[i.severity || "baixo"] = (acc[i.severity || "baixo"] || 0) + 1;
    return acc;
  }, {});

  // Extrair valores para widgets novos
  const totalVendasNum = statsCards?.[0]?.value ? parseFloat(String(statsCards[0].value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0 : 0;
  const ticketMedioNum = statsCards?.[1]?.value ? parseFloat(String(statsCards[1].value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0 : 0;
  const otdNum = parseInt(kpisOperacionais?.[0]?.value || '0');
  const entregasPend = parseInt(kpiCards?.find(k => k.title?.includes('Entregas'))?.value || '0');
  const inadimplNum = parseInt(kpisOperacionais?.[3]?.value || '0');
  const entregasConc = entregasPend > 0 ? Math.max(0, entregasPend - 2) : 0;

  return (
    <div className="w-full h-full space-y-6 mt-4">

      {/* Faixa de Insights de IA */}
      <Slot Component={DashboardIAInsightsStrip} fallbackH={8} componentProps={{
        totalVendas: totalVendasNum,
        fluxoCaixa,
        produtosBaixoEstoque,
        taxaInadimplencia: inadimplNum,
        otd: otdNum,
        entregasPendentes: entregasPend,
        ticketMedio: ticketMedioNum,
      }} />

      {/* KPIs financeiros principais */}
      <Slot Component={StatsSection} fallbackH={24} componentProps={{ statsCards, empresaId }} />

      {/* KPIs operacionais */}
      <Slot Component={KPIsOperacionaisSection} fallbackH={20} componentProps={{ kpis: kpisOperacionais }} />

      {/* KPIs secundários */}
      <Slot Component={SecondaryKPIsSection} fallbackH={16} componentProps={{ kpis: kpiCards }} />

      {/* Ações rápidas contextuais */}
      <Slot Component={DashboardAcoesRapidas} fallbackH={20} componentProps={{
        pedidosAguardandoAprovacao,
        produtosBaixoEstoque,
        entregasPendentes: kpisOperacionais?.find?.(k => k.title?.includes('OTD'))?.subtitle?.split('/')?.[0] || 0,
        receitasPendentes,
        despesasPendentes,
        canSeeComercial: true,
        canSeeEstoque,
        canSeeFinanceiro,
        canSeeExpedicao: true,
        onDrillDown,
      }} />

      {/* Pedidos recentes + pendentes */}
      <Slot Component={PedidosResumoPanel} fallbackH={24} componentProps={{
        pedidosRecentes,
        pedidosPendentes,
        pedidosAguardandoAprovacao,
        onVerTodos: () => onDrillDown(createPageUrl("Comercial")),
      }} />

      {/* Resumo financeiro */}
      <div style={{ display: canSeeFinanceiro ? undefined : 'none' }}>
        <Slot Component={FinancialSummary} fallbackH={20} componentProps={{
          receitasPendentes,
          despesasPendentes,
          fluxoCaixa,
        }} />
      </div>

      {/* Apenas Estoque crítico + Metas (removido TopProdutos — info redundante em Estoque) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {canSeeEstoque && (
          <Slot Component={WidgetEstoqueCritico} fallbackH={20} componentProps={{
            preds14Count: preds14,
            count: produtosBaixoEstoque,
            onNavigate: () => onDrillDown(createPageUrl("Estoque")),
          }} />
        )}
        <Slot Component={DashboardMetasProgress} fallbackH={20} componentProps={{
          totalVendas: totalVendasNum,
          entregasConcluidas: entregasConc,
          taxaInadimplencia: inadimplNum,
        }} />
      </div>

      {/* Anomalias críticas apenas (P4: simplificação) */}
      {canSeeFinanceiro && anomResumo.alto > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              ⚠️ {anomResumo.alto} anomalias críticas detectadas
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Apenas gráfico de fluxo (vendas removida — redundante em Comercial) */}
      {fluxo7Dias && fluxo7Dias.length > 0 && (
        <Slot Component={ChartsSection} fallbackH={32} componentProps={{
          vendasUltimos30Dias: [],
          fluxo7Dias,
        }} />
      )}

    </div>
  );
}