import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.3: Handler bidirecional para NotaFiscal
 * Grupo → Empresas: replica NFs
 * Empresa → Grupo: sincroniza status de autorização, chaves
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });

    const nf = data || await base44.asServiceRole.entities.NotaFiscal.get(entity_id);
    if (!nf) return Response.json({ error: `NotaFiscal ${entity_id} não encontrado` }, { status: 404 });
    if (nf.e_replicado === true) return Response.json({ success: false, reason: 'anti-loop' });

    const isGroupLevel = !!nf.group_id && !nf.empresa_id;

    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: nf.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.NotaFiscal.filter({
          group_id: nf.group_id, empresa_id: emp.id, numero_nf: nf.numero_nf, e_replicado: true
        }, undefined, 1);

        const payload = { ...nf, id: undefined, created_date: undefined, updated_date: undefined, empresa_id: emp.id, group_id: nf.group_id, e_replicado: true, documento_grupo_id: entity_id };
        return (Array.isArray(existing) && existing.length > 0) ? base44.asServiceRole.entities.NotaFiscal.update(existing[0].id, payload) : base44.asServiceRole.entities.NotaFiscal.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      return Response.json({ success: true, direction: 'down', ok });
    }

    if (nf.empresa_id && nf.documento_grupo_id) {
      const patch = {};
      ['status', 'chave_acesso', 'numero_protocolo_autorizacao', 'data_autorizacao', 'data_cancelamento'].forEach(f => { if (nf[f] !== undefined) patch[f] = nf[f]; });
      if (Object.keys(patch).length > 0) await base44.asServiceRole.entities.NotaFiscal.update(nf.documento_grupo_id, patch);
      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});