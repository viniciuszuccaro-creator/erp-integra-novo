import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';

/**
 * Baixa estoque de item (liberação de reserva no faturamento)
 */
async function baixarEstoqueItem(item, pedido, empresaId) {
  const produtos = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: empresaId });
  const produto = produtos[0];

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  const novoReservado = Math.max(0, (produto.estoque_reservado || 0) - item.quantidade);
  const novoEstoque = (produto.estoque_atual || 0) - item.quantidade;

  if (novoEstoque < 0) {
    throw new Error(`Estoque insuficiente para ${produto.descricao}`);
  }

  const user = await getUsuarioAtual();
  const movimentacao = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: pedido.group_id,
    tipo_movimento: "liberacao_reserva",
    origem_movimento: "pedido",
    origem_documento_id: pedido.id,
    produto_id: item.produto_id,
    produto_descricao: item.descricao,
    codigo_produto: item.codigo_sku,
    quantidade: item.quantidade,
    unidade_medida: item.unidade,
    estoque_anterior: produto.estoque_atual,
    estoque_atual: novoEstoque,
    reservado_anterior: produto.estoque_reservado || 0,
    reservado_atual: novoReservado,
    data_movimentacao: new Date().toISOString(),
    documento: pedido.numero_pedido,
    motivo: `Baixa por faturamento - NF-e`,
    responsavel: (user?.full_name || user?.email || "Sistema"),
    responsavel_id: user?.id
  });

  await base44.entities.Produto.update(item.produto_id, {
    estoque_atual: novoEstoque,
    estoque_reservado: novoReservado
  });

  await auditar("Estoque", "MovimentacaoEstoque", "create", movimentacao.id, `Baixa por faturamento - Pedido ${pedido.numero_pedido}`, empresaId, null, movimentacao);
  return movimentacao;
}

/**
 * Faturar pedido: baixa estoque + cria entrega
 */
export async function faturarPedidoCompleto(pedido, nfe, empresaId) {
  const resultados = { baixasEstoque: [], entrega: null, erros: [] };

  // Vol 5.2/Regra-Mãe: Faturamento deve ocorrer na empresa, nunca no grupo.
  // Emissão de NF-e só na empresa — bloqueia faturamento sem empresa_id explícita.
  if (!empresaId) {
    resultados.erros.push('Faturamento bloqueado: empresa_id é obrigatório. NF-e só pode ser emitida na empresa, não no grupo.');
    return resultados;
  }
  if (!pedido?.group_id) {
    resultados.erros.push('Faturamento bloqueado: pedido sem group_id (multiempresa).');
    return resultados;
  }

  try {
    if (pedido.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        try {
          const baixa = await baixarEstoqueItem(item, pedido, empresaId);
          resultados.baixasEstoque.push(baixa);
        } catch (error) {
          resultados.erros.push(`Erro ao baixar ${item.descricao}: ${error.message}`);
        }
      }
    }

    const user = await getUsuarioAtual();
    const entrega = await base44.entities.Entrega.create({
      empresa_id: empresaId,
      group_id: pedido.group_id,
      pedido_id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      nfe_id: nfe?.id,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      endereco_entrega_completo: pedido.endereco_entrega_principal,
      contato_entrega: pedido.contatos_cliente?.[0] || {},
      data_previsao: pedido.data_prevista_entrega,
      transportadora: pedido.transportadora,
      tipo_frete: pedido.tipo_frete,
      volumes: pedido.volumes,
      peso_total_kg: pedido.peso_total_kg,
      valor_frete: pedido.valor_frete,
      valor_mercadoria: pedido.valor_total,
      status: "Pronto para Expedir",
      prioridade: pedido.prioridade || "Normal",
      usuario_responsavel: (user?.full_name || user?.email || 'Sistema'),
      usuario_responsavel_id: user?.id,
      qr_code: `ENT-${Date.now()}`,
      historico_status: [{
        status: "Pronto para Expedir",
        data_hora: new Date().toISOString(),
        usuario: (user?.full_name || user?.email || "Sistema"),
        observacao: "Entrega criada automaticamente no faturamento"
      }]
    });

    await auditar("Logística", "Entrega", "create", entrega.id, `Entrega criada do Pedido ${pedido.numero_pedido}`, empresaId, null, entrega);
    resultados.entrega = entrega;

    await base44.entities.Pedido.update(pedido.id, {
      status: "Faturado",
      ordem_expedicao_id: entrega.id,
      data_entrega_realizada: new Date().toISOString().split('T')[0]
    });
    await auditar("Comercial", "Pedido", "update", pedido.id, `Pedido ${pedido.numero_pedido} faturado`, empresaId, null, { status: "Faturado" });
  } catch (error) {
    resultados.erros.push(`Erro no faturamento: ${error.message}`);
  }

  return resultados;
}