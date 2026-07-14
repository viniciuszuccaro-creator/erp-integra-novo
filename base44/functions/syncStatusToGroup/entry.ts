import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Propagação Empresa → Grupo
 * Sync status de entidades (Pago, Recebido, Entregue, etc.) de volta ao Grupo
 * Trigger: ContaReceber.update, ContaPagar.update, Entrega.update, OrdemCompra.update
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { entityName, entityId, novoStatus, empresaId, groupId } = await req.json();
    if (!entityName || !entityId || !novoStatus) {
      return Response.json({ error: 'entityName, entityId e novoStatus obrigatórios' }, { status: 400 });
    }

    const entityMap = {
      ContaReceber: base44.entities.ContaReceber,
      ContaPagar: base44.entities.ContaPagar,
      Entrega: base44.entities.Entrega,
      OrdemCompra: base44.entities.OrdemCompra,
      OrdemProducao: base44.entities.OrdemProducao,
    };

    const api = entityMap[entityName];
    if (!api) {
      return Response.json({ error: `Entity ${entityName} não suportada` }, { status: 400 });
    }

    // Buscar registro atual
    const registro = await api.get(entityId);
    if (!registro) return Response.json({ error: 'Registro não encontrado' }, { status: 404 });

    // Verificar se tem documento_grupo_id (é replicado de grupo)
    const grupoDocId = registro.documento_grupo_id;
    if (!grupoDocId) {
      return Response.json({ success: true, message: 'Registro sem vínculo ao grupo, nada a sincronizar' });
    }

    // Buscar registro do grupo
    const registroGrupo = await api.get(grupoDocId);
    if (!registroGrupo) {
      return Response.json({ success: true, message: 'Registro do grupo não encontrado (pode ter sido deletado)' });
    }

    // Sincronizar status para o grupo apenas se sincronizar_baixa_com_grupo=true
    const deveSync = registro.sincronizar_baixa_com_grupo !== false;
    if (!deveSync) {
      return Response.json({ success: true, message: 'Sincronização desabilitada neste registro' });
    }

    // Atualizar o grupo com o novo status e data de conclusão
    const patchGrupo = {
      status: novoStatus,
      [`data_sync_empresa_${empresaId}`]: new Date().toISOString(),
    };

    // Para ContaReceber/ContaPagar: se todas as empresas pagaram, grupo fica Pago
    const distribuicao = registroGrupo.distribuicao_realizada || [];
    if (distribuicao.length > 0) {
      // Atualizar status desta empresa na distribuição
      const distribAtualizada = distribuicao.map(d =>
        d.empresa_id === empresaId ? { ...d, status: novoStatus } : d
      );
      patchGrupo.distribuicao_realizada = distribAtualizada;

      // Se todas as empresas com distribuição estão pagas, grupo fica Pago
      const todasPagas = distribAtualizada.every(d =>
        ['Pago', 'Recebido', 'Recebida', 'Entregue', 'Concluído'].includes(d.status)
      );
      if (todasPagas) patchGrupo.status = novoStatus;
    }

    await api.update(grupoDocId, patchGrupo);

    // AuditLog
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      modulo: 'Sistema',
      entidade: entityName,
      acao: 'Sincronização Empresa→Grupo',
      tipo_auditoria: 'multiempresa',
      empresa_id: empresaId || registro.empresa_id || null,
      group_id: groupId || registro.group_id || null,
      registro_id: grupoDocId,
      descricao: `${entityName} empresa→grupo: status=${novoStatus}`,
      data_hora: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `Status ${novoStatus} sincronizado ao grupo`,
      grupo_id: grupoDocId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});