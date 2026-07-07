import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function useDetalhesFornecedor({ fornecedor }) {
  const [activeTab, setActiveTab] = useState("historico");
  const [showDocumentoDialog, setShowDocumentoDialog] = useState(false);
  const [documentoForm, setDocumentoForm] = useState({
    tipo: "Contrato Social",
    nome_arquivo: "",
    data_validade: "",
    observacao: ""
  });

  const queryClient = useQueryClient();
  const { canEdit } = usePermissions();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: ordensCompra = [] } = useRLSQuery('OrdemCompra', { fornecedor_id: fornecedor.id }, undefined, 100, { enabled: !!fornecedor.id });
  const { data: notasFiscais = [] } = useRLSQuery('NotaFiscal', { cliente_fornecedor_id: fornecedor.id, tipo: 'NF-e (Entrada)' }, undefined, 100, { enabled: !!fornecedor.id });
  const { data: contasPagar = [] } = useRLSQuery('ContaPagar', { fornecedor_id: fornecedor.id }, undefined, 100, { enabled: !!fornecedor.id });

  const updateFornecedorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success("Fornecedor atualizado com sucesso!");
    },
  });

  // Cálculos derivados
  const totalCompras = ordensCompra
    .filter(o => o.status !== 'Cancelada')
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const valorPendente = contasPagar
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const valorPago = contasPagar
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const prazoMedioEntrega = ordensCompra.length > 0
    ? ordensCompra
        .filter(o => o.lead_time_real > 0)
        .reduce((sum, o) => sum + o.lead_time_real, 0) / ordensCompra.filter(o => o.lead_time_real > 0).length
    : (fornecedor.prazo_entrega_padrao || 0);

  const handleAdicionarDocumento = () => {
    const novosDocumentos = [...(fornecedor.documentos || []), { ...documentoForm, data_upload: new Date().toISOString() }];
    updateFornecedorMutation.mutate({
      id: fornecedor.id,
      data: { ...fornecedor, documentos: novosDocumentos }
    });
    setShowDocumentoDialog(false);
    setDocumentoForm({ tipo: "Contrato Social", nome_arquivo: "", data_validade: "", observacao: "" });
  };

  const handleRemoverDocumento = (index) => {
    const documentosAtualizados = (fornecedor.documentos || []).filter((_, idx) => idx !== index);
    updateFornecedorMutation.mutate({
      id: fornecedor.id,
      data: { ...fornecedor, documentos: documentosAtualizados }
    });
  };

  return {
    activeTab, setActiveTab,
    showDocumentoDialog, setShowDocumentoDialog,
    documentoForm, setDocumentoForm,
    ordensCompra, notasFiscais, contasPagar,
    updateFornecedorMutation,
    totalCompras, valorPendente, valorPago, prazoMedioEntrega,
    handleAdicionarDocumento, handleRemoverDocumento,
    canEdit
  };
}