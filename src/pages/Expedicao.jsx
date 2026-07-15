import React, { Suspense, useState, startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Truck, Package, FileText, Route, Activity, BarChart3, Settings, Map } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useToast } from "@/components/ui/use-toast";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";
const ExpedicaoIAPanel = React.lazy(() => import("@/components/expedicao/ExpedicaoIAPanel"));
import KPIsExpedicao from "@/components/expedicao/expedicao-launchpad/KPIsExpedicao";
import ModulosGridExpedicao from "@/components/expedicao/expedicao-launchpad/ModulosGridExpedicao";
import { useRealtimeEntregas } from '@/components/lib/useRealtimeData';
import IntegracaoRomaneio from "../components/logistica/IntegracaoRomaneio";

const EntregasListagem = React.lazy(() => import("../components/expedicao/EntregasListagem"));
const SeparacaoConferenciaIA = React.lazy(() => import("@/components/expedicao/SeparacaoConferenciaIA"));
const RoteirizacaoInteligente = React.lazy(() => import("@/components/expedicao/RoteirizacaoInteligente"));
const PainelMetricasRealtime = React.lazy(() => import("../components/logistica/PainelMetricasRealtime"));
const DashboardEntregasRealtime = React.lazy(() => import("../components/expedicao/DashboardEntregasRealtime"));
const RelatoriosLogistica = React.lazy(() => import("../components/expedicao/RelatoriosLogistica"));
const ConfiguracaoExpedicao = React.lazy(() => import("../components/expedicao/ConfiguracaoExpedicao"));
const MapaRoteirizacaoIA = React.lazy(() => import("../components/logistica/MapaRoteirizacaoIA"));
const RoteirizacaoMapa = React.lazy(() => import("../components/expedicao/RoteirizacaoMapa"));
const ComprovanteDigital = React.lazy(() => import("../components/expedicao/ComprovanteDigital"));
const FormularioEntrega = React.lazy(() => import("../components/expedicao/FormularioEntrega"));
const LogisticaFinanceiroPanel = React.lazy(() => import("../components/expedicao/financeiro/LogisticaFinanceiroPanel"));
const ConfigFinanceiroLogistica = React.lazy(() => import("../components/expedicao/financeiro/ConfigFinanceiroLogistica"));
const RelatorioFinanceiroLogistica = React.lazy(() => import("../components/expedicao/financeiro/RelatorioFinanceiroLogistica"));

