import React, { Suspense, useEffect, startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Users, ShoppingCart, FileText, TrendingUp, ShieldCheck, Truck, Package, AlertCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { toast } from "sonner";
import PedidoFormCompleto from "../components/comercial/PedidoFormCompleto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ValidarPedidosExternos from "@/components/comercial/ValidarPedidosExternos";
import HeaderComercialCompacto from "@/components/comercial/comercial-launchpad/HeaderComercialCompacto";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsComercial from "@/components/comercial/comercial-launchpad/KPIsComercial";
import ModulosGridComercial from "@/components/comercial/comercial-launchpad/ModulosGridComercial";
import useComercialDerivedData from "@/components/comercial/hooks/useComercialDerivedData";
import {
  COMERCIAL_COMPANY_LIMIT,
  COMERCIAL_EXTERNAL_LIMIT,
  COMERCIAL_LIST_LIMIT,
  COMERCIAL_SHORT_LIMIT,
} from "@/components/comercial/config/comercialQueryConfig";

const ClientesTab = React.lazy(() => import("../components/comercial/ClientesTab"));
const PedidosTab = React.lazy(() => import("../components/comercial/PedidosTab"));
const ComissoesTab = React.lazy(() => import("../components/comercial/ComissoesTab"));
const NotasFiscaisTab = React.lazy(() => import("../components/comercial/NotasFiscaisTab"));
const TabelasPrecoTab = React.lazy(() => import("../components/comercial/TabelasPrecoTab"));
const CentralAprovacoesManager = React.lazy(() => import("../components/comercial/CentralAprovacoesManager"));
const PedidosEntregaTab = React.lazy(() => import("../components/comercial/PedidosEntregaTab"));
const PedidosRetiradaTab = React.lazy(() => import("../components/comercial/PedidosRetiradaTab"));
const MonitoramentoCanaisRealtime = React.lazy(() => import("@/components/comercial/MonitoramentoCanaisRealtime"));

export default function Comercial() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canViewComercial = (section = null) => hasPermission('Comercial', section, 'visualizar');
  const canSeeComercial = canViewComercial();
  const { openWindow, closeWindow } = useWindow();
  const { createInContext, updateInContext, empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  // groupId já declarado acima via contextoValido
  const { user } = useUser();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto válido inclui grupo explícito (não só empresa)
  const contextoValido = !!(empresaAtual?.id || groupId);
  const bloqueadoSemEmpresa = !contextoValido;

  const { data: clientes = [] } = useRLSQuery(
    'Cliente', {}, '-created_date', COMERCIAL_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: pedidos = [], refetch: refetchPedidos } = useRLSQuery(
    'Pedido', {}, '-created_date', COMERCIAL_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo)) return;
    if (!base44.entities?.Pedido?.subscribe) return;
    const un = base44.entities.Pedido.subscribe(() => {
      try { queryClient.invalidateQueries({ queryKey: ['Pedido'] }); } catch (_) {}
    });
    return () => { try { un?.(); } catch (_) {} };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo, queryClient]);

  // Realtime adicional: Comissões e NF-e
  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo)) return;
    const unsubs = [];
    if (base44.entities?.Comissao?.subscribe) {
      unsubs.push(base44.entities.Comissao.subscribe(() => {
        try { queryClient.invalidateQueries({ queryKey: ['comissoes'] }); } catch (_) {}
      }));
    }
    if (base44.entities?.NotaFiscal?.subscribe) {
      unsubs.push(base44.entities.NotaFiscal.subscribe(() => {
        try { queryClient.invalidateQueries({ queryKey: ['notasFiscais'] }); } catch (_) {}
      }));
    }
    return () => { unsubs.forEach(u => { try { u && u(); } catch (_) {} }); };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo]);

  const { data: comissoes = [] } = useRLSQuery(
    'Comissao', {}, '-created_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: notasFiscais = [] } = useRLSQuery(
    'NotaFiscal', {}, '-created_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: tabelasPreco = [] } = useRLSQuery(
    'TabelaPreco', {}, '-updated_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: empresas = [] } = useRLSQuery(
    'Empresa', {}, '-created_date', COMERCIAL_COMPANY_LIMIT,
    { staleTime: 30000, enabled: Boolean(canSeeComercial && contextoValido) }
  );

  const { data: pedidosExternos = [] } = useRLSQuery(
    'PedidoExterno', {}, '-created_date', COMERCIAL_EXTERNAL_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const {
    pedidosExternosPendentes,
    totalVendas,
    ticketMedio,
    clientesAtivos,
    pedidosPendentesAprovacao,
    pedidosEntrega,
    pedidosRetirada,
    valorFaturado,
    valorPendenteFaturamento,
    pesoTotalVendido,
    pedidosFaturados,
    pedidosFaturamentoParcial,
    pedidosCancelados,
    margemBruta,
    margemPercentual,
  } = useComercialDerivedData({ pedidos, clientes, pedidosExternos });

  const handleCreateNewPedido = () => {
    let pedidoCriado = false;
    openWindow(
      PedidoFormCompleto,
      {
        clientes,
        windowMode: true,
        pedido: { status: 'Rascunho' },
        onSubmit: async (formData) => {
          if (pedidoCriado) return;
          pedidoCriado = true;
          try {
            const created = await createInContext('Pedido', {
              ...formData,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id
            });
            toast.success("Pedido criado!");
            await refetchPedidos();
          } catch (error) {
            pedidoCriado = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: ' Novo Pedido', width: 1400, height: 800 }
    );
  };

  const handleEditPedido = (pedido) => {
    let atualizacaoEmAndamento = false;
    let windowIdRef = openWindow(
      PedidoFormCompleto,
      {
        pedido,
        clientes,
        windowMode: true,
        onSubmit: async (formData) => {
          if (atualizacaoEmAndamento) return;
          atualizacaoEmAndamento = true;
          try {
            await updateInContext('Pedido', formData.id, formData);
            toast.success("Pedido atualizado!");
            await refetchPedidos();
            if (windowIdRef) closeWindow(windowIdRef);
          } catch (error) {
            atualizacaoEmAndamento = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: `Editar: ${pedido.numero_pedido}`, width: 1400, height: 800 }
    );
  };

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

  const modules = [
    {
      title: 'Clientes',
      sectionKey: 'Clientes',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'blue',
      component: ClientesTab,
      windowTitle: ' Clientes',
      width: 1500,
      height: 850,
      props: { clientes }
    },
    {
      title: 'Pedidos',
      sectionKey: 'Pedidos',
      description: 'Orçamentos e vendas',
      icon: ShoppingCart,
      color: 'purple',
      component: PedidosTab,
      windowTitle: ' Pedidos',
      width: 1500,
      height: 850,
      props: { pedidos, clientes, empresas, onCreatePedido: handleCreateNewPedido, onEditPedido: handleEditPedido }
    },
    {
      title: 'Logística Entrega',
      description: 'CIF e FOB',
      icon: Truck,
      color: 'blue',
      component: PedidosEntregaTab,
      windowTitle: ' Logística de Entrega',
      width: 1400,
      height: 800,
      badge: pedidosEntrega > 0 ? `${pedidosEntrega}` : null
    },
    {
      title: 'Pedidos Retirada',
      sectionKey: 'Pedidos Retirada',
      description: 'Cliente retira',
      icon: Package,
      color: 'green',
      component: PedidosRetiradaTab,
      windowTitle: ' Pedidos p/ Retirada',
      width: 1400,
      height: 800,
      badge: pedidosRetirada > 0 ? `${pedidosRetirada}` : null
    },
    {
      title: 'Comissões',
      description: 'Vendedores e indicadores',
      icon: TrendingUp,
      color: 'green',
      component: ComissoesTab,
      windowTitle: 'Comissões',
      width: 1400,
      height: 800,
      props: { comissoes, pedidos, empresas }
    },
    {
      title: 'Notas Fiscais',
      sectionKey: 'Notas Fiscais',
      description: 'NF-e emitidas',
      icon: FileText,
      color: 'indigo',
      component: NotasFiscaisTab,
      windowTitle: ' Notas Fiscais',
      width: 1500,
      height: 850,
      props: { notasFiscais, pedidos, clientes }
    },
    {
      title: 'Aprovações',
      description: 'Descontos hierárquicos',
      icon: ShieldCheck,
      color: 'orange',
      component: CentralAprovacoesManager,
      windowTitle: 'Aviso: Central de Aprovações',
      width: 1400,
      height: 800,
      badge: pedidosPendentesAprovacao > 0 ? `${pedidosPendentesAprovacao} pendentes` : null
    },
    {
      title: 'Tabelas de Preço',
      description: 'Gestão de preços',
      icon: TrendingUp,
      color: 'indigo',
      component: TabelasPrecoTab,
      windowTitle: ' Tabelas de Preço',
      width: 1400,
      height: 800,
      props: { tabelasPreco }
    },
    {
      title: 'Canais Realtime',
      sectionKey: 'Canais Realtime',
      description: 'Monitoramento de origem',
      icon: TrendingUp,
      color: 'cyan',
      component: MonitoramentoCanaisRealtime,
      windowTitle: ' Canais em Tempo Real',
      width: 1300,
      height: 750,
      props: { autoRefresh: true }
    }
  ];

  const allowedModules = modules
    .map((m) => ({ ...m, permissionKey: `Comercial.${m.sectionKey || m.title}.visualizar` }))
    .filter(m => canViewComercial(m.sectionKey || m.title));

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
                <KPIsComercial
                   totalClientes={clientes.length}
                   clientesAtivos={clientesAtivos}
                   totalPedidos={pedidos.length}
                   totalVendas={totalVendas}
                   ticketMedio={ticketMedio}
                   valorFaturado={valorFaturado}
                   valorPendenteFaturamento={valorPendenteFaturamento}
                   pesoTotalVendido={pesoTotalVendido}
                   pedidosFaturados={pedidosFaturados}
                   pedidosFaturamentoParcial={pedidosFaturamentoParcial}
                   pedidosCancelados={pedidosCancelados}
                   margemBruta={margemBruta}
                   margemPercentual={margemPercentual}
                 />
                {pedidosExternosPendentes > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 px-3 py-2 text-sm font-medium">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    {pedidosExternosPendentes} pedido(s) externo(s) a validar
                  </Badge>
                )}
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