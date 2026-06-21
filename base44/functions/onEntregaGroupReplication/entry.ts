import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.3: Handler bidirecional para Entrega
 * Grupo → Empresas: replica dados de entrega
 * Empresa → Grupo: sincroniza status, rastreamento
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });

    const entrega = data || await base44.asServiceRole.entities.Entrega.get(entity_id);
    if (!entrega) return Response.json({ error: `Entrega ${entity_id} não encontrado` }, { status: 404 });
    if (entrega.e_replicado === true) return Response.json({ success: false, reason: 'anti-loop' });

    const isGroupLevel = !!entrega.group_id && !entrega.empresa_id;

    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: entrega.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.Entrega.filter({
          group_id: entrega.group_id, empresa_id: emp.id, codigo_rastreamento: entrega.codigo_rastreamento, e_replicado: true
        }, undefined, 1);

        const payload = { ...entrega, id: undefined, created_date: undefined, updated_date: undefined, empresa_id: emp.id, group_id: entrega.group_id, e_replicado: true, documento_grupo_id: entity_id };
        return (Array.isArray(existing) && existing.length > 0) ? base44.asServiceRole.entities.Entrega.update(existing[0].id, payload) : base44.asServiceRole.entities.Entrega.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      return Response.json({ success: true, direction: 'down', ok });
    }

    if (entrega.empresa_id && entrega.documento_grupo_id) {
      const patch = {};
      ['status', 'data_entrega', 'codigo_rastreamento', 'localizacao_gps', 'assinatura_digital'].forEach(f => { if (entrega[f] !== undefined) patch[f] = entrega[f]; });
      if (Object.keys(patch).length > 0) await base44.asServiceRole.entities.Entrega.update(entrega.documento_grupo_id, patch);
      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});