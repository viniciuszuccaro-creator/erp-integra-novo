// Serviço central de notificação para o sistema (UI NotificationCenter + canais opcionais)
// Mantém multiempresa, RBAC (invocado no backend autenticado) e auditoria via funções chamadoras

async function notify(base44, notif, options = {}) {
  const { whatsapp = false } = options;
  const {
    titulo,
    mensagem,
    tipo = 'alerta',
    categoria = 'Sistema',
    prioridade = 'Normal',
    empresa_id = null,
    dados = null,
  } = notif || {};

  try {
    // Cria registro para NotificationCenter se entidade existir no app
    if (base44?.asServiceRole?.entities?.Notificacao?.create) {
      await base44.asServiceRole.entities.Notificacao.create({
        titulo,
        mensagem,
        tipo,
        categoria,
        prioridade,
        empresa_id,
        dados,
      });
    }
  } catch (_) {
    // Notificação não pode quebrar fluxo principal
  }

  // Envio opcional via WhatsApp (se configuração ativa por empresa)
  if (whatsapp && empresa_id) {
    try {
      const cfgs = await base44.asServiceRole.entities?.ConfiguracaoWhatsApp?.filter?.({ empresa_id }, '-updated_date', 1);
      const whats = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
      const podeWhats = whats && whats.ativo !== false && (whats.enviar_cobranca === true || whats.enviar_cobranca === undefined);
      const numeroAlvo = whats?.numero_whatsapp;
      if (podeWhats && numeroAlvo) {
        const msg = `[${categoria}] ${titulo}: ${mensagem}`;
        await base44.asServiceRole.functions.invoke('whatsappSend', {
          action: 'sendText',
          numero: numeroAlvo,
          mensagem: msg,
          empresaId: empresa_id,
        });
      }
    } catch (_) {
      // Silencioso
    }
  }
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/notificationService' });
});