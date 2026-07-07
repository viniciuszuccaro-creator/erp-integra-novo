import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

/**
 * Hook: estado, queries, mutations, IA e validação de estoque para OP
 * P2: Multi-tenant — filterInContext
 */
export default function useFormularioOP(op, onClose) {
  const queryClient = useQueryClient();
  const { filterInContext, empresaAtual, grupoAtual, contexto, carimbarContexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const [formData, setFormData] = useState(op || {
    numero_op: "", tipo_producao: "Armado Padrão", pedido_id: "", cliente_nome: "",
    peso_total_kg: 0, prioridade: "Normal", status: "Planejada", observacoes: "", itens: []
  });
  const [seletorProdutoAberto, setSeletorProdutoAberto] = useState(false);
  const [produtosInsuficientes, setProdutosInsuficientes] = useState([]);

  const { data: pedidos = [] } = useRLSQuery('Pedido', {}, '-created_date', 999, { enabled: !!contexto });
  const { data: empresas = [] } = useRLSQuery('Empresa', {}, 'nome_fantasia', 999, { enabled: !!contexto });
  const { data: produtosProducaoRaw = [] } = useRLSQuery('Produto', {}, 'descricao', 999, { enabled: !!contexto });
  const produtosProducao = React.useMemo(() => produtosProducaoRaw.filter(p => p.tipo_item === 'Matéria-Prima Produção' && p.status === 'Ativo'), [produtosProducaoRaw]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const stamped = carimbarContexto(data, 'empresa_id');
      if (op?.id) return base44.entities.OrdemProducao.update(op.id, stamped);
      return base44.entities.OrdemProducao.create(stamped);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ordens-producao"]);
      toast.success(op?.id ? "OP atualizada!" : "OP criada!");
      if (onClose) onClose();
    },
  });

  const handleGerarIA = async () => {
    toast.info("🤖 IA analisando pedido...");
    try {
      const pedido = pedidos.find(p => p.id === formData.pedido_id);
      if (!pedido) { toast.error("Selecione um pedido primeiro"); return; }
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este pedido e sugira otimização de produção:
Pedido: ${pedido.numero_pedido}
Cliente: ${pedido.cliente_nome}
Itens Armado: ${JSON.stringify(pedido.itens_armado_padrao || [])}
Itens Corte/Dobra: ${JSON.stringify(pedido.itens_corte_dobra || [])}
Retorne: sequenciamento, otimização de corte, tempo previsto, riscos e gargalos.`,
        response_json_schema: {
          type: "object",
          properties: {
            sequenciamento_sugerido: { type: "string" },
            otimizacao_corte: { type: "string" },
            tempo_previsto_horas: { type: "number" },
            riscos_identificados: { type: "array", items: { type: "string" } },
            gargalos: { type: "array", items: { type: "string" } }
          }
        }
      });
      setFormData(prev => ({
        ...prev,
        gargalos_detectados: result.gargalos?.map(g => ({ tipo: "Gargalo Produtivo", descricao: g, impacto: "Médio", sugestao_ia: result.otimizacao_corte })) || [],
        observacoes: prev.observacoes + `\n\n🤖 Análise IA:\n${result.sequenciamento_sugerido}\n\nOtimização: ${result.otimizacao_corte}`
      }));
      toast.success("✅ IA gerou sugestões!");
    } catch (error) {
      toast.error("Erro ao gerar sugestões IA");
    }
  };

  const validarEstoque = () => {
    const insuficientes = [];
    (formData.itens || []).forEach(item => {
      const produto = produtosProducao.find(p => p.id === item.produto_id);
      if (produto) {
        const estoqueDisponivel = produto.estoque_disponivel || produto.estoque_atual || 0;
        if (estoqueDisponivel < item.quantidade) {
          insuficientes.push({ produto: produto.descricao, necessario: item.quantidade, disponivel: estoqueDisponivel, faltante: item.quantidade - estoqueDisponivel });
        }
      }
    });
    setProdutosInsuficientes(insuficientes);
    return insuficientes.length === 0;
  };

  const adicionarProduto = (produto) => {
    const itemExistente = formData.itens?.find(i => i.produto_id === produto.id);
    if (itemExistente) { toast.info("Produto já adicionado. Ajuste a quantidade."); return; }
    setFormData(prev => ({
      ...prev,
      itens: [...(prev.itens || []), {
        produto_id: produto.id, descricao: produto.descricao, codigo: produto.codigo,
        quantidade: 0, unidade: produto.unidade_principal,
        peso_teorico_kg_m: produto.peso_teorico_kg_m || 0,
        estoque_disponivel: produto.estoque_disponivel || produto.estoque_atual || 0
      }]
    }));
    setSeletorProdutoAberto(false);
    toast.success(`✅ ${produto.descricao} adicionado`);
  };

  const atualizarQuantidadeItem = (index, quantidade) => {
    const novosItens = [...(formData.itens || [])];
    novosItens[index].quantidade = parseFloat(quantidade) || 0;
    setFormData(prev => ({ ...prev, itens: novosItens }));
  };

  const removerItem = (index) => {
    setFormData(prev => ({ ...prev, itens: (prev.itens || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarEstoque()) { toast.error("❌ Estoque insuficiente de matéria-prima!"); return; }
    saveMutation.mutate(formData);
  };

  return {
    formData, setFormData,
    pedidos, empresas, produtosProducao,
    seletorProdutoAberto, setSeletorProdutoAberto,
    produtosInsuficientes,
    saveMutation,
    handleGerarIA, adicionarProduto, atualizarQuantidadeItem, removerItem, handleSubmit,
  };
}