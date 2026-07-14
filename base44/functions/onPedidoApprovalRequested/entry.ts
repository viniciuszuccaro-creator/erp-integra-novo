import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event, data, old_data } = await req.json();
    if (event?.type !== 'update' || !data) return Response.json({ ok: true, skipped: true });

    // Quando status_aprovacao mudar para pendente, notifica aprovador
    if (data?.status_aprovacao === 'pendente' && data?.usuario_aprovador_id && old_data?.status_aprovacao !== 'pendente') {
      // Permissão básica de visualizar comercial
      const perm = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'visualizar');
      if (perm) return perm;

      // Busca aprovador
      let aprovador = null;
      try {
        aprovador = await base44.asServiceRole.entities.User.get(data.usuario_aprovador_id);
      } catch {}

      const to = aprovador?.email || user?.email;
      if (to) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to,
          subject: `Aprovação de Desconto - Pedido ${data?.numero_pedido || data?.id}`,
          body: `Há uma solicitação de aprovação de desconto para o Pedido ${data?.numero_pedido || data?.id}.\nPercentual solicitado: ${data?.desconto_solicitado_percentual || 0}%\nSolicitante: ${data?.usuario_solicitante_id || '-'}\nAcesse o módulo Comercial para aprovar.`
        });
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});