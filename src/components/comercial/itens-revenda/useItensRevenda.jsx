import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { converterUnidade } from "@/components/lib/CalculadoraUnidades";

/**
 * Hook extraído de ItensRevendaTab.jsx
 * Gerencia busca de produtos, adição/remoção de itens, IA sugestão e cópia de último pedido
 */
export function useItensRevenda({ formData, setFormData }) {
  const [search, setSearch] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [unidadeVenda, setUnidadeVenda] = useState('UN');
  const [descontoItem, setDescontoItem] = useState(0);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-revenda', formData?.empresa_id, formData?.group_id],
    queryFn: async () => {
      const filter = formData?.empresa_id
        ? { empresa_id: formData.empresa_id, tipo_item: 'Revenda', status: 'Ativo' }
        : { tipo_item: 'Revenda', status: 'Ativo' };
      if (formData?.group_id) filter.group_id = formData.group_id;
      return await base44.entities.Produto.filter(filter);
    },
    enabled: true
  });

  const produtosFiltrados = produtos.filter(p =>
    p.descricao?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setUnidadeVenda((produto.unidades_secundarias?.length > 0 ? produto.unidades_secundarias[0] : 'UN'));
    setSearch('');
  };

  const adicionarItem = () => {
    if (!produtoSelecionado) { toast.error('Selecione um produto'); return; }

    const quantidadeKG = converterUnidade(quantidade, unidadeVenda, 'KG', produtoSelecionado);
    const precoBase = produtoSelecionado.preco_venda || 0;
    const descontoValor = (precoBase * descontoItem) / 100;
    const precoUnitario = precoBase - descontoValor;
    const valorTotal = precoUnitario * quantidade;

    const novoItem = {
      produto_id: produtoSelecionado.id,
      codigo_sku: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade_medida: unidadeVenda,
      quantidade,
      quantidade_kg: quantidadeKG,
      custo_unitario: produtoSelecionado.custo_medio || 0,
      preco_base_produto: precoBase,
      preco_unitario_bruto: precoBase,
      desconto_item_percentual: descontoItem,
      desconto_item_valor: descontoValor * quantidade,
      preco_unitario: precoUnitario,
      valor_item: valorTotal,
      margem_percentual: precoUnitario > 0
        ? (((precoUnitario - (produtoSelecionado.custo_medio || 0)) / precoUnitario) * 100) : 0,
      estoque_disponivel: produtoSelecionado.estoque_disponivel || 0,
      peso_unitario: quantidade > 0 ? (quantidadeKG / quantidade) : 0
    };

    setFormData(prev => ({
      ...prev,
      itens_revenda: [...(prev?.itens_revenda || []), novoItem]
    }));

    setProdutoSelecionado(null);
    setQuantidade(1);
    setUnidadeVenda('UN');
    setDescontoItem(0);
    setSearch('');
    toast.success('✅ Item adicionado');
  };

  const removerItem = (index) => {
    setFormData(prev => ({
      ...prev,
      itens_revenda: (prev?.itens_revenda || []).filter((_, i) => i !== index)
    }));
    toast.success('✅ Item removido');
  };

  const copiarUltimoPedido = async () => {
    if (!formData?.cliente_id) { toast.error('Selecione um cliente primeiro'); return; }

    const filter = { cliente_id: formData.cliente_id };
    if (formData?.group_id) filter.group_id = formData.group_id;

    const pedidosCliente = await base44.entities.Pedido.filter(filter, '-data_pedido', 1);

    if (pedidosCliente.length > 0 && pedidosCliente[0].itens_revenda?.length > 0) {
      setFormData(prev => ({
        ...prev,
        itens_revenda: [...(prev?.itens_revenda || []), ...pedidosCliente[0].itens_revenda]
      }));
      toast.success(`✅ ${pedidosCliente[0].itens_revenda.length} item(ns) copiado(s)`);
    } else {
      toast.error(pedidosCliente.length > 0 ? 'Último pedido não tem itens de revenda' : 'Cliente não tem pedidos anteriores');
    }
  };

  const sugerirQuantidadeIA = async () => {
    if (!produtoSelecionado || !formData?.cliente_id) {
      toast.info('Selecione um cliente e um produto antes de pedir sugestões.');
      return;
    }

    try {
      const filter = { cliente_id: formData.cliente_id };
      if (formData?.group_id) filter.group_id = formData.group_id;

      const historicoPedidos = await base44.entities.Pedido.filter(filter, '-data_pedido', 5);

      let quantidadeTotal = 0, numeroDeCompras = 0;
      historicoPedidos.forEach(ped => {
        (ped.itens_revenda || []).forEach(item => {
          if (item.produto_id === produtoSelecionado.id) {
            const qtdConvertida = converterUnidade(
              item.quantidade, item.unidade_medida || 'UN', unidadeVenda, produtoSelecionado
            );
            quantidadeTotal += qtdConvertida;
            numeroDeCompras++;
          }
        });
      });

      if (numeroDeCompras > 0) {
        const sugestao = parseFloat((quantidadeTotal / numeroDeCompras).toFixed(2));
        setQuantidade(sugestao);
        toast.success(`🧠 IA sugere: ${sugestao} ${unidadeVenda} (baseado em ${numeroDeCompras} compra(s) anteriores)`);
      } else {
        toast.info('Cliente nunca comprou este produto. Nenhuma sugestão disponível.');
      }
    } catch (error) {
      console.error('Erro ao obter sugestão da IA:', error);
      toast.error('Falha ao obter sugestão da IA.');
    }
  };

  const opcoesUnidade = produtoSelecionado?.unidades_secundarias || ['UN'];

  return {
    search, setSearch, produtoSelecionado, selecionarProduto,
    quantidade, setQuantidade, unidadeVenda, setUnidadeVenda,
    descontoItem, setDescontoItem, produtosFiltrados,
    adicionarItem, removerItem, copiarUltimoPedido, sugerirQuantidadeIA, opcoesUnidade
  };
}