import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';

/**
 * Valida limite de crédito do cliente
 */
export async function validarLimiteCredito(pedido) {
  if (!pedido.cliente_id) {
    return { aprovado: true, motivo: "Sem cliente vinculado" };
  }

  const clientes = await base44.entities.Cliente.filter({ id: pedido.cliente_id });
  const cliente = clientes[0];

  if (!cliente) {
    return { aprovado: true, motivo: "Cliente não encontrado" };
  }

  const limiteTotal = cliente.condicao_comercial?.limite_credito || 0;
  const limiteUtilizado = cliente.condicao_comercial?.limite_credito_utilizado || 0;
  const limiteDisponivel = limiteTotal - limiteUtilizado;

  if (pedido.limite_credito_override) {
    return {
      aprovado: true,
      limite_total: limiteTotal,
      limite_utilizado: limiteUtilizado,
      limite_disponivel: limiteDisponivel,
      motivo: `Override aprovado: ${pedido.limite_credito_justificativa}`
    };
  }

  const aprovado = pedido.valor_total <= limiteDisponivel || limiteTotal === 0;

  return {
    aprovado,
    limite_total: limiteTotal,
    limite_utilizado: limiteUtilizado,
    limite_disponivel: limiteDisponivel,
    valor_pedido: pedido.valor_total,
    motivo: aprovado ? "Crédito aprovado" : "Limite insuficiente"
  };
}

/**
 * Atualiza limite de crédito utilizado do cliente
 */
export async function atualizarLimiteCreditoCliente(clienteId, valor, operacao = 'adicionar') {
  const clientes = await base44.entities.Cliente.filter({ id: clienteId });
  const cliente = clientes[0];
  if (!cliente) return;

  const limiteAtual = cliente.condicao_comercial?.limite_credito_utilizado || 0;
  const novoLimite = operacao === 'adicionar' ? limiteAtual + valor : limiteAtual - valor;

  await base44.entities.Cliente.update(clienteId, {
    condicao_comercial: {
      ...(cliente.condicao_comercial || {}),
      limite_credito_utilizado: Math.max(0, novoLimite)
    }
  });
}

/**
 * Baixa estoque na aprovação do pedido (itens de revenda)
 */
export async function baixarEstoqueItemAprovacao(item, pedido, empresaId) {
  const produtos = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: empresaId });
  const produto = produtos[0];

  if (!produto) {
    throw new Error("Produto não encontrado no estoque");
  }

  const estoqueAtual = produto.estoque_atual || 0;

  if (estoqueAtual < item.quantidade) {
    throw new Error(`Estoque insuficiente. Disponível: ${estoqueAtual} ${item.unidade}`);
  }

  const novoEstoque = estoqueAtual - item.quantidade;
  const user = await getUsuarioAtual();

  const movimentacao = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: pedido.group_id,
    tipo_movimento: "saida",
    origem_movimento: "pedido",
    origem_documento_id: pedido.id,
    produto_id: item.produto_id,
    produto_descricao: item.descricao || item.produto_descricao,
    codigo_produto: item.codigo_sku,
    quantidade: item.quantidade,
    unidade_medida: item.unidade,
    estoque_anterior: estoqueAtual,
    estoque_atual: novoEstoque,
    reservado_anterior: 0,
    reservado_atual: 0,
    disponivel_anterior: estoqueAtual,
    disponivel_atual: novoEstoque,
    data_movimentacao: new Date().toISOString(),
    documento: pedido.numero_pedido,
    motivo: `Baixa automática - Pedido ${pedido.numero_pedido} aprovado`,
    responsavel: (user?.full_name || user?.email || "Sistema"),
    responsavel_id: user?.id,
    valor_unitario: item.preco_unitario || item.valor_unitario,
    valor_total: item.valor_total || (item.quantidade * (item.preco_unitario || 0)),
    aprovado: true
  });

  await base44.entities.Produto.update(item.produto_id, { estoque_atual: novoEstoque });
  await auditar("Estoque", "MovimentacaoEstoque", "create", movimentacao.id, `Baixa por faturamento - Pedido ${pedido.numero_pedido}`, empresaId, null, movimentacao);
  return movimentacao;
}

/**
 * Gera OP automática a partir dos itens de produção do pedido
 */
