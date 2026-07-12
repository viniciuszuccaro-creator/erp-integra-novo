import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Avaliação de risco com IA (não bloqueante). Usa Core.InvokeLLM quando habilitado em ConfiguracaoSistema.
// Retorna: { score: 0-100, level: 'Baixo'|'Médio'|'Alto'|'Crítico', reasons: string[] }
async function assessActionRisk(base44, { entity, op, user, ip, userAgent, data }) {
  try {
    // Prompt compacto e objetivo (privacidade: sem PII sensível)
    const now = new Date().toISOString();
    const prompt = [
      'Você é um avaliador de risco de ações em um ERP. Classifique o risco (0-100) e nível (Baixo/Médio/Alto/Crítico).',
      'Considere: tipo da entidade, tipo de operação (create/update/delete/read), horário, possível sensibilidade financeira, IP externo, user-agent suspeito e campos alterados relevantes.',
      'Responda em JSON com: {"score": number, "level": "Baixo|Médio|Alto|Crítico", "reasons": string[]}.',
      `Agora avalie:
       entidade=${entity}
       operacao=${op}
       horario=${now}
       ip=${ip || ''}
       userAgent=${userAgent || ''}
       papelUsuario=${user?.role || ''}
       camposAlterados=${data ? Object.keys(data).slice(0, 12).join(',') : ''}`
    ].join('\n');

    // Chamada via integração Core.InvokeLLM (retorno como objeto quando schema é fornecido)
    const schema = {
      type: 'object',
      properties: {
        score: { type: 'number' },
        level: { type: 'string', enum: ['Baixo','Médio','Alto','Crítico'] },
        reasons: { type: 'array', items: { type: 'string' } }
      },
      required: ['score','level']
    };

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: false,
    });

    const out = res;
    if (!out || typeof out !== 'object') return null;

    const score = Math.max(0, Math.min(100, Number(out.score || 0)));
    const level = out.level && ['Baixo','Médio','Alto','Crítico'].includes(out.level) ? out.level : (score >= 80 ? 'Crítico' : score >= 60 ? 'Alto' : score >= 30 ? 'Médio' : 'Baixo');
    const reasons = Array.isArray(out.reasons) ? out.reasons.slice(0, 8) : [];

    return { score, level, reasons };
  } catch (_) {
    return null; // nunca quebra o fluxo
  }
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/security/iaAccessRiskAssessor' });
});