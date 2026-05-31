import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * syncBidirectional v2.0
 * Propagação bidirecional Grupo ↔ Empresas
 * Suporta: create (DOWN), update (DOWN + UP), delete (DOWN)
 * 
 * Anti-loop: verifica e_replicado=true para evitar loops infinitos
 * Chamado via automação entity OU diretamente do frontend
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Suporte tanto ao payload manual quanto ao payload de automação entity
    // Automação entity envia: { event: {type, entity_name, entity_id}, data: {...}, old_data: {...} }
    // Frontend envia: { entityName, groupId, direction, data: {...} }
    const isEntityAutomation = !!(body?.event?.entity_name);
    const eventData = body?.data || (isEntityAutomation ? null : body) || {};
    const eventType = body?.event?.type || body?.eventType || 'create';
    // suporte a snake_case (automações) e camelCase (frontend)
    const entityName = body?.event?.entity_name || body?.entity_name || body?.entityName;
    const entityId = body?.event?.entity_id || body?.entity_id || body?.entityId || eventData?.id;

    const {
      // suporte a groupId (camelCase do frontend) e group_id (snake_case da automação/data)
      group_id: _gid,
      groupId,
      empresa_id: _empId,
      direction,
    } = body;
    const group_id = _gid || groupId || eventData?.group_id;
    const empresa_id = _empId || eventData?.empresa_id;

    // Anti-loop: se o registro já é replicado, não propagar novamente
    if (eventData?.e_replicado === true) {
      return Response.json({ ok: true, skipped: 'anti-loop', e_replicado: true });
    }

    // Sem entidade → não propagar
    if (!entityName) {
      return Response.json({ ok: false, reason: 'entity_name obrigatório' }, { status: 400 });
    }

    // Sem contexto → não propagar
    if (!group_id && !empresa_id) {
      return Response.json({ ok: true, skipped: 'no context' });
    }

    const results = [];
    const isBoth = direction === 'both';
    const isDown = isBoth || (!!group_id && (!empresa_id || direction === 'down'));
    const isUp   = isBoth || (!!empresa_id && !!group_id && direction === 'up');

    // ===== DOWN: Grupo → Empresas =====
    if (isDown && eventData) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter(
        { group_id },
        null,
        100
      );

      for (const emp of empresas) {
        try {
          const newData = {
            ...eventData,
            empresa_id: emp.id,
            documento_grupo_id: entityId || eventData?.id,
            e_replicado: true,
            // Remover campos que pertencem apenas ao grupo
            group_id: group_id,
          };
          delete newData.id;
          delete newData.created_date;
          delete newData.updated_date;

          // Verificar se já existe réplica para evitar duplicação
          const existing = await base44.asServiceRole.entities[entityName]
            .filter({ documento_grupo_id: entityId || eventData?.id, empresa_id: emp.id }, null, 1)
            .catch(() => []);

          if (existing?.length > 0 && eventType === 'update') {
            // Atualizar réplica existente
            await base44.asServiceRole.entities[entityName].update(existing[0].id, {
              ...newData,
              id: undefined
            });
            results.push({ empresa_id: emp.id, status: 'updated' });
          } else if (existing?.length === 0) {
            // Criar nova réplica
            await base44.asServiceRole.entities[entityName].create(newData);
            results.push({ empresa_id: emp.id, status: 'created' });
          } else {
            results.push({ empresa_id: emp.id, status: 'skipped_exists' });
          }
        } catch (e) {
          results.push({ empresa_id: emp.id, status: 'error', msg: e.message });
        }
      }
    }

    // ===== UP: Empresa → Grupo =====
    if (isUp && eventData) {
      try {
        // Verificar se já existe no grupo (evita duplicação)
        const existing = await base44.asServiceRole.entities[entityName]
          .filter({ empresa_dona_id: empresa_id, grupo_origem: true, group_id }, null, 1)
          .catch(() => []);

        const groupData = {
          ...eventData,
          group_id,
          empresa_id: null,
          empresa_dona_id: empresa_id,
          grupo_origem: true,
          e_replicado: true,
        };
        delete groupData.id;
        delete groupData.created_date;
        delete groupData.updated_date;

        if (existing?.length > 0 && eventType === 'update') {
          await base44.asServiceRole.entities[entityName].update(existing[0].id, { ...groupData, id: undefined });
          results.push({ group_id, status: 'updated_group' });
        } else if (existing?.length === 0) {
          await base44.asServiceRole.entities[entityName].create(groupData);
          results.push({ group_id, status: 'created_group' });
        } else {
          results.push({ group_id, status: 'skipped_exists_group' });
        }
      } catch (e) {
        results.push({ group_id, status: 'error', msg: e.message });
      }
    }

    // ===== DELETE DOWN: Grupo deleta → remove réplicas nas empresas =====
    if (eventType === 'delete' && (isDown || direction === 'down') && entityId) {
      try {
        const replicas = await base44.asServiceRole.entities[entityName]
          .filter({ documento_grupo_id: entityId }, null, 100)
          .catch(() => []);

        for (const replica of replicas) {
          try {
            await base44.asServiceRole.entities[entityName].delete(replica.id);
            results.push({ replica_id: replica.id, empresa_id: replica.empresa_id, status: 'deleted' });
          } catch (e) {
            results.push({ replica_id: replica.id, status: 'delete_error', msg: e.message });
          }
        }
      } catch (e) {
        results.push({ status: 'delete_replicas_error', msg: e.message });
      }
    }

    return Response.json({
      ok: true,
      entity: entityName,
      event: eventType,
      direction: isBoth ? 'both' : isDown ? 'down' : isUp ? 'up' : direction || 'auto',
      total_processados: results.length,
      results,
      total: results.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});