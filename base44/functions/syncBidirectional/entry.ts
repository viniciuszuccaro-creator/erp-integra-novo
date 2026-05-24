import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { entity_name, entity_id, group_id, empresa_id, direction, data } = body;

    // Determina se DOWN (grupo→empresas) ou UP (empresa→grupo)
    const isDown = !!group_id && !empresa_id;
    const isUp = !!empresa_id && !!group_id;

    if (!isDown && !isUp) {
      return Response.json({ ok: false, reason: 'Contexto inválido' }, { status: 400 });
    }

    const results = [];

    if (isDown) {
      // Grupo → Empresas
      const empresas = await base44.asServiceRole.entities.Empresa.filter(
        { group_id },
        null,
        100
      );

      for (const emp of empresas) {
        try {
          const newData = { ...data, empresa_id: emp.id, documento_grupo_id: entity_id };
          await base44.asServiceRole.entities[entity_name].create(newData);
          results.push({ empresa_id: emp.id, status: 'ok' });
        } catch (e) {
          results.push({ empresa_id: emp.id, status: 'error', msg: e.message });
        }
      }
    }

    if (isUp) {
      // Empresa → Grupo
      try {
        const groupData = { ...data, empresa_id: null, empresa_dona_id: empresa_id };
        await base44.asServiceRole.entities[entity_name].create(groupData);
        results.push({ group_id, status: 'ok' });
      } catch (e) {
        results.push({ group_id, status: 'error', msg: e.message });
      }
    }

    return Response.json({ ok: true, direction: isDown ? 'down' : 'up', results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});