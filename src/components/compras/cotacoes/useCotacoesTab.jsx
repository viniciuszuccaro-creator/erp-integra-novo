import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast as sonnerToast } from "sonner";

const DEFAULT_FORM = {
  descricao: "",
  data_limite_resposta: "",
  itens: [{ produto_descricao: "", quantidade: 0, unidade: "UN", observacoes: "" }],
  fornecedores_selecionados: [],
  observacoes_gerais: "",
};

export default function useCotacoesTab({ cotacoes, setCotacoes }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comparativoModal, setComparativoModal] = useState(null);
  const [formCotacao, setFormCotacao] = useState(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { carimbarContexto, grupoAtual, empresaAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || null;
  const empresaId = empresaAtual?.id || null;

  const criarCotacaoMutation = useMutation({
    mutationFn: async (data) => {
      await new Promise((r) => setTimeout(r, 1000));
      const novaCotacao = {
        id: Date.now().toString(),
        numero_cotacao: `COT-${String(cotacoes.length + 1).padStart(3, "0")}`,
        descricao: data.descricao,
        data_criacao: new Date().toISOString().split("T")[0],
        data_limite: data.data_limite_resposta,
        status: "Aguardando Propostas",
        fornecedores_convidados: data.fornecedores_selecionados.length,
        propostas_recebidas: 0,
        itens: data.itens,
        propostas: [],
        ...(groupId ? { group_id: groupId } : {}),
        ...(empresaId ? { empresa_id: empresaId } : {}),
      };
      setCotacoes([novaCotacao, ...cotacoes]);
      try {
        const me = await base44.auth.me();
        await base44.entities.AuditLog.create({
          usuario: me?.full_name || me?.email || "Usuario", usuario_id: me?.id || null,
          acao: "Criação", modulo: "Compras", tipo_auditoria: "entidade", entidade: "Cotacao",
          descricao: `Cotação criada: ${novaCotacao.numero_cotacao}`,
          empresa_id: empresaId || null, group_id: groupId || null,
          dados_novos: novaCotacao, data_hora: new Date().toISOString(),
        });
      } catch (e) { console.error('[cotacoes] catch:', e); }
      return novaCotacao;
    },
    onSuccess: () => {
      setDialogOpen(false);
      setFormCotacao(DEFAULT_FORM);
      toast({ title: "✅ Cotação Criada!", description: "Cotação criada e enviada aos fornecedores" });
    },
  });

  const gerarOrdemCompraMutation = useMutation({
    mutationFn: async (proposta) => {
      const ordemCompra = carimbarContexto({
        fornecedor_id: proposta.fornecedor_id,
        fornecedor_nome: proposta.fornecedor_nome,
        data_solicitacao: new Date().toISOString().split("T")[0],
        valor_total: proposta.valor_total,
        status: "Aprovada",
        itens: proposta.itens.map((item) => ({ descricao: item.produto_descricao, quantidade_solicitada: item.quantidade || 1, valor_unitario: item.preco_unitario, valor_total: item.valor_total })),
        condicao_pagamento: proposta.forma_pagamento,
        prazo_entrega_acordado: proposta.prazo_entrega,
      }, "empresa_id");
      const result = await base44.entities.OrdemCompra.create(ordemCompra);
      try {
        const me = await base44.auth.me();
        await base44.entities.AuditLog.create({
          usuario: me?.full_name || me?.email || "Usuario", usuario_id: me?.id || null,
          acao: "Criação", modulo: "Compras", tipo_auditoria: "entidade", entidade: "OrdemCompra",
          descricao: `OC gerada de cotação para ${proposta.fornecedor_nome}`,
          empresa_id: empresaId || null, group_id: groupId || null,
          dados_novos: { fornecedor: proposta.fornecedor_nome, valor: proposta.valor_total }, data_hora: new Date().toISOString(),
        });
      } catch (e) { console.error('[cotacoes] catch:', e); }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordensCompra"] });
      setComparativoModal(null);
      toast({ title: "✅ Ordem de Compra Gerada!", description: "OC criada com sucesso a partir da cotação" });
    },
  });

  const resetForm = () => setFormCotacao(DEFAULT_FORM);

  const adicionarItem = () => setFormCotacao({ ...formCotacao, itens: [...formCotacao.itens, { produto_descricao: "", quantidade: 0, unidade: "UN", observacoes: "" }] });
  const removerItem = (index) => setFormCotacao({ ...formCotacao, itens: formCotacao.itens.filter((_, i) => i !== index) });
  const toggleFornecedor = (fornecedorId) => {
    const selecionados = formCotacao.fornecedores_selecionados.includes(fornecedorId)
      ? formCotacao.fornecedores_selecionados.filter((id) => id !== fornecedorId)
      : [...formCotacao.fornecedores_selecionados, fornecedorId];
    setFormCotacao({ ...formCotacao, fornecedores_selecionados: selecionados });
  };

  const handleSubmit = (e) => { e.preventDefault(); criarCotacaoMutation.mutate(formCotacao); };

  const getStatusColor = (status) => {
    const cores = {
      "Aguardando Propostas": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Em Análise": "bg-blue-100 text-blue-700 border-blue-300",
      "Aprovada": "bg-green-100 text-green-700 border-green-300",
      "OC Gerada": "bg-purple-100 text-purple-700 border-purple-300",
      "Cancelada": "bg-red-100 text-red-700 border-red-300",
    };
    return cores[status] || "bg-slate-100 text-slate-700";
  };

  return {
    dialogOpen, setDialogOpen, comparativoModal, setComparativoModal,
    formCotacao, setFormCotacao, criarCotacaoMutation, gerarOrdemCompraMutation,
    resetForm, adicionarItem, removerItem, toggleFornecedor, handleSubmit, getStatusColor,
  };
}