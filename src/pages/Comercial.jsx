import React, { startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { Button } from "@/components/ui/button";
import ValidarPedidosExternos from "@/components/comercial/ValidarPedidosExternos";
import HeaderComercialCompacto from "@/components/comercial/comercial-launchpad/HeaderComercialCompacto";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import ModulosGridComercial from "@/components/comercial/comercial-launchpad/ModulosGridComercial";
import useComercialPageData from "@/components/comercial/page/useComercialPageData";
import useComercialPedidoWindows from "@/components/comercial/page/useComercialPedidoWindows";
import { buildComercialModules } from "@/components/comercial/page/comercialModulesConfig";
import ComercialKPIsStrip from "@/components/comercial/page/ComercialKPIsStrip";

export default function Comercial() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canViewComercial = (section = null) => hasPermission('Comercial', section, 'visualizar');
  const canSeeComercial = canViewComercial();
  const { openWindow } = useWindow();
  const { user } = useUser();

  const {
    empresaAtual, grupoAtual, bloqueadoSemEmpresa,
    clientes, pedidos, refetchPedidos,
    comissoes, notasFiscais, tabelasPreco, empresas,
    derived, totalPedidosServer, totalClientesServer,
  } = useComercialPageData({ canSeeComercial });

  const { handleCreateNewPedido, handleEditPedido } = useComercialPedidoWindows({ clientes, refetchPedidos });

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (bloqueadoSemEmpresa) {
    return (
      <ProtectedSection module="Comercial" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados do módulo.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = buildComercialModules({
    clientes,
    pedidos,
    empresas,
    comissoes,
    notasFiscais,
    tabelasPreco,
    pedidosEntrega: derived.pedidosEntrega,
    pedidosRetirada: derived.pedidosRetirada,
    pedidosPendentesAprovacao: derived.pedidosPendentesAprovacao,
    onCreatePedido: handleCreateNewPedido,
    onEditPedido: handleEditPedido,
  });

  const allowedModules = modules
    .map((m) => ({ ...m, permissionKey: `Comercial.${m.sectionKey || m.title}.visualizar` }))
    .filter(m => canViewComercial(m.sectionKey || m.title));

  // Vol 5.1: Drill-down de KPIs — clicar no card abre o módulo de origem
  const handleKPIDrillDown = (dataKey) => {
    const moduleMap = {
      clientes: modules.find(m => m.title === 'Clientes'),
      pedidos: modules.find(m => m.title === 'Pedidos'),
      vendas: modules.find(m => m.title === 'Pedidos'),
      ticket: modules.find(m => m.title === 'Pedidos'),
      faturado: modules.find(m => m.title === 'Notas Fiscais'),
      pendente: modules.find(m => m.title === 'Pedidos'),
      peso: modules.find(m => m.title === 'Pedidos'),
      margem: modules.find(m => m.title === 'Pedidos'),
      // V21.4: Novos drill-downs
      etapas: modules.find(m => m.title === 'Pedidos'),
      producao: modules.find(m => m.title === 'Pedidos'),
      expedicao: modules.find(m => m.title === 'Logística Entrega'),
    };
    const targetModule = moduleMap[dataKey];
    if (targetModule) {
      handleModuleClick(targetModule);
    }
  };

  const handleModuleClick = (module) => {
    if (!canViewComercial(module.sectionKey || module.title)) {
      toast.error('Sem permissao para visualizar esta area do Comercial.');
      return;
    }
    startTransition(() => {
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        acao: 'Visualização',
        modulo: 'Comercial',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null,
        data_hora: new Date().toISOString(),
      }).catch((auditErr) => { console.error('AuditLog falhou (Comercial module click):', auditErr); });
      openWindow(
        module.component,
        { ...(module.props || {}), windowMode: true },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `comercial-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Comercial" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout
              title="Comercial e Vendas"
              subtitle="Vendas, clientes e canais"
              actions={<div className="flex items-center gap-2">
                <ProtectedSection module="Comercial" section="Pedidos" action="criar">
                  <Button onClick={handleCreateNewPedido} className="bg-indigo-600 hover:bg-indigo-700">Novo Pedido</Button>
                </ProtectedSection>
                <ProtectedSection module="Comercial" section="Pedidos" action="visualizar">
                  <Button
                    variant="outline"
                    onClick={() => openWindow(ValidarPedidosExternos, { windowMode: true }, { title: 'Validar Pedidos Externos', width: 1300, height: 800 })}
                  >Validar Pedido Externo</Button>
                </ProtectedSection>
              </div>}
            >
              <ModuleKPIs>
                <ComercialKPIsStrip
                  derived={derived}
                  totalPedidosServer={totalPedidosServer}
                  totalClientesServer={totalClientesServer}
                  onDrillDown={handleKPIDrillDown}
                />
              </ModuleKPIs>
              <ModuleContent>
                <ModuleTabs
                  listagem={<ModulosGridComercial modules={allowedModules} onModuleClick={handleModuleClick} />}
                />
              </ModuleContent>
            </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}