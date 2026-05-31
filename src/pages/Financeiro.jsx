import React from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, DollarSign, TrendingUp, TrendingDown, BarChart3, CreditCard, ArrowLeftRight, Globe, FileText, AlertCircle, Activity } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsFinanceiroLaunchpad from "@/components/financeiro/KPIsFinanceiroLaunchpad";
import MetricasSecundariasLaunchpad from "@/components/financeiro/MetricasSecundariasLaunchpad";

import ModulosGridFinanceiro from "@/components/financeiro/ModulosGridFinanceiro";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useFinanceiroDerivedData from "@/components/financeiro/hooks/useFinanceiroDerivedData";
import { FINANCEIRO_CONFIG_LIMIT, FINANCEIRO_LIST_LIMIT, FINANCEIRO_SMALL_LIST_LIMIT } from "@/components/financeiro/config/financeiroQueryConfig";

const CaixaCentralLiquidacao = React.lazy(() => import("../components/financeiro/CaixaCentralLiquidacao"));
const ContasReceberTab = React.lazy(() => import("../components/financeiro/ContasReceberTab"));
const ContasPagarTab = React.lazy(() => import("../components/financeiro/ContasPagarTab"));
const ConciliacaoBancaria = React.lazy(() => import("../components/financeiro/ConciliacaoBancaria"));
const AprovacaoDescontosManager = React.lazy(() => import("../components/comercial/AprovacaoDescontosManager"));
const CaixaPDVCompleto = React.lazy(() => import("../components/financeiro/CaixaPDVCompleto"));
const GestaoRemessaRetorno = React.lazy(() => import("../components/financeiro/GestaoRemessaRetorno"));
const VendasMulticanal = React.lazy(() => import("../components/financeiro/VendasMulticanal"));
const RateioMultiempresa = React.lazy(() => import("../components/financeiro/RateioMultiempresa"));
const AlertasFinanceirosEmpresa = React.lazy(() => import("../components/financeiro/AlertasFinanceirosEmpresa"));
const RelatorioFinanceiro = React.lazy(() => import("../components/financeiro/RelatorioFinanceiro"));
const DashboardFormasPagamento = React.lazy(() => import("../components/financeiro/DashboardFormasPagamento"));
const LogisticaFinanceiroPanel = React.lazy(() => import("../components/expedicao/financeiro/LogisticaFinanceiroPanel"));

