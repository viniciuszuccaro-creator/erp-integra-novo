import React, { startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Clock, Calendar, Activity, Trophy, UserCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import KPIsRH from "@/components/rh/rh-launchpad/KPIsRH";
const FeriasTab = React.lazy(() => import('@/components/rh/FeriasTab'));
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import ModulosGridRH from "@/components/rh/rh-launchpad/ModulosGridRH";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
// P4: RHIAPanel movido para uso sob demanda (janela), não mais no header fixo

const PontoTab = React.lazy(() => import("../components/rh/PontoTab"));
const GameficacaoProducao = React.lazy(() => import("@/components/rh/GameficacaoProducao"));
const MonitoramentoRHInteligente = React.lazy(() => import("@/components/rh/MonitoramentoRHInteligente"));
const PontoEletronicoBiometrico = React.lazy(() => import("@/components/rh/PontoEletronicoBiometrico"));
const DashboardRHRealtime = React.lazy(() => import("../components/rh/DashboardRHRealtime"));
const RHIAInsights = React.lazy(() => import('@/components/rh/RHIAPanel'));

const ColaboradoresWindow = () => (
  <div className="h-full w-full">
    <VisualizadorUniversalEntidade
      nomeEntidade="Colaborador"
      tituloDisplay="Colaboradores"
      icone={Users}
      camposPrincipais={["nome_completo","cpf","email","cargo","departamento","status","telefone"]}
      componenteEdicao={ColaboradorForm}
      windowMode
    />
  </div>
);

export default function RH() {
  const { hasPermission, canCreate, isLoading: loadingPermissions } = usePermissions();
  const canSeeRH = hasPermission('RH', null, 'visualizar');
  const { openWindow } = useWindow();
  const { user } = useUser();

  // P2: contexto multiempresa obrigatório antes de qualquer query
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: colaboradores = [] } = useRLSQuery(
    'Colaborador', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2, enabled: canSeeRH && contextoValido }
  );
  const { data: pontos = [] } = useRLSQuery(
    'Ponto', {}, '-data', 100,
    { staleTime: 30000, retry: 1, enabled: canSeeRH && contextoValido }
  );
  const { data: ferias = [] } = useRLSQuery(
    'Ferias', {}, '-created_date', 50,
    { staleTime: 30000, retry: 1, enabled: canSeeRH && contextoValido }
  );

  const totalColaboradores = colaboradores.length;
  const colaboradoresAtivos = colaboradores.filter(c => (c.status || '').toString().trim().toLowerCase() === 'ativo').length;
  const feriasAprovadas = ferias.filter(f => f.status === "Aprovada").length;
  const feriasPendentes = ferias.filter(f => f.status === "Solicitada").length;

  if (loadingPermissions) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // P2: banner sem contexto (consistência com Comercial/Financeiro)
  if (!contextoValido) {
    return (
      <ProtectedSection module="RH" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados de RH.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Colaboradores',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'purple',
      component: ColaboradoresWindow,
      windowTitle: '👥 Colaboradores',
      width: 1400,
      height: 800,
    },
    {
      title: 'Ponto',
      description: 'Registro de ponto',
      icon: Clock,
      color: 'blue',
      component: PontoTab,
      windowTitle: '⏰ Ponto',
      width: 1400,
      height: 800,
      props: { pontos, colaboradores, canApprove: true, windowMode: true }
    },
    {
      title: 'Ponto Biométrico',
      description: 'Reconhecimento facial',
      icon: UserCircle,
      color: 'indigo',
      component: PontoEletronicoBiometrico,
      windowTitle: '🔒 Ponto Biométrico',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Dashboard RH',
      description: 'Métricas realtime',
      icon: Activity,
      color: 'green',
      component: DashboardRHRealtime,
      windowTitle: '📊 Dashboard RH',
      width: 1500,
      height: 850,
      props: { windowMode: true }
    },
    {
      title: 'Férias',
      description: 'Solicitações e aprovações',
      icon: Calendar,
      color: 'orange',
      component: FeriasTab,
      windowTitle: '🏖️ Férias',
      width: 1200,
      height: 700,
      badge: feriasPendentes > 0 ? `${feriasPendentes} pendentes` : null
    },
    {
      title: 'Rankings',
      description: 'Gamificação produção',
      icon: Trophy,
      color: 'orange',
      component: GameficacaoProducao,
      windowTitle: '🏆 Rankings e Gamificação',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Monitoramento IA',
      description: 'Análise inteligente',
      icon: Activity,
      color: 'cyan',
      component: MonitoramentoRHInteligente,
      windowTitle: '🤖 Monitoramento IA',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      // P4: IA insights movido para cá — fora do header fixo
      title: 'IA RH Insights',
      description: 'Análise preditiva de colaboradores',
      icon: Activity,
      color: 'violet',
      component: RHIAInsights,
      windowTitle: '🤖 IA RH — Insights',
      width: 1200,
      height: 700,
      props: { colaboradores, pontos, ferias, windowMode: true }
    },
  ];

  // P3: fallback para admin e permissão global do módulo
  const allowedModules = modules.filter(m =>
    hasPermission('RH', (m.sectionKey || m.title), 'visualizar') ||
    hasPermission('RH', null, 'visualizar')
  );

  const handleModuleClick = (module) => {
    startTransition(() => {
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: groupId || null,
        acao: 'Visualização',
        modulo: 'RH',
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
          uniqueKey: `rh-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="RH" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="Recursos Humanos" subtitle="Colaboradores, ponto e indicadores" actions={
        <div className="flex items-center gap-2">
          {/* P3: RBAC granular — Colaboradores.criar */}
          {canCreate('RH', 'Colaboradores') && contextoValido && (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => openWindow(ColaboradorForm, {
                windowMode: true,
                empresa_id: empresaAtual?.id || null,
                group_id: groupId || null,
                onSuccess: () => {}
              }, { title: '👤 Novo Colaborador', width: 1200, height: 750 })}
            >
              + Colaborador
            </Button>
          )}
        </div>
      }>
        <ModuleKPIs>
          {/* P4: RHIAPanel removido do header (pesado) — KPIs essenciais apenas */}
          <KPIsRH
            colaboradoresAtivos={colaboradoresAtivos}
            totalColaboradores={totalColaboradores}
            feriasAprovadas={feriasAprovadas}
            feriasPendentes={feriasPendentes}
            totalPontos={pontos.length}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridRH modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}