// Validações leves para geração de reservas/movimentos a partir do Pedido
function validatePedidoForReserva(pedido) {
  const itensRev = Array.isArray(pedido?.itens_revenda) ? pedido.itens_revenda : [];
  const itensArm = Array.isArray(pedido?.itens_armado_padrao) ? pedido.itens_armado_padrao : [];
  const itensCD  = Array.isArray(pedido?.itens_corte_dobra) ? pedido.itens_corte_dobra : [];
  const totalItens = itensRev.length + itensArm.length + itensCD.length;

  const warnings = [];
  if (totalItens === 0) warnings.push('sem_itens');
  if (!pedido?.empresa_id) warnings.push('sem_empresa_id');
  if (!pedido?.cliente_id) warnings.push('sem_cliente');

  return {
    ok: warnings.length === 0,
    total_itens: totalItens,
    warnings,
  };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/pedido/validatePedido' });
});