import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined: persistMovements (from inventoryUtils)
async function persistMovements(base44, movimentos) {
  const produtoIds = [];
  for (const rec of movimentos) {
    await base44.asServiceRole.entities.MovimentacaoEstoque.create(rec);
    if (rec.produto_id) produtoIds.push(rec.produto_id);
  }
  return produtoIds;
}

// Wrapper helper: persiste movimentos do inventário (mantém regra atual)
async function persistInventoryMovements(base44, movimentoRecords) {
  return persistMovements(base44, movimentoRecords);
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/inventario/persistInventoryMovements' });
});