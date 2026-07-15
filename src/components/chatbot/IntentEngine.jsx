import { base44 } from '@/api/base44Client';
import { INTENTS_CONFIG } from './intentEngine/intentsConfig';
import { analisarSentimento, extrairEntidades, gerarResposta, obterAcoesSugeridas } from './intentEngine/intentNER';
import { executarAcaoIntent } from './intentEngine/intentActions';

/**
 * V21.6 - MOTOR DE INTENTS AVANÇADO
 * Engine de IA para detecção de intenção, análise de sentimento,
 * extração de entidades (NER), execução de ações automáticas e
 * geração de respostas contextuais com suporte multi-empresa.
 */
const IntentEngine = {
  intents: INTENTS_CONFIG,

  /**
   * Detectar intent da mensagem
   */
  async detectarIntent(mensagem, clienteId, contexto = {}) {
    const mensagemLower = mensagem.toLowerCase().trim();

    let intentDetectado = 'desconhecido';
    let confianca = 0;
    let melhorMatch = null;

    // 1. Detecção estática por palavras-chave
    for (const [intent, config] of Object.entries(this.intents)) {
      const matches = config.palavras_chave.filter(palavra => mensagemLower.includes(palavra.toLowerCase()));
      if (matches.length > 0) {
        const score = (matches.length / config.palavras_chave.length) * 100;
        if (score > confianca || (score === confianca && config.prioridade < (melhorMatch?.prioridade || 999))) {
          confianca = Math.min(score * 1.5, 95);
          intentDetectado = intent;
          melhorMatch = config;
        }
      }
    }

    // 2. Detecção dinâmica via entidade ChatbotIntent (multiempresa, cache compartilhado)
    try {
      const filtro = { ativo: true };
      if (contexto?.empresaId) filtro.empresa_id = contexto.empresaId;
      if (contexto?.groupId) filtro.group_id = contexto.groupId;
      const res = await base44.functions.invoke('entityListSorted', {
        entityName: 'ChatbotIntent',
        filter: filtro,
        sortField: 'updated_date', sortDirection: 'desc', limit: 50,
      });
      const intentsDinamicas = res?.data || res || [];
      for (const dyn of intentsDinamicas || []) {
        const palavras = Array.isArray(dyn.palavras_chave) ? dyn.palavras_chave : String(dyn.palavras_chave || '').split(',');
        const matchesDyn = palavras.filter(p => p && mensagemLower.includes(String(p).trim().toLowerCase()));
        if (matchesDyn.length > 0) {
          const scoreDyn = Math.min((matchesDyn.length / Math.max(palavras.length, 1)) * 100, 95);
          const prioridadeDyn = typeof dyn.prioridade === 'number' ? dyn.prioridade : 3;
          if (scoreDyn > confianca || (scoreDyn === confianca && prioridadeDyn < (melhorMatch?.prioridade || 999))) {
            confianca = Math.round(scoreDyn);
            intentDetectado = dyn.intent_key || dyn.nome || 'desconhecido';
            melhorMatch = { prioridade: prioridadeDyn, requer_humano: !!dyn.requer_humano, acao: dyn.acao };
          }
        }
      }
    } catch (_) { console.error('[chatbot] catch:', _); }

    // 3. Fallback via IA se confiança baixa
    if (confianca < 50) {
      try {
        const byIA = await this.analisarComIA(mensagem, contexto);
        if (byIA?.intent && typeof byIA?.confianca === 'number' && (byIA.confianca > confianca)) {
          intentDetectado = byIA.intent;
          confianca = Math.round(byIA.confianca);
          melhorMatch = { prioridade: 3, requer_humano: !!byIA.necessita_atendente };
        }
      } catch (_) { console.error('[chatbot] catch:', _); }
    }

    const sentimento = analisarSentimento(mensagemLower);
    const entidades = extrairEntidades(mensagemLower);

    const necessitaAtendente =
      melhorMatch?.requer_humano ||
      sentimento === 'Frustrado' ||
      sentimento === 'Urgente' ||
      confianca < 40;

    const respostaSugerida = gerarResposta(intentDetectado, entidades, clienteId, contexto, sentimento);
    const acoesSugeridas = obterAcoesSugeridas(intentDetectado);

    return {
      intent: intentDetectado,
      confianca: Math.round(confianca),
      sentimento,
      entidades_detectadas: entidades,
      necessita_atendente: necessitaAtendente,
      resposta_sugerida: respostaSugerida,
      acoes_sugeridas: acoesSugeridas,
      contexto_usado: contexto
    };
  },

  /**
   * Executar ação automática (delegado para intentActions)
   */
  async executarAcao(intent, entidades, clienteId, contexto = {}) {
    return executarAcaoIntent(intent, entidades, clienteId, contexto);
  },

  /**
   * V21.6: Usar IA avançada para análise (com fallback)
   */
  async analisarComIA(mensagem, contexto = {}) {
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a mensagem de um cliente e retorne:
1. Intent principal (consultar_pedido, consultar_entrega, segunda_via_boleto, orcamento, suporte_tecnico, falar_atendente, cancelamento, saudacao, agradecimento, despedida, desconhecido)
2. Confiança de 0 a 100
3. Sentimento (Positivo, Neutro, Negativo, Frustrado, Urgente)
4. Entidades detectadas (CPF, CNPJ, número de pedido, valor, data, email, telefone)
5. Se precisa de atendente humano

Mensagem: "${mensagem}"

Contexto do cliente: ${JSON.stringify(contexto)}`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confianca: { type: "number" },
            sentimento: { type: "string" },
            entidades: { type: "object" },
            necessita_atendente: { type: "boolean" },
            resposta_sugerida: { type: "string" },
            acoes_sugeridas: { type: "array", items: { type: "string" } }
          }
        }
      });
      return resultado;
    } catch (error) {
      console.warn('IA indisponível, usando fallback:', error.message);
      return this.detectarIntent(mensagem, null, contexto);
    }
  }
};

export default IntentEngine;