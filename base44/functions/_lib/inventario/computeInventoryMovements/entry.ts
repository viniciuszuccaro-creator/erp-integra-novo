// Inlined from _lib/inventoryUtils
function buildMovementRecord(inv, item, user) {
  const delta = Number(item.ajuste || 0);
  if (!item.produto_id || delta === 0) return null;
  return {
    origem_movimento: 'ajuste',
    tipo_movimento: 'ajuste',
    produto_id: item.produto_id,
    produto_descricao: item.produto_descricao,
    quantidade: delta,
    unidade_medida: item.unidade || 'UN',
    empresa_id: inv.empresa_id,
    group_id: inv.group_id || null,
    data_movimentacao: new Date().toISOString(),
    motivo: `Ajuste inventário ${inv.id || ''}`,
    responsavel: user?.full_name || user?.email,
    responsavel_id: user?.id,
  };
}

function computeMovements(inv, user) {
  if (!Array.isArray(inv?.itens)) return [];
  const movimentos = [];
  for (const item of inv.itens) {
    const rec = buildMovementRecord(inv, item, user);
    if (rec) movimentos.push(rec);
  }
  return movimentos;
}

// Wrapper helper: calcula movimentos do inventário (mantém regra atual)
function computeInventoryMovements(inv, user) {
  return computeMovements(inv, user);
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/inventario/computeInventoryMovements' });
});