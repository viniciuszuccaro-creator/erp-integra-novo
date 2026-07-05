import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Factory, Plus, Search, Edit, Trash2, Eye, Clock } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import FormularioOrdemProducao from "./FormularioOrdemProducao";

const STATUS_COLORS = {
  "Rascunho": "bg-slate-100 text-slate-600",
  "Liberada": "bg-blue-100 text-blue-700",
  "Em Corte": "bg-orange-100 text-orange-700",
  "Em Dobra": "bg-yellow-100 text-yellow-700",
  "Em Armação": "bg-purple-100 text-purple-700",
  "Finalizada": "bg-green-100 text-green-700",
  "Cancelada": "bg-red-100 text-red-700",
};

export default function OrdensProducaoListagem({ windowMode }) {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const { empresaAtual, filterInContext } = useContextoVisual();
  const { openWindow } = useWindow();
  const qc = useQueryClient();

  const { data: ops = [], isLoading } = useQuery({
    queryKey: ['ops-listagem', empresaAtual?.id],
    queryFn: () => filterInContext('OrdemProducao', {}, '-created_date', 200),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OrdemProducao.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ops-listagem'] })
  });

  const filtered = ops.filter(op => {
    const matchSearch = [op.numero_op, op.cliente_nome, op.descricao, op.status].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "todos" || op.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Factory className="w-5 h-5 text-orange-600" /> Ordens de Produção
        </h2>
        <Button size="sm" data-permission="Producao.OrdemProducao.criar" onClick={() => openWindow(FormularioOrdemProducao, { windowMode: true, onSuccess: () => qc.invalidateQueries({ queryKey: ['ops-listagem'] }) }, { title: 'Nova Ordem de Produção', width: 1200, height: 750 })}>
          <Plus className="w-4 h-4 mr-1" /> Nova OP
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar OP..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 overflow-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OP</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Carregando...</TableCell></TableRow>
              ) : filtered.map(op => (
                <TableRow key={op.id}>
                  <TableCell className="font-mono font-semibold">{op.numero_op || op.id?.slice(0, 8)}</TableCell>
                  <TableCell className="max-w-xs truncate">{op.descricao || op.objeto}</TableCell>
                  <TableCell>{op.cliente_nome}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[op.status] || "bg-slate-100 text-slate-600"}>{op.status}</Badge></TableCell>
                  <TableCell>{op.quantidade_total || '-'}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {op.data_previsao ? new Date(op.data_previsao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" data-permission="Producao.OrdemProducao.editar" onClick={() => openWindow(FormularioOrdemProducao, { op, windowMode: true, onSuccess: () => qc.invalidateQueries({ queryKey: ['ops-listagem'] }) }, { title: `Editar OP: ${op.numero_op || ''}`, width: 1200, height: 750 })}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-permission="Producao.OrdemProducao.excluir" className="text-red-600" onClick={() => setItemParaExcluir(op)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma ordem de produção encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-500 border-t pt-2">
        <Clock className="w-3 h-3" />
        {filtered.length} de {ops.length} OPs exibidas
      </div>
      <ConfirmDialog open={!!itemParaExcluir} onOpenChange={(open) => !open && setItemParaExcluir(null)} onConfirm={() => { if (itemParaExcluir) deleteMutation.mutate(itemParaExcluir.id); setItemParaExcluir(null); }} title="Confirmar Exclusão" description="Excluir esta ordem de produção? Esta ação não pode ser desfeita." confirmText="Excluir" />
    </div>
  );
}