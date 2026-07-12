// Inlined: buildFinalizePatch (from inventoryUtils)
function buildFinalizePatch(user) {
  return {
    status: 'Concluído',
    aprovado_por: user?.full_name || user?.email,
    aprovado_por_id: user?.id,
    data_aprovacao: new Date().toISOString(),
  };
}

// Wrapper helper: patch de finalização do inventário (mantém regra atual)
function finalizeInventoryPatch(user) {
  return buildFinalizePatch(user);
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/inventario/finalizeInventoryPatch' });
});