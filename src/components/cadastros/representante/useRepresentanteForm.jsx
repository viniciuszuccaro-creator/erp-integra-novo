import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

/**
 * Hook extraído de RepresentanteFormCompleto.jsx
 * Encapsula estado, queries, mutations e handlers do formulário de representante.
 */
export default function useRepresentanteForm({ representante: representanteProp, item, data, onSuccess, onClose, onSave, onSubmit }) {
  const representante = representanteProp || item || data || null;
  const onCloseNorm = onClose || onSave || onSubmit;
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, filterInContext, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Representante") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Representante") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Representante") || canDelete("Cadastros", null);

  const [formData, setFormData] = useState(representante || {
    tipo_pessoa: "Pessoa Física", tipo_representante: "Representante Comercial",
    nome: "", razao_social: "", cpf: "", cnpj: "", crea_cau: "", registro_profissional: "",
    email: "", telefone: "", whatsapp: "",
    endereco: { cep: "", logradouro: "", numero: "", bairro: "", cidade: "", estado: "" },
    regioes_atendimento: [], tipo_comissao: "Percentual", percentual_comissao: 0,
    valor_fixo_comissao: 0, percentual_cashback: 0, limite_mensal_comissao: 0,
    forma_pagamento_comissao: "PIX",
    dados_bancarios: { banco: "", agencia: "", conta: "", tipo_conta: "Corrente", pix_chave: "", tipo_pix: "CPF" },
    data_inicio_contrato: "", data_fim_contrato: "", status: "Ativo", observacoes: "",
    empresa_id: empresaAtual?.id, group_id: groupId
  });

  const { data: regioes = [] } = useRLSQuery('RegiaoAtendimento', {}, 'nome', 200, { enabled: contextoValido });
  const { data: clientesIndicados = [] } = useRLSQuery('Cliente', { indicador_id: representante?.id }, 'nome', 200, { enabled: !!representante?.id && contextoValido });
  const { data: pedidosIndicados = [] } = useQuery({
    queryKey: ['pedidos-indicados', representante?.id, contextKey],
    queryFn: () => filterInContext('Pedido', { indicador_id: representante.id }, '-created_date', 200),
    enabled: !!representante?.id && contextoValido
  });

  useEffect(() => {
    if (representante) {
      setFormData({ ...representante, endereco: representante.endereco || {}, dados_bancarios: representante.dados_bancarios || {}, regioes_atendimento: representante.regioes_atendimento || [] });
    }
  }, [representante?.id]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido) throw new Error("Selecione um grupo ou empresa antes de salvar o representante.");
      const payload = { ...data, ...(empresaAtual?.id && !data.empresa_id ? { empresa_id: empresaAtual.id } : {}), ...(groupId && !data.group_id ? { group_id: groupId } : {}) };
      if (representante?.id) { if (!podeEditar) throw new Error("Seu perfil nao permite editar representantes."); return updateInContext('Representante', representante.id, payload); }
      if (!podeCriar) throw new Error("Seu perfil nao permite criar representantes.");
      return createInContext('Representante', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes'] });
      toast({ title: `✅ Representante ${representante?.id ? 'atualizado' : 'criado'} com sucesso!` });
      if (onSuccess) onSuccess(); if (onCloseNorm) onCloseNorm();
    },
    onError: (error) => { toast({ title: "❌ Erro ao salvar", description: error.message, variant: "destructive" }); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => { if (!podeExcluir) throw new Error("Seu perfil nao permite excluir representantes."); return deleteInContext('Representante', id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['representantes'] }); toast({ title: "✅ Representante excluído!" }); if (onSuccess) onSuccess(); if (onCloseNorm) onCloseNorm(); }
  });

  const handleSave = () => saveMutation.mutate(formData);
  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();
  const handleExcluir = async () => {
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Excluir "${formData.nome}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (ok) deleteMutation.mutate(representante.id);
  };
  const handleAlternarStatus = () => setFormData({ ...formData, status: formData.status === 'Ativo' ? 'Inativo' : 'Ativo' });

  const handleDadosCNPJ = (dados) => {
    setFormData(prev => ({ ...prev, nome: dados.razao_social || prev.nome, razao_social: dados.razao_social || "", endereco: { ...prev.endereco, cep: dados.endereco_completo?.cep || prev.endereco.cep, logradouro: dados.endereco_completo?.logradouro || prev.endereco.logradouro, numero: dados.endereco_completo?.numero || prev.endereco.numero, bairro: dados.endereco_completo?.bairro || prev.endereco.bairro, cidade: dados.endereco_completo?.cidade || prev.endereco.cidade, estado: dados.endereco_completo?.uf || prev.endereco.estado } }));
    toast({ title: "✅ Dados da Receita Federal preenchidos!" });
  };
  const handleDadosCEP = (dados) => {
    setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, logradouro: dados.logradouro || "", bairro: dados.bairro || "", cidade: dados.cidade || "", estado: dados.uf || "" } }));
    toast({ title: "✅ Endereço preenchido!" });
  };

  const totalVendas = (pedidosIndicados || []).reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const totalComissao = (pedidosIndicados || []).reduce((sum, p) => sum + ((p.valor_total || 0) * (formData.percentual_comissao || 0) / 100), 0);
  const quantidadePedidos = (pedidosIndicados || []).length;
  const totais = representante?.id ? { totalVendas, totalComissao, quantidadePedidos } : { totalVendas: 0, totalComissao: 0, quantidadePedidos: 0 };

  return {
    representante, formData, setFormData, activeTab, setActiveTab, contextoValido, contextKey,
    podeCriar, podeEditar, podeExcluir, groupId, regioes, clientesIndicados, totais,
    saveMutation, deleteMutation, handleSave, handleExcluir, handleAlternarStatus,
    handleDadosCNPJ, handleDadosCEP, ConfirmExcluirDialog, onCloseNorm
  };
}