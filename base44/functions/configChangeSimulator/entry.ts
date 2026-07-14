import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const { change_summary = '', context = {} } = payload;

    const prompt = `Analise o impacto da seguinte mudança de configuração/permissões e responda JSON com {risco: (Baixo/Médio/Alto), impactos: [strings], conflitos_sod: [strings], recomendacoes: [strings]}.\nMudança: ${change_summary}\nContexto: ${JSON.stringify(context)}`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          risco: { type: 'string' },
          impactos: { type: 'array', items: { type: 'string' } },
          conflitos_sod: { type: 'array', items: { type: 'string' } },
          recomendacoes: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({ success: true, simulacao: res });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});