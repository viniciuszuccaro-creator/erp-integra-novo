import React, { Suspense, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Box, TrendingUp, PackageCheck, PackageMinus, PackageOpen, Clock, BarChart3, Sparkles, ArrowLeftRight, Download } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { Button } from "@/components/ui/button";
import HeaderEstoqueCompacto from "@/components/estoque/estoque-launchpad/HeaderEstoqueCompacto";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsEstoque from "@/components/estoque/estoque-launchpad/KPIsEstoque";
import ModulosGridEstoque from "@/components/estoque/estoque-launchpad/ModulosGridEstoque";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useEstoqueDerivedData from "@/components/estoque/hooks/useEstoqueDerivedData";
import TransferenciaEntreEmpresasForm from "../components/estoque/TransferenciaEntreEmpresasForm";
import { ESTOQUE_BATCH_SIZE, ESTOQUE_LIST_LIMIT, ESTOQUE_PRODUCTS_LIMIT, estoqueQueryDefaults } from "@/components/estoque/config/estoqueQueryConfig";
import { isProdutoEstoqueBaixo } from "@/components/estoque/utils/estoqueSafeData";

const ProdutosTab = React.lazy(() => import("../components/estoque/ProdutosTab"));
const MovimentacoesTab = React.lazy(() => import("../components/estoque/MovimentacoesTab"));
const SolicitacoesTab = React.lazy(() => import("../components/estoque/SolicitacoesTab"));
const RecebimentoTab = React.lazy(() => import("../components/estoque/RecebimentoTab"));
const RequisicoesAlmoxarifadoTab = React.lazy(() => import("../components/estoque/RequisicoesAlmoxarifadoTab"));
const ControleLotesValidade = React.lazy(() => import("../components/estoque/ControleLotesValidade"));
const RelatoriosEstoque = React.lazy(() => import("../components/estoque/RelatoriosEstoque"));
const IAReposicao = React.lazy(() => import("../components/estoque/IAReposicao"));

