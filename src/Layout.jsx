import React, { useState, useEffect, useRef } from "react";
import { createPageUrl } from "@/utils";
import { useLocation } from "react-router-dom";
import { 
        LayoutDashboard, Users, ShoppingCart, Truck, DollarSign, Package,
        UserCircle, Box, FileText, Settings, Calendar, BarChart3, Factory,
        MessageCircle, Building2,
      } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import usePermissions from "@/components/lib/usePermissions";
import { UserProvider, useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import PesquisaUniversal from "@/components/PesquisaUniversal";
import { WindowProvider } from "@/components/lib/WindowManager";
import ZIndexGuard from "@/components/lib/ZIndexFix";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import "@/components/lib/networkGuard";
import BootstrapGuard from "@/components/lib/BootstrapGuard";
import GlobalNetworkErrorHandler from "@/components/lib/GlobalNetworkErrorHandler";
import GlobalContextStamp from "@/components/lib/GlobalContextStamp";
import { usePrefetchModuleData } from "@/components/lib/usePrefetchModuleData";
import { usePrefetchCadastrosData } from "@/components/cadastros/hooks/useCadastrosData";
import { useInvalidationBus } from "@/components/lib/useInvalidationBus";
import { useNavHistory } from "@/components/lib/useNavHistory";
import { usePredictivePrefetch } from "@/components/lib/usePredictivePrefetch";

import EmpresaOnboardingGuard from "@/components/sistema/EmpresaOnboardingGuard";
import LayoutEffects from "@/components/layout/LayoutEffects";
import LayoutRBACWrapper from "@/components/layout/LayoutRBACWrapper";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import LayoutHeaderBar from "@/components/layout/LayoutHeaderBar";
import LayoutMainContent from "@/components/layout/LayoutMainContent";

const navigationItems = [
    { title: "Dashboard", url: "/Dashboard", icon: LayoutDashboard, group: "principal" },
    { title: "Relatórios e Análises", url: "/Relatorios", icon: BarChart3, group: "principal" },
    { title: "Agenda e Calendário", url: "/Agenda", icon: Calendar, group: "principal" },
    { title: "CRM - Relacionamento", url: "/CRM", icon: Users, group: "principal" },
    { title: "Cadastros Gerais", url: "/Cadastros", icon: Users, group: "cadastros" },
    { title: "Comercial e Vendas", url: "/Comercial", icon: ShoppingCart, group: "operacional" },
    { title: "Estoque e Almoxarifado", url: "/Estoque", icon: Box, group: "operacional" },
    { title: "Compras e Suprimentos", url: "/Compras", icon: Package, group: "operacional" },
    { title: "Expedição e Logística", url: "/Expedicao", icon: Truck, group: "operacional" },
    { title: "Produção e Manufatura", url: "/Producao", icon: Factory, group: "operacional" },
    { title: "Financeiro e Contábil", url: "/Financeiro", icon: DollarSign, group: "administrativo" },
    { title: "Recursos Humanos", url: "/RH", icon: UserCircle, group: "administrativo" },
    { title: "Fiscal e Tributário", url: "/Fiscal", icon: FileText, group: "administrativo" },
    { title: "Gestão de Contratos", url: "/Contratos", icon: FileText, group: "administrativo" },
    { title: "Administração do Sistema", url: "/AdministracaoSistema?tab=integracoes", icon: Settings, group: "sistema" },
    { title: "Hub de Atendimento", url: "/HubAtendimento", icon: MessageCircle, group: "principal" },
  ];

const titleToModule = {
  "CRM - Relacionamento": "CRM",
  "Comercial e Vendas": "Comercial",
  "Estoque e Almoxarifado": "Estoque",
  "Compras e Suprimentos": "Compras",
  "Financeiro e Contábil": "Financeiro",
  "Fiscal e Tributário": "Fiscal",
  "Recursos Humanos": "RH",
};

const pageToModule = {
  CRM: 'CRM', Comercial: 'Comercial', Estoque: 'Estoque', Compras: 'Compras',
  Financeiro: 'Financeiro', Fiscal: 'Fiscal', RH: 'RH', Expedicao: 'Expedição',
  Producao: 'Produção', Dashboard: 'Dashboard', Relatorios: 'Relatórios',
  Agenda: 'Agenda', Cadastros: 'Cadastros', Contratos: 'Contratos',
  AdministracaoSistema: 'Sistema', PlanoMelhoria: 'Sistema', HubAtendimento: 'HubAtendimento',
};

function LayoutContent({ children, currentPageName }) {
  const moduleName = pageToModule?.[currentPageName] || 'Sistema';
  const { user } = useUser();
  const { empresaAtual, filterInContext, grupoAtual, contexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const [pesquisaOpen, setPesquisaOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [integracoesOk, setIntegracoesOk] = useState(true);
  const { prefetch: prefetchModule } = usePrefetchModuleData();
  const prefetchCadastros = usePrefetchCadastrosData();
  const queryClient = useQueryClient();
  const contextRef = useRef({ user, empresaAtual, grupoAtual, contexto, moduleName });
  contextRef.current = { user, empresaAtual, grupoAtual, contexto, moduleName };

  // Invalidação seletiva + rastreamento + prefetch preditivo
  useInvalidationBus([
    'Cliente', 'Fornecedor', 'Transportadora', 'Colaborador', 'Produto',
    'Pedido', 'ContaReceber', 'ContaPagar', 'Entrega', 'NotaFiscal',
    'OrdemCompra', 'MovimentacaoEstoque', 'Oportunidade', 'Representante',
    'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
    'CentroCusto', 'PlanoDeContas', 'FormaPagamento', 'Banco', 'GatewayPagamento',
    'Marca', 'GrupoProduto', 'UnidadeMedida', 'TabelaNCM', 'TabelaPreco',
    'CondicaoComercial', 'SetorAtividade', 'Cargo', 'Departamento', 'Turno',
    'Veiculo', 'Motorista', 'RotaPadrao', 'TipoFrete', 'LocalEstoque',
    'Servico', 'KitProduto', 'MoedaIndice', 'CentroResultado', 'CentroOperacao',
    'Evento', 'Ferias', 'Ponto', 'Contrato', 'SolicitacaoCompra',
    'OrdemProducao', 'ApontamentoProducao', 'Romaneio', 'Inventario',
    'TransferenciaFilial', 'CatalogoWeb', 'OperadorCaixa', 'TabelaFiscal',
    'ConfiguracaoSistema', 'IAConfig', 'AuditLog', 'Notificacao',
    'ApiExterna', 'ChatbotCanal', 'ChatbotIntent', 'ChatbotIntents',
    'JobAgendado', 'Webhook', 'EventoNotificacao', 'ModeloDocumento',
    'PerfilAcesso', 'GrupoEmpresarial',
    'ChatbotInteracao', 'ImportacaoXMLNFe', 'SolicitacaoAprovacao',
    'SeparacaoConferencia', 'ConciliacaoPedido', 'RateioFinanceiro',
    'ConciliacaoBancaria', 'ExtratoBancario', 'CaixaMovimento',
    'MovimentoCartao', 'CaixaOrdemLiquidacao', 'LancamentoContabil',
    'DRE', 'SPEDFiscal', 'LogFiscal', 'MonitoramentoSistema',
    'AlertaPerformance', 'LogPerformance', 'BackupAutomatico',
    'ConfiguracaoBackup', 'ConfiguracaoMonitoramento', 'ConfiguracaoSeguranca',
    'GovernancaEmpresa', 'AuditoriaGlobal', 'AuditoriaAcesso',
    'AuditoriaGPS', 'AuditoriaIA', 'LogsIA', 'LogCobranca',
    'PlanoMelhoriaItem', 'TabelaDIFAL', 'ConversaOmnicanal',
    'MensagemOmnicanal', 'PagamentoOmnichannel', 'SessaoUsuario',
    'TokenRefresh', 'ConfiguracaoIntegracaoMarketplace', 'DocumentoTecnica',
    'ParametroOrigemPedido', 'ConfigFiscalEmpresa', 'PermissaoEmpresaModulo',
    'SolicitacaoAprovacao', 'MonitoramentoRH', 'InspecaoQualidade',
    'TabelaPrecoItem', 'PedidoEtapa', 'EntregaItens', 'PedidoExterno',
  ], { enabled: true });
  useNavHistory();
  usePredictivePrefetch();

  // Prefetch ao passar o mouse em itens do menu — delega para usePrefetchModuleData
  // (chaves de query alinhadas com useRLSQuery para compartilhar cache)
  const prefetchForItem = (title) => {
    try {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          try { prefetchModule(title); } catch (_) {}
        }, { timeout: 3000 });
      } else {
        setTimeout(() => { try { prefetchModule(title); } catch (_) {} }, 200);
      }
    } catch (_) {}
  };

  // Safety-net: refetch periódico de queries ativas a cada 45s (caso WebSocket falhe)
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        queryClient.invalidateQueries({ refetchType: 'active' });
      } catch (_) {}
    }, 45000);
    return () => clearInterval(iv);
  }, [queryClient]);

  // Atalhos de teclado (Ctrl+K = pesquisa, Ctrl+Shift+D = dashboard, Ctrl+Shift+C = comercial)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'k') { e.preventDefault(); setPesquisaOpen(true); }
      if (ctrl && e.shiftKey && e.key === 'D') { e.preventDefault(); window.location.href = createPageUrl('Dashboard'); }
      if (ctrl && e.shiftKey && e.key === 'C') { e.preventDefault(); window.location.href = createPageUrl('Comercial'); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Idle prefetch common datasets (multiempresa-aware) + Cadastro Gerais
  useEffect(() => {
    const can = (contexto === 'grupo') || !!empresaAtual?.id;
    if (!can) return;
    const run = () => {
      try {
        if (hasPermission('Comercial', null, 'ver')) queryClient.prefetchQuery({ queryKey: ['pedidos', empresaAtual?.id, grupoAtual?.id, contexto], queryFn: () => filterInContext('Pedido', {}, '-updated_date', 20) });
        if (hasPermission('Financeiro', null, 'ver')) queryClient.prefetchQuery({ queryKey: ['contasReceber', empresaAtual?.id, grupoAtual?.id, contexto], queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 20) });
        if (hasPermission('Estoque', null, 'ver')) queryClient.prefetchQuery({ queryKey: ['produtos', empresaAtual?.id, grupoAtual?.id, contexto], queryFn: () => filterInContext('Produto', {}, '-updated_date', 20) });
        // Ramificação de Cadastro Gerais: camada core imediata
        prefetchCadastros('core');
      } catch (_) {}
    };
    const runRef = () => {
      try { prefetchCadastros('ref'); } catch (_) {}
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 2000 });
      // Camada de referência após core (prioridade menor)
      window.requestIdleCallback(runRef, { timeout: 5000 });
    } else {
      setTimeout(run, 1500);
      setTimeout(runRef, 3000);
    }
  }, [empresaAtual?.id, grupoAtual?.id, contexto]);

  const isMobilePage = false;

  const itemsFiltrados = navigationItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    const mod = titleToModule[item.title];
    if (!mod) return true;
    return hasPermission(mod, null, 'ver');
  });

  const groupedItems = {
    principal: itemsFiltrados.filter(item => item.group === "principal"),
    cadastros: itemsFiltrados.filter(item => item.group === "cadastros"),
    operacional: itemsFiltrados.filter(item => item.group === "operacional"),
    administrativo: itemsFiltrados.filter(item => item.group === "administrativo"),
    sistema: itemsFiltrados.filter(item => item.group === "sistema"),
    publico: itemsFiltrados.filter(item => item.group === "publico"),
  };

  return (
    <SidebarProvider>
      <LayoutEffects
        user={user} empresaAtual={empresaAtual} grupoAtual={grupoAtual}
        contexto={contexto} moduleName={moduleName} currentPageName={currentPageName}
        isOffline={isOffline} setIsOffline={setIsOffline}
        setIntegracoesOk={setIntegracoesOk} contextRef={contextRef}
      />
      <LayoutRBACWrapper
        user={user} empresaAtual={empresaAtual} grupoAtual={grupoAtual}
        contexto={contexto} contextRef={contextRef}
      />

      <div className="w-full h-full min-h-screen" style={{ display: isMobilePage ? undefined : 'none' }}>{children}</div>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50" style={{ display: isMobilePage ? 'none' : undefined }}>
        <LayoutSidebar navigationItems={navigationItems} groupedItems={groupedItems} onHoverItem={prefetchForItem} />

        <main className="flex-1 flex flex-col">
          <LayoutHeaderBar
            pesquisaOpen={pesquisaOpen}
            setPesquisaOpen={setPesquisaOpen}
            isOffline={isOffline}
            contexto={contexto}
            empresaAtual={empresaAtual}
          />

          <LayoutMainContent moduleName={moduleName} currentPageName={currentPageName}>
            {children}
          </LayoutMainContent>
        </main>

        <PesquisaUniversal open={pesquisaOpen} onOpenChange={setPesquisaOpen} />
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <WindowProvider>
        <ZIndexGuard>
          <GlobalNetworkErrorHandler />
          <GlobalContextStamp />
          <LayoutContent children={children} currentPageName={currentPageName} />
        </ZIndexGuard>
      </WindowProvider>
    </UserProvider>
  );
}