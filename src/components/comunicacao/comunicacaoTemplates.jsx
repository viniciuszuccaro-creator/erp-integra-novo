/**
 * Templates de comunicação (E-mail e WhatsApp)
 * Extraído de EnviarComunicacaoModal.jsx
 */

export const TEMPLATES_EMAIL = {
  pedido_confirmado: {
    assunto: "Pedido Confirmado - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} foi confirmado com sucesso!

Valor Total: R$ {valor_total}
Previsão de Entrega: {data_entrega}

Qualquer dúvida, estamos à disposição.

Atenciosamente,
{empresa}`
  },
  saida_caminhao: {
    assunto: "Seu pedido saiu para entrega - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} saiu para entrega!

🚚 Transportadora: {transportadora}
📦 Volumes: {volumes}
🔢 Código de Rastreamento: {codigo_rastreamento}

Rastreie em: {link_rastreamento}

Atenciosamente,
{empresa}`
  },
  entregue: {
    assunto: "Pedido Entregue - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} foi entregue com sucesso!

Esperamos que esteja satisfeito com sua compra.
Avalie nosso atendimento: {link_avaliacao}

Atenciosamente,
{empresa}`
  },
  nfe_emitida: {
    assunto: "Nota Fiscal - #{numero_pedido}",
    corpo: `Olá {cliente},

Segue em anexo a Nota Fiscal Eletrônica referente ao pedido #{numero_pedido}.

Chave de Acesso: {chave_nfe}

Atenciosamente,
{empresa}`
  }
};

export const TEMPLATES_WHATSAPP = {
  pedido_confirmado: `✅ *Pedido Confirmado*

Olá {cliente}! Seu pedido *#{numero_pedido}* foi confirmado.

💰 Valor: R$ {valor_total}
📅 Previsão: {data_entrega}`,

  saida_caminhao: `🚚 *Pedido em Trânsito*

Olá {cliente}! Seu pedido *#{numero_pedido}* saiu para entrega!

📦 Volumes: {volumes}
🔢 Rastreio: {codigo_rastreamento}
🚛 Transportadora: {transportadora}

Rastreie: {link_rastreamento}`,

  entregue: `✅ *Pedido Entregue*

Olá {cliente}! Seu pedido *#{numero_pedido}* foi entregue!

Obrigado pela preferência! 🎉`,

  producao_iniciada: `⚙️ *Produção Iniciada*

Olá {cliente}! Seu pedido *#{numero_pedido}* entrou em produção.

Status: {status}
Previsão: {data_entrega}`,

  aguardando_retirada: `📦 *Pronto para Retirada*

Olá {cliente}! Seu pedido *#{numero_pedido}* está pronto para retirada!

📍 Endereço: {endereco_retirada}
🕐 Horário: {horario_retirada}`
};

/**
 * Aplica template substituindo variáveis do pedido
 */
export function aplicarTemplateComunicacao(canal, templateKey, pedido) {
  if (!pedido) return { mensagem: '', assunto: '' };

  const templateData = canal === "email" ? TEMPLATES_EMAIL[templateKey] : TEMPLATES_WHATSAPP[templateKey];
  if (!templateData) return { mensagem: '', assunto: '' };

  let texto = canal === "email" ? templateData.corpo : templateData;
  let assuntoEmail = canal === "email" ? templateData.assunto : "";

  const variaveis = {
    cliente: pedido.cliente_nome || "Cliente",
    numero_pedido: pedido.numero_pedido || "",
    valor_total: (pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    data_entrega: pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : "A confirmar",
    transportadora: pedido.transportadora || "A definir",
    volumes: pedido.volumes || 1,
    codigo_rastreamento: pedido.codigo_rastreamento || "Será informado",
    link_rastreamento: pedido.codigo_rastreamento ? `https://rastreamento.com.br/${pedido.codigo_rastreamento}` : "#",
    chave_nfe: pedido.nfe_chave_acesso || "Será informado",
    empresa: "ERP Integra",
    status: pedido.status || "Em processamento",
    endereco_retirada: "Rua Principal, 123 - Centro",
    horario_retirada: "8h às 18h",
    link_avaliacao: "https://avaliacao.com.br"
  };

  Object.keys(variaveis).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    texto = texto.replace(regex, variaveis[key]);
    assuntoEmail = assuntoEmail.replace(regex, variaveis[key]);
  });

  return { mensagem: texto, assunto: assuntoEmail };
}