export default function Estoque() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canSeeEstoque = hasPermission('Estoque', null, 'ver');
  const canExportEstoque = hasPermission('Estoque', null, 'exportar') || hasPermission('Estoque', 'Relatórios', 'exportar') || hasPermission('Estoque', 'Relatorios', 'exportar');
  const canTransferirEstoque = hasPermission('Estoque', 'Transferências', 'criar') || hasPermission('Estoque', 'Transferencias', 'criar') || hasPermission('Estoque', 'Movimentações', 'criar') || hasPermission('Estoque', 'Movimentacoes', 'criar');
  const { openWindow } = useWindow();
  const { user } = useUser();
  const { estaNoGrupo, empresaAtual, grupoAtual, empresasDoGrupo, filtrarPorContexto, getFiltroContexto } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || 'sem-contexto';
  const contextoValido = contextKey !== 'sem-contexto';
  
  // Estados removidos - VisualizadorUniversalEntidade gerencia tudo internamente

  // Query removida - VisualizadorUniversalEntidade busca os dados

  // ✅ Contagens via backend otimizado - CARREGA TUDO para cálculo correto
  const { data: contagensTotais = { total: 0, revenda: 0, producao: 0, estoqueBaixo: 0 }, isLoading: loadingContagens, refetch: refetchContagens } = useQuery({
    queryKey: ['produtos-contagens-dashboard', contextKey],
    queryFn: async () => {
      const filtroBase = getFiltroContexto('empresa_id', true);

      // Buscar TODOS os produtos para contagem correta
      let todosProdutos = [];
      let skip = 0;
      const batchSize = ESTOQUE_BATCH_SIZE;
      let hasMore = true;
      const MAX_PAGES = 20; // segurança: máximo 20 páginas (20×200 = 4000 produtos)
      let page = 0;
      
      while (hasMore && page < MAX_PAGES) {
        const batch = await base44.entities.Produto.filter(filtroBase, undefined, batchSize, skip);
        if (!batch || batch.length === 0) {
          hasMore = false;
        } else {
          todosProdutos = [...todosProdutos, ...batch];
          if (batch.length < batchSize) {
            hasMore = false;
          } else {
            skip += batchSize;
            page++;
          }
        }
      }

      const total = todosProdutos.length;
      const revenda = todosProdutos.filter(p => p.tipo_item === 'Revenda').length;
      const producao = todosProdutos.filter(p => p.tipo_item === 'Matéria-Prima Produção').length;
      const estoqueBaixo = todosProdutos.filter((p) => isProdutoEstoqueBaixo(p)).length;

      return { total, revenda, producao, estoqueBaixo };
    },
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: false,
    enabled: canSeeEstoque && contextoValido
  });

  // ✅ Real-time update via subscription
  React.useEffect(() => {
    const unsubscribe = base44.entities.Produto.subscribe(() => {
      if (contextoValido) refetchContagens();
    });
    return unsubscribe;
  }, [refetchContagens, contextoValido]);

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes', contextKey],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('MovimentacaoEstoque', {}, '-data_movimentacao', ESTOQUE_LIST_LIMIT);
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
        return [];
      }
    },
    ...estoqueQueryDefaults,
    enabled: canSeeEstoque && contextoValido
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes', contextKey],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('SolicitacaoCompra', {}, '-data_solicitacao', ESTOQUE_LIST_LIMIT);
      } catch (err) {
        console.error('Erro ao buscar solicitações:', err);
        return [];
      }
    },
    ...estoqueQueryDefaults,
    enabled: canSeeEstoque && contextoValido
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordensCompra', contextKey],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('OrdemCompra', {}, '-data_solicitacao', ESTOQUE_LIST_LIMIT);
      } catch (err) {
        console.error('Erro ao buscar ordens:', err);
        return [];
      }
    },
    ...estoqueQueryDefaults,
    enabled: canSeeEstoque && contextoValido
  });

  // Buscar produtos simples para KPIs de valor de estoque
  const { data: produtosParaKPIs = [] } = useQuery({
    queryKey: ['produtos-kpis', contextKey],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('Produto', {}, undefined, ESTOQUE_PRODUCTS_LIMIT);
      } catch (err) {
        console.error('Erro ao buscar produtos para KPIs:', err);
        return [];
      }
    },
    ...estoqueQueryDefaults,
    enabled: canSeeEstoque && contextoValido
  });

  const movimentacoesFiltradas = movimentacoes;

  const { totalReservado, estoqueDisponivel, recebimentos, requisicoesAlmoxarifado } = useEstoqueDerivedData({
    movimentacoes: movimentacoesFiltradas,
    produtos: produtosParaKPIs,
  });

  // Exportação PDF do estoque de aço (bitolas)
  const handleExportAco = async () => {
    if (!canExportEstoque) return;
    try {
      const { data } = await base44.functions.invoke('exportEstoqueAco', {
        filtros: { empresa_id: empresaAtual?.id || null, group_id: groupId || null }
      });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'estoque_aco.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuario local',
          usuario_id: user?.id || null,
          acao: 'Exportacao',
          modulo: 'Estoque',
          entidade: 'RelatorioEstoqueAco',
          empresa_id: empresaAtual?.id || null,
          group_id: groupId || null,
          descricao: 'Exportacao de estoque de aco em PDF',
          sucesso: true,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
    } catch (e) {
      console.error('Falha ao exportar estoque de aço:', e);
    }
  };

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  const modules = [
    {
      title: 'Inventário',
      description: 'Contagem e ajustes',
      icon: Box,
      color: 'cyan',
      component: React.lazy(() => import('../components/estoque/InventarioForm')),
      windowTitle: '📋 Inventário',
      width: 1200,
      height: 800,
      props: {}
    },
    {
      title: 'Produtos',
      description: 'Cadastro e estoque',
      icon: Box,
      color: 'indigo',
      component: ProdutosTab,
      windowTitle: '📦 Produtos',
      width: 1500,
      height: 850,
      props: {}
    },
    {
      title: 'Movimentações',
      description: 'Entradas e saídas',
      icon: TrendingUp,
      color: 'blue',
      component: MovimentacoesTab,
      windowTitle: '📊 Movimentações',
      width: 1500,
      height: 850,
      props: { movimentacoes: movimentacoesFiltradas, produtos: produtosParaKPIs }
    },
    {
      title: 'Recebimento',
      description: 'Entrada de mercadorias',
      icon: PackageCheck,
      color: 'green',
      component: RecebimentoTab,
      windowTitle: '📥 Recebimento',
      width: 1400,
      height: 800,
      props: { recebimentos, ordensCompra, produtos: produtosParaKPIs }
    },
    {
      title: 'Requisições Almox.',
      description: 'Saídas almoxarifado',
      icon: PackageMinus,
      color: 'orange',
      component: RequisicoesAlmoxarifadoTab,
      windowTitle: '📤 Requisições Almoxarifado',
      width: 1400,
      height: 800,
      props: { requisicoes: requisicoesAlmoxarifado, produtos: produtosParaKPIs }
    },
    {
      title: 'Solicitações Compra',
      description: 'Requisições internas',
      icon: PackageOpen,
      color: 'purple',
      component: SolicitacoesTab,
      windowTitle: '📋 Solicitações Compra',
      width: 1400,
      height: 800,
      props: { solicitacoes, produtos: produtosParaKPIs }
    },
    {
      title: 'Lotes e Validade',
      description: 'Controle de lotes',
      icon: Clock,
      color: 'orange',
      component: ControleLotesValidade,
      windowTitle: '⏰ Lotes e Validade',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Relatórios',
      description: 'Analytics de estoque',
      icon: BarChart3,
      color: 'indigo',
      component: RelatoriosEstoque,
      windowTitle: '📈 Relatórios Estoque',
      width: 1400,
      height: 800,
      props: { produtos: produtosParaKPIs, movimentacoes: movimentacoesFiltradas }
    },
    {
      title: 'IA Reposição',
      description: 'Sugestões inteligentes',
      icon: Sparkles,
      color: 'blue',
      component: IAReposicao,
      windowTitle: '🤖 IA Reposição',
      width: 1300,
      height: 750,
      props: { empresaId: empresaAtual?.id }
    },
  ];

  const allowedModules = modules.filter(m => hasPermission('Estoque', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: groupId || null,
        acao: 'Visualização',
        modulo: 'Estoque',
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
          uniqueKey: `estoque-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Estoque" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout
        title="Estoque e Almoxarifado"
        subtitle="Produtos, níveis e movimentações"
        actions={<div className="flex items-center gap-2">
          <Button onClick={handleExportAco} disabled={!contextoValido || !canExportEstoque} variant="outline" className="gap-2"><Download className="w-3 h-3" /> Exportar Aço (PDF)</Button>
        </div>}
      >
        <ModuleKPIs>
          <KPIsEstoque
            produtosAtivos={contagensTotais.total}
            produtosBaixoEstoque={contagensTotais.estoqueBaixo}
            totalReservado={totalReservado}
            estoqueDisponivel={estoqueDisponivel}
            produtosRevenda={contagensTotais.revenda}
            produtosProducao={contagensTotais.producao}
          />
        </ModuleKPIs>
        <ModuleContent>
          {estaNoGrupo && (
            <Button
              onClick={() => openWindow(TransferenciaEntreEmpresasForm, {
                empresasDoGrupo,
                produtos: produtosParaKPIs,
                windowMode: true
              }, {
                title: '↔️ Transferência Entre Empresas',
                width: 900,
                height: 600
              })}
              className="bg-purple-600 hover:bg-purple-700 mb-2"
              disabled={!contextoValido || !canTransferirEstoque}
              size="sm"
            >
              <ArrowLeftRight className="w-3 h-3 mr-2" />
              Transferir entre Empresas
            </Button>
          )}
          <ModuleTabs
            listagem={<ModulosGridEstoque modules={allowedModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}