import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin-only: convidar usuário para o app
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const email = body?.email;
    const role = body?.role === 'admin' ? 'admin' : 'user';

    if (!email) return Response.json({ error: 'email é obrigatório' }, { status: 400 });

    await base44.users.inviteUser(email, role);

    // Auditoria
    try {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id,
        acao: 'Criação',
        modulo: 'Sistema',
        entidade: 'ConviteUsuario',
        descricao: `Convite enviado para ${email} com role=${role}`,
        dados_novos: { email, role },
        data_hora: new Date().toISOString(),
      });
    } catch (e) { console.error('[adminInviteUser] catch:', e); }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});