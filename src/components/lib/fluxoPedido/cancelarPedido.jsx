import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';
import { atualizarLimiteCreditoCliente } from './aprovarPedido';

/**
 * Libera reserva de estoque (cancelamento de pedido)
 */
async function liberarReservaEstoque(movimentacaoReserva, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: movimentacaoReserva.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];
  if (!produto) return;

  const user = await getUsuarioAtual();
  const mov = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: movimentacaoReserva.group_id,
    tipo_movimento: "liberacao_reserva",
    origem_movimento: "pedido",
    origem_documento_id: movimentacaoReserva.origem_documento_id,
    produto_id: produto.id,
    produto_descricao: produto.descricao,
    codigo_produto: produto.codigo,
    quantidade: movimentacaoReserva.quantidade,
    unidade_medida: produto.unidade_medida,
    estoque_anterior: produto.estoque_atual,
    estoque_atual: produto.estoque_atual,
    reservado_anterior: produto.estoque_reservado || 0,
    reservado_atual: Math.max(0, (produto.estoque_reservado || 0) - movimentacaoReserva.quantidade),
    data_movimentacao: new Date().toISOString(),
    documento: movimentacaoReserva.documento,
    motivo: "Liberação de reserva - pedido cancelado",
    responsavel: (user?.full_name || user?.email || "Sistema"),
    responsavel_id: user?.id
  });

  await auditar("Estoque", "MovimentacaoEstoque", "create", mov.id, "Liberação de reserva - pedido cancelado", empresaId, null, mov);
  await base44.entities.Produto.update(produto.id, {
    estoque_reservado: Math.max(0, (produto.estoque_reservado || 0) - movimentacaoReserva.quantidade)
  });
}

/**
 * Cancelar pedido: libera reservas + cancela contas a receber + libera crédito
 */
export async function cancelarPedidoCompleto(pedido, empresaId) {
  const resultados = { reservasLiberadas: [], contasCanceladas: [], erros: [] };

  try {
    const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
      origem_documento_id: pedido.id,
      tipo_movimento: "reserva"
    });

    for (const mov of movimentacoes) {
      try {
        await liberarReservaEstoque(mov, empresaId);
        resultados.reservasLiberadas.push(mov);
      } catch (error) {
        resultados.erros.push(`Erro ao liberar reserva: ${error.message}`);
      }
    }

    const contas = await base44.entities.ContaReceber.filter({
      pedido_id: pedido.id,
      status: "Pendente"
    });

    for (const conta of contas) {
      await base44.entities.ContaReceber.update(conta.id, { status: "Cancelado" });
      await auditar("Financeiro", "ContaReceber", "update", conta.id, `Conta a receber cancelada (Pedido ${pedido.numero_pedido})`, empresaId, { status: conta.status }, { status: "Cancelado" });
      resultados.contasCanceladas.push(conta);
    }

    if (pedido.cliente_id) {
      await atualizarLimiteCreditoCliente(pedido.cliente_id, pedido.valor_total, 'remover');
    }

    await base44.entities.Pedido.update(pedido.id, { status: "Cancelado" });
    await auditar("Comercial", "Pedido", "update", pedido.id, `Pedido ${pedido.numero_pedido} cancelado`, empresaId, null, { status: "Cancelado" });
  } catch (error) {
    resultados.erros.push(`Erro ao cancelar: ${error.message}`);
  }

  return resultados;
}