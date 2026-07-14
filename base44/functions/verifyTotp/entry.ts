import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Verifica código 2FA (compatível com entityGuard):
// Payload: { module?:string, section?:string|string[], empresa_id?:string, group_id?:string, code:string }
// Retorna { ok:true } quando válido (janela de 5min, aceita janela anterior).

function to6(buf) {
  const v = new Uint8Array(buf); let a = 0; for (let i = 0; i < v.length; i++) a = (a * 33 + v[i]) >>> 0; return String(a % 1000000).padStart(6, '0');
}
async function makeCode(secret, userId, moduleName, sectionStr, empresaId, groupId, step) {
  const enc = new TextEncoder();
  const data = enc.encode(`${secret}|${userId}|${moduleName || ''}|${sectionStr || ''}|${empresaId || ''}|${groupId || ''}|${step}`);
  const h = await crypto.subtle.digest('SHA-256', data);
  return to6(h);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || '').trim();
    if (!code) return Response.json({ error: 'code is required' }, { status: 400 });

    const moduleName = body?.module || 'Sistema';
    const section = Array.isArray(body?.section) ? body.section.join('.') : (body?.section || '-');
    const empresaId = body?.empresa_id || '';
    const groupId = body?.group_id || '';

    const secret = Deno.env.get('BACKUP_ENCRYPTION_KEY') || Deno.env.get('DEPLOY_AUDIT_TOKEN') || 'b44_fallback_secret';
    const step = Math.floor(Date.now() / (5 * 60 * 1000));
    const expected = await makeCode(secret, user.id, moduleName, section, empresaId, groupId, step);
    const prev = await makeCode(secret, user.id, moduleName, section, empresaId, groupId, step - 1);

    const ok = code === expected || code === prev;

    // Auditoria leve
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário', usuario_id: user.id,
        acao: ok ? 'Visualização' : 'Bloqueio', modulo: moduleName, tipo_auditoria: 'seguranca', entidade: '2FA.Verify',
        descricao: ok ? '2FA verificado' : '2FA inválido', dados_novos: { empresa_id: empresaId || null, group_id: groupId || null, section }, data_hora: new Date().toISOString()
      });
    } catch {}

    if (!ok) return Response.json({ ok: false }, { status: 403 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});