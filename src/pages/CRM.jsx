import React, { startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Target, MessageSquare, Sparkles, AlertTriangle, Megaphone, PlusCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import KPIsCRM from "@/components/crm/crm-launchpad/KPIsCRM";
import ModulosGridCRM from "@/components/crm/crm-launchpad/ModulosGridCRM";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";
import useCRMDerivedData from "@/components/crm/hooks/useCRMDerivedData";
import { CRM_CAMPAIGN_LIMIT, CRM_LIST_LIMIT } from "@/components/crm/config/crmQueryConfig";

const OportunidadesListagem = React.lazy(() => import("../components/crm/OportunidadesListagem"));
const InteracoesListagem = React.lazy(() => import("../components/crm/InteracoesListagem"));
const FunilVisual = React.lazy(() => import("../components/crm/FunilVisual"));
const IALeadsPriorizacao = React.lazy(() => import("../components/crm/IALeadsPriorizacao"));
const IAChurnDetection = React.lazy(() => import("../components/crm/IAChurnDetection"));
const OportunidadeForm = React.lazy(() => import("../components/crm/OportunidadeForm"));
const CampanhaForm = React.lazy(() => import('../components/crm/CampanhaForm'));
const CRMIAPanel = React.lazy(() => import('@/components/crm/CRMIAPanel'));

export default function CRMPage() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { empresaAtual, estaNoGrupo, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto válido requer empresa OU grupo explícito
  const contextoValido = !!(empresaAtual?.id || groupId);
  const bloqueadoSemEmpresa = !estaNoGrupo && !empresaAtual;
  const { openWindow } = useWindow();
  const { user } = useUser();

  // P2: Queries via useRLSQuery — só executam com contextoValido
  const { data: oportunidades = [] } = useRLSQuery(
    'Oportunidade', {}, '-created_date', CRM_LIST_LIMIT,
    { staleTime: 60000, enabled: contextoValido }
  );
  const { data: interacoes = [] } = useRLSQuery(
    'Interacao', {}, '-created_date', CRM_LIST_LIMIT,
    { staleTime: 60000, enabled: contextoValido }
  );
  const { data: campanhas = [] } = useRLSQuery(
    'Campanha', {}, '-created_date', CRM_CAMPAIGN_LIMIT,
    { staleTime: 60000, enabled: contextoValido }
  );
  const { data: clientes = [] } = useRLSQuery(
    'Cliente', {}, '-created_date', CRM_LIST_LIMIT,
    { staleTime: 60000, enabled: contextoValido }
  );

  const { totalOportunidades, oportunidadesAbertas, valorPipeline, valorPonderado, taxaConversao } = useCRMDerivedData({ oportunidades });

  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa' || c.status === 'Em andamento').length;
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;

  if (loadingPermissions) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contextoValido) {
    return (
      <ProtectedSection module="CRM" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados do módulo.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Funil Visual',
      description: 'Drag-drop etapas',
      icon: TrendingUp,
      color: 'blue',
      component: FunilVisual,
      windowTitle: '🎯 Funil Visual',
      width: 1600,
      height: 900,
      props: { oportunidades, windowMode: true }
    },
    {
      title: 'Oportunidades',
      description: 'Gestão completa',
      icon: Target,
      color: 'indigo',
      component: OportunidadesListagem,
      windowTitle: '📊 Oportunidades',
      width: 1500,
      height: 850,
    },
    {
      title: 'Interações',
      description: 'Histórico contatos',
      icon: MessageSquare,
      color: 'green',
      component: InteracoesListagem,
      windowTitle: '💬 Interações',
      width: 1400,
      height: 800,
    },
    {
      title: 'IA Leads',
      description: 'Priorização automática',
      icon: Sparkles,
      color: 'purple',
      component: IALeadsPriorizacao,
      windowTitle: '🤖 IA Leads',
      width: 1400,
      height: 800,
      props: { oportunidades, windowMode: true }
    },
    {
      title: 'IA Churn',
      description: 'Detecção perda',
      icon: AlertTriangle,
      color: 'orange',
      component: IAChurnDetection,
      windowTitle: '⚠️ IA Churn',
      width: 1400,
      height: 800,
      props: { clientes, windowMode: true }
    },
    {
      title: 'Campanhas',
      description: `${campanhasAtivas} ativas`,
      icon: Megaphone,
      color: 'pink',
      component: CampanhaForm,
      windowTitle: '📣 Campanhas CRM',
      width: 1200,
      height: 750,
      props: { windowMode: true },
      badge: campanhasAtivas > 0 ? `${campanhasAtivas} ativas` : null,
    },
    {
      // P4: IA insights movido para cá — fora do header fixo
      title: 'IA CRM',
      description: 'Churn, leads e análise',
      icon: Sparkles,
      color: 'violet',
      component: CRMIAPanel,
      windowTitle: '🤖 IA CRM Insights',
      width: 1300,
      height: 750,
      props: { windowMode: true }
    },
  ];

  // P3: RBAC — filtrar módulos pelo perfil do usuário
  const allowedModules = modules.filter(m => hasPermission('CRM', (m.sectionKey || m.title), 'visualizar') || hasPermission('CRM', null, 'visualizar'));

  const handleModuleClick = (module) => {
    startTransition(() => {
      // Auditoria de abertura de seção
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        acao: 'Visualização',
        modulo: 'CRM',
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
          uniqueKey: `crm-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="CRM" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="CRM - Relacionamento" subtitle="Relacionamento, funil e campanhas" actions={
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openWindow(OportunidadeForm, { windowMode: true, onSuccess: () => {} }, { title: '🎯 Nova Oportunidade', width: 1000, height: 700 })}>
            <PlusCircle className="w-4 h-4 mr-1" /> Oportunidade
          </Button>
        </div>
      }>
        {/* P4: CRMIAPanel e CRMScoreClienteWidget removidos do header fixo — header mais leve */}
        <ModuleKPIs>
          <KPIsCRM
            oportunidadesAbertas={oportunidadesAbertas}
            totalOportunidades={totalOportunidades}
            valorPipeline={valorPipeline}
            valorPonderado={valorPonderado}
            taxaConversao={taxaConversao}
            totalClientes={clientesAtivos}
            campanhasAtivas={campanhasAtivas}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridCRM modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}