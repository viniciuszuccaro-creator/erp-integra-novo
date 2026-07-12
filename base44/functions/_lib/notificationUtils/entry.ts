async function sendEmail(base44, to, subject, body) {
  return base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
}

async function notify(base44, titulo, mensagem, tipo = 'info', categoria = 'Sistema', prioridade = 'Baixa') {
  return base44.asServiceRole.entities.Notificacao.create({ titulo, mensagem, tipo, categoria, prioridade });
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/notificationUtils' });
});