import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined: validatePedidoForReserva
function validatePedidoForReserva(pedido) {
  const itensRev = Array.isArray(pedido?.itens_revenda) ? pedido.itens_revenda : [];
  const itensArm = Array.isArray(pedido?.itens_armado_padrao) ? pedido.itens_armado_padrao : [];
  const itensCD  = Array.isArray(pedido?.itens_corte_dobra) ? pedido.itens_corte_dobra : [];
  const totalItens = itensRev.length + itensArm.length + itensCD.length;
  const warnings = [];
  if (totalItens === 0) warnings.push('sem_itens');
  if (!pedido?.empresa_id) warnings.push('sem_empresa_id');
  if (!pedido?.cliente_id) warnings.push('sem_cliente');
  return { ok: warnings.length === 0, total_itens: totalItens, warnings };
}

// Inlined: processReservas (from orderReservationUtils)
const ITEM_KEYS = ['itens_revenda','itens_armado_padrao','itens_corte_dobra'];
async function processReservas(base44, data, user) {
  const movimentos = [];
  for (const key of ITEM_KEYS) {
    const itens = Array.isArray(data?.[key]) ? data[key] : [];
    for (const it of itens) {
      const produtoId = it?.produto_id;
      const quantidade = Number(it?.quantidade || 0);
      if (!produtoId || quantidade <= 0) continue;
      const [produto] = await base44.asServiceRole.entities.Produto.filter({ id: produtoId });
      const podeSomar = produto && (produto.unidade_estoque === it?.unidade || !it?.unidade);
      if (podeSomar) {
        const novoReservado = Number(produto?.estoque_reservado || 0) + Number(quantidade || 0);
        await base44.asServiceRole.entities.Produto.update(produto.id, { estoque_reservado: novoReservado });
      }
      const movRecord = {
        origem_movimento: 'pedido', tipo_movimento: 'reserva',
        produto_id: it?.produto_id, produto_descricao: produto?.descricao,
        quantidade, unidade_medida: it?.unidade || produto?.unidade_estoque || 'UN',
        empresa_id: data?.empresa_id || null, group_id: data?.group_id || null,
        data_movimentacao: new Date().toISOString(),
        motivo: `Reserva para Pedido ${data?.numero_pedido || data?.id}`,
        valor_total: 0, responsavel: user?.full_name || user?.email, responsavel_id: user?.id,
      };
      const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create(movRecord);
      if (mov?.id) movimentos.push(mov.id);
    }
  }
  return movimentos;
}

// Inlined: auditPedidoReserva
async function auditPedidoReserva(base44, user, { pedido, movimentos }) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque',
      registro_id: pedido?.id || null,
      descricao: `Movimentações geradas a partir do Pedido ${pedido?.numero_pedido || pedido?.id || ''}`,
      empresa_id: pedido?.empresa_id || null,
      dados_novos: { quantidade_movimentos: Array.isArray(movimentos) ? movimentos.length : 0 },
      data_hora: new Date().toISOString(),
    });
  } catch (auditErr) { console.error('onPedidoCreatedHandler: AuditLog de movimentações falhou:', auditErr); }
}

// Inlined: emitPedidoMovementsGenerated
async function emitPedidoMovementsGenerated(base44, { pedido, movimentos, validation }) {
  const empresa_id = pedido?.empresa_id || null;
  const count = Array.isArray(movimentos) ? movimentos.length : 0;
  try {
    if (base44?.asServiceRole?.entities?.Notificacao?.create) {
      await base44.asServiceRole.entities.Notificacao.create({
        titulo: 'Reserva de Estoque',
        mensagem: `${count} movimentações geradas para o pedido ${pedido?.numero_pedido || pedido?.id || ''}`,
        tipo: 'info', categoria: 'Comercial', prioridade: count > 0 ? 'Normal' : 'Baixa',
        empresa_id, dados: { pedido_id: pedido?.id, movimentos_count: count, validation },
      });
    }
  } catch (notifErr) { console.error('onPedidoCreatedHandler: Notificação de reserva falhou:', notifErr); }
}

// Handler focado e reutilizável para criação de reservas a partir do Pedido
async function handleOnPedidoCreated(base44, ctx, data, user) {
  const validation = validatePedidoForReserva(data);
  const movimentos = await processReservas(base44, data, user);
  await auditPedidoReserva(base44, user, { pedido: data, movimentos });
  await emitPedidoMovementsGenerated(base44, { pedido: data, movimentos, validation });
  return { movimentos, validation };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/pedido/onPedidoCreatedHandler' });
});