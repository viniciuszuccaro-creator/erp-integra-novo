import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

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

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('OrdemCompra', { fornecedor_id: fornecedor.id }),
    enabled: !!fornecedor.id && !!contextoKey && contextoKey !== 'sem-grupo-sem-empresa'
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notas-entrada-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('NotaFiscal', {
      cliente_fornecedor_id: fornecedor.id,
      tipo: 'NF-e (Entrada)'
    }),
    enabled: !!fornecedor.id && !!contextoKey && contextoKey !== 'sem-grupo-sem-empresa'
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('ContaPagar', { fornecedor_id: fornecedor.id }),
    enabled: !!fornecedor.id && !!contextoKey && contextoKey !== 'sem-grupo-sem-empresa'
  });

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