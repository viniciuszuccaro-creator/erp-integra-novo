import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, CheckCircle2, Send, Star, Printer, Eye, Download } from "lucide-react";
import OrdensCompraHeader from "./OrdensCompraHeader";
import OCSelecionadasBar from "./OCSelecionadasBar";
import OCTabela from "./OCTabela";
import OCPaginacao from "./OCPaginacao";
import ERPDataTable from "@/components/ui/erp/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import OrdemCompraForm from "./OrdemCompraForm";
import AvaliacaoFornecedorForm from "./AvaliacaoFornecedorForm";
import RecebimentoOCForm from "./RecebimentoOCForm";
import { useWindow } from "@/components/lib/useWindow";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useEntityListSorted from "@/components/lib/useEntityListSorted";
import { toast as sonnerToast } from "sonner";
import { ImprimirOrdemCompra } from "@/components/lib/ImprimirOrdemCompra";
import { useUser } from "@/components/lib/UserContext";

export default function OrdensCompraTab({ ordensCompra, fornecedores, empresas = [], windowMode = false }) {
  const { createInContext, updateInContext } = useContextoVisual();
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('OrdemCompra', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('OrdemCompra', 'data_solicitacao', 'desc');

  // persistência de sort movida para usePersistedSort

  const { data: ocBackend = [] } = useEntityListSorted('OrdemCompra', {}, { sortField, sortDirection, page, pageSize, limit: pageSize });
  const ocList = Array.isArray(ordensCompra) && ordensCompra.length ? ordensCompra : ocBackend;
  const { user: authUser } = useUser();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOC, setEditingOC] = useState(null);
  const { openWindow } = useWindow();
  const [isAvaliacaoDialogOpen, setIsAvaliacaoDialogOpen] = useState(false);
  const [ocSelecionada, setOcSelecionada] = useState(null);
  const [isRecebimentoDialogOpen, setIsRecebimentoDialogOpen] = useState(false);
  // Seleção em massa + exportação
  const [selectedOCs, setSelectedOCs] = useState([]);
  const toggleOC = (id) => setSelectedOCs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllOCs = (checked, lista) => setSelectedOCs(checked ? lista.map(o => o.id) : []);
  const exportarOCsCSV = (lista) => {
    const headers = ['numero_oc','fornecedor_nome','empresa_id','data_solicitacao','valor_total','status','lead_time_real'];
    const csv = [
      headers.join(','),
      ...lista.map(o => headers.map(h => JSON.stringify(o[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordens_compra_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [formData, setFormData] = useState({
    numero_oc: "",
    fornecedor_id: "",
    fornecedor_nome: "",
    data_solicitacao: new Date().toISOString().split('T')[0],
    data_entrega_prevista: "",
    valor_total: "",
    prazo_entrega_acordado: "",
    condicao_pagamento: "À Vista",
    forma_pagamento: "Boleto",
    observacoes: "",
    itens: []
  });

  const [avaliacaoFormData, setAvaliacaoFormData] = useState({
    nota: 5,
    qualidade: 5,
    prazo: 5,
    preco: 5,
    atendimento: 5,
    comentario: ""
  });

  const [recebimentoFormData, setRecebimentoFormData] = useState({
    data_entrega_real: new Date().toISOString().split('T')[0],
    nota_fiscal_entrada: "",
    observacoes: ""
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data) => createInContext('OrdemCompra', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ordensCompra']);
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Ordem de Compra criada com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateInContext('OrdemCompra', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ordensCompra']);
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Ordem de Compra atualizada com sucesso!" });
    },
  });

  const aprovarMutation = useMutation({
    mutationFn: async ({ id, oc }) => {
      const hoje = new Date().toISOString().split('T')[0];
      
      await updateInContext('OrdemCompra', id, {
        status: 'Aprovada',
        data_aprovacao: hoje,
        historico: [
          ...(oc.historico || []),
          {
            data: new Date().toISOString(),
            status_anterior: oc.status,
            status_novo: 'Aprovada',
            usuario: (authUser?.full_name || authUser?.email || 'Sistema'),
            observacao: 'Ordem de compra aprovada'
          }
        ]
      });
    },
    onSuccess: async () => {
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Compras', entidade: 'OrdemCompra', descricao: 'OC aprovada', data_hora: new Date().toISOString() }); } catch(_) {}
      queryClient.invalidateQueries(['ordensCompra']);
      toast({ title: "✅ Ordem de Compra aprovada!" });
    },
  });

  const enviarFornecedorMutation = useMutation({
    mutationFn: async ({ id, oc }) => {
      const hoje = new Date().toISOString().split('T')[0];
      
      await updateInContext('OrdemCompra', id, {
        status: 'Enviada ao Fornecedor',
        data_envio_fornecedor: hoje,
        historico: [
          ...(oc.historico || []),
          {
            data: new Date().toISOString(),
            status_anterior: oc.status,
            status_novo: 'Enviada ao Fornecedor',
            usuario: (authUser?.full_name || authUser?.email || 'Sistema'),
            observacao: 'Ordem enviada ao fornecedor'
          }
        ]
      });
    },
    onSuccess: async () => {
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Compras', entidade: 'OrdemCompra', descricao: 'OC enviada ao fornecedor', data_hora: new Date().toISOString() }); } catch(_) {}
      queryClient.invalidateQueries(['ordensCompra']);
      toast({ 
        title: "✅ OC Enviada ao Fornecedor!",
        description: "E-mail enviado (se configurado)"
      });
    },
  });

  const receberMutation = useMutation({
    mutationFn: async ({ id, oc, dados }) => {
      const dataEnvio = new Date(oc.data_envio_fornecedor);
      const dataRecebimento = new Date(dados.data_entrega_real);
      const leadTimeReal = Math.floor((dataRecebimento - dataEnvio) / (1000 * 60 * 60 * 24));

      // Atualizar OC
      await updateInContext('OrdemCompra', id, {
        status: 'Recebida',
        data_entrega_real: dados.data_entrega_real,
        nota_fiscal_entrada: dados.nota_fiscal_entrada,
        lead_time_real: leadTimeReal,
        historico: [
          ...(oc.historico || []),
          {
            data: new Date().toISOString(),
            status_anterior: oc.status,
            status_novo: 'Recebida',
            usuario: (authUser?.full_name || authUser?.email || 'Sistema'),
            observacao: `Recebida. Lead time: ${leadTimeReal} dias`
          }
        ]
      });

      // Atualizar estatísticas do fornecedor
      const fornecedor = fornecedores.find(f => f.id === oc.fornecedor_id);
      if (fornecedor) {
        const qtdCompras = (fornecedor.quantidade_compras || 0) + 1;
        const valorTotal = (fornecedor.valor_total_compras || 0) + (oc.valor_total || 0);
        
        // Calcular lead time médio
        const leadTimesAnteriores = fornecedor.lead_time_medio ? [fornecedor.lead_time_medio] : [];
        const leadTimes = [...leadTimesAnteriores, leadTimeReal];
        const leadTimeMedio = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;

        // Calcular % entregas no prazo
        const prazoAcordado = oc.prazo_entrega_acordado || fornecedor.prazo_entrega_padrao || 0;
        const noPrazo = leadTimeReal <= prazoAcordado;
        const totalEntregasPrazo = (fornecedor.percentual_entregas_prazo || 0) * (qtdCompras - 1);
        const novoPercentual = ((totalEntregasPrazo + (noPrazo ? 1 : 0)) / qtdCompras) * 100;

        await updateInContext('Fornecedor',fornecedor.id, {
          quantidade_compras: qtdCompras,
          valor_total_compras: valorTotal,
          ultima_compra: dados.data_entrega_real,
          lead_time_medio: Math.round(leadTimeMedio),
          percentual_entregas_prazo: Math.round(novoPercentual)
        });
      }

      // Criar movimentação de estoque (entrada) para cada item
      if (oc.itens && oc.itens.length > 0) {
        for (const item of oc.itens) {
          await createInContext('MovimentacaoEstoque', {
            produto_id: item.produto_id,
            produto_descricao: item.descricao,
            tipo_movimentacao: 'Entrada',
            quantidade: item.quantidade_solicitada,
            data_movimentacao: dados.data_entrega_real,
            documento: `OC-${oc.numero_oc}`,
            motivo: `Recebimento de Ordem de Compra`,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            responsavel: 'Sistema',
            observacoes: dados.observacoes
          });

          // Atualizar estoque do produto
          if (item.produto_id) {
            const produto = await base44.entities.Produto.filter({ id: item.produto_id });
            if (produto && produto.length > 0) {
              const produtoAtual = produto[0];
              await base44.entities.Produto.update(item.produto_id, {
                estoque_atual: (produtoAtual.estoque_atual || 0) + item.quantidade_solicitada
              });
            }
          }
        }
      }

      return { leadTimeReal, fornecedorNome: oc.fornecedor_nome };
    },
    onSuccess: async ({ leadTimeReal, fornecedorNome }) => {
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Compras', entidade: 'OrdemCompra', descricao: 'Recebimento registrado', data_hora: new Date().toISOString() }); } catch(_) {}

      queryClient.invalidateQueries(['ordensCompra']);
      queryClient.invalidateQueries(['fornecedores']);
      queryClient.invalidateQueries(['movimentacoes']);
      queryClient.invalidateQueries(['produtos']);
      
      setIsRecebimentoDialogOpen(false);
      
      toast({ 
        title: "✅ Recebimento Registrado!",
        description: `Lead time: ${leadTimeReal} dias | Estoque atualizado`
      });

      // Abrir dialog de avaliação
      setTimeout(() => {
        setOcSelecionada(ocSelecionada); // Manter OC selecionada
        setIsAvaliacaoDialogOpen(true);
      }, 500);
    },
  });

  const avaliarFornecedorMutation = useMutation({
    mutationFn: async ({ oc, avaliacao }) => {
      const notaMedia = (
        avaliacao.qualidade +
        avaliacao.prazo +
        avaliacao.preco +
        avaliacao.atendimento
      ) / 4;

      // Atualizar OC com avaliação
      await base44.entities.OrdemCompra.update(oc.id, {
        avaliacao_fornecedor: {
          realizada: true,
          data: new Date().toISOString(),
          nota: notaMedia,
          criterios: {
            qualidade: avaliacao.qualidade,
            prazo: avaliacao.prazo,
            preco: avaliacao.preco,
            atendimento: avaliacao.atendimento
          },
          comentario: avaliacao.comentario
        }
      });

      // Adicionar avaliação ao histórico do fornecedor
      const fornecedor = fornecedores.find(f => f.id === oc.fornecedor_id);
      if (fornecedor) {
        const novasAvaliacoes = [
          ...(fornecedor.avaliacoes || []),
          {
            data: new Date().toISOString(),
            nota: notaMedia,
            criterios: {
              qualidade: avaliacao.qualidade,
              prazo: avaliacao.prazo,
              preco: avaliacao.preco,
              atendimento: avaliacao.atendimento
            },
            ordem_compra_id: oc.id,
            avaliador: 'Sistema',
            comentario: avaliacao.comentario
          }
        ];

        // Calcular nota média do fornecedor
        const somaNotas = novasAvaliacoes.reduce((sum, av) => sum + av.nota, 0);
        const notaMediaFornecedor = somaNotas / novasAvaliacoes.length;

        await updateInContext('Fornecedor',fornecedor.id, {
          avaliacoes: novasAvaliacoes,
          nota_media: parseFloat(notaMediaFornecedor.toFixed(2))
        });
      }

      return { notaMedia, fornecedorNome: oc.fornecedor_nome };
    },
    onSuccess: ({ notaMedia, fornecedorNome }) => {
      queryClient.invalidateQueries(['ordensCompra']);
      queryClient.invalidateQueries(['fornecedores']);
      setIsAvaliacaoDialogOpen(false);
      setAvaliacaoFormData({
        nota: 5,
        qualidade: 5,
        prazo: 5,
        preco: 5,
        atendimento: 5,
        comentario: ""
      });
      toast({ 
        title: "✅ Avaliação Registrada!",
        description: `${fornecedorNome}: ${notaMedia.toFixed(1)} estrelas`
      });
    },
  });

  const resetForm = () => {
    setFormData({
      numero_oc: "",
      fornecedor_id: "",
      fornecedor_nome: "",
      data_solicitacao: new Date().toISOString().split('T')[0],
      data_entrega_prevista: "",
      valor_total: "",
      prazo_entrega_acordado: "",
      condicao_pagamento: "À Vista",
      forma_pagamento: "Boleto",
      observacoes: "",
      itens: []
    });
    setEditingOC(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const fornecedorSelecionado = fornecedores.find(f => f.id === formData.fornecedor_id);
    
    const data = {
      ...formData,
      fornecedor_nome: fornecedorSelecionado?.nome || formData.fornecedor_nome,
      valor_total: parseFloat(formData.valor_total),
      prazo_entrega_acordado: parseInt(formData.prazo_entrega_acordado) || null
    };

    if (editingOC) {
      updateMutation.mutate({ id: editingOC.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (oc) => {
    setEditingOC(oc);
    setFormData({
      numero_oc: oc.numero_oc || "",
      fornecedor_id: oc.fornecedor_id || "",
      fornecedor_nome: oc.fornecedor_nome || "",
      data_solicitacao: oc.data_solicitacao || new Date().toISOString().split('T')[0],
      data_entrega_prevista: oc.data_entrega_prevista || "",
      valor_total: oc.valor_total || "",
      prazo_entrega_acordado: oc.prazo_entrega_acordado || "",
      condicao_pagamento: oc.condicao_pagamento || "À Vista",
      forma_pagamento: oc.forma_pagamento || "Boleto",
      observacoes: oc.observacoes || "",
      itens: oc.itens || []
    });
    setIsDialogOpen(true);
  };

  const handleReceberClick = (oc) => {
    if (!hasPermission('Compras','OrdemCompra','receber')) { toast({ title: '⛔ Sem permissão para receber', variant: 'destructive' }); return; }
    openWindow(RecebimentoOCForm, {
      ordemCompra: oc,
      windowMode: true,
      onSubmit: async (dados) => {
        try {
          await receberMutation.mutateAsync({ id: oc.id, oc, dados });
          sonnerToast.success("✅ Recebimento registrado!");
        } catch (error) {
          sonnerToast.error("Erro ao registrar recebimento");
        }
      }
    }, {
      title: `📦 Receber: ${oc.numero_oc}`,
      width: 800,
      height: 600
    });
  };

  const filteredOCs = ocList.filter(oc => {
    const searchLower = searchTerm.toLowerCase();
    return oc.numero_oc?.toLowerCase().includes(searchLower) ||
      oc.fornecedor_nome?.toLowerCase().includes(searchLower) ||
      oc.status?.toLowerCase().includes(searchLower) ||
      oc.solicitante?.toLowerCase().includes(searchLower) ||
      oc.aprovador?.toLowerCase().includes(searchLower) ||
      oc.centro_custo?.toLowerCase().includes(searchLower) ||
      oc.condicao_pagamento?.toLowerCase().includes(searchLower) ||
      oc.forma_pagamento?.toLowerCase().includes(searchLower) ||
      oc.nota_fiscal_entrada?.includes(searchLower) ||
      oc.observacoes?.toLowerCase().includes(searchLower);
  });

  const statusColors = {
    'Solicitada': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-purple-100 text-purple-700',
    'Enviada ao Fornecedor': 'bg-indigo-100 text-indigo-700',
    'Em Processo': 'bg-yellow-100 text-yellow-700',
    'Parcialmente Recebida': 'bg-cyan-100 text-cyan-700',
    'Recebida': 'bg-green-100 text-green-700',
    'Cancelada': 'bg-gray-100 text-gray-700'
  };

  const content = (
    <div className="space-y-1.5">
      <OrdensCompraHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNovaOC={() => {
          if (!hasPermission('Compras','OrdemCompra','criar')) { toast({ title: '⛔ Sem permissão para criar', variant: 'destructive' }); return; }
          openWindow(OrdemCompraForm, {
            windowMode: true,
            onSubmit: async (data) => {
              try {
                await createMutation.mutateAsync(data);
                sonnerToast.success("✅ Ordem de Compra criada!");
              } catch (error) {
                sonnerToast.error("Erro ao criar OC");
              }
            }
          }, {
            title: '🛒 Nova Ordem de Compra',
            width: 1100,
            height: 700
          })
        }}
      />

        {/* BACKUP: Dialog removido */}
        <Dialog open={false}>
          <DialogTrigger asChild>
            <Button className="hidden">Removido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOC ? 'Editar OC' : 'Nova Ordem de Compra'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_oc">Número da OC *</Label>
                  <Input
                    id="numero_oc"
                    value={formData.numero_oc}
                    onChange={(e) => setFormData({...formData, numero_oc: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Select
                    value={formData.fornecedor_id}
                    onValueChange={(value) => setFormData({...formData, fornecedor_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.filter(f => f.status === 'Ativo').map(fornecedor => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data_solicitacao">Data Solicitação *</Label>
                  <Input
                    id="data_solicitacao"
                    type="date"
                    value={formData.data_solicitacao}
                    onChange={(e) => setFormData({...formData, data_solicitacao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_entrega_prevista">Entrega Prevista</Label>
                  <Input
                    id="data_entrega_prevista"
                    type="date"
                    value={formData.data_entrega_prevista}
                    onChange={(e) => setFormData({...formData, data_entrega_prevista: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="valor_total">Valor Total *</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({...formData, valor_total: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prazo_entrega">Prazo Entrega (dias)</Label>
                  <Input
                    id="prazo_entrega"
                    type="number"
                    value={formData.prazo_entrega_acordado}
                    onChange={(e) => setFormData({...formData, prazo_entrega_acordado: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="condicao_pagamento">Condição Pagamento</Label>
                  <Select
                    value={formData.condicao_pagamento}
                    onValueChange={(value) => setFormData({...formData, condicao_pagamento: value})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="À Vista">À Vista</SelectItem>
                      <SelectItem value="30 dias">30 dias</SelectItem>
                      <SelectItem value="60 dias">60 dias</SelectItem>
                      <SelectItem value="90 dias">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="forma_pagamento">Forma Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(value) => setFormData({...formData, forma_pagamento: value})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" data-permission="Compras.OrdemCompra.criar">
                  {editingOC ? 'Atualizar' : 'Criar'} OC
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      <Card className="border-0 shadow-sm">
        <OCSelecionadasBar
          selectedCount={selectedOCs.length}
          onExportCSV={() => exportarOCsCSV(filteredOCs.filter(o => selectedOCs.includes(o.id)))}
          onClear={() => setSelectedOCs([])}
        />
        <CardContent className="p-0">
          <OCTabela
            ocs={filteredOCs}
            selectedOCs={selectedOCs}
            onToggleOC={toggleOC}
            onSort={(field) => { setSortField(field); setSortDirection(prev => (sortField===field && prev==='asc')?'desc':'asc'); }}
            statusColors={statusColors}
            onImprimir={(oc)=>{ const empresa = empresas?.find(e => e.id === oc.empresa_id); const fornecedor = fornecedores?.find(f => f.id === oc.fornecedor_id); ImprimirOrdemCompra({ oc, empresa, fornecedor }); }}
            onVer={(oc)=> openWindow(OrdemCompraForm, { ordemCompra: oc, windowMode: true, onSubmit: async (data) => { try { await updateMutation.mutateAsync({ id: oc.id, data }); sonnerToast.success('✅ OC atualizada!'); } catch { sonnerToast.error('Erro ao atualizar OC'); } } }, { title: `👁️ Ver: ${oc.numero_oc}`, width: 1100, height: 700 })}
            onEditar={handleEdit}
            onAprovar={(oc)=> { if (!hasPermission('Compras','OrdemCompra','aprovar')) { toast({ title: '⛔ Sem permissão para aprovar', variant: 'destructive' }); return; } aprovarMutation.mutate({ id: oc.id, oc }); }}
            onEnviar={(oc)=> { if (!hasPermission('Compras','OrdemCompra','enviar_fornecedor')) { toast({ title: '⛔ Sem permissão para enviar', variant: 'destructive' }); return; } enviarFornecedorMutation.mutate({ id: oc.id, oc }); }}
            onReceber={handleReceberClick}
            onAvaliar={(oc)=> { if (!hasPermission('Compras','OrdemCompra','avaliar_fornecedor')) { toast({ title: '⛔ Sem permissão para avaliar', variant: 'destructive' }); return; } openWindow(AvaliacaoFornecedorForm, { ordemCompra: oc, windowMode: true, onSubmit: async (avaliacao) => { try { await avaliarFornecedorMutation.mutateAsync({ oc, avaliacao }); sonnerToast.success('⭐ Avaliação registrada!'); } catch { sonnerToast.error('Erro ao avaliar fornecedor'); } } }, { title: `⭐ Avaliar: ${oc.fornecedor_nome}`, width: 800, height: 650 }); }}
          />

          <OCPaginacao
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            hasNext={ocBackend.length >= pageSize}
          />

          {filteredOCs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">Nenhuma ordem de compra encontrada</p>
            </div>
          )}
          </CardContent>
        </Card>

        {/* DIALOGS REMOVIDOS - Agora usam Windows */}
      </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}