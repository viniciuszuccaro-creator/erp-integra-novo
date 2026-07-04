import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MessageSquare, Edit, Trash2, Phone, Mail, Video, Users } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import InteracaoForm from "./InteracaoForm";
import { useWindow } from "@/components/lib/useWindow";

const tipoIcon = { Telefone: Phone, Email: Mail, Reunião: Video, Visita: Users, WhatsApp: MessageSquare };
const tipoColor = {
  Telefone: "bg-blue-100 text-blue-700",
  Email: "bg-indigo-100 text-indigo-700",
  Reunião: "bg-green-100 text-green-700",
  Visita: "bg-orange-100 text-orange-700",
  WhatsApp: "bg-emerald-100 text-emerald-700",
};

export default function InteracoesListagem({ interacoes: propInt = [], windowMode }) {
  const [search, setSearch] = useState("");
  const { empresaAtual, filterInContext } = useContextoVisual();
  const { openWindow } = useWindow();
  const qc = useQueryClient();

  const { data: interacoes = propInt } = useQuery({
    queryKey: ['interacoes-list', empresaAtual?.id],
    queryFn: () => filterInContext('Interacao', {}, '-created_date', 200),
    staleTime: 30000,
    enabled: propInt.length === 0
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Interacao.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interacoes-list'] })
  });

  const filtered = interacoes.filter(i =>
    [i.assunto, i.cliente_nome, i.responsavel, i.tipo].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-600" /> Interações</h2>
        <Button size="sm" onClick={() => openWindow(InteracaoForm, { windowMode: true, onSuccess: () => qc.invalidateQueries({ queryKey: ['interacoes-list'] }) }, { title: 'Nova Interação', width: 800, height: 600 })}>
          <Plus className="w-4 h-4 mr-1" /> Nova
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input className="pl-9" placeholder="Buscar interação..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="flex-1 overflow-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => {
                const Icon = tipoIcon[i.tipo] || MessageSquare;
                return (
                  <TableRow key={i.id}>
                    <TableCell><Badge className={tipoColor[i.tipo] || "bg-slate-100 text-slate-700"}><Icon className="w-3 h-3 mr-1 inline" />{i.tipo}</Badge></TableCell>
                    <TableCell className="font-medium">{i.assunto}</TableCell>
                    <TableCell>{i.cliente_nome}</TableCell>
                    <TableCell>{i.responsavel}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{i.data_interacao ? new Date(i.data_interacao).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" data-permission="CRM.Interacao.excluir" className="text-red-600" onClick={() => window.confirm('Excluir?') && deleteMutation.mutate(i.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400"><MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhuma interação encontrada</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}