import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const event = payload?.event || null;

    // Se chamada direta do frontend (sem event de automação), exige auth
    if (!event) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entityId = event?.entity_id || payload?.oportunidade_id;
    if (!entityId) return Response.json({ error: 'oportunidade_id obrigatório' }, { status: 400 });

    const opp = payload?.data || await base44.asServiceRole.entities.Oportunidade.get(entityId);

    const prompt = `Calcule score (0-100) e temperatura (Frio/Morno/Quente) para a oportunidade abaixo. Responda JSON.\nDados: ${JSON.stringify({
      valor_estimado: opp?.valor_estimado,
      probabilidade: opp?.probabilidade,
      dias_sem_contato: opp?.dias_sem_contato,
      etapa: opp?.etapa,
      historico_interacoes: opp?.quantidade_interacoes,
      data_previsao: opp?.data_previsao,
      cliente: opp?.cliente_nome,
    })}`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          temperatura: { type: 'string' },
          proxima_acao: { type: 'string' }
        },
      },
    });

    const patch = {};
    if (typeof res?.score === 'number') patch.score = Math.max(0, Math.min(100, Math.round(res.score)));
    if (typeof res?.temperatura === 'string') patch.temperatura = res.temperatura;

    if (res?.proxima_acao) {
      patch.proxima_acao = res.proxima_acao;
      patch.data_proxima_acao = patch.data_proxima_acao || new Date().toISOString();
    }

    if (Object.keys(patch).length) {
      await base44.asServiceRole.entities.Oportunidade.update(entityId, patch);
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'automacao',
        acao: 'Edição',
        modulo: 'CRM',
        entidade: 'Oportunidade',
        registro_id: entityId,
        descricao: 'Score/Temperatura atualizados por IA',
        dados_novos: patch,
        duracao_ms: Date.now() - t0,
      });
    } catch (e) { console.error('[oportunidadeScorer] catch:', e); }

    return Response.json({ success: true, updated: patch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});