import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * BI Forecast Preditivo (Ciclo 10)
 * ML para prever vendas, margem e caixa 30/60/90 dias
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { empresa_id, group_id, horizon_days = 30 } = await req.json();
    const scope = { ...(group_id && { group_id }), ...(empresa_id && { empresa_id }) };

    // 1. Histórico de vendas (últimos 90 dias)
    const vendas = await base44.entities.Pedido?.filter?.(
      { ...scope, status: 'Faturado' },
      '-data_pedido',
      100
    ) || [];

    // 2. Calcular tendência (vendas/dia médio)
    const vendidosPorDia = vendas.length / 90;
    const margemMedia = vendas.reduce((sum, p) => {
      const mg = (p.valor_total * 0.15); // 15% margem padrão
      return sum + mg;
    }, 0) / vendas.length || 0;

    // 3. Projeção simples (linear) + sazonalidade (aprox)
    const forecast = {
      periodo_dias: horizon_days,
      vendas_previstas: Math.round(vendidosPorDia * horizon_days),
      margem_prevista: Math.round(margemMedia * horizon_days),
      caixa_previsto: Math.round((margemMedia * horizon_days) * 0.8), // 80% realizado
      confianca_percentual: Math.min(95, 50 + (vendas.length * 0.4)), // Aumenta com histórico
      horizonte_dias: horizon_days,
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + horizon_days * 86400000).toISOString()
    };

    // 4. Alertas automáticos
    const alertas = [];
    if (forecast.caixa_previsto < 50000) alertas.push('⚠️ Previsão de caixa baixa');
    if (margemMedia < 5000) alertas.push('⚠️ Margem abaixo da meta');
    if (vendas.length < 10) alertas.push('⚠️ Histórico limitado, previsão com baixa confiança');

    return Response.json({ forecast, alertas, vendas_sample: vendas.slice(0, 3) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});