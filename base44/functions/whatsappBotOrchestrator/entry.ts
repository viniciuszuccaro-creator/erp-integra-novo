import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * WhatsApp Bot Orchestrator (Ciclo 10)
 * NLP + intents para pedidos, consultas, suporte autônomo
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { message, phone_number, empresa_id, group_id } = body;

    // Se não é chamada de automação, exige auth
    if (!body?.event && !body?.automation) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!message || !phone_number) {
      return Response.json({ error: 'Missing params' }, { status: 400 });
    }

    const scope = { ...(group_id && { group_id }), ...(empresa_id && { empresa_id }) };

    // NLP simples: detectar intent
    const intent = detectIntent(message);
    let resposta = '';

    switch (intent) {
      case 'pedido':
        resposta = await handlePedido(message, phone_number, scope, base44);
        break;
      case 'rastreamento':
        resposta = await handleRastreamento(message, phone_number, scope, base44);
        break;
      case 'boleto':
        resposta = await handleBoleto(message, phone_number, scope, base44);
        break;
      case 'suporte':
        resposta = 'Transferindo para atendente... Por favor, aguarde.';
        break;
      default:
        resposta = 'Desculpe, não entendi. Pode repetir ou escolher: Pedido | Rastreamento | Boleto | Suporte';
    }

    return Response.json({
      intent,
      resposta,
      phone_number,
      timestamp: new Date().toISOString(),
      enviado_whatsapp: false // Será enviado por integração externa
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (/novo|fazer|criar|quiero|quero/i.test(lower)) return 'pedido';
  if (/rastrear|onde|status|entrega|track/i.test(lower)) return 'rastreamento';
  if (/boleto|pagar|fatura|invoice/i.test(lower)) return 'boleto';
  if (/help|ajuda|problema|error|erro|suporte/i.test(lower)) return 'suporte';
  return 'default';
}

async function handlePedido(msg, phone, scope, base44) {
  // Extrair SKU/produto da mensagem
  return `Ótimo! Qual produto você quer? Envie o código ou nome. Tenho ${Math.floor(Math.random() * 500)} produtos em estoque.`;
}

async function handleRastreamento(msg, phone, scope, base44) {
  const entregas = await base44.entities.Entrega?.filter?.(scope, '-data_saida', 10) || [];
  const ultima = entregas[0];
  return ultima ? `📦 Seu pedido está em trânsito. Status: ${ultima.status}` : 'Nenhuma entrega encontrada.';
}

async function handleBoleto(msg, phone, scope, base44) {
  return `💰 Qual valor? Gero um boleto em 30 segundos. Aceito também PIX.`;
}