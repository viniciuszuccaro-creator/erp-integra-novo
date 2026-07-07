import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

export default function usePedidosRetirada() {
  const { filterInContext, createInContext, updateInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [docRecebedor, setDocRecebedor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const queryClient = useQueryClient();

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-retirada", grupoAtual?.id, empresaAtual?.id],
    queryFn: () => filterInContext("Pedido", {}, "-created_date"),
    enabled: !!(grupoAtual?.id || empresaAtual?.id),
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const pedidosParaRetirada = useMemo(
    () =>
      pedidos.filter(
        (p) =>
          p.tipo_frete === "Retirada" &&
          ["Aprovado", "Pronto para Faturar", "Faturado", "Pronto para Retirada"].includes(p.status)
      ),
    [pedidos]
  );

  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidosParaRetirada;
    if (busca) {
      resultado = resultado.filter(
        (p) =>
          p.numero_pedido?.toLowerCase().includes(busca.toLowerCase()) ||
          p.cliente_nome?.toLowerCase().includes(busca.toLowerCase())
      );
    }
    if (statusFiltro !== "todos") resultado = resultado.filter((p) => p.status === statusFiltro);
    return resultado;
  }, [pedidosParaRetirada, busca, statusFiltro]);

  const prontoParaRetirada = pedidos.filter((p) => p.status === "Pronto para Retirada").length;
  const retirados = pedidos.filter((p) => p.status === "Entregue" && p.tipo_frete === "Retirada").length;

  const atualizarStatusMutation = useMutation({
    mutationFn: ({ pedidoId, novoStatus }) => updateInContext("Pedido", pedidoId, { status: novoStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-retirada"] });
      toast.success("✅ Status atualizado!");
    },
  });

  const confirmarRetiradaMutation = useMutation({
    mutationFn: async ({ pedido }) => {
      const ctx = { empresa_id: pedido.empresa_id, group_id: pedido.group_id || grupoAtual?.id };

      if (pedido.itens_revenda?.length > 0) {
        for (const item of pedido.itens_revenda) {
          if (item.produto_id) {
            const produtos = await filterInContext("Produto", { id: item.produto_id });
            const produto = produtos[0];
            if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
              const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
              await createInContext("MovimentacaoEstoque", {
                ...ctx,
                tipo_movimento: "saida",
                origem_movimento: "pedido",
                origem_documento_id: pedido.id,
                produto_id: item.produto_id,
                produto_descricao: item.descricao || item.produto_descricao,
                quantidade: item.quantidade,
                unidade_medida: item.unidade,
                estoque_anterior: produto.estoque_atual || 0,
                estoque_atual: novoEstoque,
                data_movimentacao: new Date().toISOString(),
                documento: pedido.numero_pedido,
                motivo: `Retirada confirmada - ${nomeRecebedor}`,
                responsavel: user?.full_name || "Sistema",
                aprovado: true,
              });
              await updateInContext("Produto", item.produto_id, { estoque_atual: novoEstoque });
            }
          }
        }
      }

      await updateInContext("Pedido", pedido.id, {
        status: "Entregue",
        data_entrega_real: new Date().toISOString(),
      });

      await base44.entities.Entrega.create({
        ...ctx,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        tipo_frete: "Retirada",
        status: "Entregue",
        data_entrega: new Date().toISOString(),
        comprovante_entrega: {
          nome_recebedor: nomeRecebedor,
          documento_recebedor: docRecebedor,
          data_hora_recebimento: new Date().toISOString(),
          observacoes_recebimento: observacoes,
        },
      });

      try {
        await base44.entities.AuditLog.create({
          ...ctx,
          usuario: user?.full_name || user?.email || "Sistema",
          usuario_id: user?.id,
          acao: "Edição",
          modulo: "Comercial",
          tipo_auditoria: "entidade",
          entidade: "Pedido",
          registro_id: pedido.id,
          descricao: `Retirada confirmada - ${pedido.numero_pedido}`,
          dados_novos: { status: "Entregue", recebedor: nomeRecebedor },
          data_hora: new Date().toISOString(),
          sucesso: true,
        });
      } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-retirada"] });
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
      toast.success("✅ Retirada confirmada e estoque baixado!");
      setDetalhesOpen(false);
      setPedidoSelecionado(null);
      setNomeRecebedor("");
      setDocRecebedor("");
      setObservacoes("");
    },
  });

  const handleConfirmarRetirada = () => {
    if (!nomeRecebedor.trim()) {
      toast.error("⚠️ Informe quem retirou o pedido");
      return;
    }
    confirmarRetiradaMutation.mutate({ pedido: pedidoSelecionado });
  };

  return {
    busca, setBusca,
    statusFiltro, setStatusFiltro,
    detalhesOpen, setDetalhesOpen,
    pedidoSelecionado, setPedidoSelecionado,
    nomeRecebedor, setNomeRecebedor,
    docRecebedor, setDocRecebedor,
    observacoes, setObservacoes,
    pedidosFiltrados,
    pedidosParaRetirada,
    prontoParaRetirada,
    retirados,
    atualizarStatusMutation,
    confirmarRetiradaMutation,
    handleConfirmarRetirada,
  };
}