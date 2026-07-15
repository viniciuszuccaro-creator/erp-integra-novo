import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Consolidação de: auditError + auditEntityEvents + orderFlowAuditor
// Ponto único de entrada para todas as logs de segurança

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      usuario, usuario_id, acao, modulo, tipo_auditoria,
      entidade, registro_id, descricao,
      dados_anteriores, dados_novos,
      empresa_id, group_id,
      ip_address, user_agent,
      duracao_ms,
      event, data, old_data, payload_too_large
    } = body;

    // Se for evento de entidade (automação), processar como auditEntityEvents
    if (event?.entity_name) {
      const entityName = event.entity_name;
      const entityId = event.entity_id;
      const eventType = event.type;

      let recordData = data;
      let previousData = old_data;

      // Recupera dados se payload grande
      if (payload_too_large && entityName && entityId) {
        try {
          const rows = await Promise.race([
            base44.asServiceRole.entities?.[entityName]?.filter?.({ id: entityId }, undefined, 1),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
          ]);
          recordData = Array.isArray(rows) ? (rows[0] || recordData) : recordData;
        } catch (_) { console.error('[securityAuditLogger] catch:', _); }
      }

      const moduleMap = {
        Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM',
        Pedido: 'Comercial', Comissao: 'Comercial',
        NotaFiscal: 'Fiscal',
        Entrega: 'Expedição', Romaneio: 'Expedição',
        Fornecedor: 'Compras', SolicitacaoCompra: 'Compras', OrdemCompra: 'Compras',
        Produto: 'Estoque', MovimentacaoEstoque: 'Estoque', Inventario: 'Estoque',
        ContaPagar: 'Financeiro', ContaReceber: 'Financeiro', CentroCusto: 'Financeiro',
        Evento: 'Agenda', User: 'Acesso', PerfilAcesso: 'Acesso'
      };

      const moduleForEntity = moduleMap[entityName] || 'Sistema';
      const empresaId = recordData?.empresa_id || previousData?.empresa_id || null;
      const groupId = recordData?.group_id || previousData?.group_id || null;

      const actionMap = { create: 'Criação', update: 'Edição', delete: 'Exclusão' };
      const action = actionMap[eventType] || 'Edição';

      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        acao: action,
        modulo: moduleForEntity,
        tipo_auditoria: 'entidade',
        entidade: entityName,
        registro_id: entityId,
        descricao: `${entityName} • ${action}`,
        dados_anteriores: eventType !== 'create' ? recordData : null,
        dados_novos: eventType !== 'delete' ? recordData : null,
        empresa_id: empresaId || null,
        group_id: groupId || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
        user_agent: req.headers.get('user-agent') || '',
        data_hora: new Date().toISOString(),
      });

      return Response.json({ ok: true });
    }

    // Senão, log genérico (auditError)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: usuario || user.full_name || 'Usuário',
      usuario_id: usuario_id || user.id,
      acao: acao || 'Visualização',
      modulo: modulo || 'Sistema',
      tipo_auditoria: tipo_auditoria || 'sistema',
      entidade: entidade || 'Geral',
      registro_id: registro_id || null,
      descricao: descricao || '',
      dados_anteriores: dados_anteriores || null,
      dados_novos: dados_novos || null,
      empresa_id: empresa_id || null,
      group_id: group_id || null,
      ip_address: ip_address || req.headers.get('x-forwarded-for') || '',
      user_agent: user_agent || req.headers.get('user-agent') || '',
      duracao_ms: duracao_ms || null,
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    const status = error?.response?.status || error?.status;
    if (status === 429) {
      return Response.json({ ok: true, skipped: true, reason: 'rate-limit' }, { status: 200 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});