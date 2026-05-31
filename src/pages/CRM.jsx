import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, MessageSquare, Mail, Sparkles, AlertTriangle, BarChart3, Users } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderCRMCompacto from "@/components/crm/crm-launchpad/HeaderCRMCompacto";
import KPIsCRM from "@/components/crm/crm-launchpad/KPIsCRM";
import ModulosGridCRM from "@/components/crm/crm-launchpad/ModulosGridCRM";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";
import useCRMDerivedData from "@/components/crm/hooks/useCRMDerivedData";
import CRMIAPanel from "@/components/crm/CRMIAPanel";
import CRMScoreClienteWidget from "@/components/crm/CRMScoreClienteWidget";
const OportunidadesListagem = React.lazy(() => import("../components/crm/OportunidadesListagem"));
const InteracoesListagem = React.lazy(() => import("../components/crm/InteracoesListagem"));
import { useUser } from "@/components/lib/UserContext";
import { CRM_CAMPAIGN_LIMIT, CRM_LIST_LIMIT, crmQueryDefaults } from "@/components/crm/config/crmQueryConfig";

const FunilVisual = React.lazy(() => import("../components/crm/FunilVisual"));

const IALeadsPriorizacao = React.lazy(() => import("../components/crm/IALeadsPriorizacao"));
const IAChurnDetection = React.lazy(() => import("../components/crm/IAChurnDetection"));

export default function CRMPage() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filterInContext, getFiltroContexto, empresaAtual, estaNoGrupo, grupoAtual } = useContextoVisual();
  const bloqueadoSemEmpresa = !estaNoGrupo && !empresaAtual;
  const { openWindow } = useWindow();
  const { user } = useUser();

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: () => filterInContext('Oportunidade', {}, '-created_date', CRM_LIST_LIMIT),
    ...crmQueryDefaults,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['interacoes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: () => filterInContext('Interacao', {}, '-created_date', CRM_LIST_LIMIT),
    ...crmQueryDefaults,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: () => filterInContext('Campanha', {}, '-created_date', CRM_CAMPAIGN_LIMIT, 'empresa_dona_id'),
    ...crmQueryDefaults,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: () => filterInContext('Cliente', {}, '-created_date', CRM_LIST_LIMIT),
    ...crmQueryDefaults,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: totalClientes = 0 } = useQuery({
    queryKey: ['clientes-count-crm', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: getFiltroContexto('empresa_id', true)
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 300000,
    retry: false,
    enabled: !bloqueadoSemEmpresa
  });

  // Dados já vêm filtrados do servidor
  const oportunidadesFiltradas = oportunidades;
  const interacoesFiltradas = interacoes;
  const campanhasFiltradas = campanhas;

  const { totalOportunidades, oportunidadesAbertas, valorPipeline, valorPonderado, taxaConversao } = useCRMDerivedData({ oportunidades: oportunidadesFiltradas });

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bloqueadoSemEmpresa) {
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
      props: { oportunidades: oportunidadesFiltradas, windowMode: true }
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
      title: 'Campanhas',
      description: 'Marketing ativo',
      icon: Mail,
      color: 'pink',
      component: () => <div className="p-4">Campanhas Marketing (em desenvolvimento)</div>,
      windowTitle: '📧 Campanhas',
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
      props: { oportunidades: oportunidadesFiltradas, windowMode: true }
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
  ];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
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
      <ModuleLayout title="CRM - Relacionamento" subtitle="Relacionamento, funil e campanhas" actions={<div className="flex items-center gap-2"><Button size="sm" onClick={() => base44.analytics.track({ eventName: 'crm_primary_action' })}>Novo</Button></div>}>
        <ModuleKPIs>
          <CRMIAPanel oportunidades={oportunidadesFiltradas} clientes={clientes} interacoes={interacoesFiltradas} />
          <CRMScoreClienteWidget compact />
          <KPIsCRM
            oportunidadesAbertas={oportunidadesAbertas}
            totalOportunidades={totalOportunidades}
            valorPipeline={valorPipeline}
            valorPonderado={valorPonderado}
            taxaConversao={taxaConversao}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridCRM modules={modules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}