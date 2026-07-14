import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Handler bidirecional para OrdemCompra
 * Grupo → Empresas: replica OC do grupo para empresas
 * Empresa → Grupo: sincroniza status e datas
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });

    const oc = data || await base44.asServiceRole.entities.OrdemCompra.get(entity_id);
    if (!oc) return Response.json({ error: `OrdemCompra ${entity_id} não encontrado` }, { status: 404 });
    if (oc.e_replicado === true) return Response.json({ success: false, reason: 'anti-loop' });

    const isGroupLevel = !!oc.group_id && !oc.empresa_id;

    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: oc.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.OrdemCompra.filter({
          group_id: oc.group_id, empresa_id: emp.id, numero_oc: oc.numero_oc, e_replicado: true
        }, undefined, 1);

        const payload = { ...oc, id: undefined, created_date: undefined, updated_date: undefined, empresa_id: emp.id, group_id: oc.group_id, e_replicado: true, documento_grupo_id: entity_id };
        return (Array.isArray(existing) && existing.length > 0) ? base44.asServiceRole.entities.OrdemCompra.update(existing[0].id, payload) : base44.asServiceRole.entities.OrdemCompra.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      return Response.json({ success: true, direction: 'down', ok });
    }

    if (oc.empresa_id && oc.documento_grupo_id) {
      const patch = {};
      ['status', 'data_entrega_real', 'quantidade_recebida', 'observacoes'].forEach(f => { if (oc[f] !== undefined) patch[f] = oc[f]; });
      if (Object.keys(patch).length > 0) await base44.asServiceRole.entities.OrdemCompra.update(oc.documento_grupo_id, patch);
      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});