import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { propagateBidirectional } from './_lib/propagationBidirectional.js';

/**
 * P2.3: Propagação Empresa → Grupo (sincronização ascendente)
 * Quando status muda em uma Empresa (Baixa, Recebimento, Confirmação),
 * sincroniza o registro-pai no Grupo.
 *
 * Casos de uso:
 *  - ContaReceber baixada na Empresa → Grupo reflete status 'Recebido'
 *  - ContaPagar paga na Empresa → Grupo reflete status 'Pago'
 *  - Entrega confirmada → Grupo reflete status 'Entregue'
 *  - OrdemCompra recebida → Grupo reflete status 'Recebida'
 *  - Pedido aprovado → Grupo reflete status 'Aprovado'
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

    // Só sincroniza se tem group_id E empresa_id (contexto empresa)
    if (!entityData.group_id || !entityData.empresa_id) {
      return Response.json({ success: false, reason: 'Sem contexto multiempresa' });
    }

    // 1. Atualizar status localmente se fornecido
    if (novo_status) {
      await base44.asServiceRole.entities[entity_name].update(entity_id, {
        status: novo_status,
        ...(dados_extras || {}),
      });
    }

    // 2. Propagar para cima (Empresa → Grupo)
    const updatedData = { ...entityData, status: novo_status || entityData.status, ...(dados_extras || {}) };
    const result = await propagateBidirectional(base44, {
      entity_name,
      entity_id,
      type: 'update',
      data: updatedData,
    });

    // 3. Buscar documento-pai no grupo (via documento_grupo_id)
    if (entityData.documento_grupo_id && novo_status) {
      try {
        await base44.asServiceRole.entities[entity_name].update(entityData.documento_grupo_id, {
          status: novo_status,
          ...(dados_extras || {}),
          sincronizar_baixa_com_grupo: true,
        });
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
        descricao: `Sync ascendente ${entity_name}: status → ${novo_status || 'mantido'}`,
        dados_novos: { status: novo_status, ...(dados_extras || {}) },
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({
      success: result.ok || true,
      direction: 'up',
      entity: entity_name,
      novo_status,
      propagation: result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});