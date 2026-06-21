import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.3: Propagação Empresa → Grupo (sincronização ascendente)
 * Invoca syncBidirectional (já existente) para propagar Up
 *
 * Casos de uso:
 *  - ContaReceber baixada → Grupo reflete status 'Recebido'
 *  - ContaPagar paga → Grupo reflete status 'Pago'
 *  - Entrega confirmada → Grupo reflete 'Entregue'
 *  - OrdemCompra recebida → Grupo reflete 'Recebida'
 *  - Pedido aprovado → Grupo reflete 'Aprovado'
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_name, entity_id, novo_status, dados_extras } = body;

    if (!entity_name || !entity_id) {
      return Response.json({ error: 'entity_name e entity_id obrigatórios' }, { status: 400 });
    }

    // Buscar registro na empresa
    const entityData = await base44.asServiceRole.entities[entity_name]?.get(entity_id);
    if (!entityData) {
      return Response.json({ error: `${entity_name} não encontrado` }, { status: 404 });
    }

    // Só sincroniza se tem group_id E empresa_id
    if (!entityData.group_id || !entityData.empresa_id) {
      return Response.json({ success: false, reason: 'Sem contexto multiempresa' });
    }

    // 1. Atualizar status localmente se fornecido
    const updates = { ...(dados_extras || {}) };
    if (novo_status) updates.status = novo_status;

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities[entity_name].update(entity_id, updates);
    }

    // 2. Propagar para cima (Empresa → Grupo) via syncBidirectional
    let syncResult = null;
    try {
      const res = await base44.functions.invoke('syncBidirectional', {
        entity_name,
        entity_id,
        direction: 'up',
        updates,
        group_id: entityData.group_id,
        empresa_id: entityData.empresa_id,
      });
      syncResult = res?.data;
    } catch (_) {}

    // 3. Sync direto no documento-pai (via documento_grupo_id) como fallback
    if (entityData.documento_grupo_id && Object.keys(updates).length > 0) {
      try {
        await base44.asServiceRole.entities[entity_name].update(entityData.documento_grupo_id, updates);
      } catch (_) {}
    }

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        modulo: 'Sistema',
        entidade: entity_name,
        acao: 'Sync Empresa→Grupo',
        tipo_auditoria: 'sistema',
        registro_id: entity_id,
        group_id: entityData.group_id,
        empresa_id: entityData.empresa_id,
        descricao: `Sync up ${entity_name}: ${novo_status || 'dados atualizados'}`,
        dados_novos: updates,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({
      success: true,
      direction: 'up',
      entity: entity_name,
      novo_status,
      sync: syncResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});