export default function Expedicao() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canSeeExpedicao = hasPermission('Expedição', null, 'visualizar');
  const { openWindow } = useWindow();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { estaNoGrupo, empresaAtual, empresasDoGrupo, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto válido requer empresa OU grupo explícito
  const contextoValido = !!(empresaAtual?.id || groupId);

  // Estados de modais removidos — gerenciados dentro de EntregasListagem via openWindow

  // P2: queries só executam com contexto válido de empresa/grupo
  const queryEnabled = canSeeExpedicao && contextoValido;
  const { data: entregas = [] } = useRLSQuery(
    'Entrega', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2, enabled: queryEnabled }
  );
  const { data: clientes = [] } = useRLSQuery(
    'Cliente', {}, '-created_date', 100,
    { staleTime: 30000, retry: 1, enabled: queryEnabled }
  );
  const { data: pedidos = [] } = useRLSQuery(
    'Pedido', {}, '-created_date', 100,
    { staleTime: 30000, retry: 1, enabled: queryEnabled }
  );
  const { data: romaneios = [] } = useRLSQuery(
    'Romaneio', {}, '-created_date', 50,
    { staleTime: 30000, retry: 1, enabled: queryEnabled }
  );
  const { data: rotas = [] } = useRLSQuery(
    'Rota', {}, '-created_date', 50,
    { staleTime: 30000, retry: 1, enabled: queryEnabled }
  );

  const { data: entregasRealtime, hasChanges } = useRealtimeEntregas(empresaAtual?.id);

  const statusCounts = {
    total: entregas.length,
    aguardando: entregas.filter(e => e.status === "Aguardando Separação").length,
    separacao: entregas.filter(e => e.status === "Em Separação").length,
    pronto: entregas.filter(e => e.status === "Pronto para Expedir").length,
    transito: entregas.filter(e => e.status === "Em Trânsito" || e.status === "Saiu para Entrega").length,
    entregue: entregas.filter(e => e.status === "Entregue").length,
    frustrada: entregas.filter(e => e.status === "Entrega Frustrada").length,
  };

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  // P2: banner sem contexto — consistência com demais módulos
  if (!contextoValido) {
    return (
      <ProtectedSection module="Expedição" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados logísticos.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Entregas',
      description: 'Lista e gestão',
      icon: Truck,
      color: 'blue',
      component: EntregasListagem,
      windowTitle: '🚚 Entregas',
      width: 1600,
      height: 900,
      props: { entregas, clientes, pedidos, empresasDoGrupo, estaNoGrupo }
    },
    {
      title: 'Separação',
      description: 'Picking de pedidos',
      icon: Package,
      color: 'purple',
      component: SeparacaoConferenciaIA,
      windowTitle: '📦 Separação IA',
      width: 1400,
      height: 850,
    },
    {
      title: 'Romaneios',
      description: 'Gestão de cargas',
      icon: FileText,
      color: 'indigo',
      component: IntegracaoRomaneio,
      windowTitle: '📋 Romaneios',
      width: 1400,
      height: 800,
      props: { pedidosSelecionados: pedidos.filter(p => ['Faturado', 'Em Expedição', 'Pronto para Faturar'].includes(p.status)) }
    },
    {
      title: 'Rotas e Mapa',
      description: 'Visualização cartográfica',
      icon: Map,
      color: 'green',
      component: RoteirizacaoMapa,
      windowTitle: '🗺️ Rotas e Mapa',
      width: 1400,
      height: 800,
      props: { entregas: entregas.filter(e => e.status === "Pronto para Expedir"), empresaId: empresaAtual?.id }
    },
    {
      title: 'Roteirização IA',
      description: 'Otimização automática',
      icon: Route,
      color: 'purple',
      component: RoteirizacaoInteligente,
      windowTitle: '🤖 Roteirização IA',
      width: 1400,
      height: 800,
    },
    {
      title: 'Métricas Realtime',
      description: 'Monitoramento ao vivo',
      icon: Activity,
      color: 'green',
      component: PainelMetricasRealtime,
      windowTitle: '⚡ Métricas Tempo Real',
      width: 1200,
      height: 700,
    },
    {
      title: 'Dashboard Logístico',
      description: 'Analytics e métricas',
      icon: BarChart3,
      color: 'blue',
      component: DashboardEntregasRealtime,
      windowTitle: '📊 Dashboard Logístico',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Financeiro Logístico',
      description: 'CR/CP e conciliação',
      icon: BarChart3,
      color: 'teal',
      component: LogisticaFinanceiroPanel,
      windowTitle: '💸 Financeiro Logístico',
      width: 1300,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Relatório Financeiro',
      description: 'KPIs, grupos e detalhamento',
      icon: BarChart3,
      color: 'cyan',
      component: RelatorioFinanceiroLogistica,
      windowTitle: '📊 Relatório Financeiro Logístico',
      width: 1300,
      height: 900
    },
    {
      title: 'Relatórios',
      description: 'Análises e exportação',
      icon: FileText,
      color: 'indigo',
      component: RelatoriosLogistica,
      windowTitle: '📄 Relatórios Logística',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Configurações',
      description: 'Parâmetros e ajustes',
      icon: Settings,
      color: 'purple',
      component: ConfiguracaoExpedicao,
      windowTitle: '⚙️ Configurações',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id }
    },
    {
      // P4: IA insights movido para cá — fora do header fixo
      title: 'IA Logística',
      description: 'Análise preditiva entregas',
      icon: Activity,
      color: 'violet',
      component: ExpedicaoIAPanel,
      windowTitle: '🤖 IA Logística',
      width: 1200,
      height: 700,
      props: { windowMode: true }
    },
  ];

  // P3: RBAC — 'visualizar' é o padrão do sistema (não 'ver')
  const allowedModules = modules.filter(m => hasPermission('Expedição', (m.sectionKey || m.title), 'visualizar') || hasPermission('Expedição', null, 'visualizar'));

  const handleModuleClick = (module) => {
    startTransition(() => {
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        acao: 'Visualização',
        modulo: 'Expedição',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      }).catch(() => {});
      openWindow(
         module.component,
        { ...(module.props || {}), windowMode: true },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `expedicao-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Expedição" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="Expedição e Logística" subtitle="Entregas, romaneios e rotas" actions={<div className="flex items-center gap-2">
          <Button
            size="sm"

            onClick={() => openWindow(FormularioEntrega, {
              windowMode: true,
              empresa_id: empresaAtual?.id || null,
              group_id: groupId || null,
              pedidos,
              clientes,
              onSuccess: () => {}
            }, { title: '🚚 Nova Entrega', width: 1200, height: 800 })}
          >Nova Entrega</Button>
        </div>}>
        {/* P4: ExpedicaoIAPanel removido do header fixo (pesado) — KPIs essenciais apenas */}
        <ModuleKPIs>
          <KPIsExpedicao statusCounts={statusCounts} />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridExpedicao modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>

          {/* P1/P4: Dialogs de entrega inline removidos — agora abertos via openWindow nas próprias EntregasListagem */}
    </ErrorBoundary>
    </ProtectedSection>
  );
}