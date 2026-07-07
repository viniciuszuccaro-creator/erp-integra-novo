export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getProdutoEstoqueDisponivel(produto) {
  const estoqueDisponivel = produto?.estoque_disponivel;
  if (estoqueDisponivel !== undefined && estoqueDisponivel !== null && estoqueDisponivel !== '') return safeNumber(estoqueDisponivel);
  return safeNumber(produto?.estoque_atual) - safeNumber(produto?.estoque_reservado);
}

export function isProdutoEstoqueBaixo(produto) {
  const estoqueMinimo = safeNumber(produto?.estoque_minimo);
  return produto?.status === 'Ativo' && estoqueMinimo > 0 && getProdutoEstoqueDisponivel(produto) <= estoqueMinimo;
}