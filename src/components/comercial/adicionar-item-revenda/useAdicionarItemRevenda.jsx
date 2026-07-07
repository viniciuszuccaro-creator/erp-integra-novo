import { useState } from "react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { calcularPrecoItem } from "../CalculadorPrecoItem";

export default function useAdicionarItemRevenda({
  cliente,
  tabelaPreco,
  tabelaPrecoItens = [],
  margemMinimaSistema = 10,
}) {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [descontoValor, setDescontoValor] = useState(0);
  const [justificativaDesconto, setJustificativaDesconto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(true);

  const { contexto } = useContextoVisual();

  const { data: produtos = [] } = useRLSQuery("Produto", { tipo_item: 'Revenda', status: 'Ativo' }, "descricao", 999);

  const produtosAtivos = produtos.filter(
    (p) => p.status === "Ativo" && p.tipo_item === "Revenda"
  );

  const produtosFiltrados = produtosAtivos.filter(
    (p) =>
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculo = produtoSelecionado
    ? calcularPrecoItem({
        produto: produtoSelecionado,
        tabelaPreco,
        tabelaPrecoItens,
        descontoPadraoCliente:
          cliente?.condicao_comercial?.percentual_desconto || 0,
        descontoItemPercentual: descontoPercentual,
        descontoItemValor: descontoValor,
        quantidade,
        margemMinimaCliente: cliente?.condicao_comercial?.margem_minima || null,
        margemMinimaSistema,
      })
    : null;

  const resetForm = () => {
    setProdutoSelecionado(null);
    setQuantidade(1);
    setDescontoPercentual(0);
    setDescontoValor(0);
    setJustificativaDesconto("");
    setObservacoes("");
    setSearchTerm("");
    setMostrarSugestoes(true);
  };

  const handleSelecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setSearchTerm(produto.descricao);
    setMostrarSugestoes(false);
  };

  const buildNovoItem = () => {
    if (!produtoSelecionado || !calculo) return null;

    if (calculo.margem_violada && !justificativaDesconto.trim()) {
      toast.error(
        "Margem mínima violada! É necessário informar uma justificativa para o desconto."
      );
      return null;
    }

    return {
      produto_id: produtoSelecionado.id,
      codigo_sku: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_medida,
      quantidade,
      custo_unitario: calculo.custo_unitario,
      preco_base_produto: produtoSelecionado.preco_venda,
      preco_tabela:
        calculo.origem_preco === "tabela_preco"
          ? calculo.preco_unitario_bruto
          : null,
      preco_unitario_bruto: calculo.preco_unitario_bruto,
      desconto_padrao_cliente_percentual:
        cliente?.condicao_comercial?.percentual_desconto || 0,
      desconto_item_percentual: descontoPercentual,
      desconto_item_valor: descontoValor,
      preco_unitario: calculo.preco_unitario,
      valor_item: calculo.valor_item,
      margem_percentual: calculo.margem_percentual,
      margem_valor: calculo.margem_valor,
      margem_minima_produto: produtoSelecionado.margem_minima_percentual,
      margem_violada: calculo.margem_violada,
      aprovacao_margem_necessaria: calculo.margem_violada,
      aprovacao_margem_concedida: false,
      justificativa_desconto: justificativaDesconto,
      estoque_disponivel:
        produtoSelecionado.estoque_disponivel ||
        produtoSelecionado.estoque_atual ||
        0,
      situacao_item:
        (produtoSelecionado.estoque_disponivel || 0) >= quantidade
          ? "Em Estoque"
          : "Sob Encomenda",
      ncm: produtoSelecionado.ncm,
      observacoes,
      _calculo_detalhado: calculo.detalhes_calculo,
    };
  };

  const handleAdicionarItem = (onAddItem, onClose) => {
    const novoItem = buildNovoItem();
    if (!novoItem) return;
    onAddItem(novoItem);
    resetForm();
    onClose();
  };

  return {
    produtoSelecionado,
    quantidade,
    descontoPercentual,
    descontoValor,
    justificativaDesconto,
    observacoes,
    searchTerm,
    mostrarSugestoes,
    produtosFiltrados,
    calculo,
    setQuantidade,
    setDescontoPercentual,
    setDescontoValor,
    setJustificativaDesconto,
    setObservacoes,
    setSearchTerm,
    setMostrarSugestoes,
    handleSelecionarProduto,
    handleAdicionarItem,
    resetForm,
  };
}