export default function Financeiro() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canSeeFinanceiro = hasPermission('Financeiro', null, 'ver');
  const { openWindow } = useWindow();
  const { user } = useUser();

  const {
    estaNoGrupo,
    grupoAtual,
    empresaAtual,
    empresasDoGrupo,
    adicionarColunasContexto,
  } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || empresasDoGrupo?.[0]?.group_id || null;
  const contextKey = empresaAtual?.id || groupId || 'sem-contexto';
  const contextoValido = contextKey !== 'sem-contexto';

  const { data: contasReceber = [] } = useRLSQuery(
    'ContaReceber', {}, 'data_vencimento', FINANCEIRO_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const totalContasReceber = contasReceber.length;

  const { data: contasPagar = [] } = useRLSQuery(
    'ContaPagar', {}, 'data_vencimento', FINANCEIRO_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const totalContasPagar = contasPagar.length;

  const { data: rateios = [] } = useRLSQuery(
    'RateioFinanceiro', {}, '-created_date', FINANCEIRO_SMALL_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const { data: extratosBancarios = [] } = useRLSQuery(
    'ExtratoBancario', {}, '-data_movimento', FINANCEIRO_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const { data: configsGateway = [] } = useRLSQuery(
    'ConfiguracaoGatewayPagamento', {}, '-created_date', FINANCEIRO_CONFIG_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const { data: ordensLiquidacao = [] } = useRLSQuery(
    'CaixaOrdemLiquidacao', {}, '-created_date', FINANCEIRO_SMALL_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  const { data: pedidosPendentesAprovacao = [] } = useRLSQuery(
    'Pedido', { status_aprovacao: 'pendente' }, '-created_date', FINANCEIRO_SMALL_LIST_LIMIT,
    { staleTime: 60000, enabled: canSeeFinanceiro && contextoValido }
  );

  // Dados já vêm filtrados do servidor
  const contasReceberFiltradas = contasReceber;
  const contasPagarFiltradas = contasPagar;

  const contasReceberComContexto = adicionarColunasContexto(contasReceberFiltradas);
  const contasPagarComContexto = adicionarColunasContexto(contasPagarFiltradas);

  const {
    receberPendente,
    pagarPendente,
    saldo,
    contasReceberVencidas,
    contasPagarVencidas,
    titulosComBoleto,
    titulosComPix,
    empresasComGateway,
    extratosNaoConciliados,
    valorNaoConciliado,
    ordensLiquidacaoPendentes,
    totalPendentesAprovacao,
  } = useFinanceiroDerivedData({
    contasReceber: contasReceberFiltradas,
    contasPagar: contasPagarFiltradas,
    extratosBancarios,
    configsGateway,
    ordensLiquidacao,
    pedidosPendentesAprovacao,
  });

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Caixa Central',
      description: 'Hub unificado de liquidações',
      icon: DollarSign,
      color: 'green',
      component: CaixaCentralLiquidacao,
      windowTitle: '💰 Caixa Central V22.0',
      width: 1600,
      height: 900,
      badge: ordensLiquidacaoPendentes > 0 ? `${ordensLiquidacaoPendentes} pendentes` : null,
    },

    {
      title: 'Formas de Pagamento',
      description: 'Gestão centralizada de meios',
      icon: CreditCard,
      color: 'indigo',
      component: DashboardFormasPagamento,
      windowTitle: '🏦 Formas de Pagamento',
      width: 1500,
      height: 850,
    },
    {
      title: 'Caixa PDV Completo',
      description: 'Vendas e liquidações multi-operador',
      icon: Activity,
      color: 'emerald',
      component: CaixaPDVCompleto,
      windowTitle: '💵 Caixa PDV Completo',
      width: 1500,
      height: 850,
    },

    {
      title: 'Vendas Multicanal',
      description: 'E-commerce e marketplaces',
      icon: Globe,
      color: 'blue',
      component: VendasMulticanal,
      windowTitle: '🌐 Vendas Multicanal',
      width: 1400,
      height: 800,
    },
    {
      title: 'Remessa/Retorno CNAB',
      description: 'Arquivos bancários automatizados',
      icon: FileText,
      color: 'purple',
      component: GestaoRemessaRetorno,
      windowTitle: '🏦 Gestão CNAB',
      width: 1400,
      height: 800,
    },
    {
      title: 'Contas a Receber',
      description: 'Títulos e cobranças completas',
      icon: TrendingUp,
      color: 'green',
      component: ContasReceberTab,
      windowTitle: '📈 Contas a Receber',
      width: 1500,
      height: 850,
      props: { contas: contasReceberComContexto }
    },
    {
      title: 'Contas a Pagar',
      description: 'Fornecedores e obrigações',
      icon: TrendingDown,
      color: 'red',
      component: ContasPagarTab,
      windowTitle: '📉 Contas a Pagar',
      width: 1500,
      height: 850,
      props: { contas: contasPagarComContexto }
    },
    {
      title: 'Aprovações Descontos',
      description: 'Hierarquia de aprovações',
      icon: AlertCircle,
      color: 'orange',
      component: AprovacaoDescontosManager,
      windowTitle: '⚠️ Aprovações de Descontos',
      width: 1400,
      height: 800,
      badge: totalPendentesAprovacao > 0 ? `${totalPendentesAprovacao} pendentes` : null,
    },
    {
      title: 'Conciliação Bancária',
      description: 'Matching automático de extratos',
      icon: ArrowLeftRight,
      color: 'cyan',
      component: ConciliacaoBancaria,
      windowTitle: '💳 Conciliação Bancária',
      width: 1500,
      height: 850,
    },
    {
      title: 'Custos Logísticos',
      description: 'Conciliação e relatórios (LOG)',
      icon: BarChart3,
      color: 'teal',
      component: LogisticaFinanceiroPanel,
      windowTitle: '\ud83d\udee3\ufe0f Custos Logísticos (LOG)',
      width: 1500,
      height: 850,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Relatórios Financeiros',
      description: 'DRE, fluxo e análises',
      icon: BarChart3,
      color: 'indigo',
      component: RelatorioFinanceiro,
      windowTitle: '📊 Relatórios Financeiros',
      width: 1500,
      height: 850,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Alertas por Empresa',
      description: 'Notificações e riscos',
      icon: AlertCircle,
      color: 'orange',
      component: AlertasFinanceirosEmpresa,
      windowTitle: '⚠️ Alertas Financeiros',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id, groupId: empresasDoGrupo[0]?.group_id }
    },
  ];

  const grupoModules = estaNoGrupo ? [
    {
      title: 'Rateio Multi-Empresa',
      description: 'Distribuição consolidada de custos',
      icon: ArrowLeftRight,
      color: 'purple',
      component: RateioMultiempresa,
      windowTitle: '🔀 Rateio Multi-Empresa',
      width: 1400,
      height: 800,
      props: { empresas: empresasDoGrupo, grupoId: empresasDoGrupo[0]?.group_id }
    },
  ] : [];

  const allModules = [...modules, ...grupoModules];

  const allowedAllModules = allModules.filter(m => hasPermission('Financeiro', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: groupId || null,
        acao: 'Visualização',
        modulo: 'Financeiro',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      }).catch(() => {});
      openWindow(
        module.component,
        { 
          ...(module.props || {}),
          empresaAtual,
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `financeiro-${module.title.toLowerCase().replace(/\s/g, '-').replace(/•/g, '')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Financeiro" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="Financeiro e Contábil" subtitle="Pagamentos, recebimentos e conciliação">
        <ModuleKPIs>
          <KPIsFinanceiroLaunchpad
            receberPendente={receberPendente}
            pagarPendente={pagarPendente}
            saldo={saldo}
            contasReceberVencidas={contasReceberVencidas}
            contasPagarVencidas={contasPagarVencidas}
          />
        </ModuleKPIs>
        <ModuleContent>
          <MetricasSecundariasLaunchpad
            titulosComBoleto={titulosComBoleto}
            titulosComPix={titulosComPix}
            empresasComGateway={empresasComGateway}
            rateiosCount={rateios.length}
            extratosNaoConciliados={extratosNaoConciliados}
            valorNaoConciliado={valorNaoConciliado}
            ordensLiquidacaoPendentes={ordensLiquidacaoPendentes}
            totalPendentesAprovacao={totalPendentesAprovacao}
          />
          <ModuleTabs
            listagem={<ModulosGridFinanceiro modules={allowedAllModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}