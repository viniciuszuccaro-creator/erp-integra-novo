import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined from _lib/notificationService
async function notify(base44, notif, options = {}) {
  const { titulo, mensagem, tipo = 'info', categoria = 'Sistema', prioridade = 'Normal', empresa_id = null, dados = null } = notif || {};
  try {
    if (base44?.asServiceRole?.entities?.Notificacao?.create) {
      await base44.asServiceRole.entities.Notificacao.create({ titulo, mensagem, tipo, categoria, prioridade, empresa_id, dados });
    }
  } catch (notifErr) { console.error('pedidoEvents: Notificação falhou:', notifErr); }
}

// Emite notificação padrão quando movimentos/reservas são gerados a partir do Pedido
async function emitPedidoMovementsGenerated(base44, { pedido, movimentos, validation }) {
  const empresa_id = pedido?.empresa_id || null;
  const count = Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0);

  await notify(base44, {
    titulo: 'Reserva de Estoque',
    mensagem: `${count} movimentações geradas para o pedido ${pedido?.numero_pedido || pedido?.id || ''}`,
    tipo: 'info',
    categoria: 'Comercial',
    prioridade: count > 0 ? 'Normal' : 'Baixa',
    empresa_id,
    dados: { pedido_id: pedido?.id, movimentos_count: count, validation },
  }, { whatsapp: false });
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/pedido/pedidoEvents' });
});