import React from "react";
import { base44 } from "@/api/base44Client";
import { Factory, LayoutGrid, Clock, CheckCircle, AlertTriangle, Settings, BarChart3, Activity, Zap, FileText, Sparkles } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import HeaderProducaoCompacto from "@/components/producao/producao-launchpad/HeaderProducaoCompacto";
import KPIsProducao from "@/components/producao/producao-launchpad/KPIsProducao";
import ModulosGridProducao from "@/components/producao/producao-launchpad/ModulosGridProducao";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";
import ProducaoIAPanel from "@/components/producao/ProducaoIAPanel";

const KanbanProducaoInteligente = React.lazy(() => import("@/components/producao/KanbanProducaoInteligente"));
const ApontamentoProducao = React.lazy(() => import("@/components/producao/ApontamentoProducao"));
const ControleRefugo = React.lazy(() => import("@/components/producao/ControleRefugo"));
const RelatoriosProducao = React.lazy(() => import("@/components/producao/RelatoriosProducao"));
const ConfiguracaoProducao = React.lazy(() => import("../components/producao/ConfiguracaoProducao"));
const DashboardProducaoRealtime = React.lazy(() => import("../components/producao/DashboardProducaoRealtime"));
const IADiagnosticoEquipamentos = React.lazy(() => import("../components/producao/IADiagnosticoEquipamentos"));
const DocumentosProducao = React.lazy(() => import("../components/producao/DocumentosProducao"));

export default function Producao() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();
  const { user } = useUser();

  const { data: ordensProducao = [] } = useRLSQuery(
    'OrdemProducao', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2 }
  );

  const totalOrdensProducao = ordensProducao.length;

  const totalOPs = ordensProducao.length;
  const opsLiberadas = ordensProducao.filter(op => op.status === "Liberada").length;
  const opsEmProducao = ordensProducao.filter(op =>
    ["Em Corte", "Em Dobra", "Em Armação"].includes(op.status)
  ).length;
  const opsFinalizadas = ordensProducao.filter(op => op.status === "Finalizada").length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Kanban',
      description: 'Visão drag-drop',
      icon: LayoutGrid,
      color: 'blue',
      component: KanbanProducaoInteligente,
      windowTitle: '📋 Kanban Produção',
      width: 1600,
      height: 900,
      props: { windowMode: true }
    },
    {
      title: 'Ordens Produção',
      description: 'Listagem OPs',
      icon: Factory,
      color: 'orange',
      component: React.lazy(() => import("@/components/producao/OrdensProducaoListagem")),
      windowTitle: '🏭 Ordens de Produção',
      width: 1500,
      height: 850,
    },
    {
      title: 'Apontamentos',
      description: 'Registro produção',
      icon: Clock,
      color: 'purple',
      component: ApontamentoProducao,
      windowTitle: '⏱️ Apontamentos',
      width: 1300,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Controle Refugo',
      description: 'Perdas e análise',
      icon: AlertTriangle,
      color: 'red',
      component: ControleRefugo,
      windowTitle: '⚠️ Controle de Refugo',
      width: 1400,
      height: 800,
      props: { ops: ordensProducao, windowMode: true }
    },
    {
      title: 'Dashboard',
      description: 'Métricas e análise IA',
      icon: Activity,
      color: 'green',
      component: DashboardProducaoRealtime,
      windowTitle: '📊 Dashboard Produção',
      width: 1500,
      height: 850,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'IoT Equipamentos',
      description: 'Diagnóstico IA',
      icon: Zap,
      color: 'indigo',
      component: IADiagnosticoEquipamentos,
      windowTitle: '⚡ IoT & Equipamentos',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Documentos',
      description: 'Etiquetas e docs',
      icon: FileText,
      color: 'blue',
      component: DocumentosProducao,
      windowTitle: '📄 Documentos Produção',
      width: 1200,
      height: 700,
      props: { windowMode: true }
    },
    {
      title: 'Relatórios',
      description: 'Análises produção',
      icon: BarChart3,
      color: 'purple',
      component: RelatoriosProducao,
      windowTitle: '📈 Relatórios Produção',
      width: 1400,
      height: 800,
      props: { ops: ordensProducao, windowMode: true }
    },
    {
      title: 'Configurações',
      description: 'Setup produção',
      icon: Settings,
      color: 'purple',
      component: ConfiguracaoProducao,
      windowTitle: '⚙️ Configurações',
      width: 1200,
      height: 700,
      props: { windowMode: true }
    },
  ];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        acao: 'Visualização',
        modulo: 'Produção',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      });
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
          uniqueKey: `producao-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Produção" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout
        title="Produção"
        subtitle="Chão de fábrica, OPs e desempenho"
        actions={<div className="flex items-center gap-2"><Button size="sm" onClick={() => base44.analytics.track({ eventName: 'producao_primary_action' })}>Nova OP</Button></div>}
      >
        <ModuleKPIs>
          <ProducaoIAPanel ordensProducao={ordensProducao} />
          <KPIsProducao
            totalOPs={totalOPs}
            opsLiberadas={opsLiberadas}
            opsEmProducao={opsEmProducao}
            opsFinalizadas={opsFinalizadas}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridProducao modules={modules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}