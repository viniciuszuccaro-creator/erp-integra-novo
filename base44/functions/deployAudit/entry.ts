import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    // Parse payload first (needed to distinguish scheduled heartbeat from CI webhook)
    const body = await req.json().catch(() => ({}));
    const isHeartbeat = body?.heartbeat === true;

    // Simple shared-secret validation for CI webhooks.
    // Heartbeat agendado (sem token de header) e permitido e grava registro FIXO (sem persistir dados do body).
    const tokenHeader = req.headers.get('x-deploy-token') || '';
    const expected = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
    if (!isHeartbeat && (!expected || tokenHeader !== expected)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    if (isHeartbeat) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        usuario_id: null,
        empresa_id: null,
        empresa_nome: null,
        acao: 'Deploy',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'Deploy',
        descricao: 'Heartbeat de deploy/health executado (agendado)',
        dados_novos: { heartbeat: true, at: new Date().toISOString() },
        data_hora: new Date().toISOString(),
        sucesso: true
      });
      return Response.json({ ok: true, heartbeat: true });
    }
    const {
      provider = 'github_actions',
      status = 'unknown',
      branch = '',
      commit = '',
      actor = 'CI',
      url = ''
    } = body || {};

    // Audit to central log (service role, webhook context)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: actor || 'CI',
      usuario_id: null,
      empresa_id: null,
      empresa_nome: null,
      acao: 'Deploy',
      modulo: 'Sistema',
      tipo_auditoria: 'sistema',
      entidade: 'Deploy',
      descricao: `Deploy ${status} via ${provider} (${branch} ${commit})`,
      dados_novos: { provider, status, branch, commit, actor, url },
      data_hora: new Date().toISOString(),
      sucesso: status === 'success'
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});