/**
 * V21.6 - NER Simplificado e Análise de Sentimento
 * Extração de entidades e detecção de sentimento da mensagem
 */
import { PALAVRAS_NEGATIVAS, PALAVRAS_POSITIVAS, RESPOSTAS_PADRAO, ACOES_SUGERIDAS } from './intentsConfig';

/**
 * Analisar sentimento da mensagem
 */
export function analisarSentimento(mensagem) {
  const negativoScore = PALAVRAS_NEGATIVAS.filter(p => mensagem.includes(p)).length;
  const positivoScore = PALAVRAS_POSITIVAS.filter(p => mensagem.includes(p)).length;

  if (mensagem.includes('urgente') || mensagem.includes('imediato') || mensagem.includes('agora mesmo')) {
    return 'Urgente';
  }

  if (negativoScore >= 2 || mensagem.includes('!!!') || (mensagem.toUpperCase() === mensagem && mensagem.length > 10)) {
    return 'Frustrado';
  }

  if (negativoScore > positivoScore) return 'Negativo';
  if (positivoScore > negativoScore) return 'Positivo';
  return 'Neutro';
}

/**
 * Extrair entidades da mensagem (NER simplificado)
 */
export function extrairEntidades(mensagem) {
  const entidades = {};

  // Número de pedido (PED-XXXXXX)
  const pedidoMatch = mensagem.match(/ped[-\s]?(\d{4,8})/i);
  if (pedidoMatch) entidades.numero_pedido = `PED-${pedidoMatch[1]}`;

  // CPF
  const cpfMatch = mensagem.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
  if (cpfMatch) entidades.cpf = cpfMatch[0].replace(/\D/g, '');

  // CNPJ
  const cnpjMatch = mensagem.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
  if (cnpjMatch) entidades.cnpj = cnpjMatch[0].replace(/\D/g, '');

  // Valor monetário
  const valorMatch = mensagem.match(/r\$\s?[\d.,]+/i);
  if (valorMatch) entidades.valor = parseFloat(valorMatch[0].replace(/[r$\s.]/gi, '').replace(',', '.'));

  // Data
  const dataMatch = mensagem.match(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/);
  if (dataMatch) entidades.data = dataMatch[0];

  // Email
  const emailMatch = mensagem.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) entidades.email = emailMatch[0];

  // Telefone
  const telMatch = mensagem.match(/\(?\d{2}\)?[\s-]?\d{4,5}[-\s]?\d{4}/);
  if (telMatch) entidades.telefone = telMatch[0];

  // Produto mencionado
  const produtoMatch = mensagem.match(/(?:produto|item|mercadoria)\s+(.{3,30}?)(?:\s|$|,|\.)/i);
  if (produtoMatch) entidades.produto_mencionado = produtoMatch[1].trim();

  return entidades;
}

/**
 * Gerar resposta baseada no intent
 */
export function gerarResposta(intent, entidades, clienteId, contexto, sentimento) {
  let resposta = RESPOSTAS_PADRAO[intent] || RESPOSTAS_PADRAO['desconhecido'];

  // Personalizar resposta se tiver dados do cliente
  if (contexto?.dadosCliente?.nome) {
    const primeiroNome = contexto.dadosCliente.nome.split(' ')[0];
    resposta = resposta.replace('você', primeiroNome);
  }

  // Ajustar tom baseado no sentimento
  if (sentimento === 'Frustrado' || sentimento === 'Negativo') {
    resposta = `Peço desculpas por qualquer inconveniente. ${resposta}`;
  }
  if (sentimento === 'Urgente') {
    resposta = `⚡ ${resposta} Estamos tratando com prioridade!`;
  }

  return resposta;
}

/**
 * Obter ações sugeridas para o cliente
 */
export function obterAcoesSugeridas(intent) {
  return ACOES_SUGERIDAS[intent] || ACOES_SUGERIDAS['desconhecido'];
}