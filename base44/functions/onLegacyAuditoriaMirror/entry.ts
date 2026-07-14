import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const evt = payload?.event || {};
    const data = payload?.data || null;

    if (!evt?.entity_name) return Response.json({ ok: true, skipped: true });

    const tipoMap = {
      'AuditoriaAcesso': 'acesso',
      'AuditoriaGPS': 'gps',
      'AuditoriaIA': 'ia',
      'AuditoriaGlobal': 'global'
    };

    const tipo = tipoMap[evt.entity_name];
    if (!tipo || !data) return Response.json({ ok: true, skipped: true });

    if (evt.type === 'delete') return Response.json({ ok: true, action: 'ignored_delete' });

    const entry = {
      usuario: data.usuario_nome || data.usuario_email || 'Usuário',
      usuario_id: data.usuario_id || null,
      empresa_id: data.empresa_id || null,
      acao: (() => {
        const m = {
          'Login': 'Login','Logout': 'Logout','Criar':'Criação','Editar':'Edição','Excluir':'Exclusão','Visualizar':'Visualização','Aprovar':'Aprovação','Rejeitar':'Rejeição','Exportar':'Exportação','Importar':'Importação','Troca Empresa':'Troca de Empresa'
        }; return m[data.acao || data.tipo_acao] || 'Visualização';
      })(),
      modulo: data.modulo || 'Sistema',
      tipo_auditoria: tipo,
      entidade: evt.entity_name,
      registro_id: data.id,
      descricao: data.descricao || `Mirror ${evt.entity_name}`,
      dados_anteriores: data.dados_antes || null,
      dados_novos: data.dados_depois || data || null,
      data_hora: data.data_hora || new Date().toISOString(),
      sucesso: data.sucesso !== false,
      duracao_ms: data.duracao_ms || undefined
    };

    await base44.asServiceRole.entities.AuditLog.create(entry);
    return Response.json({ ok: true, action: 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});