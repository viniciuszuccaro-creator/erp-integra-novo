function computeUpdatesForContaPagar(action, justificativa, registro) {
  const updates = {};
  if (action === 'aprovar') {
    updates.status_pagamento = 'Aprovado';
  } else if (action === 'pagar') {
    updates.status_pagamento = 'Pago';
    updates.status = 'Pago';
    updates.data_pagamento = new Date().toISOString().slice(0,10);
    updates.detalhes_pagamento = {
      ...(registro?.detalhes_pagamento || {}),
      status_compensacao: 'Aguardando'
    };
  } else if (action === 'cancelar') {
    updates.status_pagamento = 'Cancelado';
    updates.motivo_rejeicao = justificativa || 'Cancelado';
  }
  return updates;
}

function computeUpdatesForContaReceber(action, justificativa, registro) {
  const updates = {};
  if (action === 'receber') {
    updates.status = 'Recebido';
    updates.data_recebimento = new Date().toISOString().slice(0,10);
    updates.detalhes_pagamento = {
      ...(registro?.detalhes_pagamento || {}),
      status_compensacao: 'Aguardando'
    };
  } else if (action === 'cancelar') {
    updates.status = 'Cancelado';
    updates.motivo_rejeicao = justificativa || 'Cancelado';
  }
  return updates;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/paymentStatusUtils' });
});