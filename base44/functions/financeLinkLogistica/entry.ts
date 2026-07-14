import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // May be null when triggered by automation
    const user = await base44.auth.me().catch(() => null);

    const payload = await req.json().catch(() => ({}));
    // Entity automation payload shape
    const event = payload?.event || {};
    const entrega = payload?.data || payload?.entrega || null;

    if (!entrega || event?.entity_name !== 'Entrega') {
      return Response.json({ ok: true, skipped: true, reason: 'no entrega in payload' });
    }

    const empresaId = entrega.empresa_id || null;
    const groupId = entrega.group_id || null;

    // Load finance config for company (fallback to global)
    const cfgKeyCompany = empresaId ? `log_finance_cfg_${empresaId}` : null;
    let cfg = null;
    try {
      if (cfgKeyCompany) {
        const rows = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave: cfgKeyCompany }, undefined, 1);
        cfg = rows?.[0]?.valor_json || null;
      }
      if (!cfg) {
        const rowsG = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave: 'log_finance_cfg_global' }, undefined, 1);
        cfg = rowsG?.[0]?.valor_json || null;
      }
    } catch (_) {}

    const centro_custo_id = cfg?.centro_custo_id || null;
    const plano_contas_id = cfg?.plano_contas_id || null;
    const forma_recebimento = cfg?.forma_recebimento || 'PIX';
    const forma_pagamento = cfg?.forma_pagamento || 'Cartão';
    const custo_km = Number(cfg?.custo_km || 0);
    const dias_vencimento = Number(cfg?.dias_vencimento || 7);

    const todayISO = new Date().toISOString().slice(0, 10);
    const vencISO = new Date(Date.now() + dias_vencimento * 86400000).toISOString().slice(0, 10);

    // Helper: idempotent find by entrega_id tag
    const findExistingCR = async () => {
      const descTag = `entrega_id:${entrega.id}`;
      const $or = [
        { descricao: { $regex: descTag } },
      ];
      const filtro = { $or };
      const list = await base44.asServiceRole.entities.ContaReceber.filter(filtro, '-updated_date', 5);
      return list?.find((c) => /\[LOG\]/.test(c.descricao || '')) || null;
    };
    const findExistingCP = async (prefix) => {
      const descTag = `entrega_id:${entrega.id}`;
      const $or = [ { descricao: { $regex: descTag } } ];
      const list = await base44.asServiceRole.entities.ContaPagar.filter({ $or }, '-updated_date', 10);
      return list?.find((c) => (c.descricao || '').startsWith(prefix)) || null;
    };

    // 1) Vincular automaticamente custos de combustível às entregas/rotas (com km)
    let cpResult = null;
    if ((entrega.km_rodado || 0) > 0 && custo_km > 0 && centro_custo_id && plano_contas_id) {
      const valor = Number(entrega.km_rodado) * custo_km;
      const prefix = 'Combustível [LOG] ';
      const descricao = `${prefix}entrega_id:${entrega.id} rota:${entrega.rota_id || ''}`;
      const existing = await findExistingCP(prefix);
      if (existing) {
        cpResult = await base44.asServiceRole.entities.ContaPagar.update(existing.id, {
          valor,
          data_vencimento: vencISO,
          empresa_id: empresaId || existing.empresa_id || null,
        });
      } else {
        cpResult = await base44.asServiceRole.entities.ContaPagar.create({
          descricao,
          fornecedor: entrega.motorista || 'Motorista',
          fornecedor_id: entrega.motorista_id || null,
          valor,
          data_emissao: todayISO,
          data_vencimento: vencISO,
          centro_custo_id,
          plano_contas_id,
          categoria: 'Transporte',
          forma_pagamento,
          status: 'Pendente',
          ...(groupId ? { group_id: groupId } : {}),
          ...(empresaId ? { empresa_id: empresaId } : {}),
        });
      }
    }

    // 2) Gerar contas a receber para serviços de entrega quando Entregue e tiver valor_frete
    let crResult = null;
    if (String(entrega.status) === 'Entregue' && Number(entrega.valor_frete || 0) > 0 && centro_custo_id && plano_contas_id) {
      const descricao = `Serviço de Entrega [LOG] entrega_id:${entrega.id} pedido:${entrega.numero_pedido || ''}`;
      const existingCR = await findExistingCR();
      if (existingCR) {
        crResult = await base44.asServiceRole.entities.ContaReceber.update(existingCR.id, {
          valor: Number(entrega.valor_frete),
          data_vencimento: vencISO,
          cliente: entrega.cliente_nome || existingCR.cliente || 'Cliente',
          cliente_id: entrega.cliente_id || existingCR.cliente_id || null,
          forma_cobranca: forma_recebimento,
          projeto_obra: entrega.rota_id ? `Rota ${entrega.rota_id}` : existingCR.projeto_obra,
          empresa_id: empresaId || existingCR.empresa_id || null,
        });
      } else {
        crResult = await base44.asServiceRole.entities.ContaReceber.create({
          descricao,
          cliente: entrega.cliente_nome || 'Cliente',
          cliente_id: entrega.cliente_id || null,
          valor: Number(entrega.valor_frete),
          data_emissao: todayISO,
          data_vencimento: vencISO,
          centro_custo_id,
          plano_contas_id,
          forma_cobranca: forma_recebimento,
          status: 'Pendente',
          projeto_obra: entrega.rota_id ? `Rota ${entrega.rota_id}` : undefined,
          ...(groupId ? { group_id: groupId } : {}),
          ...(empresaId ? { empresa_id: empresaId } : {}),
        });
      }
    }

    return Response.json({ ok: true, cp: !!cpResult, cr: !!crResult });
  } catch (error) {
    return Response.json({ error: error?.message || 'error' }, { status: 500 });
  }
});