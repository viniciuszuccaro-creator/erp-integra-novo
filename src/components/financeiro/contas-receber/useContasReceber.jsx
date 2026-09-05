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
      // Regra-Mãe 5: validação dupla (RBAC + contexto multiempresa) na persistência, não só na UI
      if (!hasPermission('Financeiro', 'Caixa', 'criar') && !hasPermission('Financeiro', null, 'baixar')) {
        throw new Error('Sem permissão para enviar títulos ao Caixa');
      }
      if (!titulos?.length || !titulos.some(t => t.group_id)) {
        throw new Error('Contexto de grupo/empresa obrigatório para envio ao Caixa (Regra-Mãe 5a)');
      }
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
    onSuccess: async (ordens, titulos) => {
      await base44.entities.AuditLog.create({
        acao: 'Criação', modulo: 'Financeiro', entidade: 'CaixaOrdemLiquidacao',
        descricao: `${ordens.length} título(s) enviado(s) ao Caixa (Contas a Receber)`,
        data_hora: new Date().toISOString(),
        group_id: titulos?.[0]?.group_id, grupo_id: titulos?.[0]?.group_id, empresa_id: titulos?.[0]?.empresa_id,
        usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_novos: { ordens: ordens.length, titulos_ids: titulos?.map(t => t.id) }
      });
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      setContasSelecionadas([]);
    },
    onError: (err) => toast({ title: 'Erro ao enviar para o Caixa', description: err?.message, variant: 'destructive' })
  });

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      // Regra-Mãe 5: validação dupla (RBAC + contexto multiempresa) na persistência, não só na UI
      if (!hasPermission('Financeiro', 'ContaReceber', 'baixar') && !hasPermission('Financeiro', 'ContaReceber', 'liquidar')) {
        throw new Error('Sem permissão para baixar título');
      }
      const conta = contasList.find(c => c.id === id) || {};
      if (!conta.group_id || !conta.empresa_id) {
        throw new Error('Título sem contexto de grupo/empresa — baixa bloqueada (Regra-Mãe 5a)');
      }
      // Consistência: valor recebido sempre reflete valor + juros + multa - desconto (igual ao total exibido no diálogo)
      const valorRecebido = (conta.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
      const titulo = await updateRLS('ContaReceber', id, {
        status: "Recebido", data_recebimento: dados.data_recebimento, valor_recebido: valorRecebido,
        forma_recebimento: dados.forma_recebimento, juros: dados.juros, multa: dados.multa, desconto: dados.desconto, observacoes: dados.observacoes
      });
      if (conta.cliente_id) {
        await createRLS('HistoricoCliente', {
          group_id: conta.group_id, empresa_id: conta.empresa_id, cliente_id: conta.cliente_id, cliente_nome: conta.cliente,
          modulo_origem: "Financeiro", referencia_id: id, referencia_tipo: "ContaReceber", tipo_evento: "Recebimento",
          titulo_evento: `Recebimento de R$ ${valorRecebido.toFixed(2)}`,
          descricao_detalhada: `Título ${conta.descricao} recebido via ${dados.forma_recebimento}`,
          usuario_responsavel: authUser?.full_name || authUser?.email, usuario_responsavel_id: authUser?.id,
          data_evento: new Date().toISOString(), valor_relacionado: valorRecebido, resolvido: true
        });
      }
      return titulo;
    },
    onSuccess: async (_data, vars) => {
      const conta = contasList.find(c => c.id === vars?.id) || {};
      await base44.entities.AuditLog.create({
        acao: 'Baixa', modulo: 'Financeiro', entidade: 'ContaReceber', registro_id: vars?.id,
        descricao: 'Baixa de título registrada', data_hora: new Date().toISOString(),
        group_id: conta.group_id, grupo_id: conta.group_id, empresa_id: conta.empresa_id,
        usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_anteriores: { status: conta.status, valor: conta.valor, data_recebimento: conta.data_recebimento, valor_recebido: conta.valor_recebido },
        dados_novos: {
          status: 'Recebido', data_recebimento: vars?.dados?.data_recebimento, forma_recebimento: vars?.dados?.forma_recebimento,
          juros: vars?.dados?.juros, multa: vars?.dados?.multa, desconto: vars?.dados?.desconto,
          valor_recebido: (conta.valor || 0) + (vars?.dados?.juros || 0) + (vars?.dados?.multa || 0) - (vars?.dados?.desconto || 0)
        }
      });
      queryClient.invalidateQueries({ queryKey: ['ContaReceber'] });
      setDialogBaixaOpen(false); setContaAtual(null);
      toast({ title: "✅ Título baixado com sucesso!" });
    },
    onError: (err) => toast({ title: 'Erro ao baixar título', description: err?.message, variant: 'destructive' })
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
      const contasCtx = contasSelecionadas.map(cid => contasList.find(c => c.id === cid)).filter(Boolean);
      await base44.entities.AuditLog.create({
        acao: 'Baixa', modulo: 'Financeiro', entidade: 'ContaReceber',
        descricao: `Baixa múltipla (${contasSelecionadas.length} título(s))`, data_hora: new Date().toISOString(),
        group_id: contasCtx[0]?.group_id, grupo_id: contasCtx[0]?.group_id, empresa_id: contasCtx[0]?.empresa_id,
        usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_novos: { titulos_ids: [...contasSelecionadas], ...dadosBaixa }
      });
      setContasSelecionadas([]); setDialogBaixaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) baixado(s)!` });
    },
    onError: (err) => toast({ title: 'Erro na baixa múltipla', description: err?.message, variant: 'destructive' })
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