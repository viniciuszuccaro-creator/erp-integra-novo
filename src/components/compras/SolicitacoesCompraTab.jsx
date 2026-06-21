import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, CheckCircle2, XCircle, ShoppingCart, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SolicitacaoCompraForm from "./SolicitacaoCompraForm";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { toast as sonnerToast } from "sonner";
import ERPDataTable from "@/components/ui/erp/DataTable";
import useEntityListSorted from "@/components/lib/useEntityListSorted";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePersistedSort from "@/components/lib/usePersistedSort";

export default function SolicitacoesCompraTab({ solicitacoes, windowMode = false }) {
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('SolicitacaoCompra', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('SolicitacaoCompra', 'data_solicitacao', 'desc');
  const { data: solBackend = [] } = useEntityListSorted('SolicitacaoCompra', {}, { sortField, sortDirection, page, pageSize, limit: pageSize });
  const solList = Array.isArray(solicitacoes) && solicitacoes.length ? solicitacoes : solBackend;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const [selectedSolicitacoes, setSelectedSolicitacoes] = useState([]);
  const toggleSolicitacao = (id) => setSelectedSolicitacoes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const exportarSolicitacoesCSV = (lista) => {
    const headers = ['numero_solicitacao','produto_descricao','quantidade_solicitada','unidade_medida','solicitante','data_solicitacao','prioridade','status'];
    const csv = [headers.join(','), ...lista.map(s => headers.map(h => JSON.stringify(s[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitacoes_compra_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [formData, setFormData] = useState({
    numero_solicitacao: `SC-${Date.now()}`,
    data_solicitacao: new Date().toISOString().split('T')[0],
    solicitante: "", setor: "", produto_id: "", produto_descricao: "",
    quantidade_solicitada: 1, unidade_medida: "UN", justificativa: "",
    prioridade: "Media", data_necessidade: "", status: "Pendente", observacoes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, createInContext, updateInContext } = useContextoVisual();

  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: () => base44.entities.Produto.list() });
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });

  const createMutation = useMutation({
    mutationFn: (data) => createInContext('SolicitacaoCompra', {
      ...data, empresa_id: empresaAtual?.id, group_id: empresaAtual?.grupo_id,
      solicitante: user?.full_name, solicitante_id: user?.id
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] }); handleCloseDialog(); toast({ title: "Solicitacao criada!" }); },
  });

  const aprovarMutation = useMutation({
    mutationFn: ({ id }) => updateInContext('SolicitacaoCompra', id, {
      status: "Aprovada", aprovador: user?.full_name, data_aprovacao: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] }); toast({ title: "Solicitacao aprovada!" }); },
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ id, motivo }) => updateInContext('SolicitacaoCompra', id, {
      status: "Rejeitada", aprovador: user?.full_name,
      data_aprovacao: new Date().toISOString().split('T')[0], observacoes: motivo
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] }); toast({ title: "Solicitacao rejeitada" }); },
  });

  const gerarOCMutation = useMutation({
    mutationFn: async (solicitacao) => {
      const oc = await createInContext('OrdemCompra', {
        numero_oc: `OC-${Date.now()}`, fornecedor_nome: "A definir",
        solicitacao_compra_id: solicitacao.id, data_solicitacao: new Date().toISOString().split('T')[0],
        valor_total: 0, status: "Solicitada",
        itens: [{ produto_id: solicitacao.produto_id, descricao: solicitacao.produto_descricao,
          quantidade_solicitada: solicitacao.quantidade_solicitada, unidade: solicitacao.unidade_medida,
          valor_unitario: 0, valor_total: 0 }],
        empresa_id: empresaAtual?.id, group_id: empresaAtual?.grupo_id
      });
      await updateInContext('SolicitacaoCompra', solicitacao.id, { status: "Compra Gerada", ordem_compra_id: oc.id });
      return oc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      queryClient.invalidateQueries({ queryKey: ['ordensCompra'] });
      toast({ title: "OC gerada!" });
    },
  });

  const sugerirComprasIA = useMutation({
    mutationFn: async () => {
      throw new Error("IA indisponivel: creditos de integracao esgotados ate 07/07/2026");
    },
    onError: (error) => {
      toast({ title: "IA indisponivel", description: error.message, variant: "destructive" });
    }
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditando(null);
    setFormData({
      numero_solicitacao: `SC-${Date.now()}`,
      data_solicitacao: new Date().toISOString().split('T')[0],
      solicitante: "", setor: "", produto_id: "", produto_descricao: "",
      quantidade_solicitada: 1, unidade_medida: "UN", justificativa: "",
      prioridade: "Media", data_necessidade: "", status: "Pendente", observacoes: ""
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); createMutation.mutate(formData); };
  const handleAprovar = (s) => { if (confirm(`Aprovar solicitacao de ${s.produto_descricao}?`)) aprovarMutation.mutate({ id: s.id }); };
  const handleRejeitar = (s) => { const m = prompt("Motivo da rejeicao:"); if (m) rejeitarMutation.mutate({ id: s.id, motivo: m }); };
  const handleGerarOC = (s) => { if (confirm(`Gerar OC para ${s.produto_descricao}?`)) gerarOCMutation.mutate(s); };

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700', 'Em Analise': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-green-100 text-green-700', 'Rejeitada': 'bg-red-100 text-red-700',
    'Compra Gerada': 'bg-purple-100 text-purple-700', 'Finalizada': 'bg-gray-100 text-gray-700'
  };

  const content = (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Solicitações de Compra</h2>
        <div className="flex gap-1">
          <Button onClick={() => sugerirComprasIA.mutate()} disabled={sugerirComprasIA.isPending}
            variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
            <span className="text-xs">🤖 IA</span>
          </Button>
          {hasPermission('Compras','SolicitacaoCompra','criar') && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
              data-permission="Compras.SolicitacaoCompra.criar" data-sensitive="true"
              onClick={() => openWindow(SolicitacaoCompraForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  try { await createMutation.mutateAsync(data); sonnerToast.success("Solicitacao criada!"); }
                  catch { sonnerToast.error("Erro ao criar solicitacao"); }
                }
              }, { title: 'Nova Solicitacao de Compra', width: 900, height: 650 })}>
              <Plus className="w-3 h-3 mr-1" /> Nova
            </Button>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Solicitações ({solList.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedSolicitacoes.length > 0 && (
            <Alert className="m-4 border-blue-300 bg-blue-50">
              <AlertDescription className="flex items-center justify-between">
                <div className="text-blue-900 font-semibold">{selectedSolicitacoes.length} solicitacao(oes) selecionada(s)</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportarSolicitacoesCSV(solList.filter(s => selectedSolicitacoes.includes(s.id)))}>
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedSolicitacoes([])}>Limpar</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <ERPDataTable
            columns={[
              { key: 'numero_solicitacao', label: 'N Solicitacao', render: (s) => <span className="font-medium">{s.numero_solicitacao}</span> },
              { key: 'produto_descricao', label: 'Produto' },
              { key: 'quantidade_solicitada', label: 'Qtd', isNumeric: true, render: (s) => `${s.quantidade_solicitada} ${s.unidade_medida}` },
              { key: 'solicitante', label: 'Solicitante' },
              { key: 'data_solicitacao', label: 'Data', render: (s) => new Date(s.data_solicitacao).toLocaleDateString('pt-BR') },
              { key: 'prioridade', label: 'Prioridade', render: (s) => (
                <Badge variant="outline" className={
                  s.prioridade === 'Urgente' ? 'border-red-300 text-red-700' :
                  s.prioridade === 'Alta' ? 'border-orange-300 text-orange-700' : 'border-slate-300 text-slate-700'
                }>{s.prioridade}</Badge>
              ) },
              { key: 'status', label: 'Status', render: (s) => <Badge className={statusColors[s.status]}>{s.status}</Badge> },
              { key: 'actions', label: 'Acoes', render: (s) => (
                <div className="flex gap-1">
                  {s.status === 'Pendente' && (
                    <>
                      {hasPermission('Compras','SolicitacaoCompra','aprovar') && (
                        <Button variant="ghost" size="icon" data-permission="Compras.SolicitacaoCompra.aprovar" data-sensitive="true" onClick={() => handleAprovar(s)} title="Aprovar">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      {hasPermission('Compras','SolicitacaoCompra','rejeitar') && (
                        <Button variant="ghost" size="icon" data-permission="Compras.SolicitacaoCompra.rejeitar" data-sensitive="true" onClick={() => handleRejeitar(s)} title="Rejeitar">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </>
                  )}
                  {s.status === 'Aprovada' && hasPermission('Compras','SolicitacaoCompra','gerar_oc') && (
                    <Button variant="ghost" size="sm" data-permission="Compras.SolicitacaoCompra.gerar_oc" data-sensitive="true" onClick={() => handleGerarOC(s)} className="text-purple-600">
                      <ShoppingCart className="w-4 h-4 mr-1" /> Gerar OC
                    </Button>
                  )}
                </div>
              )}
            ]}
            data={solList}
            entityName="SolicitacaoCompra"
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(sf, sd) => { setSortField(sf); setSortDirection(sd); }}
            selectedIds={selectedSolicitacoes}
            allSelected={selectedSolicitacoes.length === solList.length && solList.length > 0}
            onToggleSelectAll={() => {
              const all = selectedSolicitacoes.length === solList.length && solList.length > 0;
              setSelectedSolicitacoes(all ? [] : solList.map(s => s.id));
            }}
            onToggleItem={(id) => toggleSolicitacao(id)}
            permission="Compras.SolicitacaoCompra.visualizar"
            page={page} pageSize={pageSize}
            totalItems={page * pageSize + (solBackend.length < pageSize ? 0 : 1)}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          />
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-orange-50 overflow-auto p-1.5">{content}</div>;
  }
  return content;
}