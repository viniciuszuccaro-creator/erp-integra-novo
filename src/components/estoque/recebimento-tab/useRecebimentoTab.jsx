import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

const STATUS_COLORS = {
  Pendente: "bg-yellow-100 text-yellow-700",
  Conferido: "bg-blue-100 text-blue-700",
  Aprovado: "bg-green-100 text-green-700",
  Divergente: "bg-red-100 text-red-700",
};

export default function useRecebimentoTab(recebimentos, ordensCompra, produtos) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingRecebimento, setViewingRecebimento] = useState(null);
  const { empresaAtual, grupoAtual, createInContext, updateInContext } = useContextoVisual();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const ctx = { empresa_id: empresaAtual?.id, group_id: grupoAtual?.id || empresaAtual?.group_id };

      await createInContext('MovimentacaoEstoque', {
        ...ctx,
        tipo_movimentacao: "Entrada",
        data_movimentacao: data.data_recebimento,
        documento: data.numero_nf || data.numero_recebimento,
        responsavel: data.responsavel_recebimento || data.conferente || user?.full_name || "Sistema",
        observacoes: `Recebimento: ${data.numero_recebimento}`,
        itens_recebidos: data.itens,
      });

      for (const item of data.itens) {
        if (item.quantidade_recebida > 0) {
          const produto = produtos.find((p) => p.id === item.produto_id);
          if (produto) {
            await updateInContext('Produto', produto.id, {
              estoque_atual: (produto.estoque_atual || 0) + item.quantidade_recebida,
            });
            await createInContext('MovimentacaoEstoque', {
              ...ctx,
              produto_id: item.produto_id,
              produto_descricao: item.produto_descricao,
              tipo_movimentacao: "Entrada",
              quantidade: item.quantidade_recebida,
              data_movimentacao: data.data_recebimento,
              documento: data.numero_nf || data.numero_recebimento,
              motivo: "Recebimento de compra",
              responsavel: data.responsavel_recebimento,
              observacoes: data.observacoes,
            });
          }
        }
      }

      if (data.ordem_compra_id) {
        await base44.entities.OrdemCompra.update(data.ordem_compra_id, { status: "Recebida" });
      }

      try {
        await base44.entities.AuditLog.create({
          ...ctx,
          usuario: user?.full_name || user?.email || "Sistema",
          usuario_id: user?.id,
          acao: "Criação",
          modulo: "Estoque",
          tipo_auditoria: "entidade",
          entidade: "MovimentacaoEstoque",
          descricao: `Recebimento ${data.numero_recebimento} registrado`,
          dados_novos: { numero: data.numero_recebimento, itens: data.itens?.length || 0 },
          data_hora: new Date().toISOString(),
          sucesso: true,
        });
      } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["ordensCompra"] });
      toast.success("✅ Recebimento registrado!");
    },
    onError: () => toast.error("Erro ao registrar recebimento"),
  });

  const filteredRecebimentos = recebimentos.filter((r) => {
    const s = searchTerm.toLowerCase();
    return (
      r.numero_recebimento?.toLowerCase().includes(s) ||
      r.documento?.toLowerCase().includes(s) ||
      r.fornecedor?.toLowerCase().includes(s) ||
      r.numero_nf?.includes(s) ||
      r.responsavel_recebimento?.toLowerCase().includes(s) ||
      r.responsavel?.toLowerCase().includes(s) ||
      r.status?.toLowerCase().includes(s) ||
      r.observacoes?.toLowerCase().includes(s) ||
      r.itens_recebidos?.some((i) => i?.produto_descricao?.toLowerCase().includes(s))
    );
  });

  return {
    searchTerm,
    setSearchTerm,
    viewingRecebimento,
    setViewingRecebimento,
    createMutation,
    filteredRecebimentos,
    statusColors: STATUS_COLORS,
  };
}