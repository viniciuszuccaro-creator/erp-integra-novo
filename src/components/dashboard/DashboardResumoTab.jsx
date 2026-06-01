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
const StatsSection            = React.lazy(() => import("@/components/dashboard/StatsSection"));
const KPIsOperacionaisSection = React.lazy(() => import("@/components/dashboard/KPIsOperacionaisSection"));
const SecondaryKPIsSection    = React.lazy(() => import("@/components/dashboard/SecondaryKPIsSection"));
const ChartsSection           = React.lazy(() => import("@/components/dashboard/ChartsSection"));
const PedidosResumoPanel      = React.lazy(() => import("@/components/dashboard/PedidosResumoPanel"));
const FinancialSummary        = React.lazy(() => import("@/components/dashboard/FinancialSummary"));
const QuickAccessModulesGrid  = React.lazy(() => import("@/components/dashboard/QuickAccessModulesGrid"));
const WidgetEstoqueCritico    = React.lazy(() => import("@/components/estoque/WidgetEstoqueCritico"));
const DashboardAcoesRapidas   = React.lazy(() => import("@/components/dashboard/DashboardAcoesRapidas"));
const DashboardTopProdutos    = React.lazy(() => import("@/components/dashboard/DashboardTopProdutos"));

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
  COLORS,
  anomaliasIA,
  loadingAnomIA,
  previsoesIA,
  loadingPrevIA,
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

  return (
    <div className="w-full h-full space-y-6 mt-4">

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

      {/* Top Produtos + Estoque crítico (lado a lado) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {canSeeEstoque && (
          <Slot Component={WidgetEstoqueCritico} fallbackH={20} componentProps={{
            preds14Count: preds14,
            count: produtosBaixoEstoque,
            onNavigate: () => onDrillDown(createPageUrl("Estoque")),
          }} />
        )}
        <Slot Component={DashboardTopProdutos} fallbackH={20} componentProps={{
          topProdutos,
          onNavigate: () => onDrillDown(createPageUrl("Estoque")),
        }} />
      </div>

      {/* Anomalias Financeiras */}
      {canSeeFinanceiro && anomList.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Anomalias Financeiras Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-sm">
              {anomResumo.alto > 0 && <Badge className="bg-red-100 text-red-700">Alta: {anomResumo.alto}</Badge>}
              {anomResumo.medio > 0 && <Badge className="bg-amber-100 text-amber-700">Média: {anomResumo.medio}</Badge>}
              {anomResumo.baixo > 0 && <Badge variant="outline">Baixa: {anomResumo.baixo}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos de vendas (30d) e fluxo (7d) */}
      <Slot Component={ChartsSection} fallbackH={48} componentProps={{
        vendasUltimos30Dias,
        fluxo7Dias,
      }} />

      {/* Acesso rápido aos módulos */}
      <Slot Component={QuickAccessModulesGrid} fallbackH={24} componentProps={{
        modules: quickAccess,
        onClick: onDrillDown,
      }} />

    </div>
  );
}