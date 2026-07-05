/**
 * useHubAtendimentoData — extrai todas as queries e mutations do HubAtendimento.
 * Centraliza acesso a conversas, mensagens, métricas e ações de atendimento.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export function useHubAtendimentoData({
  filtroStatus, filtroCanal, filtroPrioridade, buscaTexto,
  conversaSelecionada, setConversaSelecionada, setMensagemAtendente,
}) {
  const queryClient = useQueryClient();
  const { user, isAdmin, hasPermission } = usePermissions();
  const { empresaAtual, filterInContext } = useContextoVisual();

  const podeAtenderTransbordo = isAdmin() || hasPermission('chatbot', null, 'visualizar') || hasPermission('CRM', null, 'visualizar');

  // Buscar conversas
  const { data: conversas = [], isLoading } = useQuery({
    queryKey: ['conversas-omnicanal', filtroStatus, filtroCanal, empresaAtual?.id],
    queryFn: async () => {
      let filtros = {};
      if (filtroStatus !== "Todas") filtros.status = filtroStatus;
      if (filtroCanal !== "Todos") filtros.canal = filtroCanal;
      if (empresaAtual?.id) filtros.empresa_id = empresaAtual.id;
      if (!hasPermission('chatbot', 'ver_todas_conversas')) {
        filtros.$or = [{ atendente_id: user.id }, { atendente_id: { $exists: false } }];
      }
      return await base44.entities.ConversaOmnicanal.filter(filtros, '-data_ultima_mensagem', 50);
    },
    refetchInterval: 5000,
  });

  // Buscar mensagens da conversa selecionada
  const { data: mensagens = [] } = useQuery({
    queryKey: ['mensagens-conversa', conversaSelecionada?.id],
    queryFn: async () => {
      if (!conversaSelecionada) return [];
      return await base44.entities.MensagemOmnicanal.filter({ conversa_id: conversaSelecionada.id }, 'data_envio', 200);
    },
    enabled: !!conversaSelecionada,
    refetchInterval: 3000,
  });

  // Buscar métricas
  const { data: metricas } = useQuery({
    queryKey: ['metricas-atendimento', empresaAtual?.id],
    queryFn: async () => {
      const todasConversas = await base44.entities.ConversaOmnicanal.filter({ empresa_id: empresaAtual?.id });
      return {
        total: todasConversas.length,
        emProgresso: todasConversas.filter(c => c.status === 'Em Progresso').length,
        aguardando: todasConversas.filter(c => c.status === 'Aguardando').length,
        naoAtribuidas: todasConversas.filter(c => c.status === 'Não Atribuída').length,
        resolvidasHoje: todasConversas.filter(c => {
          if (!c.data_finalizacao) return false;
          return new Date(c.data_finalizacao).toDateString() === new Date().toDateString();
        }).length,
        tempoMedioResposta: 2.5,
        taxaResolucaoBot: 78,
      };
    },
    refetchInterval: 10000,
  });

  // KPIs SLA 24h
  const { data: botSla = { chats: 0, sla_ok: 0, sla_total: 0 } } = useQuery({
    queryKey: ['bot-sla-24h', empresaAtual?.id],
    queryFn: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const items = await filterInContext('ChatbotInteracao', {}, '-created_date', 500);
      const within = (items || []).filter(i => new Date(i?.created_date || Date.now()).getTime() >= since);
      const acc = within.reduce((a, i) => {
        const ms = Number(i?.tempo_primeira_resposta_ms || 0);
        if (!isNaN(ms)) { a.total++; if (ms <= 60000) a.ok++; }
        return a;
      }, { ok: 0, total: 0 });
      return { chats: within.length, sla_ok: acc.ok, sla_total: acc.total };
    },
    staleTime: 60000,
  });

  // Enviar mensagem
  const enviarMensagemMutation = useMutation({
    mutationFn: async ({ mensagem, arquivo }) => {
      if (!conversaSelecionada) return;
      let arquivoUrl = null;
      if (arquivo) {
        const result = await base44.integrations.Core.UploadFile({ file: arquivo });
        arquivoUrl = result.file_url;
      }
      const novaMensagem = await base44.entities.MensagemOmnicanal.create({
        conversa_id: conversaSelecionada.id,
        empresa_id: conversaSelecionada.empresa_id || empresaAtual?.id,
        group_id: empresaAtual?.group_id || null,
        sessao_id: conversaSelecionada.sessao_id,
        canal: conversaSelecionada.canal,
        tipo_remetente: 'Atendente',
        remetente_id: user.id,
        remetente_nome: user.full_name,
        mensagem,
        tipo_conteudo: arquivo ? 'documento' : 'texto',
        midia_url: arquivoUrl,
        data_envio: new Date().toISOString(),
        resposta_automatica: false,
      });
      await base44.entities.ConversaOmnicanal.update(conversaSelecionada.id, {
        data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: (conversaSelecionada.total_mensagens || 0) + 1,
        mensagens_humano: (conversaSelecionada.mensagens_humano || 0) + 1,
        tipo_atendimento: 'Humano',
      });
      return novaMensagem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens-conversa'] });
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      setMensagemAtendente("");
    },
  });

  // Assumir conversa
  const assumirConversaMutation = useMutation({
    mutationFn: async (conversaId) => {
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        atendente_id: user.id,
        atendente_nome: user.full_name,
        status: 'Em Progresso',
        tipo_atendimento: 'Humano',
        transferido_em: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] }),
  });

  // Resolver conversa
  const resolverConversaMutation = useMutation({
    mutationFn: async (conversaId) => {
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        status: 'Resolvida',
        resolvido: true,
        data_finalizacao: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      setConversaSelecionada(null);
    },
  });

  // Conversas filtradas por texto e prioridade
  const conversasFiltradas = conversas.filter(c => {
    if (buscaTexto) {
      const texto = buscaTexto.toLowerCase();
      const matchTexto = (
        c.cliente_nome?.toLowerCase().includes(texto) ||
        c.cliente_email?.toLowerCase().includes(texto) ||
        c.cliente_telefone?.includes(texto) ||
        c.sessao_id?.toLowerCase().includes(texto) ||
        c.intent_principal?.toLowerCase().includes(texto) ||
        c.assuntos_detectados?.some(a => a.toLowerCase().includes(texto)) ||
        c.tags?.some(t => t.toLowerCase().includes(texto))
      );
      if (!matchTexto) return false;
    }
    if (filtroPrioridade !== "Todas" && c.prioridade !== filtroPrioridade) return false;
    return true;
  });

  return {
    user, podeAtenderTransbordo,
    conversas, isLoading, conversasFiltradas,
    mensagens, metricas, botSla,
    enviarMensagemMutation, assumirConversaMutation, resolverConversaMutation,
    queryClient,
  };
}