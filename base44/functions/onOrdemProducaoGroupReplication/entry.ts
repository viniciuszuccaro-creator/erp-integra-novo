import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Handler bidirecional para OrdemProducao
 * Grupo → Empresas: replica ordens de produção
 * Empresa → Grupo: sincroniza status, apontamentos
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });

    const op = data || await base44.asServiceRole.entities.OrdemProducao.get(entity_id);
    if (!op) return Response.json({ error: `OrdemProducao ${entity_id} não encontrado` }, { status: 404 });
    if (op.e_replicado === true) return Response.json({ success: false, reason: 'anti-loop' });

    const isGroupLevel = !!op.group_id && !op.empresa_id;

    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: op.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.OrdemProducao.filter({
          group_id: op.group_id, empresa_id: emp.id, numero_op: op.numero_op, e_replicado: true
        }, undefined, 1);

        const payload = { ...op, id: undefined, created_date: undefined, updated_date: undefined, empresa_id: emp.id, group_id: op.group_id, e_replicado: true, documento_grupo_id: entity_id };
        return (Array.isArray(existing) && existing.length > 0) ? base44.asServiceRole.entities.OrdemProducao.update(existing[0].id, payload) : base44.asServiceRole.entities.OrdemProducao.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      return Response.json({ success: true, direction: 'down', ok });
    }

    if (op.empresa_id && op.documento_grupo_id) {
      const patch = {};
      ['status', 'data_conclusao_real', 'quantidade_produzida', 'apontamentos_realizados'].forEach(f => { if (op[f] !== undefined) patch[f] = op[f]; });
      if (Object.keys(patch).length > 0) await base44.asServiceRole.entities.OrdemProducao.update(op.documento_grupo_id, patch);
      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});