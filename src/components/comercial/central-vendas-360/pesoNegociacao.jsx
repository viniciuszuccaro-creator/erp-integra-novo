/**
 * Peso das negociações da Central 360°.
 * Usa o peso já gravado no documento (pedido) e, quando não houver, calcula pelos
 * cadastros oficiais de Produto (peso bruto e fatores de conversão de unidade).
 * Nenhuma regra comercial nova: apenas leitura dos dados mestres.
 */

const numero = (valor) => Number(valor || 0);

// Quilogramas por unidade de venda, conforme fatores oficiais do produto
const kgPorUnidade = (unidade, produto) => {
  const fatores = produto?.fatores_conversao || {};
  switch (String(unidade || produto?.unidade_principal || 'UN').toUpperCase()) {
    case 'KG':
      return 1;
    case 'TON':
      return numero(fatores.kg_por_ton) || 1000;
    case 'MT':
    case 'METRO':
      return numero(fatores.kg_por_metro) || numero(produto?.peso_teorico_kg_m);
    case 'M2':
    case 'M3':
      return numero(fatores.kg_por_metro) || numero(produto?.peso_bruto_kg);
    case 'PÇ':
    case 'PC':
    case 'PEÇA':
    case 'BARRA':
      return numero(fatores.kg_por_peca);
    default:
      return numero(produto?.peso_bruto_kg) || numero(produto?.peso_liquido_kg);
  }
};

export function pesoDoItem(item, produto) {
  if (!produto) return 0;
  const quantidade = numero(item?.quantidade);
  if (!quantidade) return 0;
  return quantidade * kgPorUnidade(item?.unidade, produto);
}

export function pesoDaNegociacao(negociacao, produtosPorId = {}) {
  if (!negociacao) return null;

  const pesoDocumento = numero(negociacao.registro?.peso_total_kg) || numero(negociacao.registro?.peso_total);
  if (pesoDocumento > 0) return { kg: pesoDocumento, origem: 'documento' };

  const itens = negociacao.itens || [];
  if (!itens.length) return null;

  let total = 0;
  let itensComPeso = 0;
  itens.forEach((item) => {
    const produto = item.produto_id ? produtosPorId[item.produto_id] : null;
    const peso = pesoDoItem(item, produto);
    if (peso > 0) {
      total += peso;
      itensComPeso += 1;
    }
  });

  if (total <= 0) return null;
  return {
    kg: total,
    origem: itensComPeso === itens.length ? 'cadastro' : 'parcial',
  };
}

export const TITULO_ORIGEM_PESO = {
  documento: 'Peso informado no documento do pedido',
  cadastro: 'Peso calculado pelos cadastros oficiais de Produto',
  parcial: 'Peso parcial: há itens sem peso cadastrado no Produto',
};