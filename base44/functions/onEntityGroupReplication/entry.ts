import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { propagateBidirectional } from './_lib/propagationBidirectional.js';

/**
 * P2.2: Handler Genérico Grupo → Empresas
 * Reusa propagationBidirectional.js (já implementado)
 * Entidades suportadas: ContaReceber, ContaPagar, Pedido, NotaFiscal,
 *   Entrega, OrdemCompra, Evento, Campanha, FormaPagamento, TabelaPreco
 *
 * Chamado por automações entity quando origem='grupo' (sem empresa_id)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_name, entity_id, data, event_type } = body;

    if (!entity_name || !entity_id) {
      return Response.json({ error: 'entity_name e entity_id obrigatórios' }, { status: 400 });
    }

    // Buscar dados da entidade se não fornecidos
    let entityData = data;
    if (!entityData) {
      entityData = await base44.asServiceRole.entities[entity_name]?.get(entity_id);
    }

    if (!entityData) {
      return Response.json({ error: `${entity_name} ${entity_id} não encontrado` }, { status: 404 });
    }

    // Determina direção automaticamente pela lib
    const result = await propagateBidirectional(base44, {
      entity_name,
      entity_id,
      type: event_type || 'create',
      data: entityData,
    });

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        modulo: 'Sistema',
        entidade: entity_name,
        acao: 'Propagação',
        tipo_auditoria: 'sistema',
        registro_id: entity_id,
        group_id: entityData.group_id || null,
        empresa_id: entityData.empresa_id || null,
        descricao: `Propagação ${result.direction || 'N/A'}: ${result.reason || JSON.stringify(result)}`,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ success: result.ok, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});