async function gerarOPAutomatica(pedido, empresaId) {
  const numeroOP = `OP-${Date.now()}`;
  const materiaisNecessarios = [];
  let pesoTotal = 0;

  for (const item of pedido.itens_producao || []) {
    if (item.ferro_principal_bitola && item.ferro_principal_peso_kg) {
      materiaisNecessarios.push({
        bitola_id: item.ferro_principal_bitola,
        descricao: `Ferro ${item.ferro_principal_bitola}`,
        quantidade_kg: item.ferro_principal_peso_kg * item.quantidade,
        unidade: "KG"
      });
      pesoTotal += item.ferro_principal_peso_kg * item.quantidade;
    }
    if (item.estribo_bitola && item.estribo_peso_kg) {
      materiaisNecessarios.push({
        bitola_id: item.estribo_bitola,
        descricao: `Estribo ${item.estribo_bitola}`,
        quantidade_kg: item.estribo_peso_kg * item.quantidade,
        unidade: "KG"
      });
      pesoTotal += item.estribo_peso_kg * item.quantidade;
    }
  }

  const user = await getUsuarioAtual();
  const op = await base44.entities.OrdemProducao.create({
    empresa_id: empresaId,
    group_id: pedido.group_id,
    numero_op: numeroOP,
    pedido_id: pedido.id,
    numero_pedido: pedido.numero_pedido,
    cliente_id: pedido.cliente_id,
    cliente_nome: pedido.cliente_nome,
    origem: "pedido",
    gerada_automaticamente: true,
    tipo_producao: "misto",
    data_emissao: new Date().toISOString().split('T')[0],
    data_prevista_inicio: new Date().toISOString().split('T')[0],
    data_prevista_conclusao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prazo_dias: 7,
    prioridade: pedido.prioridade || "Normal",
    status: "Liberada",
    itens_producao: pedido.itens_producao,
    materiais_necessarios: materiaisNecessarios,
    peso_teorico_total_kg: pesoTotal,
    itens_total: pedido.itens_producao?.length || 0,
    itens_concluidos: 0,
    percentual_conclusao: 0,
    historico_status: [{
      status_anterior: null,
      status_novo: "Liberada",
      data_hora: new Date().toISOString(),
      usuario: (user?.full_name || user?.email || "Sistema"),
      observacao: "OP gerada automaticamente na aprovação do pedido"
    }]
  });

  await auditar("Produção", "OrdemProducao", "create", op.id, `OP ${numeroOP} gerada do Pedido ${pedido.numero_pedido}`, empresaId, null, op);
  await base44.entities.Pedido.update(pedido.id, {
    ordem_producao_ids: [...(pedido.ordem_producao_ids || []), op.id],
    status: "Em Produção"
  });

  return op;
}

/**
 * Gera conta a receber a partir de parcela
 */
async function gerarContaReceber(pedido, parcela, empresaId) {
  const conta = await base44.entities.ContaReceber.create({
    empresa_id: empresaId,
    group_id: pedido.group_id,
    origem_tipo: "pedido",
    descricao: `Pedido ${pedido.numero_pedido} - Parcela ${parcela.numero_parcela}`,
    cliente: pedido.cliente_nome,
    cliente_id: pedido.cliente_id,
    pedido_id: pedido.id,
    valor: parcela.valor,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: parcela.data_vencimento,
    status: "Pendente",
    forma_recebimento: pedido.forma_pagamento,
    numero_parcela: parcela.numero_parcela.toString(),
    observacoes: `Gerado automaticamente do pedido ${pedido.numero_pedido}`
  });
  await auditar("Financeiro", "ContaReceber", "create", conta.id, `CR gerada do Pedido ${pedido.numero_pedido} - Parcela ${parcela.numero_parcela}`, empresaId, null, conta);
  return conta;
}

/**
 * Aprovar pedido completo: valida crédito + baixa estoque + gera OP + gera contas a receber
 */
export async function aprovarPedidoCompleto(pedido, empresaId) {
  const resultados = { validacaoCredito: null, reservasEstoque: [], opsGeradas: [], contasReceber: [], erros: [] };

  try {
    const validacaoCredito = await validarLimiteCredito(pedido);
    resultados.validacaoCredito = validacaoCredito;

    if (!validacaoCredito.aprovado) {
      resultados.erros.push(`Limite de crédito insuficiente: disponível R$ ${validacaoCredito.limite_disponivel}`);
      return resultados;
    }

    if (pedido.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        try {
          const baixa = await baixarEstoqueItemAprovacao(item, pedido, empresaId);
          resultados.reservasEstoque.push(baixa);
        } catch (error) {
          resultados.erros.push(`Erro ao baixar estoque ${item.descricao}: ${error.message}`);
        }
      }
    }

    if (pedido.itens_producao?.length > 0) {
      try {
        const op = await gerarOPAutomatica(pedido, empresaId);
        resultados.opsGeradas.push(op);
      } catch (error) {
        resultados.erros.push(`Erro ao gerar OP: ${error.message}`);
      }
    }

    if (pedido.forma_pagamento && pedido.parcelas?.length > 0) {
      for (const parcela of pedido.parcelas) {
        try {
          const conta = await gerarContaReceber(pedido, parcela, empresaId);
          resultados.contasReceber.push(conta);
        } catch (error) {
          resultados.erros.push(`Erro ao gerar conta a receber: ${error.message}`);
        }
      }
    }

    if (pedido.cliente_id) {
      await atualizarLimiteCreditoCliente(pedido.cliente_id, pedido.valor_total, 'adicionar');
    }

    await base44.entities.Pedido.update(pedido.id, {
      status: "Aprovado",
      data_aprovacao: new Date().toISOString()
    });
    await auditar("Comercial", "Pedido", "update", pedido.id, `Pedido ${pedido.numero_pedido} aprovado`, empresaId, null, { status: "Aprovado" });

    const userHC = await getUsuarioAtual();
    await base44.entities.HistoricoCliente.create({
      empresa_id: empresaId,
      group_id: pedido.group_id,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      modulo_origem: "Comercial",
      referencia_id: pedido.id,
      referencia_tipo: "Pedido",
      referencia_numero: pedido.numero_pedido,
      tipo_evento: "Aprovacao",
      titulo_evento: "Pedido Aprovado e Processado",
      descricao_detalhada: `Pedido aprovado. ${resultados.reservasEstoque.length} baixas de estoque, ${resultados.opsGeradas.length} OPs geradas`,
      usuario_responsavel: (userHC?.full_name || userHC?.email || "Sistema"),
      data_evento: new Date().toISOString(),
      valor_relacionado: pedido.valor_total
    });
  } catch (error) {
    resultados.erros.push(`Erro geral: ${error.message}`);
  }

  return resultados;
}