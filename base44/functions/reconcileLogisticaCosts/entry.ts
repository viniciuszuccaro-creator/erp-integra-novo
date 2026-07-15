import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function toISO(d) { try { return new Date(d).toISOString().slice(0,10); } catch { return null; } }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    // Payload: { filtros?: { empresa_id?, start_date?, end_date? } }
    const body = await req.json().catch(() => ({}));
    const filtros = body?.filtros || {};

    const today = new Date();
    const defaultStart = new Date(today.getTime() - 3 * 86400000); // últimos 3 dias
    const startISO = toISO(filtros.start_date || defaultStart);
    const endISO = toISO(filtros.end_date || today);
    const empresaId = filtros.empresa_id || null;

    // Carrega configuração financeira por empresa (fallback global)
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
    } catch (_) { console.error('[reconcileLogisticaCosts] catch:', _); }

    const centro_custo_id = cfg?.centro_custo_id || null;
    const plano_contas_id = cfg?.plano_contas_id || null;
    const custo_km = Number(cfg?.custo_km || 0);
    const pedagio_por_km = Number(cfg?.pedagio_por_km || 0);
    const percentual_alerta_desvio = Number(cfg?.percentual_alerta_desvio || 15); // 15%
    const forma_recebimento = cfg?.forma_recebimento || 'PIX';
    const forma_pagamento = cfg?.forma_pagamento || 'Cartão';
    const regra_frete = cfg?.regra_frete || 'auto'; // 'auto' usa tipo_frete da entrega

    const vencDays = Number(cfg?.dias_vencimento || 7);
    const todayISO = toISO(today);

    const buildRange = (field) => {
      const f = {};
      if (startISO && endISO) f[field] = { $gte: startISO, $lte: endISO };
      else if (startISO) f[field] = { $gte: startISO };
      else if (endISO) f[field] = { $lte: endISO };
      return f;
    };

    // Busca entregas no intervalo (usa data_saida; se não houver, data_previsao)
    const entregaFiltro = {
      $or: [ buildRange('data_saida'), buildRange('data_previsao') ],
      ...(empresaId ? { empresa_id: empresaId } : {}),
    };

    const entregas = await base44.asServiceRole.entities.Entrega.filter(entregaFiltro, '-updated_date', 2000);

    // Helper idempotentes por entrega_id
    const ensureCP = async ({ prefix, valor, entrega, categoria = 'Transporte', extra = {} }) => {
      if (!valor || valor <= 0) return { updated: false, created: false };
      const descTag = `entrega_id:${entrega.id}`;
      const descricao = `${prefix} [LOG] ${descTag}`.trim();
      const list = await base44.asServiceRole.entities.ContaPagar.filter({ descricao: { $regex: descTag } }, '-updated_date', 20);
      const existing = list?.find((c) => (c.descricao||'').startsWith(prefix)) || null;
      if (existing) {
        await base44.asServiceRole.entities.ContaPagar.update(existing.id, {
          valor, data_vencimento: toISO(new Date(Date.now() + vencDays*86400000)),
          empresa_id: entrega.empresa_id || existing.empresa_id || null,
          ...extra,
        });
        return { updated: true, created: false };
      }
      await base44.asServiceRole.entities.ContaPagar.create({
        descricao,
        fornecedor: entrega.transportadora || entrega.motorista || 'Logística',
        fornecedor_id: entrega.transportadora_id || entrega.motorista_id || null,
        valor,
        data_emissao: todayISO,
        data_vencimento: toISO(new Date(Date.now() + vencDays*86400000)),
        centro_custo_id,
        plano_contas_id,
        categoria,
        forma_pagamento,
        status: 'Pendente',
        ...(entrega.group_id ? { group_id: entrega.group_id } : {}),
        ...(entrega.empresa_id ? { empresa_id: entrega.empresa_id } : {}),
        ...extra,
      });
      return { updated: false, created: true };
    };

    const ensureCR = async ({ entrega, valor }) => {
      if (!valor || valor <= 0) return { updated: false, created: false };
      const descTag = `entrega_id:${entrega.id}`;
      const list = await base44.asServiceRole.entities.ContaReceber.filter({ descricao: { $regex: descTag } }, '-updated_date', 10);
      const existing = list?.find((c) => /\[LOG\]/.test(c.descricao||'')) || null;
      if (existing) {
        await base44.asServiceRole.entities.ContaReceber.update(existing.id, {
          valor,
          data_vencimento: toISO(new Date(Date.now() + vencDays*86400000)),
          cliente: entrega.cliente_nome || existing.cliente || 'Cliente',
          cliente_id: entrega.cliente_id || existing.cliente_id || null,
          forma_cobranca: forma_recebimento,
          projeto_obra: entrega.rota_id ? `Rota ${entrega.rota_id}` : existing.projeto_obra,
          empresa_id: entrega.empresa_id || existing.empresa_id || null,
        });
        return { updated: true, created: false };
      }
      await base44.asServiceRole.entities.ContaReceber.create({
        descricao: `Serviço de Entrega [LOG] ${descTag}`,
        cliente: entrega.cliente_nome || 'Cliente',
        cliente_id: entrega.cliente_id || null,
        valor,
        data_emissao: todayISO,
        data_vencimento: toISO(new Date(Date.now() + vencDays*86400000)),
        centro_custo_id,
        plano_contas_id,
        forma_cobranca: forma_recebimento,
        status: 'Pendente',
        projeto_obra: entrega.rota_id ? `Rota ${entrega.rota_id}` : undefined,
        ...(entrega.group_id ? { group_id: entrega.group_id } : {}),
        ...(entrega.empresa_id ? { empresa_id: entrega.empresa_id } : {}),
      });
      return { updated: false, created: true };
    };

    // Pré-carrega NFs por id
    const entregasComNFe = entregas.filter(e => !!e.nfe_id);
    const nfeIndex = new Map();
    for (let i=0;i<entregasComNFe.length;i+=50) {
      const batch = entregasComNFe.slice(i, i+50).map(e => e.nfe_id);
      const notas = await base44.asServiceRole.entities.NotaFiscal.filter({ id: { $in: batch } }, undefined, 1000);
      notas.forEach(n => nfeIndex.set(n.id, n));
    }

    let createdCP = 0, updatedCP = 0, createdCR = 0, updatedCR = 0, alerts = 0, processed = 0;

    for (const ent of entregas) {
      processed++;
      const nota = ent.nfe_id ? nfeIndex.get(ent.nfe_id) : null;

      // 1) Combustível (km * custo_km)
      if ((ent.km_rodado || 0) > 0 && custo_km > 0 && centro_custo_id && plano_contas_id) {
        const res = await ensureCP({ prefix: 'Combustível', valor: Number(ent.km_rodado) * custo_km, entrega: ent });
        if (res.created) createdCP++; if (res.updated) updatedCP++;
      }

      // 2) Frete (CIF => despesa; FOB => receita do cliente?)
      const freteNF = Number(nota?.valor_frete || 0);
      if (freteNF > 0 && centro_custo_id && plano_contas_id) {
        const isCIF = String(ent.tipo_frete || '').toUpperCase() === 'CIF' || regra_frete === 'CIF_expense';
        if (isCIF) {
          const res = await ensureCP({ prefix: 'Frete Transportadora', valor: freteNF, entrega: ent, categoria: 'Transporte' });
          if (res.created) createdCP++; if (res.updated) updatedCP++;
        } else if (String(ent.status) === 'Entregue') {
          const res = await ensureCR({ entrega: ent, valor: freteNF });
          if (res.created) createdCR++; if (res.updated) updatedCR++;
        }
      }

      // 3) Pedágios / Outras despesas
      const outras = Number(nota?.outras_despesas || 0);
      const estimPedagio = (Number(ent.km_rodado||0) * pedagio_por_km);
      const pedagioValor = outras > 0 ? outras : (pedagio_por_km > 0 ? estimPedagio : 0);
      if (pedagioValor > 0 && centro_custo_id && plano_contas_id) {
        const res = await ensureCP({ prefix: 'Pedágios/Despesas', valor: pedagioValor, entrega: ent, categoria: 'Transporte' });
        if (res.created) createdCP++; if (res.updated) updatedCP++;
      }

      // 4) Alerta de desvio orçamentário por entrega (planejado vs realizado)
      try {
        const realizado = (
          (Number(ent.km_rodado||0) * custo_km) +
          (freteNF && String(ent.tipo_frete||'').toUpperCase() === 'CIF' ? freteNF : 0) +
          (pedagioValor || 0)
        );
        const planejado = (
          (Number(ent.km_rodado||0) * custo_km) + // simples: usa custo_km como base
          (pedagio_por_km > 0 ? Number(ent.km_rodado||0) * pedagio_por_km : 0)
        );
        if (planejado > 0) {
          const desvio = ((realizado - planejado) / planejado) * 100;
          if (desvio > percentual_alerta_desvio) {
            alerts++;
            // Marca nos CPs vinculados como alerta_divergente
            try {
              const tag = `entrega_id:${ent.id}`;
              const cps = await base44.asServiceRole.entities.ContaPagar.filter({ descricao: { $regex: tag } }, '-updated_date', 50);
              for (const c of cps) {
                if (c.alerta_taxa_divergente !== true) {
                  await base44.asServiceRole.entities.ContaPagar.update(c.id, { alerta_taxa_divergente: true, observacoes: `(LOG) Desvio ${desvio.toFixed(1)}%` });
                }
              }
            } catch (_) { console.error('[reconcileLogisticaCosts] catch:', _); }
            // Audit log
            try {
              await base44.asServiceRole.entities.AuditLog.create({
                usuario: user?.full_name || user?.email || 'Sistema',
                acao: 'Alerta', modulo: 'Financeiro', tipo_auditoria: 'integracao',
                entidade: 'Conciliação Logística', registro_id: String(ent.id),
                descricao: `Desvio orçamentário acima de ${percentual_alerta_desvio}% (real=${realizado.toFixed(2)} vs plan=${planejado.toFixed(2)})`,
                data_hora: new Date().toISOString(),
                empresa_id: ent.empresa_id || null,
                group_id: ent.group_id || null,
              });
            } catch (_) { console.error('[reconcileLogisticaCosts] catch:', _); }
          }
        }
      } catch (_) { console.error('[reconcileLogisticaCosts] catch:', _); }
    }

    return Response.json({ ok: true, processed, createdCP, updatedCP, createdCR, updatedCR, alerts, periodo: { startISO, endISO }, empresa_id: empresaId });
  } catch (error) {
    return Response.json({ error: error?.message || 'error' }, { status: 500 });
  }
});