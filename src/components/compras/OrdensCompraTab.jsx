import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Edit, CheckCircle2, Send, Star, Eye, Download } from "lucide-react";
import OrdensCompraHeader from "./OrdensCompraHeader";
import OCSelecionadasBar from "./OCSelecionadasBar";
import OCTabela from "./OCTabela";
import OCPaginacao from "./OCPaginacao";
import { useToast } from "@/components/ui/use-toast";
import OrdemCompraForm from "./OrdemCompraForm";
import AvaliacaoFornecedorForm from "./AvaliacaoFornecedorForm";
import RecebimentoOCForm from "./RecebimentoOCForm";
import { useWindow } from "@/components/lib/useWindow";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePermissions from "@/components/lib/usePermissions";
import useEntityListSorted from "@/components/lib/useEntityListSorted";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast as sonnerToast } from "sonner";
import { ImprimirOrdemCompra } from "@/components/lib/ImprimirOrdemCompra";
import { useUser } from "@/components/lib/UserContext";
import useOrdensCompraActions from "./ordens-compra/useOrdensCompraActions";

/**
 * REFACTORED (Regra-Mãe): 659 → ~80 linhas
 * Mutations em useOrdensCompraActions, Dialog morto removido.
 */
export default function OrdensCompraTab({ ordensCompra, fornecedores, empresas = [], windowMode = false }) {
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('OrdemCompra', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('OrdemCompra', 'data_solicitacao', 'desc');
  const { data: ocBackend = [] } = useEntityListSorted('OrdemCompra', {}, { sortField, sortDirection, page, pageSize, limit: pageSize });
  const ocList = Array.isArray(ordensCompra) && ordensCompra.length ? ordensCompra : ocBackend;
  const { user: authUser } = useUser();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOC, setEditingOC] = useState(null);
  const { openWindow } = useWindow();
  const [selectedOCs, setSelectedOCs] = useState([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleOC = (id) => setSelectedOCs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllOCs = (checked, lista) => setSelectedOCs(checked ? lista.map(o => o.id) : []);
  const exportarOCsCSV = (lista) => {
    const headers = ['numero_oc','fornecedor_nome','empresa_id','data_solicitacao','valor_total','status','lead_time_real'];
    const csv = [headers.join(','), ...lista.map(o => headers.map(h => JSON.stringify(o[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ordens_compra_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const { createMutation, updateMutation, aprovarMutation, enviarFornecedorMutation, receberMutation, avaliarFornecedorMutation } = useOrdensCompraActions({ fornecedores, authUser });

  // Invalidação centralizada
  const invalidateAll = () => {
    queryClient.invalidateQueries(['ordensCompra']);
    queryClient.invalidateQueries(['fornecedores']);
    queryClient.invalidateQueries(['movimentacoes']);
    queryClient.invalidateQueries(['produtos']);
  };

  // Wrappers para invalidar após sucesso
  const createMutationW = { ...createMutation, mutateAsync: async (data) => { const r = await createMutation.mutateAsync(data); invalidateAll(); sonnerToast.success("✅ Ordem de Compra criada!"); return r; } };
  const updateMutationW = { ...updateMutation, mutateAsync: async ({ id, data }) => { const r = await updateMutation.mutateAsync({ id, data }); invalidateAll(); sonnerToast.success("✅ OC atualizada!"); return r; } };
  const aprovarMutationW = { ...aprovarMutation, mutate: (p) => { aprovarMutation.mutate(p); invalidateAll(); sonnerToast.success("✅ OC aprovada!"); } };
  const enviarFornecedorMutationW = { ...enviarFornecedorMutation, mutate: (p) => { enviarFornecedorMutation.mutate(p); invalidateAll(); sonnerToast.success("✅ OC Enviada ao Fornecedor!"); } };
  const receberMutationW = { ...receberMutation, mutateAsync: async (p) => { const r = await receberMutation.mutateAsync(p); invalidateAll(); sonnerToast.success("✅ Recebimento registrado!"); return r; } };
  const avaliarFornecedorMutationW = { ...avaliarFornecedorMutation, mutateAsync: async (p) => { const r = await avaliarFornecedorMutation.mutateAsync(p); invalidateAll(); sonnerToast.success("⭐ Avaliação registrada!"); return r; } };

  const handleReceberClick = (oc) => {
    if (!hasPermission('Compras','OrdemCompra','receber')) { toast({ title: '⛔ Sem permissão para receber', variant: 'destructive' }); return; }
    openWindow(RecebimentoOCForm, { ordemCompra: oc, windowMode: true, onSubmit: async (dados) => { try { await receberMutationW.mutateAsync({ id: oc.id, oc, dados }); } catch { sonnerToast.error("Erro ao registrar recebimento"); } } }, { title: `📦 Receber: ${oc.numero_oc}`, width: 800, height: 600 });
  };

  const filteredOCs = ocList.filter(oc => {
    const s = searchTerm.toLowerCase();
    return oc.numero_oc?.toLowerCase().includes(s) || oc.fornecedor_nome?.toLowerCase().includes(s) || oc.status?.toLowerCase().includes(s) || oc.solicitante?.toLowerCase().includes(s) || oc.aprovador?.toLowerCase().includes(s) || oc.centro_custo?.toLowerCase().includes(s) || oc.condicao_pagamento?.toLowerCase().includes(s) || oc.forma_pagamento?.toLowerCase().includes(s) || oc.nota_fiscal_entrada?.includes(s) || oc.observacoes?.toLowerCase().includes(s);
  });

  const statusColors = { 'Solicitada': 'bg-blue-100 text-blue-700', 'Aprovada': 'bg-purple-100 text-purple-700', 'Enviada ao Fornecedor': 'bg-indigo-100 text-indigo-700', 'Em Processo': 'bg-yellow-100 text-yellow-700', 'Parcialmente Recebida': 'bg-cyan-100 text-cyan-700', 'Recebida': 'bg-green-100 text-green-700', 'Cancelada': 'bg-gray-100 text-gray-700' };

  const content = (
    <div className="space-y-1.5">
      <OrdensCompraHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} onNovaOC={() => {
        if (!hasPermission('Compras','OrdemCompra','criar')) { toast({ title: '⛔ Sem permissão para criar', variant: 'destructive' }); return; }
        openWindow(OrdemCompraForm, { windowMode: true, onSubmit: async (data) => { try { await createMutationW.mutateAsync(data); } catch { sonnerToast.error("Erro ao criar OC"); } } }, { title: '🛒 Nova Ordem de Compra', width: 1100, height: 700 });
      }} />
      <Card className="border-0 shadow-sm">
        <OCSelecionadasBar selectedCount={selectedOCs.length} onExportCSV={() => exportarOCsCSV(filteredOCs.filter(o => selectedOCs.includes(o.id)))} onClear={() => setSelectedOCs([])} />
        <CardContent className="p-0">
          <OCTabela ocs={filteredOCs} selectedOCs={selectedOCs} onToggleOC={toggleOC} onSort={(field) => { setSortField(field); setSortDirection(prev => (sortField===field && prev==='asc')?'desc':'asc'); }} statusColors={statusColors}
            onImprimir={(oc) => { const empresa = empresas?.find(e => e.id === oc.empresa_id); const fornecedor = fornecedores?.find(f => f.id === oc.fornecedor_id); ImprimirOrdemCompra({ oc, empresa, fornecedor }); }}
            onVer={(oc) => openWindow(OrdemCompraForm, { ordemCompra: oc, windowMode: true, onSubmit: async (data) => { try { await updateMutationW.mutateAsync({ id: oc.id, data }); } catch { sonnerToast.error('Erro ao atualizar OC'); } } }, { title: `👁️ Ver: ${oc.numero_oc}`, width: 1100, height: 700 })}
            onEditar={(oc) => { setEditingOC(oc); openWindow(OrdemCompraForm, { ordemCompra: oc, windowMode: true, onSubmit: async (data) => { try { await updateMutationW.mutateAsync({ id: oc.id, data }); } catch { sonnerToast.error('Erro ao atualizar OC'); } } }, { title: `✏️ Editar: ${oc.numero_oc}`, width: 1100, height: 700 }); }}
            onAprovar={(oc) => { if (!hasPermission('Compras','OrdemCompra','aprovar')) { toast({ title: '⛔ Sem permissão para aprovar', variant: 'destructive' }); return; } aprovarMutationW.mutate({ id: oc.id, oc }); }}
            onEnviar={(oc) => { if (!hasPermission('Compras','OrdemCompra','enviar_fornecedor')) { toast({ title: '⛔ Sem permissão para enviar', variant: 'destructive' }); return; } enviarFornecedorMutationW.mutate({ id: oc.id, oc }); }}
            onReceber={handleReceberClick}
            onAvaliar={(oc) => { if (!hasPermission('Compras','OrdemCompra','avaliar_fornecedor')) { toast({ title: '⛔ Sem permissão para avaliar', variant: 'destructive' }); return; } openWindow(AvaliacaoFornecedorForm, { ordemCompra: oc, windowMode: true, onSubmit: async (avaliacao) => { try { await avaliarFornecedorMutationW.mutateAsync({ oc, avaliacao }); } catch { sonnerToast.error('Erro ao avaliar fornecedor'); } } }, { title: `⭐ Avaliar: ${oc.fornecedor_nome}`, width: 800, height: 650 }); }}
          />
          <OCPaginacao page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} hasNext={ocBackend.length >= pageSize} />
          {filteredOCs.length === 0 && <div className="text-center py-8"><p className="text-sm text-slate-500">Nenhuma ordem de compra encontrada</p></div>}
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto p-1.5">{content}</div>;
  return content;
}