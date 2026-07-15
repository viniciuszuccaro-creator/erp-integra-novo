import React, { startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { Users, ShoppingCart, FileText, Upload, Brain, Star } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import KPIsCompras from "@/components/compras/compras-launchpad/KPIsCompras";
import ModulosGridCompras from "@/components/compras/compras-launchpad/ModulosGridCompras";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";

const FornecedoresTab = React.lazy(() => import("../components/compras/FornecedoresTab"));
const OrdensCompraTab = React.lazy(() => import("../components/compras/OrdensCompraTab"));
const SolicitacoesCompraTab = React.lazy(() => import("../components/compras/SolicitacoesCompraTab"));
const CotacoesTab = React.lazy(() => import("../components/compras/CotacoesTab"));
const ImportacaoNFeRecebimento = React.lazy(() => import("../components/compras/ImportacaoNFeRecebimento"));
const OrdemCompraForm = React.lazy(() => import("../components/compras/OrdemCompraForm"));
const ComprasIAInsights = React.lazy(() => import("../components/compras/ComprasIAInsights"));
const AvaliacaoFornecedorForm = React.lazy(() => import('../components/compras/AvaliacaoFornecedorForm'));

export default function Compras() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { empresaAtual, grupoAtual, createInContext } = useContextoVisual();
  const { user } = useUser();
  const { openWindow } = useWindow();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto válido requer empresa OU grupo explícito — nunca busca sem escopo
  const contextoValido = !!(empresaAtual?.id || groupId);
  const podeCriarOC = hasPermission("Compras", "Ordens de Compra", "criar") || hasPermission("Compras", "Ordens Compra", "criar");

  const { data: fornecedores = [] } = useRLSQuery(
    'Fornecedor', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2, enabled: contextoValido }
  );
  const { data: ordensCompra = [] } = useRLSQuery(
    'OrdemCompra', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2, enabled: contextoValido }
  );
  const { data: solicitacoes = [] } = useRLSQuery(
    'SolicitacaoCompra', {}, '-data_solicitacao', 100,
    { staleTime: 30000, retry: 1, enabled: contextoValido }
  );
  const { data: empresas = [] } = useRLSQuery(
    'Empresa', {}, '-created_date', 9999,
    { staleTime: 60000, retry: 1, enabled: contextoValido }
  );

  const totalCompras = ordensCompra
    .filter(o => o.status !== 'Cancelada')
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const fornecedoresAtivos = fornecedores.filter(f => f.status === 'Ativo').length;
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'Pendente').length;
  const ocsPendentes = ordensCompra.filter(o => ['Rascunho','Enviada','Aguardando Aprovação'].includes(o.status)).length;
  const valorEmAberto = ordensCompra.filter(o => o.status === 'Aprovada').reduce((s, o) => s + (o.valor_total || 0), 0); 

  if (loadingPermissions) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // P2: banner sem contexto — consistência com demais módulos
  if (!contextoValido) {
    return (
      <ProtectedSection module="Compras" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados de compras.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Fornecedores',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'cyan',
      component: FornecedoresTab,
      windowTitle: '👥 Fornecedores',
      width: 1500,
      height: 850,
      props: { fornecedores, isLoading: false }
    },
    {
      title: 'Recebimento NF-e',
      description: 'Importação automática',
      icon: Upload,
      color: 'blue',
      component: ImportacaoNFeRecebimento,
      windowTitle: '📥 Recebimento NF-e',
      width: 1400,
      height: 800,
    },
    {
      title: 'Solicitações',
      description: 'Requisições internas',
      icon: FileText,
      color: 'orange',
      component: SolicitacoesCompraTab,
      windowTitle: '📋 Solicitações de Compra',
      width: 1400,
      height: 800,
      props: { solicitacoes },
      badge: solicitacoesPendentes > 0 ? `${solicitacoesPendentes} pendentes` : null
    },
    {
      title: 'Cotações',
      description: 'Comparativo de preços',
      icon: FileText,
      color: 'indigo',
      component: CotacoesTab,
      windowTitle: '💰 Cotações',
      width: 1400,
      height: 800,
    },
    {
      title: 'Ordens de Compra',
      description: 'Pedidos a fornecedores',
      icon: ShoppingCart,
      color: 'purple',
      component: OrdensCompraTab,
      windowTitle: '🛒 Ordens de Compra',
      width: 1500,
      height: 850,
      props: { ordensCompra, fornecedores, empresas, isLoading: false }
    },
    {
      title: 'IA Compras',
      description: 'Insights e sugestões',
      icon: Brain,
      color: 'violet',
      component: ComprasIAInsights,
      windowTitle: '🤖 IA de Compras',
      width: 1400,
      height: 800,
      props: { fornecedores, ordensCompra, solicitacoes, windowMode: true }
    },
    {
      title: 'Avaliação Fornecedor',
      description: 'Score e desempenho',
      icon: Star,
      color: 'amber',
      component: AvaliacaoFornecedorForm,
      windowTitle: '⭐ Avaliação de Fornecedor',
      width: 1200,
      height: 700,
      props: { fornecedores, windowMode: true }
    },
  ];

  const allowedModules = modules.filter(m => hasPermission('Compras', (m.sectionKey || m.title), 'visualizar') || hasPermission('Compras', null, 'visualizar'));

  const handleModuleClick = (module) => {
    startTransition(() => {
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: groupId || null,
        acao: 'Visualização',
        modulo: 'Compras',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      }).catch(() => {});
      openWindow(
        module.component,
        { 
          ...(module.props || {}),
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `compras-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  // P2: handler de criação de OC com contexto multiempresa + P3: auditoria
  const handleNovaOC = () => openWindow(OrdemCompraForm, {
    windowMode: true,
    onSubmit: async (data) => {
      const payload = { ...data, empresa_id: data.empresa_id || empresaAtual?.id || null, group_id: data.group_id || groupId || null };
      const created = await createInContext('OrdemCompra', payload, 'empresa_id');
      try {
        await base44.entities.AuditLog.create({
          acao: 'Criação', modulo: 'Compras', tipo_auditoria: 'entidade', entidade: 'OrdemCompra',
          registro_id: created?.id, usuario: user?.full_name || user?.email || 'Usuário', usuario_id: user?.id || null,
          empresa_id: payload.empresa_id, group_id: payload.group_id, data_hora: new Date().toISOString(),
          dados_novos: payload,
        });
      } catch (_) {}
    }
  }, { title: 'Nova Ordem de Compra', width: 1200, height: 780 });

  return (
    <ProtectedSection module="Compras" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout
        title="Compras e Suprimentos"
        subtitle="Fornecedores, OCs e recebimento"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={!contextoValido || !podeCriarOC}
              onClick={handleNovaOC}

            >
              Nova OC
            </Button>
          </div>
        }
      >
        <ModuleKPIs>
          <KPIsCompras
            totalFornecedores={fornecedores.length}
            fornecedoresAtivos={fornecedoresAtivos}
            totalOrdens={ordensCompra.length}
            totalCompras={totalCompras}
            ocsPendentes={ocsPendentes}
            valorEmAberto={valorEmAberto}
            solicitacoesPendentes={solicitacoesPendentes}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridCompras modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}