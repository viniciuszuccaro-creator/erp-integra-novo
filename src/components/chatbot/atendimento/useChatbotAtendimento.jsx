import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook extraído do ChatbotAtendimento.jsx
 * Contém: detecção de intent, análise de sentimento, transbordo com RBAC, processamento de intent
 * P2: Multi-tenant via empresaAtual
 * P3: Verificação de permissão no transbordo
 */
export default function useChatbotAtendimento() {
  const [mensagem, setMensagem] = useState('');
  const [sessaoAtual, setSessaoAtual] = useState(null);
  const [clienteAutenticado, setClienteAutenticado] = useState(null);
  const [vendedorAtendendo, setVendedorAtendendo] = useState(null);
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();

  const { data: intentsConfig = [] } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: () => base44.entities.ChatbotIntents.filter({ ativo: true }),
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['chatbot-interacoes', sessaoAtual],
    queryFn: () => {
      if (!sessaoAtual) return [];
      const filtro = empresaAtual?.id
        ? { sessao_id: sessaoAtual, empresa_id: empresaAtual.id }
        : { sessao_id: sessaoAtual };
      return base44.entities.ChatbotInteracao.filter(filtro, '-data_hora', 50);
    },
    enabled: !!sessaoAtual
  });

  useEffect(() => {
    if (!sessaoAtual) {
      setSessaoAtual(`sessao-${Date.now()}`);
    }
  }, []);

  const detectarIntent = async (msg) => {
    const msgLower = msg.toLowerCase();
    for (const intentConfig of intentsConfig) {
      const palavras = intentConfig.palavras_chave || [];
      if (palavras.some(p => msgLower.includes(p.toLowerCase()))) {
        return {
          nome: intentConfig.nome_intent,
          confianca: 90,
          requer_autenticacao: intentConfig.requer_autenticacao,
          acao: intentConfig.acao_automatica,
          escalar: intentConfig.escalar_vendedor
        };
      }
    }

    if (msgLower.includes('boleto') || msgLower.includes('2 via')) return { nome: '2_via_boleto', confianca: 95, requer_autenticacao: true };
    if (msgLower.includes('rastrear') || msgLower.includes('entrega')) return { nome: 'rastrear_entrega', confianca: 90, requer_autenticacao: true };
    if (msgLower.includes('orçamento') || msgLower.includes('orcamento')) return { nome: 'fazer_orcamento_ia', confianca: 85, requer_autenticacao: false };
    if (msgLower.includes('vendedor') || msgLower.includes('atendente')) return { nome: 'falar_atendente', confianca: 100, requer_autenticacao: false, escalar: true };
    return { nome: 'desconhecido', confianca: 0, requer_autenticacao: false };
  };

  const analisarSentimento = async (msg) => {
    const palavrasFrustracao = ['absurdo', 'ridículo', 'atrasado', 'errado', 'horrível', 'cancelar', 'péssimo', 'nunca mais'];
    const palavrasUrgencia = ['urgente', 'emergência', 'imediato', 'agora', 'rápido'];
    const msgLower = msg.toLowerCase();
    const frustracaoDetectada = palavrasFrustracao.filter(p => msgLower.includes(p));
    const urgenciaDetectada = palavrasUrgencia.filter(p => msgLower.includes(p));
    let vendedorId = clienteAutenticado?.vendedor_responsavel_id || null;

    return {
      tipo: frustracaoDetectada.length > 0 ? 'Frustrado' : urgenciaDetectada.length > 0 ? 'Urgente' : 'Neutro',
      frustrado: frustracaoDetectada.length > 0,
      urgente: urgenciaDetectada.length > 0,
      palavras: [...frustracaoDetectada, ...urgenciaDetectada],
      vendedor_id: vendedorId
    };
  };

  const escalarParaAtendente = async (msg, sentimento) => {
    let vendedorDestino = 'Equipe Comercial';
    let vendedorId = sentimento.vendedor_id;

    if (vendedorId) {
      try {
        const vendedor = await base44.entities.User.get(vendedorId);
        vendedorDestino = vendedor.full_name;
        if (vendedor.perfil_acesso_id) {
          const perfil = await base44.entities.PerfilAcesso.get(vendedor.perfil_acesso_id);
          if (!perfil.permissoes?.chatbot?.pode_atender_transbordo) {
            const supervisores = await base44.entities.User.filter({ role: 'admin' }, '', 1);
            if (supervisores.length > 0) {
              vendedorId = supervisores[0].id;
              vendedorDestino = supervisores[0].full_name + ' (Supervisor)';
            } else {
              vendedorId = null;
              vendedorDestino = 'Equipe de Suporte (Supervisor)';
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar vendedor ou perfil de acesso:', error);
        vendedorId = null;
        vendedorDestino = 'Equipe de Suporte (Erro)';
      }
    } else {
      const supervisores = await base44.entities.User.filter({ role: 'admin' }, '', 1);
      if (supervisores.length > 0) {
        vendedorId = supervisores[0].id;
        vendedorDestino = supervisores[0].full_name + ' (Supervisor)';
      } else {
        vendedorDestino = 'Equipe de Suporte';
      }
    }

    await base44.entities.Notificacao.create({
      titulo: '🚨 Cliente Frustrado - Transbordo Urgente',
      mensagem: `Cliente demonstrou ${sentimento.tipo.toLowerCase()}: "${msg}".\n\nPalavras detectadas: ${sentimento.palavras.join(', ')}\n\n👉 Sessão ID: ${sessaoAtual}`,
      tipo: 'urgente',
      categoria: 'Comercial',
      prioridade: 'Urgente',
      destinatario_id: vendedorId,
      link_acao: `/chatbot-atendimento?sessao=${sessaoAtual}`,
      group_id: empresaAtual?.group_id || null,
      empresa_id: empresaAtual?.id || null,
      dados_adicionais: {
        tag: '#TRANSBORDO_CHATBOT',
        sessao_id: sessaoAtual,
        cliente_id: clienteAutenticado?.id,
        verificacao_permissao: true
      }
    });

    setVendedorAtendendo(vendedorDestino);
    toast.error(`🚨 Cliente ${sentimento.tipo} - Transferindo para ${vendedorDestino}`);
  };

  const processarIntent = async (intent, msg) => {
    switch (intent.nome) {
      case '2_via_boleto':
        if (clienteAutenticado) {
          const titulos = await base44.entities.ContaReceber.filter({
            cliente_id: clienteAutenticado.id,
            status: 'Pendente'
          });
          if (titulos.length > 0) {
            return `📄 ${titulos.length} título(s) em aberto:\n\n${titulos.map(t =>
              `R$ ${t.valor.toFixed(2)} - Venc: ${new Date(t.data_vencimento).toLocaleDateString('pt-BR')}`
            ).join('\n')}`;
          }
          return '✅ Sem títulos em aberto!';
        }
        break;
      case 'rastrear_entrega':
        if (clienteAutenticado) {
          const entregas = await base44.entities.Entrega.filter({
            cliente_id: clienteAutenticado.id,
            status: { $in: ['Em Trânsito', 'Saiu para Entrega'] }
          });
          if (entregas.length > 0) {
            return `🚚 ${entregas.length} entrega(s) em andamento:\n\n${entregas.map(e =>
              `Pedido ${e.numero_pedido} - Status: ${e.status}`
            ).join('\n')}`;
          }
          return '📦 Nenhuma entrega em andamento.';
        }
        break;
      case 'fazer_orcamento_ia':
        return '📋 Para orçamento:\n1. Envie projeto (PDF/DWG)\n2. Ou descreva o que precisa\n\n🤖 Nossa IA processará automaticamente!';
      case 'falar_atendente':
        if (intent.escalar) return '📞 Transferindo para vendedor responsável...\n\nAguarde um momento.';
        break;
      default:
        return '🤔 Posso ajudar com:\n• 2ª via boleto\n• Rastrear entrega\n• Fazer orçamento\n• Falar com vendedor';
    }
  };

  const enviarMensagemMutation = useMutation({
    mutationFn: async (msg) => {
      const intent = await detectarIntent(msg);
      if (intent.requer_autenticacao && !clienteAutenticado) {
        return await base44.entities.ChatbotInteracao.create({
          sessao_id: sessaoAtual,
          empresa_id: empresaAtual?.id,
          group_id: empresaAtual?.group_id || null,
          canal: 'Portal',
          mensagem_usuario: msg,
          intent_detectado: intent.nome,
          requer_autenticacao: true,
          autenticacao_solicitada: true,
          resposta_bot: '🔐 Para consultar informações financeiras, informe seu CPF/CNPJ:',
          data_hora: new Date().toISOString()
        });
      }

      const sentimento = await analisarSentimento(msg);
      if (sentimento.frustrado || sentimento.urgente || intent.escalar) {
        await escalarParaAtendente(msg, sentimento);
      }

      const resposta = await processarIntent(intent, msg);
      return await base44.entities.ChatbotInteracao.create({
        sessao_id: sessaoAtual,
        canal: 'Portal',
        cliente_id: clienteAutenticado?.id,
        cliente_nome: clienteAutenticado?.nome,
        autenticado: !!clienteAutenticado,
        mensagem_usuario: msg,
        intent_detectado: intent.nome,
        confianca_intent: intent.confianca,
        resposta_bot: resposta,
        sentimento_detectado: sentimento.tipo,
        palavras_chave_sentimento: sentimento.palavras,
        transferido_atendente: sentimento.frustrado || sentimento.urgente || intent.escalar,
        vendedor_notificado_id: sentimento.vendedor_id,
        empresa_id: empresaAtual?.id || null,
        group_id: empresaAtual?.group_id || null,
        data_hora: new Date().toISOString()
      });
    },
    onError: () => { toast.error('Falha ao enviar mensagem'); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-interacoes'] });
      setMensagem('');
    },
  });

  const handleEnviar = () => {
    if (!mensagem.trim()) return;
    enviarMensagemMutation.mutate(mensagem);
  };

  const ultimasInteracoes = interacoes.slice().reverse();

  return {
    mensagem, setMensagem,
    sessaoAtual,
    clienteAutenticado,
    vendedorAtendendo,
    interacoes: ultimasInteracoes,
    intentsConfig,
    enviarMensagemMutation,
    handleEnviar
  };
}