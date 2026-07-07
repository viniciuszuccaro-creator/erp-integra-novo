import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import useRLS from "@/components/lib/useRLS";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook extraído de ContasReceberTab.jsx
 * Mutations de baixa, envio ao caixa, WhatsApp + estado de diálogos.
 */
export default function useContasReceber({ contasList, queryClient: extQueryClient }) {
  const { create: createRLS, update: updateRLS } = useRLS();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const { hasPermission } = usePermissions();
  const { createInContext } = useContextoVisual();

  const [gerarCobrancaDialogOpen, setGerarCobrancaDialogOpen] = useState(false);
  const [simularPagamentoDialogOpen, setSimularPagamentoDialogOpen] = useState(false);
  const [gerarLinkDialogOpen, setGerarLinkDialogOpen] = useState(false);
  const [contaParaCobranca, setContaParaCobranca] = useState(null);
  const [contaParaSimulacao, setContaParaSimulacao] = useState(null);
  const [contaParaLink, setContaParaLink] = useState(null);
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);
  const [dadosBaixa, setDadosBaixa] = useState({
    data_recebimento: new Date().toISOString().split('T')[0],
    valor_recebido: 0, forma_recebimento: "PIX", juros: 0, multa: 0, desconto: 0, observacoes: ""
  });

  const enviarParaCaixaMutation = useMutation({
    mutationFn: async (titulos) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await createInContext('CaixaOrdemLiquidacao', {
          group_id: titulo.group_id, empresa_id: titulo.empresa_id,
          tipo_operacao: 'Recebimento', origem: 'Contas a Receber', valor_total: titulo.valor,
          forma_pagamento_pretendida: 'PIX', status: 'Pendente',
          titulos_vinculados: [{ titulo_id: titulo.id, tipo_titulo: 'ContaReceber', numero_titulo: titulo.numero_documento || titulo.descricao, cliente_fornecedor_nome: titulo.cliente, valor_titulo: titulo.valor }],
          data_ordem: new Date().toISOString()
        });
      }));
      return ordens;
    },
    onSuccess: async (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      setContasSelecionadas([]);
    }
  });

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      const titulo = await updateRLS('ContaReceber', id, {
        status: "Recebido", data_recebimento: dados.data_recebimento, valor_recebido: dados.valor_recebido,
        forma_recebimento: dados.forma_recebimento, juros: dados.juros, multa: dados.multa, desconto: dados.desconto, observacoes: dados.observacoes
      });
      const conta = contasList.find(c => c.id === id);
      if (conta?.cliente_id) {
        await createRLS('HistoricoCliente', {
          group_id: conta.group_id, empresa_id: conta.empresa_id, cliente_id: conta.cliente_id, cliente_nome: conta.cliente,
          modulo_origem: "Financeiro", referencia_id: id, referencia_tipo: "ContaReceber", tipo_evento: "Recebimento",
          titulo_evento: `Recebimento de R$ ${dados.valor_recebido.toFixed(2)}`,
          descricao_detalhada: `Título ${conta.descricao} recebido via ${dados.forma_recebimento}`,
          usuario_responsavel: authUser?.full_name || authUser?.email, usuario_responsavel_id: authUser?.id,
          data_evento: new Date().toISOString(), valor_relacionado: dados.valor_recebido, resolvido: true
        });
      }
      return titulo;
    },
    onSuccess: async (_data, vars) => {
      await base44.entities.AuditLog.create({
        acao: 'Edição', modulo: 'Financeiro', entidade: 'ContaReceber', registro_id: vars?.id,
        descricao: 'Baixa de título registrada', data_hora: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['ContaReceber'] });
      setDialogBaixaOpen(false); setContaAtual(null);
      toast({ title: "✅ Título baixado com sucesso!" });
    }
  });

  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      await Promise.all(contasSelecionadas.map(async (contaId) => {
        const conta = contasList.find(c => c.id === contaId);
        if (conta) {
          const valorTotal = (conta.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
          await baixarTituloMutation.mutateAsync({ id: contaId, dados: { ...dados, valor_recebido: valorTotal } });
        }
      }));
    },
    onSuccess: async () => {
      await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Baixa múltipla (${contasSelecionadas.length})`, data_hora: new Date().toISOString() });
      setContasSelecionadas([]); setDialogBaixaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) baixado(s)!` });
    }
  });

  const enviarWhatsAppMutation = useMutation({
    mutationFn: async (contaId) => { await updateRLS('ContaReceber', contaId, { data_envio_cobranca: new Date().toISOString() }); return { sucesso: true }; },
    onSuccess: () => toast({ title: "✅ WhatsApp enviado (simulação)!" })
  });

  const toggleSelecao = (contaId) => setContasSelecionadas(prev => prev.includes(contaId) ? prev.filter(id => id !== contaId) : [...prev, contaId]);

  const handleBaixar = (conta) => {
    if (!hasPermission('Financeiro', 'ContaReceber', 'baixar') && !hasPermission('Financeiro', 'ContaReceber', 'liquidar')) {
      toast({ title: '⛔ Sem permissão para baixar', variant: 'destructive' }); return;
    }
    setContaAtual(conta);
    setDadosBaixa({ data_recebimento: new Date().toISOString().split('T')[0], valor_recebido: conta.valor, forma_recebimento: "PIX", juros: 0, multa: 0, desconto: 0, observacoes: "" });
    setDialogBaixaOpen(true);
  };

  const handleBaixarMultipla = () => {
    if (!hasPermission('Financeiro', 'ContaReceber', 'baixar') && !hasPermission('Financeiro', 'ContaReceber', 'liquidar')) {
      toast({ title: '⛔ Sem permissão para baixa múltipla', variant: 'destructive' }); return;
    }
    if (contasSelecionadas.length === 0) { toast({ title: "⚠️ Selecione pelo menos um título", variant: "destructive" }); return; }
    setContaAtual(null);
    setDadosBaixa({ data_recebimento: new Date().toISOString().split('T')[0], valor_recebido: 0, forma_recebimento: "PIX", juros: 0, multa: 0, desconto: 0, observacoes: "" });
    setDialogBaixaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    else baixarMultiplaMutation.mutate(dadosBaixa);
  };

  return {
    gerarCobrancaDialogOpen, setGerarCobrancaDialogOpen, simularPagamentoDialogOpen, setSimularPagamentoDialogOpen,
    gerarLinkDialogOpen, setGerarLinkDialogOpen, contaParaCobranca, setContaParaCobranca, contaParaSimulacao, setContaParaSimulacao,
    contaParaLink, setContaParaLink, dialogBaixaOpen, setDialogBaixaOpen, contasSelecionadas, setContasSelecionadas,
    contaAtual, setContaAtual, dadosBaixa, setDadosBaixa,
    enviarParaCaixaMutation, baixarTituloMutation, baixarMultiplaMutation, enviarWhatsAppMutation,
    toggleSelecao, handleBaixar, handleBaixarMultipla, handleSubmitBaixa
  };
}