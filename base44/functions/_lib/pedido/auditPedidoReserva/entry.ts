import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined from _lib/estoque/auditUtils
async function stockAudit(base44, user, { acao, entidade, registro_id, descricao, empresa_id = null, dados_novos = null }) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      usuario_id: user?.id,
      acao, modulo: 'Estoque', entidade, registro_id, descricao,
      empresa_id: empresa_id || null,
      dados_novos: dados_novos || null,
      data_hora: new Date().toISOString(),
    });
  } catch (auditErr) { console.error('auditPedidoReserva: AuditLog de estoque falhou:', auditErr); }
}

// Helper: auditoria padronizada para reservas/movimentos gerados a partir do Pedido
async function auditPedidoReserva(base44, user, { pedido, movimentos }) {
  await stockAudit(base44, user, {
    acao: 'Criação',
    entidade: 'MovimentacaoEstoque',
    registro_id: pedido?.id || null,
    descricao: `Movimentações geradas a partir do Pedido ${pedido?.numero_pedido || pedido?.id || ''}`,
    empresa_id: pedido?.empresa_id || null,
    dados_novos: { quantidade_movimentos: Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0) }
  });
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/pedido/auditPedidoReserva' });
});