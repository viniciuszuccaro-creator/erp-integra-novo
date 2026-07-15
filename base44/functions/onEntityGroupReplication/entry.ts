import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.2: Handler Genérico Grupo → Empresas
 * Invoca propagateGroupConfigs (já existente) para propagar
 * Entidades suportadas: ContaReceber, ContaPagar, Pedido, NotaFiscal,
 *   Entrega, OrdemCompra, Evento, Campanha, FormaPagamento, TabelaPreco
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_name, entity_id, event_type } = body;

    if (!entity_name || !entity_id) {
      return Response.json({ error: 'entity_name e entity_id obrigatórios' }, { status: 400 });
    }

    // Buscar dados da entidade
    const entityData = await base44.asServiceRole.entities[entity_name]?.get(entity_id);
    if (!entityData) {
      return Response.json({ error: `${entity_name} ${entity_id} não encontrado` }, { status: 404 });
    }

    // Anti-loop: não propagar registros já replicados
    if (entityData.e_replicado === true) {
      return Response.json({ success: false, reason: 'anti-loop: e_replicado' });
    }

    // Só propaga Down se criado no grupo (sem empresa_id)
    const isGroupEvent = !!entityData.group_id && !entityData.empresa_id;
    if (!isGroupEvent) {
      return Response.json({ success: false, reason: 'Não é evento de grupo' });
    }

    // Invocar propagateGroupConfigs (função existente)
    const result = await base44.functions.invoke('propagateGroupConfigs', {
      entity_name,
      source_id: entity_id,
      group_id: entityData.group_id,
    });

    // Audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        modulo: 'Sistema',
        entidade: entity_name,
        acao: 'Propagação Grupo→Empresas',
        tipo_auditoria: 'sistema',
        registro_id: entity_id,
        group_id: entityData.group_id,
        descricao: `Propagação down: ${entity_name} ${entity_id}`,
        data_hora: new Date().toISOString(),
      });
    } catch (_) { console.error('[onEntityGroupReplication] catch:', _); }

    return Response.json({ success: true, direction: 'down', entity: entity_name, result: result?.data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});