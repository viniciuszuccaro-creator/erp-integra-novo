import React, { startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Settings, Book, BarChart3, Upload, Sparkles } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import KPIsFiscal from "@/components/fiscal/fiscal-launchpad/KPIsFiscal";
import ModulosGridFiscal from "@/components/fiscal/fiscal-launchpad/ModulosGridFiscal";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import { Button } from "@/components/ui/button";
import NotasFiscaisTab from "@/components/comercial/NotasFiscaisTab";
import NotaFiscalFormCompleto from "@/components/comercial/NotaFiscalFormCompleto";
const FiscalIAPanel = React.lazy(() => import("@/components/fiscal/FiscalIAPanel"));

const ConfigFiscalAutomatica = React.lazy(() => import("../components/fiscal/ConfigFiscalAutomatica"));
const PlanoDeContasTree = React.lazy(() => import("../components/fiscal/PlanoDeContasTree"));
const RelatorioDRE = React.lazy(() => import("../components/relatorios/RelatorioDRE"));
const MotorFiscalInteligente = React.lazy(() => import("@/components/fiscal/MotorFiscalInteligente"));
const ExportacaoSPED = React.lazy(() => import("../components/fiscal/ExportacaoSPED"));
const ImportarXMLNFe = React.lazy(() => import('../components/fiscal/ImportarXMLNFe'));

export default function FiscalPage() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { openWindow } = useWindow();
  const { user } = useUser();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto obrigatório antes de qualquer query
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: notasFiscais = [] } = useRLSQuery(
    'NotaFiscal', {}, '-created_date', 100,
    { staleTime: 30000, retry: 2, enabled: contextoValido }
  );

  const statusCounts = {
    total: notasFiscais.length,
    autorizadas: notasFiscais.filter(n => n.status === "Autorizada").length,
    rascunho: notasFiscais.filter(n => n.status === "Rascunho").length,
    rejeitadas: notasFiscais.filter(n => n.status === "Rejeitada").length,
    canceladas: notasFiscais.filter(n => n.status === "Cancelada").length
  };

  if (loadingPermissions) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // P2: banner sem contexto
  if (!contextoValido) {
    return (
      <ProtectedSection module="Fiscal" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados fiscais.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Notas Fiscais',
      description: 'NF-e emitidas',
      icon: FileText,
      color: 'blue',
      component: NotasFiscaisTab,
      windowTitle: '📄 Notas Fiscais',
      width: 1500,
      height: 850,
      props: { notasFiscais, windowMode: true }
    },
    {
      title: 'Motor Fiscal IA',
      description: 'Validação inteligente',
      icon: Sparkles,
      color: 'purple',
      component: MotorFiscalInteligente,
      windowTitle: '🤖 Motor Fiscal IA',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Configuração',
      description: 'Config fiscal automática',
      icon: Settings,
      color: 'cyan',
      component: ConfigFiscalAutomatica,
      windowTitle: '⚙️ Configuração Fiscal',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'Plano de Contas',
      description: 'Estrutura contábil',
      icon: Book,
      color: 'indigo',
      component: PlanoDeContasTree,
      windowTitle: '📚 Plano de Contas',
      width: 1200,
      height: 800,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'DRE Gerencial',
      description: 'Demonstração resultado',
      icon: BarChart3,
      color: 'green',
      component: RelatorioDRE,
      windowTitle: '📊 DRE Gerencial',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'SPED Fiscal',
      description: 'Exportação SPED',
      icon: FileText,
      color: 'orange',
      component: ExportacaoSPED,
      windowTitle: '📁 SPED Fiscal',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'Importar XML',
      description: 'Upload NF-e',
      icon: Upload,
      color: 'blue',
      component: ImportarXMLNFe,
      windowTitle: '📤 Importar XML NF-e',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'IA Fiscal',
      description: 'Validação inteligente NF-e',
      icon: Sparkles,
      color: 'violet',
      component: FiscalIAPanel,
      windowTitle: '🤖 IA Fiscal Insights',
      width: 1200,
      height: 700,
      props: { notas: notasFiscais, empresaAtual, windowMode: true }
    },
  ];

  // P3: fallback para permissão global do módulo
  const allowedModules = modules.filter(m =>
    hasPermission('Fiscal', (m.sectionKey || m.title), 'visualizar') ||
    hasPermission('Fiscal', null, 'visualizar')
  );

  const handleModuleClick = (module) => {
    startTransition(() => {
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        acao: 'Visualização',
        modulo: 'Fiscal',
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
          uniqueKey: `fiscal-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Fiscal" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="Fiscal e Tributário" subtitle="NF-e, tributos e relatórios" actions={<div className="flex items-center gap-2">
          <Button
            size="sm"
            data-permission="Fiscal.NotaFiscal.criar"
            onClick={() => openWindow(NotaFiscalFormCompleto, {
              windowMode: true,
              empresa_id: empresaAtual?.id || null,
              group_id: groupId || null,
              onSuccess: () => {}
            }, { title: '📄 Nova NF-e', width: 1200, height: 800 })}
          >Nova NF-e</Button>
        </div>}>
        <ModuleKPIs>
          {/* P4: FiscalIAPanel movido para módulo no grid — header mais leve */}
          <KPIsFiscal
            total={statusCounts.total}
            autorizadas={statusCounts.autorizadas}
            rascunho={statusCounts.rascunho}
            rejeitadas={statusCounts.rejeitadas}
            canceladas={statusCounts.canceladas}
          />
        </ModuleKPIs>
        <ModuleContent>
          <ModuleTabs
            listagem={<ModulosGridFiscal modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}