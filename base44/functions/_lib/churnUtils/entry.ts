async function loadChurnConfig(base44) {
  try {
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'CRM', chave: 'churn_ia' }, '-updated_date', 1);
    const cfg = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
    return {
      minDiasSemContato: Number(cfg?.min_dias_sem_contato ?? 14),
      maxAtrasoPrevisao: Number(cfg?.max_atraso_previsao_dias ?? 7),
      minProbabilidade: Number(cfg?.min_probabilidade ?? 40),
    };
  } catch (_) {
    return { minDiasSemContato: 14, maxAtrasoPrevisao: 7, minProbabilidade: 40 };
  }
}

function evaluateChurnRisk(oportunidade, cfg) {
  const dias = Number(oportunidade?.dias_sem_contato || 0);
  const prob = Number(oportunidade?.probabilidade || 0);
  let atrasoPrev = 0;
  if (oportunidade?.data_previsao) {
    const now = Date.now();
    const d = new Date(oportunidade.data_previsao).getTime();
    atrasoPrev = d < now ? Math.ceil((now - d) / (1000*60*60*24)) : 0;
  }
  const flagged = (dias >= (cfg?.minDiasSemContato ?? 14)) || (prob <= (cfg?.minProbabilidade ?? 40)) || (atrasoPrev >= (cfg?.maxAtrasoPrevisao ?? 7));
  const detalhes = { dias_sem_contato: dias, probabilidade: prob, atraso_prev: atrasoPrev };
  const recomendacao = 'Agendar follow-up nas próximas 24h';
  return { flagged, detalhes, recomendacao };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/churnUtils' });
});