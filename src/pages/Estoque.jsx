import React, { useEffect, useMemo, startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { Box, TrendingUp, PackageCheck, PackageMinus, PackageOpen, Clock, BarChart3, Sparkles, ArrowLeftRight, Download } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { Button } from "@/components/ui/button";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsEstoque from "@/components/estoque/estoque-launchpad/KPIsEstoque";
import ModulosGridEstoque from "@/components/estoque/estoque-launchpad/ModulosGridEstoque";
import useEstoqueDerivedData from "@/components/estoque/hooks/useEstoqueDerivedData";
import TransferenciaEntreEmpresasForm from "../components/estoque/TransferenciaEntreEmpresasForm";
import { ESTOQUE_LIST_LIMIT, ESTOQUE_PRODUCTS_LIMIT } from "@/components/estoque/config/estoqueQueryConfig";
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
  const canExportEstoque = hasPermission('Estoque', 'Relatórios', 'exportar');
  const canTransferirEstoque = hasPermission('Estoque', 'Transferências', 'criar');
  const { openWindow } = useWindow();
  const { user } = useUser();
  const { estaNoGrupo, empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || 'sem-contexto';
  const contextoValido = contextKey !== 'sem-contexto';

  const { data: produtosParaKPIs = [], refetch: refetchContagens } = useRLSQuery(
    'Produto', {}, undefined, ESTOQUE_PRODUCTS_LIMIT,
    { staleTime: 300000, enabled: contextoValido }
  );

  const contagensTotais = useMemo(() => ({
    total: produtosParaKPIs.length,
    revenda: produtosParaKPIs.filter(p => p.tipo_item === 'Revenda').length,
    producao: produtosParaKPIs.filter(p => p.tipo_item === 'Matéria-Prima Produção').length,
    estoqueBaixo: produtosParaKPIs.filter(isProdutoEstoqueBaixo).length,
  }), [produtosParaKPIs]);

  const { data: movimentacoes = [] } = useRLSQuery(
    'MovimentacaoEstoque', {}, '-data_movimentacao', ESTOQUE_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido }
  );

  const { data: solicitacoes = [] } = useRLSQuery(
    'SolicitacaoCompra', {}, '-data_solicitacao', ESTOQUE_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido }
  );

  const { data: ordensCompra = [] } = useRLSQuery(
    'OrdemCompra', {}, '-data_solicitacao', ESTOQUE_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido }
  );

  const { totalReservado, estoqueDisponivel, recebimentos, requisicoesAlmoxarifado } = useEstoqueDerivedData({
    movimentacoes,
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

  const InventarioForm = React.lazy(() => import('../components/estoque/InventarioForm'));

  const modules = [
    {
      title: 'Inventário',
      description: 'Contagem e ajustes',
      icon: Box,
      color: 'cyan',
      component: InventarioForm,
      windowTitle: '📋 Inventário',
      width: 1200,
      height: 800,
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
      props: { movimentacoes, produtos: produtosParaKPIs },
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
      props: { recebimentos, ordensCompra, produtos: produtosParaKPIs },
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
      props: { requisicoes: requisicoesAlmoxarifado, produtos: produtosParaKPIs },
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
      props: { solicitacoes, produtos: produtosParaKPIs },
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
      props: { empresaId: empresaAtual?.id },
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
      props: { produtos: produtosParaKPIs, movimentacoes },
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
      props: { empresaId: empresaAtual?.id },
    },
  ];

  const allowedModules = modules.filter(m => hasPermission('Estoque', (m.sectionKey || m.title), 'ver'));

  const handleModuleClick = (module) => {
    startTransition(() => {
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