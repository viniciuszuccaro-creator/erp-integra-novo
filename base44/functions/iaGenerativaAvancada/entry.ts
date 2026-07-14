import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { modulo, tipo, prompt, contexto } = await req.json();

    const promptCompleto = `[Módulo: ${modulo}] [Tipo: ${tipo}] ${prompt}. Contexto adicional: ${JSON.stringify(contexto || {})}`;

    // Modelos compatíveis com add_context_from_internet (web search):
    // apenas 'gemini_3_flash' e 'gemini_3_1_pro'
    // claude_opus_4_6 NÃO suporta web search — usar gemini_3_1_pro para IA generativa com contexto web
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: promptCompleto,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro'
    });

    // Auditoria
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      acao: 'Execução',
      modulo: modulo || 'Sistema',
      tipo_auditoria: 'ia',
      entidade: 'IAGenerativa',
      descricao: `Gerado conteúdo ${tipo} via IA generativa`,
      dados_novos: { prompt, tipo },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ resultado: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});