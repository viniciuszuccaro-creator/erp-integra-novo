import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * IA Generativa Contextual por Módulo (Ciclo 10)
 * LLM + RAG com contexto de empresa, histórico e dados reais
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { module, prompt, context = {}, max_tokens = 500 } = await req.json();
    if (!module || !prompt) return Response.json({ error: 'Missing params' }, { status: 400 });

    // Buscar contexto real da empresa/módulo
    const empresa_id = context.empresa_id || null;
    const group_id = context.group_id || null;

    let relevantData = {};
    const queryScope = { ...(group_id && { group_id }), ...(empresa_id && { empresa_id }) };

    // RAG: buscar dados relevantes baseado no módulo
    switch (module) {
      case 'Comercial': {
        const pedidos = await base44.entities.Pedido.filter(queryScope, '-updated_date', 5);
        const clientes = await base44.entities.Cliente.filter(queryScope, '-updated_date', 3);
        relevantData = { pedidos: pedidos.slice(0, 5), clientes: clientes.slice(0, 3) };
        break;
      }
      case 'Financeiro': {
        const receber = await base44.entities.ContaReceber.filter({ ...queryScope, status: 'Atrasado' }, '-data_vencimento', 5);
        const pagar = await base44.entities.ContaPagar.filter(queryScope, '-data_vencimento', 3);
        relevantData = { atrasadas: receber, proximas: pagar };
        break;
      }
      case 'Estoque': {
        const criticos = await base44.entities.Produto.filter({ ...queryScope, estoque_atual: { $lt: 10 } }, '-estoque_atual', 5);
        relevantData = { criticos };
        break;
      }
      case 'Produção': {
        const ops = await base44.entities.OrdemProducao?.filter?.(queryScope, '-updated_date', 3) || [];
        relevantData = { ordens: ops };
        break;
      }
      default:
        break;
    }

    // Prompt enriquecido com contexto
    const enrichedPrompt = `
Contexto:
- Módulo: ${module}
- Empresa: ${empresa_id || 'Grupo'}
- Dados relevantes: ${JSON.stringify(relevantData, null, 2)}
- Usuário: ${user.full_name}

Pergunta do usuário:
${prompt}

Forneça uma resposta clara, acionável e baseada nos dados acima.
`;

    // Chamar InvokeLLM com contexto
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: enrichedPrompt,
      add_context_from_internet: false,
      model: 'automatic'
    });

    return Response.json({
      response: res,
      module,
      empresa_id,
      group_id,
      used_rag_data: Object.keys(relevantData).length > 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});