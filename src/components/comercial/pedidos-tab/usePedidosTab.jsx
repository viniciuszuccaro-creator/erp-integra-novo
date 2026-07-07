import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import useRLS from "@/components/lib/useRLS";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

/**
 * Hook extraído de PedidosTab.jsx
 * Estado, filtros, seleção, mutations, estatísticas de aprovação.
 */
export default function usePedidosTab({ pedidos, empresaId }) {
  const { canEdit, canCreate, canApprove, canDelete } = usePermissions();
  const { deleteInContext } = useContextoVisual();
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('Pedido', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('Pedido', 'data_pedido', 'desc');
  const { data: pedidosBackend = [] } = useRLSQuery('Pedido', {}, `-${sortField}`, pageSize, { staleTime: 120000 });
  const { update: updatePedido } = useRLS();
  const pedidosList = Array.isArray(pedidos) && pedidos.length ? pedidos : pedidosBackend;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [selectedPedidos, setSelectedPedidos] = useState([]);

  const togglePedido = (id) => setSelectedPedidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllPedidos = (checked, lista) => setSelectedPedidos(checked ? lista.map(p => p.id) : []);

  const exportarPedidosCSV = (lista) => {
    const headers = ['numero_pedido', 'cliente_nome', 'empresa_id', 'data_pedido', 'valor_total', 'status', 'status_aprovacao'];
    const csv = [headers.join(','), ...lista.map(p => headers.map(h => JSON.stringify(p[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInContext('Pedido', id),
    onSuccess: async (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({ title: "✅ Pedido excluído!" });
    },
  });

  const filteredPedidos = pedidosList.filter(p => {
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      p.numero_pedido?.toLowerCase().includes(searchLower) ||
      p.cliente_nome?.toLowerCase().includes(searchLower) ||
      p.vendedor?.toLowerCase().includes(searchLower) ||
      p.tipo_pedido?.toLowerCase().includes(searchLower) ||
      p.origem_pedido?.toLowerCase().includes(searchLower) ||
      p.status?.toLowerCase().includes(searchLower) ||
      p.observacoes_publicas?.toLowerCase().includes(searchLower) ||
      p.observacoes_internas?.toLowerCase().includes(searchLower) ||
      p.indicador_nome?.toLowerCase().includes(searchLower) ||
      p.obra_destino_nome?.toLowerCase().includes(searchLower);
    const matchEmpresa = !empresaId || p.empresa_id === empresaId;
    return matchStatus && matchSearch && matchEmpresa;
  });

  const pedidosPendentesAprovacao = pedidosList.filter(p => p.status_aprovacao === "pendente");
  const pedidosAprovados = pedidosList.filter(p => p.status_aprovacao === "aprovado");
  const pedidosNegados = pedidosList.filter(p => p.status_aprovacao === "negado");

  const allSelected = selectedPedidos.length === filteredPedidos.length && filteredPedidos.length > 0;
  const onToggleSelectAll = () => {
    if (!allSelected) setSelectedPedidos(filteredPedidos.map(p => p.id));
    else setSelectedPedidos([]);
  };

  const notifyWhatsAppPendentes = async (ids) => {
    const alvo = (Array.isArray(ids) && ids.length ? ids : pedidosPendentesAprovacao.map(p => p.id)).slice(0, 50);
    if (!alvo.length) { toast({ title: 'Sem pendentes selecionados' }); return; }
    try {
      await base44.functions.invoke('whatsappSend', { template: 'aprovacao_pendente', pedido_ids: alvo });
      toast({ title: '📲 WhatsApp enviado', description: `${alvo.length} pedido(s)` });
      try { await base44.entities.AuditLog.create({ acao: 'Notificação', modulo: 'Comercial', entidade: 'Pedido', descricao: `WhatsApp aprovação pendente (${alvo.length})`, data_hora: new Date().toISOString() }); } catch { }
    } catch { toast({ title: 'Falha ao notificar WhatsApp', variant: 'destructive' }); }
  };

  const notifyEmailPendentes = async (ids) => {
    const alvo = (Array.isArray(ids) && ids.length ? ids : pedidosPendentesAprovacao.map(p => p.id)).slice(0, 50);
    if (!alvo.length) { toast({ title: 'Sem pendentes selecionados' }); return; }
    try {
      await base44.functions.invoke('sendEmailProvider', { tipo: 'aprovacao_pendente', pedido_ids: alvo });
      toast({ title: '✉️ E-mails enviados', description: `${alvo.length} pedido(s)` });
      try { await base44.entities.AuditLog.create({ acao: 'Notificação', modulo: 'Comercial', entidade: 'Pedido', descricao: `Email aprovação pendente (${alvo.length})`, data_hora: new Date().toISOString() }); } catch { }
    } catch { toast({ title: 'Falha ao notificar por email', variant: 'destructive' }); }
  };

  return {
    canEdit, canCreate, canApprove, canDelete,
    page, setPage, pageSize, setPageSize, sortField, setSortField, sortDirection, setSortDirection,
    pedidosBackend, updatePedido, pedidosList,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    toast, confirm, ConfirmDialog, queryClient,
    selectedPedidos, setSelectedPedidos, togglePedido, toggleAllPedidos, exportarPedidosCSV,
    deleteMutation, filteredPedidos,
    pedidosPendentesAprovacao, pedidosAprovados, pedidosNegados,
    allSelected, onToggleSelectAll,
    notifyWhatsAppPendentes, notifyEmailPendentes
  };
}