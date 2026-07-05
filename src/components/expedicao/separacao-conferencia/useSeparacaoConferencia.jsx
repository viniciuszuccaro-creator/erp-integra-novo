import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook extraído de SeparacaoConferencia.jsx (Regra-Mãe)
 * Gerencia estado, queries e mutations de separação/conferência
 */
export default function useSeparacaoConferencia({ entregaId, pedido, empresaId }) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const [itens, setItens] = useState([]);
  const [checklist, setChecklist] = useState({
    conferiu_quantidade: false,
    conferiu_qualidade: false,
    conferiu_embalagem: false,
    conferiu_etiquetas: false,
    conferiu_documentos: false,
    observacoes_checklist: ""
  });

  const { data: entrega, isLoading, isError, error } = useQuery({
    queryKey: ['entrega', entregaId, contextoKey],
    queryFn: async () => base44.entities.Entrega.get(entregaId),
    enabled: !!entregaId && !pedido,
  });

  const dadosParaSeparacao = pedido || entrega;

  useEffect(() => {
    if (dadosParaSeparacao?.itens_revenda?.length > 0) {
      const initialItens = dadosParaSeparacao.itens_revenda.map(i => ({
        ...i,
        quantidade_pedida: i.quantidade,
        quantidade_separada: 0,
        status_item: "aguardando",
        divergencia: false,
        observacao_item: "",
      }));
      setItens(initialItens);
    } else if ((entregaId || pedido) && !isLoading && !dadosParaSeparacao) {
      toast({ title: "Nenhum dado encontrado", description: "Não foi possível carregar os itens.", variant: "destructive" });
    }
  }, [dadosParaSeparacao, entregaId, pedido, isLoading, toast]);

  const criarSeparacaoMutation = useMutation({
    mutationFn: async () => {
      if (!dadosParaSeparacao) throw new Error("Dados não disponíveis para criar separação.");
      const temDivergencia = itens.some(i => i.divergencia);

      const separacao = await base44.entities.SeparacaoConferencia.create({
        group_id: dadosParaSeparacao.group_id,
        empresa_id: dadosParaSeparacao.empresa_id || empresaId,
        numero_separacao: `SEP-${Date.now()}`,
        pedido_id: dadosParaSeparacao.id,
        numero_pedido: dadosParaSeparacao.numero_pedido || dadosParaSeparacao.numero_entrega,
        cliente_id: dadosParaSeparacao.cliente_id,
        cliente_nome: dadosParaSeparacao.cliente_nome,
        tipo: "conferencia",
        data_inicio: new Date().toISOString(),
        data_conclusao: new Date().toISOString(),
        responsavel_nome: user?.full_name || user?.email || "Conferente",
        itens,
        status: temDivergencia ? "com_divergencia" : "concluido",
        tem_divergencia: temDivergencia,
        divergencias_resumo: temDivergencia ? `${itens.filter(i => i.divergencia).length} item(ns) com divergência` : "",
        checklist,
        tempo_separacao_min: 0
      });

      if (!temDivergencia && dadosParaSeparacao) {
        if (entrega?.id) await base44.entities.Entrega.update(entrega.id, { status: "Pronto para Expedir" });
        if (pedido?.id) await base44.entities.Pedido.update(pedido.id, { status: "Pronto para Faturar" });

        await base44.entities.HistoricoCliente.create({
          group_id: dadosParaSeparacao.group_id,
          empresa_id: dadosParaSeparacao.empresa_id || empresaId,
          cliente_id: dadosParaSeparacao.cliente_id,
          cliente_nome: dadosParaSeparacao.cliente_nome,
          modulo_origem: "Expedicao",
          referencia_id: separacao.id,
          referencia_tipo: "SeparacaoConferencia",
          tipo_evento: "Finalizacao",
          titulo_evento: "Separação e conferência concluída",
          descricao_detalhada: `Separação conferida e liberada para expedição.`,
          usuario_responsavel: user?.full_name || user?.email || 'Sistema',
          data_evento: new Date().toISOString(),
          status_relacionado: "Pronto para Expedir"
        });
      }
      return separacao;
    },
    onSuccess: async (separacao) => {
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: separacao?.empresa_id || empresaId || null,
          group_id: separacao?.group_id || dadosParaSeparacao?.group_id || null,
          acao: 'Criação', modulo: 'Expedição', entidade: 'SeparacaoConferencia', registro_id: separacao?.id,
          descricao: `Separação concluída (${separacao?.numero_separacao || ''})`,
          dados_novos: separacao,
          data_hora: new Date().toISOString()
        });
      } catch {}
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['separacoes'] });
      toast({ title: "✅ Conferência concluída!", description: "Itens conferidos com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao concluir conferência", description: error.message || "Ocorreu um erro ao salvar a conferência.", variant: "destructive" });
    }
  });

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    if (campo === "quantidade_separada") {
      const item = novosItens[index];
      const divergente = item.quantidade_separada !== item.quantidade_pedida;
      novosItens[index].divergencia = divergente;
      novosItens[index].status_item = divergente ? "divergente" : (item.quantidade_separada > 0 ? "ok" : "aguardando");
    }
    setItens(novosItens);
  };

  const handleItemEscaneado = (scannedItem) => {
    setItens(prevItens => {
      const newItens = [...prevItens];
      const idx = newItens.findIndex(i => i.id === scannedItem.id || i.codigo_sku === scannedItem.codigo_sku);
      if (idx !== -1) {
        const item = newItens[idx];
        const newQtd = (item.quantidade_separada || 0) + 1;
        const isDivergent = newQtd !== item.quantidade_pedida;
        newItens[idx] = { ...item, quantidade_separada: newQtd, divergencia: isDivergent, status_item: isDivergent ? "divergente" : "ok" };
        toast({ title: "Item escaneado!", description: `${item.descricao} - Qtd: ${newQtd}` });
      } else {
        toast({ title: "⚠️ Item não esperado", description: `O item "${scannedItem.descricao || scannedItem.codigo_sku || 'SKU Desconhecido'}" não faz parte desta entrega.`, variant: "destructive" });
      }
      return newItens;
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const todosSeparadosMinimo = itens.every(i => i.quantidade_separada > 0);
    if (!todosSeparadosMinimo) {
      toast({ title: "⚠️ Itens não conferidos", description: "Pelo menos um item não teve sua quantidade separada informada ou é zero.", variant: "destructive" });
      return;
    }
    if (!checklist.conferiu_quantidade || !checklist.conferiu_qualidade || !checklist.conferiu_embalagem || !checklist.conferiu_etiquetas || !checklist.conferiu_documentos) {
      toast({ title: "⚠️ Checklist incompleto", description: "Por favor, marque todos os itens do checklist de conferência.", variant: "destructive" });
      return;
    }
    criarSeparacaoMutation.mutate();
  };

  const itensDivergentes = itens.filter(i => i.divergencia);

  return {
    itens, checklist, setChecklist,
    dadosParaSeparacao, isLoading, isError, error,
    criarSeparacaoMutation, atualizarItem, handleItemEscaneado, handleSubmit,
    itensDivergentes,
  };
}