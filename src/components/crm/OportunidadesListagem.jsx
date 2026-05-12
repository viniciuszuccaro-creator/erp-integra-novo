import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, TrendingUp, Edit, Trash2, Eye } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import OportunidadeForm from "./OportunidadeForm";
import { useWindow } from "@/components/lib/useWindow";

export default function OportunidadesListagem({ oportunidades: propOps = [], windowMode }) {
  const [search, setSearch] = useState("");
  const [filtroEstagio, setFiltroEstagio] = useState("todos");
  const { empresaAtual, filterInContext } = useContextoVisual();
  const { openWindow } = useWindow();
  const qc = useQueryClient();

  const { data: oportunidades = propOps } = useQuery({
    queryKey: ['oportunidades-list', empresaAtual?.id],
    queryFn: () => filterInContext('Oportunidade', {}, '-created_date', 200),
    staleTime: 30000,
    enabled: propOps.length === 0
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Oportunidade.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oportunidades-list'] })
  });

  const estagios = ["Prospecção","Qualificação","Proposta","Negociação","Fechado Ganho","Fechado Perdido"];
  const estagioColor = {
    "Prospecção": "bg-blue-100 text-blue-700",
    "Qualificação": "bg-indigo-100 text-indigo-700",
    "Proposta": "bg-yellow-100 text-yellow-700",
    "Negociação": "bg-orange-100 text-orange-700",
    "Fechado Ganho": "bg-green-100 text-green-700",
    "Fechado Perdido": "bg-red-100 text-red-700",
  };

  const filtered = oportunidades.filter(o => {
    const match = [o.titulo, o.cliente_nome, o.responsavel].join(" ").toLowerCase().includes(search.toLowerCase());
    const estagioMatch = filtroEstagio === "todos" || o.estagio === filtroEstagio;
    return match && estagioMatch;
  });

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> Oportunidades</h2>
        <Button size="sm" onClick={() => openWindow(OportunidadeForm, { windowMode: true, onSuccess: () => qc.invalidateQueries({ queryKey: ['oportunidades-list'] }) }, { title: 'Nova Oportunidade', width: 900, height: 650 })}>
          <Plus className="w-4 h-4 mr-1" /> Nova
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filtroEstagio} onValueChange={setFiltroEstagio}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos estágios</SelectItem>
            {estagios.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 overflow-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(op => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.titulo}</TableCell>
                  <TableCell>{op.cliente_nome}</TableCell>
                  <TableCell><Badge className={estagioColor[op.estagio] || "bg-slate-100 text-slate-700"}>{op.estagio}</Badge></TableCell>
                  <TableCell className="text-green-700 font-semibold">R$ {(op.valor || 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{op.responsavel}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openWindow(OportunidadeForm, { oportunidade: op, windowMode: true, onSuccess: () => qc.invalidateQueries({ queryKey: ['oportunidades-list'] }) }, { title: `Editar: ${op.titulo}`, width: 900, height: 650 })}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => window.confirm('Excluir?') && deleteMutation.mutate(op.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhuma oportunidade encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}