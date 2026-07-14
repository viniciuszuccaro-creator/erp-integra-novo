import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    // Simple shared-secret validation for CI webhooks
    const tokenHeader = req.headers.get('x-deploy-token') || '';
    const expected = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
    if (!expected || tokenHeader !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // Parse payload from CI (GitHub Actions recommended)
    const body = await req.json().catch(() => ({}));
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