import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Centraliza auditoria de erros do frontend/backend
// Espera payload: { module, message, stack, page, empresa_id, group_id, metadata }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const moduleName = body?.module || 'Sistema';
    const page = body?.page || null;
    const empresa_id = body?.empresa_id || null;
    const group_id = body?.group_id || null;
    const message = body?.message || 'Erro desconhecido';
    const stack = body?.stack || null;
    const metadata = body?.metadata || null;

    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      empresa_id: empresa_id || undefined,
      acao: 'Erro',
      modulo: moduleName,
      tipo_auditoria: 'sistema',
      entidade: page || 'ReactQuery/UI',
      descricao: message,
      dados_novos: { stack, metadata, group_id, page },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});