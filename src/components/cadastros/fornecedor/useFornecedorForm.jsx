import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import { useConfirm } from "@/components/ui/confirm-dialog";

/**
 * Hook extraído de CadastroFornecedorCompleto.jsx
 * Estado, mutations e handlers (CNPJ/CEP/RNTRC, status, exclusão).
 */
export default function useFornecedorForm({ fornecedor: fornecedorProp, item, data, onClose, onSuccess, onSubmit, onSave }) {
  const fornecedor = fornecedorProp || item || data || null;
  const onCloseNorm = onClose || onSave || onSubmit;
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId);
  const podeCriar = canCreate("Cadastros", "Fornecedor") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Fornecedor") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Fornecedor") || canDelete("Cadastros", null);

  const [formData, setFormData] = useState(fornecedor || {
    nome: "", razao_social: "", nome_fantasia: "", cnpj: "", inscricao_estadual: "", rntrc: "",
    email: "", telefone: "", whatsapp: "", contato_responsavel: "", endereco: "", cidade: "", estado: "", cep: "",
    tipo_fornecedor: "Matéria-Prima", categoria: "Matéria Prima", prazo_entrega_padrao: 0,
    status_fornecedor: "Em Análise", status: "Ativo", avaliacoes: [], nota_media: 0,
    empresa_id: empresaAtual?.id, empresa_dona_id: empresaAtual?.id, group_id: groupId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido) throw new Error("Selecione um grupo ou empresa antes de salvar o fornecedor.");
      const payload = { ...data, ...(empresaAtual?.id && !data.empresa_id ? { empresa_id: empresaAtual.id } : {}), ...(empresaAtual?.id && !data.empresa_dona_id ? { empresa_dona_id: data.empresa_id || empresaAtual.id } : {}), ...(groupId && !data.group_id ? { group_id: groupId } : {}) };
      // TRAVA GLOBAL: verifica unicidade de CNPJ/nome antes de salvar (Regra-Mãe §5c)
      const erroUnicidade = await checkGlobalUniqueness('Fornecedor', payload, {
        groupId, empresaId: empresaAtual?.id, currentId: fornecedor?.id, isEdit: !!fornecedor?.id,
      });
      if (erroUnicidade) throw new Error(erroUnicidade);
      if (fornecedor?.id) { if (!podeEditar) throw new Error("Seu perfil nao permite editar fornecedores."); return updateInContext('Fornecedor', fornecedor.id, payload, 'empresa_dona_id'); }
      if (!podeCriar) throw new Error("Seu perfil nao permite criar fornecedores.");
      return createInContext('Fornecedor', payload, 'empresa_dona_id');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast({ title: `✅ Fornecedor ${fornecedor?.id ? 'atualizado' : 'criado'} com sucesso!` });
      if (onSuccess) onSuccess(); if (onSubmit) onSubmit(formData); if (onCloseNorm) onCloseNorm();
    },
    onError: (error) => { toast({ title: "❌ Erro ao salvar fornecedor", description: error.message, variant: "destructive" }); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { if (!podeExcluir) throw new Error("Seu perfil nao permite excluir fornecedores."); return deleteInContext('Fornecedor', id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); toast({ title: "✅ Fornecedor excluído com sucesso!" }); if (onSuccess) onSuccess(); if (onCloseNorm) onCloseNorm(); },
    onError: (error) => { toast({ title: "❌ Erro ao excluir fornecedor", description: error.message, variant: "destructive" }); }
  });

  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();
  const handleExcluir = async () => {
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir o fornecedor "${formData.nome}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    deleteMutation.mutate(fornecedor.id);
  };

  const handleAlternarStatus = () => setFormData({ ...formData, status: formData.status === 'Ativo' ? 'Inativo' : 'Ativo' });
  const handleSave = () => saveMutation.mutate(formData);

  const handleDadosCNPJ = (dados) => {
    setFormData({
      ...formData, nome: dados.razao_social || formData.nome, razao_social: dados.razao_social || "",
      nome_fantasia: dados.nome_fantasia || "", inscricao_estadual: dados.inscricao_estadual || formData.inscricao_estadual,
      cnae_principal: dados.cnae_principal || formData.cnae_principal, ramo_atividade: dados.cnae_principal || formData.ramo_atividade,
      status_fiscal_receita: dados.situacao_cadastral || "Não Verificado",
      endereco: dados.endereco_completo?.logradouro ? `${dados.endereco_completo.logradouro}, ${dados.endereco_completo.numero || 'S/N'}${dados.endereco_completo.complemento ? ', ' + dados.endereco_completo.complemento : ''}, ${dados.endereco_completo.bairro || ''}` : formData.endereco,
      cidade: dados.endereco_completo?.cidade || formData.cidade, estado: dados.endereco_completo?.uf || formData.estado,
      cep: dados.endereco_completo?.cep || formData.cep, email: dados.email || formData.email, telefone: dados.telefone || formData.telefone
    });
    toast({ title: "✅ Dados REAIS da Receita Federal preenchidos!", description: `${dados.razao_social} - ${dados.situacao_cadastral}${dados.inscricao_estadual ? ' - IE: ' + dados.inscricao_estadual : ''}` });
  };

  const handleDadosCEP = (dados) => {
    setFormData({ ...formData, endereco: dados.logradouro ? `${dados.logradouro}` : formData.endereco, cidade: dados.cidade || formData.cidade, estado: dados.uf || formData.estado });
    toast({ title: "✅ Endereço preenchido automaticamente!" });
  };

  const handleDadosRNTRC = (dados) => {
    if (dados.valido) toast({ title: "✅ RNTRC Válido", description: `Situação: ${dados.situacao} - ${dados.tipo_registro}` });
    else toast({ title: "⚠️ RNTRC com restrições", description: dados.situacao, variant: "destructive" });
  };

  useEffect(() => { if (fornecedor) setFormData({ ...fornecedor, avaliacoes: fornecedor.avaliacoes || [] }); }, [fornecedor?.id]);

  return {
    fornecedor, formData, setFormData, activeTab, setActiveTab, contextoValido, podeCriar, podeEditar, podeExcluir,
    saveMutation, deleteMutation, handleExcluir, handleAlternarStatus, handleSave, handleDadosCNPJ, handleDadosCEP, handleDadosRNTRC, ConfirmExcluirDialog
  };
}