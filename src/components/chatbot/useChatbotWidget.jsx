import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import IntentEngine from './IntentEngine';

export default function useChatbotWidget({ clienteId, canal = 'Portal', conversaId: conversaIdProp, exibirBotaoFlutuante = true }) {
  const [aberto, setAberto] = useState(!exibirBotaoFlutuante);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [sessaoId] = useState(() => conversaIdProp || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [processando, setProcessando] = useState(false);
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: configCanal } = useQuery({
    queryKey: ['config-canal', canal, contextoKey],
    queryFn: async () => {
      const configs = await filterInContext('ConfiguracaoCanal', { canal, ativo: true });
      return configs[0] || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversaExistente } = useQuery({
    queryKey: ['conversa-omnicanal', sessaoId],
    queryFn: async () => {
      const conversas = await base44.entities.ConversaOmnicanal.filter({ sessao_id: sessaoId });
      return conversas[0] || null;
    },
    enabled: !!sessaoId,
  });

  const { data: mensagensHistorico = [] } = useQuery({
    queryKey: ['mensagens-omnicanal', sessaoId],
    queryFn: async () => {
      if (!sessaoId) return [];
      return await base44.entities.MensagemOmnicanal.filter({ sessao_id: sessaoId }, 'data_envio', 100);
    },
    enabled: !!sessaoId && aberto,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (aberto && !conversaExistente && !conversaAtiva) inicializarConversa();
  }, [aberto, conversaExistente]); // eslint-disable-line react-hooks/exhaustive-deps

  const inicializarConversa = async () => {
    try {
      const novaConversa = await base44.entities.ConversaOmnicanal.create({
        canal, sessao_id: sessaoId, cliente_id: clienteId, status: 'Em Progresso', tipo_atendimento: 'Bot',
        data_inicio: new Date().toISOString(), data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: 0, mensagens_bot: 0, mensagens_cliente: 0,
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: empresaAtual?.id || null,
      });
      setConversaAtiva(novaConversa);

      const mensagemBoasVindas = configCanal?.mensagem_boas_vindas || 'Olá! 👋 Sou o assistente virtual. Como posso ajudar?';
      await base44.entities.MensagemOmnicanal.create({
        conversa_id: novaConversa.id, sessao_id: sessaoId, canal, tipo_remetente: 'Bot', remetente_nome: 'Assistente IA',
        mensagem: mensagemBoasVindas, tipo_conteudo: 'texto', data_envio: new Date().toISOString(),
        resposta_automatica: true, sugestoes_acoes: ['Ver meus pedidos', 'Consultar entrega', '2ª via de boleto', 'Solicitar orçamento'],
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: empresaAtual?.id || null,
      });
    } catch (error) { console.error('Erro ao inicializar conversa:', error); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagensHistorico]);

  const transferirParaAtendente = async (conversaId, resultado) => {
    try {
      const atendentes = configCanal?.equipe_atendimento_ids || [];
      if (atendentes.length === 0) return;
      const atendenteId = atendentes[0];
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        tipo_atendimento: 'Humano', atendente_id: atendenteId, transferido_em: new Date().toISOString(),
        status: 'Aguardando', prioridade: resultado.sentimento === 'Frustrado' ? 'Urgente' : 'Alta',
      });
      await base44.entities.Notificacao.create({
        titulo: '🚨 Nova Conversa - Transbordo Chatbot',
        mensagem: `Cliente precisa de atendimento humano.\nSentimento: ${resultado.sentimento}\nIntent: ${resultado.intent}`,
        tipo: 'urgente', categoria: 'Atendimento', prioridade: resultado.sentimento === 'Frustrado' ? 'Urgente' : 'Alta',
        destinatario_id: atendenteId, link_acao: `/hub-atendimento?conversa=${conversaId}`,
        dados_adicionais: { conversa_id: conversaId, sessao_id: sessaoId, canal },
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: empresaAtual?.id || null,
      });
    } catch (error) { console.error('Erro ao transferir para atendente:', error); }
  };

  const enviarMensagemMutation = useMutation({
    mutationFn: async ({ mensagem, arquivo }) => {
      const conversaId = conversaAtiva?.id || conversaExistente?.id;
      if (!conversaId) throw new Error('Conversa não inicializada');

      let arquivoUrl = null, arquivoTipo = null, arquivoTamanho = null;
      if (arquivo) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: arquivo });
        arquivoUrl = uploadResult.file_url; arquivoTipo = arquivo.type; arquivoTamanho = Math.round(arquivo.size / 1024);
      }

      await base44.entities.MensagemOmnicanal.create({
        conversa_id: conversaId, sessao_id: sessaoId, canal, tipo_remetente: 'Cliente', remetente_id: clienteId,
        mensagem, tipo_conteudo: arquivo ? 'documento' : 'texto', midia_url: arquivoUrl, midia_tipo: arquivoTipo,
        midia_tamanho_kb: arquivoTamanho, data_envio: new Date().toISOString(), entregue: true,
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: empresaAtual?.id || null,
      });

      const resultado = await IntentEngine.detectarIntent(mensagem, clienteId, {
        canal, sessaoId, conversaId, temAnexo: !!arquivo, empresaId: empresaAtual?.id,
      });

      if (resultado.necessita_atendente || resultado.sentimento === 'Frustrado') {
        await transferirParaAtendente(conversaId, resultado);
      }

      let acaoResultado = null;
      if (resultado.confianca >= 70 && !resultado.necessita_atendente) {
        acaoResultado = await IntentEngine.executarAcao(resultado.intent, resultado.entidades_detectadas, clienteId, { empresaId: empresaAtual?.id });
      }

      await base44.entities.MensagemOmnicanal.create({
        conversa_id: conversaId, sessao_id: sessaoId, canal,
        tipo_remetente: resultado.necessita_atendente ? 'Sistema' : 'Bot', remetente_nome: 'Assistente IA',
        mensagem: acaoResultado?.mensagem || resultado.resposta_sugerida, tipo_conteudo: 'texto',
        data_envio: new Date().toISOString(), resposta_automatica: !resultado.necessita_atendente,
        intent_detectado: resultado.intent, confianca_intent: resultado.confianca, sentimento: resultado.sentimento,
        sugestoes_acoes: resultado.acoes_sugeridas, entidades_extraidas: resultado.entidades_detectadas,
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: empresaAtual?.id || null,
      });

      await base44.entities.ConversaOmnicanal.update(conversaId, {
        data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: (conversaAtiva?.total_mensagens || 0) + 2,
        mensagens_cliente: (conversaAtiva?.mensagens_cliente || 0) + 1,
        mensagens_bot: (conversaAtiva?.mensagens_bot || 0) + 1,
        intent_principal: resultado.intent, sentimento_geral: resultado.sentimento,
        tipo_atendimento: resultado.necessita_atendente ? 'Humano' : 'Bot',
      });

      await base44.entities.ChatbotInteracao.create({
        sessao_id: sessaoId, canal, cliente_id: clienteId, empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id || empresaAtual?.group_id || null,
        mensagem_usuario: mensagem, intent_detectado: resultado.intent, confianca_intent: resultado.confianca,
        resposta_bot: acaoResultado?.mensagem || resultado.resposta_sugerida, acao_executada: acaoResultado?.tipo || 'resposta_padrao',
        sentimento_detectado: resultado.sentimento, transferido_atendente: resultado.necessita_atendente,
        data_hora: new Date().toISOString(), resolvido: !resultado.necessita_atendente,
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: 'Cliente', acao: 'Criação', modulo: 'Chatbot', entidade: 'Conversa',
          descricao: `Intent: ${resultado.intent} (confiança ${resultado.confianca}%) • Canal: ${canal}`,
          empresa_id: empresaAtual?.id,
          dados_novos: { intent: resultado.intent, confianca: resultado.confianca, sentimento: resultado.sentimento },
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return { ...resultado, acao: acaoResultado };
    },
    onSuccess: () => { setProcessando(false); setArquivoAnexo(null); },
    onError: (error) => { console.error('Erro ao enviar mensagem:', error); setProcessando(false); },
  });

  const handleEnviar = () => {
    if (!mensagemAtual.trim() && !arquivoAnexo) return;
    setProcessando(true);
    enviarMensagemMutation.mutate({ mensagem: mensagemAtual || 'Arquivo anexado', arquivo: arquivoAnexo });
    setMensagemAtual('');
  };

  const handleSugestaoClick = (sugestao) => {
    setMensagemAtual(sugestao);
    setTimeout(() => handleEnviar(), 100);
  };

  const handleAnexarArquivo = (e) => {
    const file = e.target.files?.[0];
    if (file) setArquivoAnexo(file);
  };

  const conversaTransferida = conversaAtiva?.tipo_atendimento === 'Humano' || conversaExistente?.tipo_atendimento === 'Humano';

  return {
    aberto, setAberto, mensagemAtual, setMensagemAtual, processando, arquivoAnexo, setArquivoAnexo,
    mensagensHistorico, messagesEndRef, fileInputRef, handleEnviar, handleSugestaoClick, handleAnexarArquivo,
    conversaTransferida,
  };
}