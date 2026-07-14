import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Eye, Send, XCircle, Printer, FileText } from "lucide-react";
import { ProtectedAction } from "@/components/ProtectedAction";
import { ImprimirDANFESimplificado } from "@/components/lib/impressao";
import ERPDataTable from "@/components/ui/erp/DataTable";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useBackendPagination from "@/components/lib/useBackendPagination";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import useNotasFiscaisTab from "@/components/comercial/notas-fiscais-tab/useNotasFiscaisTab";
import NotasFiscaisKPIs from "@/components/comercial/notas-fiscais-tab/NotasFiscaisKPIs";
import NotasFiscaisToolbar from "@/components/comercial/notas-fiscais-tab/NotasFiscaisToolbar";
import NotasFiscaisFormDialog from "@/components/comercial/notas-fiscais-tab/NotasFiscaisFormDialog";
import NotasFiscaisDetailsDialog from "@/components/comercial/notas-fiscais-tab/NotasFiscaisDetailsDialog";

export default function NotasFiscaisTab({ notasFiscais, pedidos, clientes, onCreateNFe }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [tipoFilter, setTipoFilter] = useState("todas");
  const [selectedNotas, setSelectedNotas] = useState([]);
  const toggleNota = (id) => setSelectedNotas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const { page, setPage, pageSize, setPageSize } = useBackendPagination('NotaFiscal', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('NotaFiscal', 'data_emissao', 'desc');
  const { data: notasBackend = [] } = useRLSQuery('NotaFiscal', {}, `-${sortField}`, pageSize, { staleTime: 120000 });
  const notasList = Array.isArray(notasFiscais) && notasFiscais.length ? notasFiscais : notasBackend;
  const { empresasDoGrupo } = useContextoVisual();
  const { hasPermission } = usePermissions();

  const {
    isDialogOpen, setIsDialogOpen, selectedNF, viewingDetails, setViewingDetails,
    formData, setFormData, createMutation, updateMutation,
    handleSubmit, resetForm, handleCancelarNFe,
  } = useNotasFiscaisTab();

  const exportarNotasCSV = (lista) => {
    const headers = ['numero', 'serie', 'tipo', 'cliente_fornecedor', 'empresa_id', 'data_emissao', 'valor_total', 'status'];
    const csv = [headers.join(','), ...lista.map(n => headers.map(h => JSON.stringify(n[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `notas_fiscais_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotas = notasList.filter(n => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = n.cliente_fornecedor?.toLowerCase().includes(searchLower) ||
      n.numero?.toString().includes(searchLower) || n.serie?.toString().includes(searchLower) ||
      n.chave_acesso?.includes(searchLower) || n.protocolo_autorizacao?.includes(searchLower) ||
      n.tipo?.toLowerCase().includes(searchLower) || n.status?.toLowerCase().includes(searchLower) ||
      n.natureza_operacao?.toLowerCase().includes(searchLower) || n.cfop?.includes(searchLower) ||
      n.numero_pedido?.includes(searchLower) || n.cliente_cpf_cnpj?.includes(searchLower) ||
      n.observacoes?.toLowerCase().includes(searchLower);
    const matchStatus = statusFilter === "todas" || n.status === statusFilter;
    const matchTipo = tipoFilter === "todas" || n.tipo === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-auto p-4">
      <NotasFiscaisKPIs notasList={notasList} />
      <NotasFiscaisToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        tipoFilter={tipoFilter} setTipoFilter={setTipoFilter} onCreateNFe={onCreateNFe} />

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notas Fiscais Emitidas</CardTitle>
            <NotasFiscaisFormDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}
              selectedNF={selectedNF} formData={formData} setFormData={setFormData}
              handleSubmit={handleSubmit} resetForm={resetForm}
              createMutation={createMutation} updateMutation={updateMutation} />
          </div>
        </CardHeader>
        <CardContent>
          {selectedNotas.length > 0 && (
            <Alert className="mb-3 border-blue-300 bg-blue-50">
              <AlertDescription className="flex items-center justify-between">
                <div className="text-blue-900 font-semibold">{selectedNotas.length} NF selecionada(s)</div>
                <div className="flex gap-2">
                  <ProtectedAction module="Fiscal" section="NotaFiscal" action="exportar" mode="disable">
                    <Button variant="outline" onClick={() => exportarNotasCSV(filteredNotas.filter(n => selectedNotas.includes(n.id)))}>
                      <Download className="w-4 h-4 mr-2" /> Exportar CSV
                    </Button>
                  </ProtectedAction>
                  <Button variant="ghost" onClick={() => setSelectedNotas([])}>Limpar Seleção</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <ERPDataTable
            columns={[
              { key: 'numero', label: 'Número', render: (n) => <span className="font-medium">{n.numero}</span> },
              { key: 'serie', label: 'Série' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'cliente_fornecedor', label: 'Cliente/Fornecedor' },
              { key: 'data_emissao', label: 'Data Emissão', render: (n) => new Date(n.data_emissao).toLocaleDateString('pt-BR') },
              { key: 'valor_total', label: 'Valor Total', isNumeric: true, render: (n) => `R$ ${Number(n.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { key: 'status', label: 'Status', render: (n) => (
                <Badge className={n.status === 'Autorizada' ? 'bg-green-100 text-green-700' : n.status === 'Cancelada' ? 'bg-red-100 text-red-700' : n.status === 'Denegada' ? 'bg-gray-100 text-gray-700' : n.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}>{n.status}</Badge>
              ) },
              { key: 'actions', label: 'Ações', render: (nota) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewingDetails(nota)} title="Ver Detalhes" className="h-8 px-2">
                    <Eye className="w-3 h-3 mr-1" /> <span className="text-xs">Ver</span>
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => { const empresa = empresasDoGrupo?.find(e => e.id === nota.empresa_id); ImprimirDANFESimplificado({ nfe: nota, empresa }); }}
                    title="Imprimir DANFE" className="h-8 px-2 text-slate-600">
                    <Printer className="w-3 h-3 mr-1" /> <span className="text-xs">Imprimir</span>
                  </Button>
                  {nota.danfe_url && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(nota.danfe_url, '_blank')} title="Baixar DANFE" className="h-8 px-2 text-blue-600">
                      <Download className="w-3 h-3 mr-1" /> <span className="text-xs">PDF</span>
                    </Button>
                  )}
                  {nota.status === 'Pendente' && hasPermission('Fiscal', 'NotaFiscal', 'enviar') && (
                    <Button variant="ghost" size="sm" title="Enviar NF-e" className="h-8 px-2 text-green-600">
                      <Send className="w-3 h-3 mr-1" /> <span className="text-xs">Enviar</span>
                    </Button>
                  )}
                  {nota.status === 'Autorizada' && (
                    <ProtectedAction module="Fiscal" section="NotaFiscal" action="cancelar" mode="disable">
                      <Button variant="ghost" size="sm" onClick={() => handleCancelarNFe(nota)} className="h-8 px-2 text-red-600" title="Cancelar NF-e">
                        <XCircle className="w-3 h-3 mr-1" /> <span className="text-xs">Cancelar</span>
                      </Button>
                    </ProtectedAction>
                  )}
                </div>
              ) }
            ]}
            data={filteredNotas}
            entityName="NotaFiscal"
            sortField={sortField} sortDirection={sortDirection}
            onSortChange={(sf, sd) => { setSortField(sf); setSortDirection(sd); }}
            selectedIds={selectedNotas}
            allSelected={selectedNotas.length === filteredNotas.length && filteredNotas.length > 0}
            onToggleSelectAll={() => {
              const all = selectedNotas.length === filteredNotas.length && filteredNotas.length > 0;
              setSelectedNotas(all ? [] : filteredNotas.map(n => n.id));
            }}
            onToggleItem={(id) => toggleNota(id)}
            permission="Fiscal.NotaFiscal.visualizar"
            page={page} pageSize={pageSize}
            totalItems={page * pageSize + (notasBackend.length < pageSize ? 0 : 1)}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          />

          {filteredNotas.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma nota encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <NotasFiscaisDetailsDialog viewingDetails={viewingDetails} setViewingDetails={setViewingDetails} />
    </div>
  );
}