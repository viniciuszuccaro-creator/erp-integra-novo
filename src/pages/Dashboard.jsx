import React, { useState, useEffect, Suspense, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";

import ErrorBoundary from "@/components/lib/ErrorBoundary";
import usePermissions from "@/components/lib/usePermissions";
import useDashboardDerivedData from "@/components/dashboard/hooks/useDashboardDerivedData";
import useDashboardQueries from "@/components/dashboard/hooks/useDashboardQueries";
import useDashboardKPIs from "@/components/dashboard/hooks/useDashboardKPIs";

const DashboardHeader          = React.lazy(() => import("@/components/dashboard/DashboardHeader"));
const DashboardKPIStrip        = React.lazy(() => import("@/components/dashboard/DashboardKPIStrip"));
const DashboardResumoTab       = React.lazy(() => import("@/components/dashboard/DashboardResumoTab"));
const ERPHealthBanner          = React.lazy(() => import("@/components/dashboard/ERPHealthBanner"));
const DashboardMultiempresaStatus = React.lazy(() => import("@/components/dashboard/DashboardMultiempresaStatus"));
const DashboardMultiempresaBanner = React.lazy(() => import("@/components/dashboard/DashboardMultiempresaBanner"));
const DashboardAlertsBar       = React.lazy(() => import("@/components/dashboard/DashboardAlertsBar"));

export default function Dashboard() {
  const navigate = useNavigate();
  const { empresaAtual, estaNoGrupo, grupoAtual, getFiltroContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const canSeeFinanceiro = hasPermission('Financeiro', null, 'visualizar');
  const canSeeCRM = hasPermission('CRM', null, 'visualizar');
  const canSeeComercial = hasPermission('Comercial', null, 'visualizar');
  const canSeeEstoque = hasPermission('Estoque', null, 'visualizar');
  const canSeeExpedicao = hasPermission('Expedição', null, 'visualizar');
  const canSeeRH = hasPermission('RH', null, 'visualizar');
  const canSeeProducao = hasPermission('Produção', null, 'visualizar');
  const canSeeFiscal = hasPermission('Fiscal', null, 'visualizar');

  const [periodo, setPeriodo] = useState(() => {
    try { return localStorage.getItem('dashboard_periodo') || "mes"; } catch { return "mes"; }
  });
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('dashboard_periodo', periodo); } catch {}
  }, [periodo]);

  const queries = useDashboardQueries({
    canSeeFinanceiro, canSeeCRM, canSeeComercial, canSeeEstoque, canSeeExpedicao,
    canSeeRH, canSeeProducao, canSeeFiscal, periodo, autoRefresh,
    empresaAtual, estaNoGrupo, grupoAtual, getFiltroContexto
  });
  const { pedidos, contasReceber, contasPagar, entregas, colaboradores, produtos, clientes, ordensProducao, iaConsolidado, loadingAnomIA, ccMetrics, botMetrics, cadastroCounts } = queries;

  const {
    pedidosPeriodo, totalVendas, ticketMedio, receitasPendentes, despesasPendentes,
    fluxoCaixa, produtosBaixoEstoque, colaboradoresAtivos, clientesAtivos, taxaConversao,
    entregasPendentes, otd, entregasNoPrazo, entregasConcluidas, pesoProduzido,
    aproveitamentoBarra, taxaInadimplencia, valorVencido, dadosVendasStatus,
    vendasUltimos30Dias, fluxo7Dias, topProdutos, vendasPorMesData, top5ClientesData,
    statusPedidosDataAll, fluxoCaixaMensalData,
    pedidosTotalCount, contasReceberPendentesCount, contasPagarPendentesCount,
  } = useDashboardDerivedData({ pedidos, contasReceber, contasPagar, entregas, ordensProducao, colaboradores, clientes, produtos, periodo, cadastroCounts });

  const pedidosRecentes = (pedidos || []).slice(0, 8);
  const pedidosPendentes = (pedidos || []).filter(p => ['Rascunho','Em Produção','Pronto para Faturar','Em Expedição'].includes(p?.status)).slice(0, 8);
  const pedidosAguardandoAprovacao = (pedidos || []).filter(p => (p?.status_aprovacao === 'pendente') || (p?.status === 'Aguardando Aprovação')).slice(0, 8);

  const totalColaboradoresDash = cadastroCounts?.colaboradoresTotal != null
    ? cadastroCounts.colaboradoresTotal
    : colaboradores.length;
  const opsConcluidasCount = (ordensProducao || []).filter(op => ["Concluída","Concluido","Concluida","Concluído","Finalizada","Finalizado","Encerrada","Encerrado","Pronto"].includes(op?.status)).length;

  const handleDrillDown = (rota) => { startTransition(() => { navigate(rota); }); };
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const { statsCards, kpisOperacionais, quickAccess } = useDashboardKPIs({
    totalVendas, fluxoCaixa, pedidosPeriodo, receitasPendentes, despesasPendentes,
    produtosBaixoEstoque, taxaInadimplencia, valorVencido,
    otd, entregasNoPrazo, entregasConcluidas, pesoProduzido, opsConcluidasCount,
    clientesAtivos, totalColaboradoresDash, entregasPendentes, pedidos,
    contasReceber, contasPagar, canSeeComercial, canSeeEstoque, canSeeExpedicao, canSeeFinanceiro,
    handleDrillDown,
    pedidosTotalCount, contasReceberPendentesCount, contasPagarPendentesCount
  });

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <Suspense fallback={<div className="h-12 w-full bg-slate-100 rounded animate-pulse" />}>
            <ErrorBoundary>
              <DashboardHeader empresaAtual={empresaAtual} estaNoGrupo={estaNoGrupo} grupoAtual={grupoAtual} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} periodo={periodo} setPeriodo={setPeriodo} />
            </ErrorBoundary>
          </Suspense>
        </div>
        <div><Suspense fallback={<></>}><ErrorBoundary><DashboardMultiempresaBanner /></ErrorBoundary></Suspense></div>
        <div><Suspense fallback={<></>}><ErrorBoundary><DashboardAlertsBar produtosBaixoEstoque={produtosBaixoEstoque} taxaInadimplencia={taxaInadimplencia} pedidosAguardando={pedidosAguardandoAprovacao.length} anomaliasCount={(iaConsolidado?.details || []).filter(a => a.severity === 'alto').length} /></ErrorBoundary></Suspense></div>
        <div><Suspense fallback={<></>}><ErrorBoundary><ERPHealthBanner /></ErrorBoundary></Suspense></div>
        <div><Suspense fallback={<></>}><ErrorBoundary><DashboardMultiempresaStatus /></ErrorBoundary></Suspense></div>
        <div>
          <Suspense fallback={<div className="h-16 w-full bg-slate-100 rounded animate-pulse" />}>
            <ErrorBoundary>
              <DashboardKPIStrip totalVendas={totalVendas} fluxoCaixa={fluxoCaixa} entregasPendentes={entregasPendentes} produtosBaixoEstoque={produtosBaixoEstoque} otd={otd} taxaInadimplencia={taxaInadimplencia} totalPedidos={pedidosTotalCount != null ? pedidosTotalCount : pedidos.length} clientesAtivos={clientesAtivos} />
            </ErrorBoundary>
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div className="h-96 w-full bg-slate-100 rounded animate-pulse" />}>
            <ErrorBoundary>
              <DashboardResumoTab
                statsCards={statsCards} kpisOperacionais={kpisOperacionais} kpiCards={[]} quickAccess={quickAccess}
                pedidosRecentes={pedidosRecentes} pedidosPendentes={pedidosPendentes} pedidosAguardandoAprovacao={pedidosAguardandoAprovacao}
                produtosBaixoEstoque={produtosBaixoEstoque} receitasPendentes={receitasPendentes} despesasPendentes={despesasPendentes}
                fluxoCaixa={fluxoCaixa} vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} topProdutos={topProdutos}
                dadosVendasStatus={dadosVendasStatus} vendasPorMesData={vendasPorMesData} top5ClientesData={top5ClientesData}
                statusPedidosDataAll={statusPedidosDataAll} fluxoCaixaMensalData={fluxoCaixaMensalData} COLORS={COLORS}
                anomaliasIA={iaConsolidado} loadingAnomIA={loadingAnomIA} previsoesIA={iaConsolidado} previsoesIA30={iaConsolidado} loadingPrevIA={loadingAnomIA}
                ccMetrics={ccMetrics} botMetrics={botMetrics} canSeeFinanceiro={canSeeFinanceiro} canSeeCRM={canSeeCRM} canSeeEstoque={canSeeEstoque}
                onDrillDown={handleDrillDown} empresaId={empresaAtual?.id}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>
    </div>
  );
}