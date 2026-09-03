/**
 * Validações de negócio - V12.0
 * Crédito, estoque e preço mínimo de pedido
 * Regra-Mãe 3: extraído de validacoes.jsx — comportamento preservado
 */

// Validar limite de crédito do cliente
export const validarLimiteCredito = (cliente, valorPedido) => {
  if (!cliente?.condicao_comercial) {
    return { valido: true, mensagem: '' };
  }

  const limite = cliente.condicao_comercial.limite_credito || 0;
  const utilizado = cliente.condicao_comercial.limite_credito_utilizado || 0;
  const disponivel = limite - utilizado;

  if (cliente.status === 'Bloqueado') {
    return {
      valido: false,
      mensagem: '❌ Cliente bloqueado! Não é possível aprovar o pedido.',
      bloqueado: true
    };
  }

  if (valorPedido > disponivel) {
    return {
      valido: false,
      mensagem: `⚠️ Limite de crédito insuficiente! Disponível: R$ ${disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Necessário: R$ ${valorPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      limite_excedido: true,
      disponivel,
      necessario: valorPedido
    };
  }

  const percentualUtilizado = limite > 0 ? ((utilizado + valorPedido) / limite) * 100 : 0;

  if (percentualUtilizado >= 90) {
    return {
      valido: true,
      mensagem: `⚠️ Atenção: Cliente próximo do limite de crédito (${percentualUtilizado.toFixed(0)}%)`,
      alerta: true
    };
  }

  return { valido: true, mensagem: '' };
};

// Validar estoque antes de aprovar pedido
export const validarEstoquePedido = async (pedido, base44) => {
  const itensRevenda = pedido.itens_revenda || [];
  const itensInsuficientes = [];

  for (const item of itensRevenda) {
    if (!item.produto_id) continue;

    const produto = await base44.entities.Produto.filter({ id: item.produto_id });
    if (produto.length === 0) continue;

    const produtoData = produto[0];
    const disponivel = (produtoData.estoque_atual || 0) - (produtoData.estoque_reservado || 0);

    if (disponivel < item.quantidade) {
      itensInsuficientes.push({
        descricao: item.descricao,
        solicitado: item.quantidade,
        disponivel,
        faltando: item.quantidade - disponivel
      });
    }
  }

  if (itensInsuficientes.length > 0) {
    return {
      valido: false,
      itensInsuficientes,
      mensagem: `⚠️ ${itensInsuficientes.length} item(ns) com estoque insuficiente`
    };
  }

  return { valido: true, mensagem: '' };
};

// Validar preço abaixo do custo
export const validarPrecoMinimo = (item, produto) => {
  if (!produto?.custo_medio) {
    return { valido: true, mensagem: '' };
  }

  const precoVenda = item.preco_unitario || item.preco_venda_unitario || 0;
  const custo = produto.custo_medio;
  const margemMinima = produto.margem_minima_percentual || 10;

  const precoMinimo = custo * (1 + margemMinima / 100);

  if (precoVenda < custo) {
    return {
      valido: false,
      mensagem: `❌ Preço abaixo do custo! Custo: R$ ${custo.toFixed(2)} | Preço: R$ ${precoVenda.toFixed(2)}`,
      prejuizo: true
    };
  }

  if (precoVenda < precoMinimo) {
    const margemAtual = ((precoVenda - custo) / custo) * 100;
    return {
      valido: false,
      mensagem: `⚠️ Margem abaixo do mínimo! Margem atual: ${margemAtual.toFixed(1)}% | Mínima: ${margemMinima}%`,
      margem_baixa: true,
      requer_aprovacao: true
    };
  }

  return { valido: true, mensagem: '' };
};