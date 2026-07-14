import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P3.3: AUDITLOG em Ações Sensíveis — Pagamentos
 * Integra AuditLog em baixa de contas pagar/receber
 * Regra-Mãe: Todos os lançamentos financeiros devem ser auditados
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, contaId, contaData, novoStatus, empresa_id, group_id } = await req.json();

    // Validações
    if (!action || !contaId) {
      return Response.json({ error: 'Action e ContaId são obrigatórios' }, { status: 400 });
    }

    const allowedActions = ['baixar_conta_pagar', 'receber_conta_receber', 'cancelar', 'rejeitar'];
    if (!allowedActions.includes(action)) {
      return Response.json({ error: 'Action inválida' }, { status: 400 });
    }

    // Buscar conta atual
    const isContaPagar = action === 'baixar_conta_pagar';
    const entityName = isContaPagar ? 'ContaPagar' : 'ContaReceber';
    const contaAnterior = await base44.entities[entityName].get(contaId);
    if (!contaAnterior) {
      return Response.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    // 1. GUARDAR dados anteriores para auditoria
    const dadosAnteriores = {
      status: contaAnterior.status,
      status_pagamento: contaAnterior.status_pagamento,
      valor: contaAnterior.valor,
      data_vencimento: contaAnterior.data_vencimento,
    };

    // 2. ATUALIZAR status
    const updates = {
      status: novoStatus || 'Pago',
      status_pagamento: novoStatus === 'Cancelado' ? 'Cancelado' : 'Pago',
      ...(action === 'baixar_conta_pagar' || action === 'receber_conta_receber' ? {
        data_pagamento: new Date().toISOString().split('T')[0],
      } : {}),
    };

    await base44.entities[entityName].update(contaId, updates);

    // 3. AUDIT LOG completo
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      modulo: 'Financeiro',
      entidade: entityName,
      acao: action === 'baixar_conta_pagar' ? 'Baixa' : action === 'receber_conta_receber' ? 'Recebimento' : action === 'cancelar' ? 'Cancelamento' : 'Rejeição',
      tipo_auditoria: 'financeiro',
      empresa_id: empresa_id || contaAnterior.empresa_id || null,
      group_id: group_id || contaAnterior.group_id || null,
      registro_id: contaId,
      descricao: `${entityName} #${contaAnterior.numero_documento || contaId} — ${updates.status}`,
      dados_anteriores: dadosAnteriores,
      dados_novos: updates,
      data_hora: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `${entityName} atualizada e auditada`,
      conta: { id: contaId, ...updates },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});