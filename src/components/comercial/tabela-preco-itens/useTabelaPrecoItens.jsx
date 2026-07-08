import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function useTabelaPrecoItens(tabela) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual, contexto, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${empresaAtual?.id || "sem-empresa"}`;

  const [formItem, setFormItem] = useState({
    produto_id: "",
    preco_base: 0,
    percentual_desconto: 0,
    data_inicio_vigencia: new Date().toISOString().split("T")[0],
    data_fim_vigencia: "",
    ativo: true,
    observacoes: "",
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["tabela-preco-itens", tabela?.id, contextoKey],
    queryFn: () => filterInContext("TabelaPrecoItem", { tabela_preco_id: tabela.id }, undefined, 999),
    enabled: !!tabela?.id && !!contexto,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", contextoKey],
    queryFn: () => filterInContext("Produto", { tipo_item: 'Revenda', status: 'Ativo' }, "descricao", 999),
    enabled: !!contexto,
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => {
      const produto = produtos.find((p) => p.id === data.produto_id);
      const precoComDesconto = data.preco_base * (1 - data.percentual_desconto / 100);
      return createInContext('TabelaPrecoItem', {
        ...data,
        tabela_preco_id: tabela.id,
        tabela_preco_nome: tabela.nome,
        produto_codigo: produto?.codigo,
        produto_descricao: produto?.descricao,
        preco_com_desconto: precoComDesconto,
        empresa_id: tabela.empresa_id,
        group_id: tabela.group_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabela-preco-itens"] });
      queryClient.invalidateQueries({ queryKey: ["tabelas-preco"] });
      setShowItemForm(false);
      setEditingItem(null);
      toast({ title: "✅ Item adicionado!" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const precoComDesconto = data.preco_base * (1 - data.percentual_desconto / 100);
      return updateInContext('TabelaPrecoItem', id, { ...data, preco_com_desconto: precoComDesconto });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabela-preco-itens"] });
      setShowItemForm(false);
      setEditingItem(null);
      toast({ title: "✅ Item atualizado!" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => deleteInContext('TabelaPrecoItem', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tabela-preco-itens"] });
      toast({ title: "✅ Item removido!" });
    },
  });

  const handleSubmitItem = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formItem });
    } else {
      createItemMutation.mutate(formItem);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormItem({
      produto_id: item.produto_id,
      preco_base: item.preco_base,
      percentual_desconto: item.percentual_desconto || 0,
      data_inicio_vigencia: item.data_inicio_vigencia || "",
      data_fim_vigencia: item.data_fim_vigencia || "",
      ativo: item.ativo !== false,
      observacoes: item.observacoes || "",
    });
    setShowItemForm(true);
  };

  const handleDeleteItem = (item) => {
    deleteItemMutation.mutate(item.id);
  };

  const resetForm = () => {
    setFormItem({
      produto_id: "",
      preco_base: 0,
      percentual_desconto: 0,
      data_inicio_vigencia: new Date().toISOString().split("T")[0],
      data_fim_vigencia: "",
      ativo: true,
      observacoes: "",
    });
    setEditingItem(null);
  };

  const filteredItens = itens.filter(
    (i) =>
      i.produto_descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.produto_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosDisponiveis = produtos.filter((p) => !itens.some((i) => i.produto_id === p.id));

  return {
    searchTerm,
    setSearchTerm,
    editingItem,
    showItemForm,
    setShowItemForm,
    formItem,
    setFormItem,
    itens,
    produtos,
    filteredItens,
    produtosDisponiveis,
    handleSubmitItem,
    handleEditItem,
    handleDeleteItem,
    resetForm,
    createItemMutation,
    updateItemMutation,
  };
}