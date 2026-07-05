import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import IntentEngine from './IntentEngine';
import { toast } from 'sonner';

/**
 * Hook extraído de ChatbotWidgetAvancado.jsx
 * Encapsula queries, mutations e handlers do chatbot omnicanal.
 */
export default function useChatbotWidget({
  clienteId, canal = 'Portal', conversaId: conversaIdProp, configuracoes = {}
}) {
  const { empresaAtual } = useContextoVisual();
  const [aberto, setAberto] = useState(true);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [sessaoId] = useState(() => conversaIdProp || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [processando, setProcessando] = useState(false);
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [exibirAvaliacao, setExibirAvaliacao] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: configCanal } = useQuery({
    queryKey: ['config-canal', canal, empresaAtual?.id],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoCanal.filter({ canal, ativo: true, empresa_id: empresaAtual?.id });
      return configs[0] || null;
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: conversaExistente } = useQuery({
    queryKey: ['conversa-omnicanal', sessaoId],
    queryFn: async () => {
      const conversas = await base44.entities.ConversaOmnicanal.filter({ sessao_id: sessaoId });
      return conversas[0] || null;
    },
    enabled: !!sessaoId
  });

  const { data: mensagensHistorico = [] } = useQuery({
    queryKey: ['mensagens-omnicanal', sessaoId],
    queryFn: async () => {
      if (!sessaoId) return [];
      return await base44.entities.MensagemOmnicanal.filter({ sessao_id: sessaoId }, 'data_envio', 100);
    },
    enabled: !!sessaoId && aberto,
    refetchInterval: 3000
  });

  const { data: dadosCliente } = useQuery({
    queryKey: ['cliente-contexto', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const clientes = await base44.entities.Cliente.filter({ id: clienteId });
      return clientes[0] || null;
    },
    enabled: !!clienteId
  });

  useEffect(() => {
    if (aberto && !conversaExistente && !conversaAtiva) inicializarConversa();
  }, [aberto, conversaExistente]);

  const inicializarConversa = async () => {
    try {
      const novaConversa = await base44.entities.ConversaOmnicanal.create({
        canal, sessao_id: sessaoId, cliente_id: clienteId,
        cliente_nome: dadosCliente?.nome || 'Cliente', cliente_email: dadosCliente?.email,
        cliente_telefone: dadosCliente?.telefone, empresa_id: empresaAtual?.id,
        status: 'Em Progresso', tipo_atendimento: 'Bot', prioridade: 'Normal',
        data_inicio: new Date().toISOString(), sla_iniciado_em: new Date().toISOString(),
        data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: 0, mensagens_bot: 0, mensagens_cliente: 0, sentimento_geral: 'Neutro'
      });
      setConversaAtiva(novaConversa);
      const nomeCliente = dadosCliente?.nome?.split(' ')[0] || 'Cliente';
      const mensagemBoasVindas = configCanal?.mensagem_boas_vindas || `Olá ${nomeCliente}! 👋 Sou o assistente virtual do ERP Zuccaro. Como posso ajudar você hoje?`;
      await base44.entities.MensagemOmnicanal.create({
        conversa_id: novaConversa.id, sessao_id: sessaoId, canal, tipo_remetente: 'Bot',
        remetente_nome: 'Assistente IA', mensagem: mensagemBoasVindas, tipo_conteudo: 'texto',
        data_envio: new Date().toISOString(), resposta_automatica: true,
        sugestoes_acoes: ['Ver meus pedidos', 'Consultar entrega', '2ª via de boleto', 'Solicitar orçamento', 'Falar com atendente']
      });
    } catch (error) { console.error('Erro ao inicializar conversa:', error); toast.error('Erro ao iniciar conversa. Tente novamente.'); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagensHistorico]);

  const transferirParaAtendente = async (conversaId, resultado) => {
    try {
      const atendentes = configCanal?.equipe_atendimento_ids || [];
      const atendenteId = atendentes[0] || null;
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        tipo_atendimento: 'Humano', atendente_id: atendenteId, transferido_em: new Date().toISOString(),
        status: 'Aguardando', prioridade: resultado.sentimento === 'Frustrado' || resultado.sentimento === 'Urgente' ? 'Urgente' : 'Alta'
      });
      if (atendenteId) {
        await base44.entities.Notificacao.create({
          titulo: '🚨 Nova Conversa - Transbordo Chatbot',
          mensagem: `Cliente precisa de atendimento humano.\nSentimento: ${resultado.sentimento}\nIntent: ${resultado.intent}\nCanal: ${canal}`,
          tipo: 'urgente', categoria: 'Atendimento',
          prioridade: resultado.sentimento === 'Frustrado' || resultado.sentimento === 'Urgente' ? 'Urgente' : 'Alta',
          destinatario_id: atendenteId, link_acao: `/hub-atendimento?conversa=${conversaId}`,
          dados_adicionais: { conversa_id: conversaId, sessao_id: sessaoId, canal, cliente_id: clienteId, sentimento: resultado.sentimento }
        });
      }
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
        conversa_id: conversaId, sessao_id: sessaoId, canal, tipo_remetente: 'Cliente',
        remetente_id: clienteId, remetente_nome: dadosCliente?.nome || 'Cliente', mensagem,
        tipo_conteudo: arquivo ? (arquivo.type.startsWith('image/') ? 'imagem' : 'documento') : 'texto',
        midia_url: arquivoUrl, midia_tipo: arquivoTipo, midia_tamanho_kb: arquivoTamanho,
        data_envio: new Date().toISOString(), entregue: true, lida: true
      });
      const resultado = await IntentEngine.detectarIntent(mensagem, clienteId, { canal, sessaoId, conversaId, temAnexo: !!arquivo, historico: mensagensHistorico.slice(-5), dadosCliente });
      const necessitaTransferencia = resultado.necessita_atendente || resultado.sentimento === 'Frustrado' || resultado.sentimento === 'Urgente' || resultado.confianca < 50;
      if (necessitaTransferencia) await transferirParaAtendente(conversaId, resultado);
      let acaoResultado = null;
      if (resultado.confianca >= 70 && !necessitaTransferencia) {
        acaoResultado = await IntentEngine.executarAcao(resultado.intent, resultado.entidades_detectadas, clienteId, { empresaId: empresaAtual?.id, dadosCliente });
      }
      await base44.entities.MensagemOmnicanal.create({
        conversa_id: conversaId, sessao_id: sessaoId, canal,
        tipo_remetente: necessitaTransferencia ? 'Sistema' : 'Bot', remetente_nome: 'Assistente IA',
        mensagem: acaoResultado?.mensagem || resultado.resposta_sugerida, tipo_conteudo: 'texto',
        data_envio: new Date().toISOString(), resposta_automatica: !necessitaTransferencia,
        intent_detectado: resultado.intent, confianca_intent: resultado.confianca, sentimento: resultado.sentimento,
        sugestoes_acoes: resultado.acoes_sugeridas, entidades_extraidas: resultado.entidades_detectadas
      });
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: (conversaAtiva?.total_mensagens || 0) + 2,
        mensagens_cliente: (conversaAtiva?.mensagens_cliente || 0) + 1,
        mensagens_bot: (conversaAtiva?.mensagens_bot || 0) + 1,
        intent_principal: resultado.intent, sentimento_geral: resultado.sentimento,
        tipo_atendimento: necessitaTransferencia ? 'Humano' : 'Bot',
        assuntos_detectados: [...(conversaAtiva?.assuntos_detectados || []), resultado.intent].filter((v, i, a) => a.indexOf(v) === i)
      });
      await base44.entities.ChatbotInteracao.create({
        sessao_id: sessaoId, canal, cliente_id: clienteId, empresa_id: empresaAtual?.id,
        mensagem_usuario: mensagem, intent_detectado: resultado.intent, confianca_intent: resultado.confianca,
        resposta_bot: acaoResultado?.mensagem || resultado.resposta_sugerida,
        acao_executada: acaoResultado?.tipo || 'resposta_padrao', sentimento_detectado: resultado.sentimento,
        transferido_atendente: necessitaTransferencia, data_hora: new Date().toISOString(),
        resolvido: !necessitaTransferencia
      });
      try {
        await base44.entities.AuditLog.create({
          usuario: dadosCliente?.nome || 'Cliente', acao: 'Criação', modulo: 'Chatbot', entidade: 'Conversa',
          descricao: `Intent: ${resultado.intent} (confiança ${resultado.confianca}%) • Canal: ${canal}`,
          empresa_id: empresaAtual?.id, dados_novos: { intent: resultado.intent, confianca: resultado.confianca, sentimento: resultado.sentimento, acoes: resultado.acoes_sugeridas },
          data_hora: new Date().toISOString()
        });
      } catch (_) {}
      return { ...resultado, acao: acaoResultado, transferido: necessitaTransferencia };
    },
    onSuccess: (data) => {
      setProcessando(false); setArquivoAnexo(null);
      if (data.transferido) toast.info('Conversa transferida para atendente humano', { description: 'Um especialista responderá em breve' });
    },
    onError: (error) => { console.error('Erro ao enviar mensagem:', error); setProcessando(false); toast.error('Erro ao enviar mensagem', { description: 'Por favor, tente novamente' }); }
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
    if (file) {
      if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande', { description: 'O tamanho máximo é 10MB' }); return; }
      setArquivoAnexo(file);
      toast.success('Arquivo anexado!');
    }
  };

  const handleAvaliar = async (nota) => {
    if (!conversaAtiva?.id && !conversaExistente?.id) return;
    const conversaId = conversaAtiva?.id || conversaExistente?.id;
    try {
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        score_satisfacao: nota, feedback_cliente: avaliacaoSelecionada === nota ? 'Positivo' : null,
        resolvido: nota >= 4, status: 'Resolvida', data_finalizacao: new Date().toISOString(), sla_finalizado_em: new Date().toISOString()
      });
      setAvaliacaoSelecionada(nota);
      toast.success('Obrigado pela avaliação!', { description: nota >= 4 ? 'Ficamos felizes em ajudar!' : 'Vamos melhorar!' });
      setTimeout(() => { setExibirAvaliacao(false); setAberto(false); }, 2000);
    } catch (error) { console.error('Erro ao avaliar:', error); }
  };

  const conversaTransferida = conversaAtiva?.tipo_atendimento === 'Humano' || conversaExistente?.tipo_atendimento === 'Humano';

  return {
    aberto, setAberto, mensagemAtual, setMensagemAtual, processando, arquivoAnexo, setArquivoAnexo,
    conversaAtiva, exibirAvaliacao, setExibirAvaliacao, avaliacaoSelecionada,
    messagesEndRef, fileInputRef, configCanal, conversaExistente, mensagensHistorico, dadosCliente,
    conversaTransferida, handleEnviar, handleSugestaoClick, handleAnexarArquivo, handleAvaliar
  };
}