import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BadgeOrigemPedido from "./BadgeOrigemPedido";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Download } from "lucide-react";
import ERPDataTable from "@/components/ui/erp/DataTable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ImprimirPedido } from "@/components/lib/impressao";
import SearchInput from "../ui/SearchInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWindow } from "@/components/lib/useWindow";
import { ProtectedAction } from "@/components/ProtectedAction";
import CentralAprovacoesManager from "./CentralAprovacoesManager";
import usePedidosTab from "./pedidos-tab/usePedidosTab";
import usePedidosColumns, { buildMenuItems } from "./pedidos-tab/pedidosColumns";
import PedidosAprovacaoStats from "./pedidos-tab/PedidosAprovacaoStats";

/**
 * REFACTORED (Regra-Mãe): 505 → ~90 linhas
 * Lógica em usePedidosTab, colunas em pedidosColumns, stats em PedidosAprovacaoStats.
 * Multi-tenant: useRLS/useRLSQuery. RBAC: usePermissions + data-permission + ProtectedAction.
 */
export default function PedidosTab({ pedidos, clientes, isLoading, empresas, onCreatePedido, onEditPedido, empresaId = null }) {
  const {
    canEdit, canCreate, canApprove, canDelete,
    page, setPage, pageSize, setPageSize, sortField, setSortField, sortDirection, setSortDirection,
    pedidosBackend, updatePedido, pedidosList,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    toast, confirm, ConfirmDialog, queryClient,
    selectedPedidos, setSelectedPedidos, togglePedido, exportarPedidosCSV,
    deleteMutation, filteredPedidos,
    pedidosPendentesAprovacao, pedidosAprovados, pedidosNegados,
    allSelected, onToggleSelectAll,
    notifyWhatsAppPendentes, notifyEmailPendentes
  } = usePedidosTab({ pedidos, empresaId });

  const { openWindow } = useWindow();

  const columns = usePedidosColumns({
    empresas, canApprove, queryClient, toast, onEditPedido, openWindow, updatePedido, confirm, deleteMutation
  });

  const menuItems = (pedido) => buildMenuItems({ pedido, empresas, toast, confirm, onEditPedido, openWindow, deleteMutation });

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-hidden">
      <PedidosAprovacaoStats
        pendentes={pedidosPendentesAprovacao} aprovados={pedidosAprovados} negados={pedidosNegados}
        selectedPedidos={selectedPedidos}
        onGerenciarAprovacoes={() => openWindow(CentralAprovacoesManager, { windowMode: true }, { title: '🔐 Central de Aprovações', width: 1200, height: 700 })}
        onNotifyWhatsApp={() => notifyWhatsAppPendentes(selectedPedidos)}
        onNotifyEmail={() => notifyEmailPendentes(selectedPedidos)}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onCreatePedido} data-permission="Comercial.Pedido.criar">
          <Plus className="w-4 h-4 mr-2" />Novo Pedido
        </Button>
      </div>

      <ResizablePanelGroup direction="vertical" className="w-full h-full flex-1 min-h-0">
        <ResizablePanel defaultSize={25} minSize={15}>
          <Card className="border-0 shadow-md rounded-sm h-full">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por número, cliente, vendedor, tipo, origem, status..." className="flex-1" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Pronto para Faturar">Pronto para Faturar</SelectItem>
                    <SelectItem value="Faturado">Faturado</SelectItem>
                    <SelectItem value="Em Expedição">Em Expedição</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75} minSize={40}>
          <Card className="border-0 shadow-md rounded-sm h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b"><CardTitle>Lista de Pedidos ({filteredPedidos.length})</CardTitle></CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {selectedPedidos.length > 0 && (
                <Alert className="m-4 border-blue-300 bg-blue-50">
                  <AlertDescription className="flex items-center justify-between">
                    <div className="text-blue-900 font-semibold">{selectedPedidos.length} pedido(s) selecionado(s)</div>
                    <div className="flex gap-2">
                      <ProtectedAction module="Comercial" section="Pedido" action="exportar" mode="disable">
                        <Button variant="outline" onClick={() => { exportarPedidosCSV(filteredPedidos.filter(p => selectedPedidos.includes(p.id))); try { base44.entities.AuditLog.create({ acao: 'Exportação', modulo: 'Comercial', entidade: 'Pedido', descricao: `Exportados ${selectedPedidos.length} pedidos`, data_hora: new Date().toISOString() }); } catch { } }}>
                          <Download className="w-4 h-4 mr-2" /> Exportar CSV
                        </Button>
                      </ProtectedAction>
                      <Button variant="outline" onClick={() => notifyWhatsAppPendentes(selectedPedidos)}>WhatsApp</Button>
                      <Button variant="outline" onClick={() => notifyEmailPendentes(selectedPedidos)}>Email</Button>
                      <Button variant="ghost" onClick={() => setSelectedPedidos([])}>Limpar Seleção</Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              <ERPDataTable
                columns={columns} data={filteredPedidos} entityName="Pedido"
                sortField={sortField} sortDirection={sortDirection}
                onSortChange={(sf, sd) => { setSortField(sf); setSortDirection(sd); }}
                selectedIds={selectedPedidos} allSelected={allSelected}
                onToggleSelectAll={onToggleSelectAll} onToggleItem={(id) => togglePedido(id)}
                permission="Comercial.Pedido.visualizar" rowContextMenuItems={menuItems}
                page={page} pageSize={pageSize}
                totalItems={page * pageSize + (pedidosBackend.length < pageSize ? 0 : 1)}
                onPageChange={(p) => setPage(p)} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
              />
              {filteredPedidos.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
      <ConfirmDialog />
    </div>
  );
}