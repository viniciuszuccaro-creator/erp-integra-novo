import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { mockCancelarNFe } from "@/components/integracoes/MockIntegracoes";
import useRLS from "@/components/lib/useRLS";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

const EMPTY_FORM = {
  tipo: "NF-e (Saída)", cliente_fornecedor: "", numero: "", serie: "1",
  data_emissao: new Date().toISOString().split('T')[0],
  valor_produtos: 0, valor_total: 0, observacoes: ""
};

/**
 * Hook: estado e mutations para NotasFiscaisTab
 * P2: usa RLS (createInContext/updateInContext) para multi-tenant
 */
export default function useNotasFiscaisTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { create: createRLS, update: updateRLS, empresaAtual } = useRLS();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNF, setSelectedNF] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const createMutation = useMutation({
    mutationFn: (data) => createRLS('NotaFiscal', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['NotaFiscal'] });
      setIsDialogOpen(false); resetForm();
      toast({ title: "✅ Nota Fiscal criada!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRLS('NotaFiscal', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['NotaFiscal'] });
      setIsDialogOpen(false); setSelectedNF(null); resetForm();
      toast({ title: "✅ Nota Fiscal atualizada!" });
    },
  });

  const cancelarNFeMutation = useMutation({
    mutationFn: async ({ nfe, motivo }) => {
      const resultado = await mockCancelarNFe({ nfe_id: nfe.id, chave_acesso: nfe.chave_acesso, motivo });
      await base44.entities.NotaFiscal.update(nfe.id, {
        status: "Cancelada",
        cancelamento: { data_cancelamento: resultado.data_cancelamento, protocolo_cancelamento: resultado.protocolo_cancelamento, motivo, justificativa: motivo, usuario: "Sistema" },
        xml_cancelamento: resultado.xml_cancelamento_url,
        historico: [...(nfe.historico || []), { data_hora: new Date().toISOString(), evento: "NF-e Cancelada (Simulação)", usuario: "Sistema", detalhes: motivo }]
      });
      await base44.entities.LogFiscal.create({
        empresa_id: nfe.empresa_id || empresaAtual?.id,
        nfe_id: nfe.id, numero_nfe: nfe.numero, chave_acesso: nfe.chave_acesso,
        data_hora: new Date().toISOString(), acao: "cancelar", provedor: "Mock/Simulação",
        ambiente: nfe.ambiente, status: "sucesso", mensagem: resultado.mensagem_sefaz,
        retorno_recebido: resultado, usuario_nome: "Sistema"
      });
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
      toast({ title: "✅ NF-e Cancelada (Simulação)" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = sanitizeOnWrite(formData);
    if (selectedNF) { updateMutation.mutate({ id: selectedNF.id, data: payload }); }
    else { createMutation.mutate(payload); }
  };

  const handleEdit = (nota) => { setSelectedNF(nota); setFormData(nota); setIsDialogOpen(true); };
  const resetForm = () => { setFormData(EMPTY_FORM); };
  const handleCancelarNFe = (nfe) => {
    const motivo = prompt("Digite o motivo do cancelamento:");
    if (!motivo) return;
    if (motivo.length < 15) { toast({ title: "⚠️ Motivo muito curto", description: "O motivo deve ter pelo menos 15 caracteres", variant: "destructive" }); return; }
    cancelarNFeMutation.mutate({ nfe, motivo });
  };

  return {
    isDialogOpen, setIsDialogOpen,
    selectedNF, setSelectedNF,
    viewingDetails, setViewingDetails,
    formData, setFormData,
    createMutation, updateMutation, cancelarNFeMutation,
    handleSubmit, handleEdit, resetForm, handleCancelarNFe,
  };
}