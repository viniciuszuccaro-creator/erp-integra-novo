import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook: lógica de cálculo de itens, descontos, totais e estoque
 * P2: Multi-tenant — usa filterInContext
 */
export default function useAnalisePedidoCalculo(pedidoProp) {
  const [comentarios, setComentarios] = useState("");
  const [descontoGeralPercentual, setDescontoGeralPercentual] = useState(
    pedidoProp.desconto_solicitado_percentual || 0
  );
  const [descontoGeralValor, setDescontoGeralValor] = useState(
    pedidoProp.desconto_geral_pedido_valor || 0
  );
  const [fecharAutomatico, setFecharAutomatico] = useState(false);
  const [descontosItens, setDescontosItens] = useState({});

  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${pedidoProp.empresa_id || empresaAtual?.id || 'sem-empresa'}`;

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-analise', contextoKey],
    queryFn: () => filterInContext('Produto', { empresa_id: pedidoProp.empresa_id }, '-updated_date', 200),
    enabled: !!contextoKey,
  });

  const todosItens = useMemo(() => {
    const itens = [];
    if (pedidoProp.itens_revenda?.length > 0) {
      pedidoProp.itens_revenda.forEach((item, idx) => {
        itens.push({ ...item, tipo: "Revenda", id_interno: `revenda_${idx}`, desconto_percentual: item.desconto_percentual || 0, desconto_valor: item.desconto_valor || 0 });
      });
    }
    if (pedidoProp.itens_armado_padrao?.length > 0) {
      pedidoProp.itens_armado_padrao.forEach((item, idx) => {
        itens.push({ ...item, tipo: "Armado Padrão", id_interno: `armado_${idx}`, desconto_percentual: item.desconto_percentual || 0, desconto_valor: item.desconto_valor || 0 });
      });
    }
    if (pedidoProp.itens_corte_dobra?.length > 0) {
      pedidoProp.itens_corte_dobra.forEach((item, idx) => {
        itens.push({ ...item, tipo: "Corte e Dobra", id_interno: `corte_${idx}`, desconto_percentual: item.desconto_percentual || 0, desconto_valor: item.desconto_valor || 0 });
      });
    }
    return itens;
  }, [pedidoProp]);

  const verificarEstoqueItem = (item) => {
    if (!item.produto_id) return { disponivel: true, estoque: 0 };
    const produto = produtos.find(p => p.id === item.produto_id);
    if (!produto) return { disponivel: false, estoque: 0 };
    const estoqueAtual = produto.estoque_atual || 0;
    const quantidadeNecessaria = item.quantidade || 0;
    return { disponivel: estoqueAtual >= quantidadeNecessaria, estoque: estoqueAtual, necessario: quantidadeNecessaria, falta: Math.max(0, quantidadeNecessaria - estoqueAtual) };
  };

  const calcularValoresItem = (item) => {
    const descontoItem = descontosItens[item.id_interno] || { percentual: item.desconto_percentual || 0, valor: item.desconto_valor || 0 };
    const precoUnitario = item.preco_unitario || item.valor_unitario || 0;
    const quantidade = item.quantidade || 1;
    const custoUnitario = item.custo_unitario || item.custo_medio || 0;
    const valorBruto = precoUnitario * quantidade;
    let valorDesconto = 0;
    if (descontoItem.valor > 0) valorDesconto = descontoItem.valor;
    else if (descontoItem.percentual > 0) valorDesconto = (valorBruto * descontoItem.percentual) / 100;
    const valorLiquido = valorBruto - valorDesconto;
    const precoUnitarioComDesconto = valorLiquido / quantidade;
    const markup = custoUnitario > 0 ? ((precoUnitarioComDesconto - custoUnitario) / custoUnitario) * 100 : 0;
    return { valorBruto, valorDesconto, valorLiquido, precoUnitarioComDesconto, markup, custoUnitario, estoque: verificarEstoqueItem(item) };
  };

  const totaisPedido = useMemo(() => {
    let subtotal = 0, descontoItensTotal = 0, margemMedia = 0;
    todosItens.forEach(item => {
      const valores = calcularValoresItem(item);
      subtotal += valores.valorBruto;
      descontoItensTotal += valores.valorDesconto;
      margemMedia += valores.markup;
    });
    margemMedia = todosItens.length > 0 ? margemMedia / todosItens.length : 0;
    let descontoGeral = 0;
    if (descontoGeralValor > 0) descontoGeral = descontoGeralValor;
    else if (descontoGeralPercentual > 0) descontoGeral = (subtotal * descontoGeralPercentual) / 100;
    const valorFinal = subtotal - descontoItensTotal - descontoGeral + (pedidoProp.valor_frete || 0);
    return { subtotal, descontoItensTotal, descontoGeral, valorFinal, margemMedia };
  }, [todosItens, descontosItens, descontoGeralPercentual, descontoGeralValor, pedidoProp.valor_frete]);

  const handleDescontoItemChange = (itemId, tipo, valor) => {
    setDescontosItens(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [tipo]: parseFloat(valor) || 0, [tipo === 'percentual' ? 'valor' : 'percentual']: 0 }
    }));
  };

  const temEstoqueInsuficiente = todosItens.some(item => {
    if (item.tipo !== "Revenda") return false;
    return !calcularValoresItem(item).estoque.disponivel;
  });

  return {
    comentarios, setComentarios,
    descontoGeralPercentual, setDescontoGeralPercentual,
    descontoGeralValor, setDescontoGeralValor,
    fecharAutomatico, setFecharAutomatico,
    descontosItens,
    todosItens,
    calcularValoresItem,
    totaisPedido,
    handleDescontoItemChange,
    temEstoqueInsuficiente,
  };
}