/**
 * V21.6 - Configuração de Intents do Motor de IA
 * Intents conhecidos e suas configurações
 */
export const INTENTS_CONFIG = {
  'consultar_pedido': {
    palavras_chave: ['pedido', 'meu pedido', 'status pedido', 'onde está', 'rastrear'],
    prioridade: 1,
    acao: 'buscar_pedidos'
  },
  'consultar_entrega': {
    palavras_chave: ['entrega', 'rastrear entrega', 'onde está minha entrega', 'previsão', 'quando chega'],
    prioridade: 1,
    acao: 'buscar_entregas'
  },
  'segunda_via_boleto': {
    palavras_chave: ['boleto', '2 via', 'segunda via', 'pagar', 'vencimento', 'código de barras'],
    prioridade: 2,
    acao: 'buscar_boletos'
  },
  'emitir_boleto': {
    palavras_chave: ['emitir boleto', 'gerar boleto', 'boleto novo', 'cobrança', 'fatura'],
    prioridade: 2,
    acao: 'gerar_boleto'
  },
  'criar_pedido': {
    palavras_chave: ['fazer pedido', 'criar pedido', 'novo pedido', 'comprar'],
    prioridade: 2,
    acao: 'criar_pedido'
  },
  'orcamento': {
    palavras_chave: ['orçamento', 'cotação', 'preço', 'quanto custa', 'valor'],
    prioridade: 2,
    acao: 'criar_orcamento'
  },
  'suporte_tecnico': {
    palavras_chave: ['problema', 'erro', 'não funciona', 'defeito', 'reclamação', 'suporte'],
    prioridade: 3,
    requer_humano: true
  },
  'falar_atendente': {
    palavras_chave: ['atendente', 'humano', 'pessoa', 'falar com alguém', 'transferir'],
    prioridade: 1,
    requer_humano: true
  },
  'cancelamento': {
    palavras_chave: ['cancelar', 'cancelamento', 'desistir', 'devolver'],
    prioridade: 2,
    requer_humano: true
  },
  'informacoes_empresa': {
    palavras_chave: ['horário', 'endereço', 'telefone', 'contato', 'localização'],
    prioridade: 3,
    acao: 'info_empresa'
  },
  'saudacao': {
    palavras_chave: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eai'],
    prioridade: 5,
    acao: 'saudar'
  },
  'agradecimento': {
    palavras_chave: ['obrigado', 'obrigada', 'valeu', 'agradeço', 'thanks'],
    prioridade: 5,
    acao: 'agradecer'
  },
  'despedida': {
    palavras_chave: ['tchau', 'até logo', 'bye', 'até mais', 'finalizar'],
    prioridade: 5,
    acao: 'despedir'
  }
};

export const PALAVRAS_NEGATIVAS = [
  'urgente', 'imediato', 'agora', 'problema', 'erro', 'falha',
  'péssimo', 'horrível', 'raiva', 'absurdo', 'inaceitável',
  'reclamação', 'procon', 'advogado', 'processo', 'nunca mais'
];

export const PALAVRAS_POSITIVAS = [
  'obrigado', 'ótimo', 'excelente', 'perfeito', 'maravilhoso',
  'parabéns', 'satisfeito', 'adorei', 'recomendo'
];

export const RESPOSTAS_PADRAO = {
  'consultar_pedido': '📦 Claro! Vou verificar seus pedidos. Um momento...',
  'consultar_entrega': '🚚 Vou consultar o status da sua entrega agora mesmo!',
  'segunda_via_boleto': '💳 Vou buscar seus boletos em aberto. Aguarde...',
  'orcamento': '📋 Você gostaria de solicitar um orçamento? Posso ajudar!',
  'suporte_tecnico': '🔧 Entendi que você precisa de suporte técnico. Vou transferir para um especialista.',
  'falar_atendente': '👤 Claro! Vou transferir você para um atendente humano. Um momento...',
  'cancelamento': '⚠️ Entendo. Vou encaminhar para um atendente que poderá ajudar com o cancelamento.',
  'informacoes_empresa': 'ℹ️ Posso te ajudar com informações da empresa!',
  'saudacao': 'Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?',
  'agradecimento': 'Por nada! 😊 Fico feliz em ajudar. Precisa de mais alguma coisa?',
  'despedida': 'Até logo! 👋 Se precisar de algo, estou por aqui. Tenha um ótimo dia!',
  'desconhecido': 'Desculpe, não entendi bem. Pode reformular ou escolher uma das opções abaixo?'
};

export const ACOES_SUGERIDAS = {
  'consultar_pedido': ['Ver meus pedidos', 'Rastrear entrega', 'Falar com atendente'],
  'consultar_entrega': ['Ver entregas', 'Rastrear pedido', 'Informar problema'],
  'segunda_via_boleto': ['Ver boletos', 'Pagar com PIX', 'Falar com financeiro'],
  'orcamento': ['Solicitar orçamento', 'Ver produtos', 'Falar com vendedor'],
  'saudacao': ['Ver meus pedidos', 'Solicitar orçamento', '2ª via de boleto', 'Falar com atendente'],
  'desconhecido': ['Ver meus pedidos', 'Consultar entrega', '2ª via de boleto', 'Falar com atendente']
};