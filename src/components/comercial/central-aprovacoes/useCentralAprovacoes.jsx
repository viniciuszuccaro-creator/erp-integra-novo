import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { useToast } from "@/components/ui/use-toast";
import AutomacaoFluxoPedido from "@/components/comercial/AutomacaoFluxoPedido";

export default function useCentralAprovacoes(empresaId) {
  const [activeTab, setActiveTab] = useState("descontos");
  const [permitido, setPermitido] = useState(true);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  const { filterInContext, updateInContext } = useContextoVisual();
  const { canApprove } = usePermissions();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-aprovacoes', empresaId],
    queryFn: () => filterInContext('Pedido', { ...(empresaId ? { empresa_id: empresaId } : {}) }, '-created_date'),
  });

  useEffect(() => {
    if (user) setPermitido(user.role === 'admin' || user.role === 'gerente');
  }, [user]);

  // §18 — fila real de limite de crédito e títulos vencidos (SolicitacaoAprovacao do Financeiro)
  const { data: solicitacoes = [], isLoading: carregandoSolicitacoes } = useQuery({
    queryKey: ['solicitacoes-aprovacao-comercial', empresaId],
    queryFn: () => filterInContext('SolicitacaoAprovacao', {
      tipo_solicitacao: { $in: ['liberar_credito', 'liberacao_vencido'] },
      ...(empresaId ? { empresa_id: empresaId } : {}),
    }, '-data_solicitacao', 200),
  });

  const decidirSolicitacao = useMutation({
    mutationFn: async ({ solicitacao, aprovado, comentarios, contraproposta }) => {
      if (!canApprove('Comercial')) throw new Error('Sem permissão para decidir aprovações comerciais.');
      if (!solicitacao?.group_id || !solicitacao?.empresa_id) throw new Error('Solicitação sem contexto de grupo/empresa.');
      if (solicitacao.status !== 'pendente') throw new Error('Esta solicitação já foi decidida.');
      if (solicitacao.solicitante_id === user?.id) throw new Error('Segregação de funções: outra pessoa deve decidir esta solicitação.');
      // A decisão passa pelo endpoint, que aplica segregação de funções, contexto e histórico imutável.
      const { data } = await base44.functions.invoke('solicitacoesAprovacao', {
        action: aprovado ? 'approve' : 'reject',
        solicitacao_id: solicitacao.id,
        group_id: solicitacao.group_id,
        empresa_id: solicitacao.empresa_id,
        comentarios_aprovacao: comentarios || '',
        ...(contraproposta ? { contraproposta } : {}),
      });
      if (data?.error) throw new Error(data.error);
      // §18 — a contraproposta de limite é aplicada pelo endpoint, no cadastro único do cliente,
      // com verificação de grupo/empresa e antes/depois. O navegador não grava mais o cadastro.
      if (data?.contraproposta_aplicada?.aplicado) {
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['cliente'] });
      }
      return data;
      // A decisão já é auditada pelo endpoint (antes/depois, usuário, grupo e empresa).
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-aprovacao-comercial'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-aprovacoes'] });
      toast({ title: 'Decisão registrada na fila de aprovações.' });
    },
    onError: (error) => toast({ title: 'Erro ao decidir', description: error.message, variant: 'destructive' }),
  });

  const aprovarPedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, dados, executarFechamento = false }) => {
      // Regra-Mãe 5: RBAC granular na persistência (fail-closed)
      if (!canApprove('Comercial')) throw new Error('Sem permissão para aprovar descontos.');
      const pedidosCompletos = await base44.entities.Pedido.filter({ id: pedidoId });
      const pedido = pedidosCompletos[0];
      if (!pedido?.group_id) throw new Error('Pedido sem contexto de grupo — aprovação bloqueada.');

      const itensRevenda = [], itensArmado = [], itensCorte = [];
      if (dados.itensAtualizados) {
        dados.itensAtualizados.forEach(item => {
          if (item.tipo === "Revenda") itensRevenda.push(item);
          else if (item.tipo === "Armado Padrão") itensArmado.push(item);
          else if (item.tipo === "Corte e Dobra") itensCorte.push(item);
        });
      }

      await updateInContext('Pedido', pedidoId, {
        status_aprovacao: "aprovado",
        status: "Aprovado",
        usuario_aprovador_id: user?.id,
        data_aprovacao: new Date().toISOString(),
        desconto_aprovado_percentual: dados.descontoGeralPercentual || 0,
        desconto_geral_pedido_percentual: dados.descontoGeralPercentual || 0,
        desconto_geral_pedido_valor: dados.descontoGeralValor || 0,
        valor_total: dados.valorFinal || 0,
        margem_aplicada_vendedor: dados.margemMedia || 0,
        comentarios_aprovacao: dados.comentarios || "",
        ...(itensRevenda.length > 0 && { itens_revenda: itensRevenda }),
        ...(itensArmado.length > 0 && { itens_armado_padrao: itensArmado }),
        ...(itensCorte.length > 0 && { itens_corte_dobra: itensCorte }),
      });

      if (executarFechamento) {
        const pedidoAtualizado = await base44.entities.Pedido.filter({ id: pedidoId });
        return { pedido: pedidoAtualizado[0], executarFechamento: true };
      }
      return { pedido: null, executarFechamento: false };
    },
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-aprovacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      toast({ title: "✅ Desconto aprovado!" });

      if (resultado.executarFechamento && resultado.pedido) {
        setTimeout(() => {
          if (window.__currentOpenWindow) {
            window.__currentOpenWindow(
              AutomacaoFluxoPedido,
              { pedido: resultado.pedido, windowMode: true, autoExecute: true,
                onComplete: () => toast({ title: "✅ Pedido fechado automaticamente!" }) },
              { title: `🚀 Automação - ${resultado.pedido.numero_pedido}`, width: 1200, height: 700 }
            );
          }
        }, 200);
      }
    },
    onError: (error) => toast({ title: "❌ Erro ao aprovar", description: error.message, variant: "destructive" })
  });

  const negarPedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, comentarios }) => {
      // Regra-Mãe 5: RBAC granular na persistência (fail-closed)
      if (!canApprove('Comercial')) throw new Error('Sem permissão para negar descontos.');
      await updateInContext('Pedido', pedidoId, {
        status_aprovacao: "negado",
        usuario_aprovador_id: user?.id,
        data_aprovacao: new Date().toISOString(),
        comentarios_aprovacao: comentarios
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-aprovacoes'] });
      toast({ title: "❌ Desconto negado" });
    },
    onError: (error) => toast({ title: "❌ Erro ao negar", description: error.message, variant: "destructive" })
  });

  const pedidosPendentes = pedidos.filter(p => p.status_aprovacao === "pendente");
  const pedidosAprovados = pedidos.filter(p => p.status_aprovacao === "aprovado");
  const pedidosNegados = pedidos.filter(p => p.status_aprovacao === "negado");

  return {
    activeTab, setActiveTab, permitido,
    pedidosPendentes, pedidosAprovados, pedidosNegados,
    solicitacoes, decidirSolicitacao, carregandoSolicitacoes,
    aprovarPedidoMutation, negarPedidoMutation,
  };
}