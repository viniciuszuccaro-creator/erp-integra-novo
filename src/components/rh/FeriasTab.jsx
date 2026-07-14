import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, CheckCircle, XCircle, Clock, Plus, Search, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import FeriasForm from "@/components/rh/FeriasForm";

const STATUS_COLORS = {
  Solicitada: "bg-yellow-100 text-yellow-700",
  Aprovada: "bg-green-100 text-green-700",
  Rejeitada: "bg-red-100 text-red-700",
  Cancelada: "bg-gray-100 text-gray-600",
};

export default function FeriasTab({ windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, carimbarContexto } = useContextoVisual();
  const { canCreate, canApprove, hasPermission } = usePermissions();
  const canAprovar = canApprove('RH') || hasPermission('RH', null, 'visualizar');

  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingFerias, setEditingFerias] = useState(null);

  const { data: ferias = [], isLoading } = useQuery({
    queryKey: ['ferias-tab'],
    queryFn: () => filterInContext('Ferias', {}, '-created_date', 200),
    staleTime: 30000,
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-ferias'],
    queryFn: () => filterInContext('Colaborador', { status: 'Ativo' }, 'nome_completo', 500),
    staleTime: 60000,
  });

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ferias.create(carimbarContexto(data)),
    onSuccess: async (f) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || 'Usuário', usuario_id: user?.id,
        acao: 'Criação', modulo: 'RH', entidade: 'Ferias',
        descricao: `Férias solicitadas para ${f.colaborador_nome}`,
        data_hora: new Date().toISOString(),
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['ferias-tab'] });
      queryClient.invalidateQueries({ queryKey: ['Ferias'] });
      setFormOpen(false);
      setEditingFerias(null);
      toast({ title: "✅ Férias solicitadas!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ferias.update(id, data),
    onSuccess: async (_r, { id, data }) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || 'Usuário', usuario_id: user?.id,
        acao: 'Edição', modulo: 'RH', entidade: 'Ferias',
        descricao: `Férias ${data.status || 'atualizada'} - ${data.colaborador_nome || ''}`,
        data_hora: new Date().toISOString(),
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['ferias-tab'] });
      queryClient.invalidateQueries({ queryKey: ['Ferias'] });
      setFormOpen(false);
      setEditingFerias(null);
      toast({ title: "✅ Férias atualizadas!" });
    },
  });

  const handleSubmit = (data) => {
    if (editingFerias) {
      updateMutation.mutate({ id: editingFerias.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAprovar = (f) => updateMutation.mutate({ id: f.id, data: { ...f, status: 'Aprovada', aprovado_por: user?.full_name } });
  const handleRejeitar = (f) => updateMutation.mutate({ id: f.id, data: { ...f, status: 'Rejeitada' } });

  const filtered = ferias.filter(f => {
    const matchSearch = !search ||
      (f.colaborador_nome || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || f.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const totais = {
    solicitadas: ferias.filter(f => f.status === 'Solicitada').length,
    aprovadas: ferias.filter(f => f.status === 'Aprovada').length,
    rejeitadas: ferias.filter(f => f.status === 'Rejeitada').length,
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-auto">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Solicitadas', value: totais.solicitadas, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Aprovadas', value: totais.aprovadas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejeitadas', value: totais.rejeitadas, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar colaborador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Solicitada">Solicitadas</SelectItem>
            <SelectItem value="Aprovada">Aprovadas</SelectItem>
            <SelectItem value="Rejeitada">Rejeitadas</SelectItem>
            <SelectItem value="Cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        {canCreate('RH') && (
           <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-9" onClick={() => { setEditingFerias(null); setFormOpen(true); }}>
             <Plus className="w-4 h-4 mr-1" /> Nova Solicitação
           </Button>
         )}
      </div>

      {/* Tabela */}
      <Card className="border-0 shadow-sm flex-1">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            Solicitações de Férias ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aprovado por</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Nenhuma solicitação encontrada
                  </TableCell></TableRow>
                ) : filtered.map(f => (
                  <TableRow key={f.id} className="text-sm">
                    <TableCell className="font-medium">{f.colaborador_nome || '—'}</TableCell>
                    <TableCell>{f.tipo || 'Férias'}</TableCell>
                    <TableCell className="text-xs">
                      {f.data_inicio && new Date(f.data_inicio).toLocaleDateString('pt-BR')} →{' '}
                      {f.data_fim && new Date(f.data_fim).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{f.dias_solicitados || '—'}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[f.status] || 'bg-gray-100 text-gray-700'}>{f.status}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-500">{f.aprovado_por || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canAprovar && f.status === 'Solicitada' && (
                           <>
                             <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:bg-green-50 text-xs"
                               onClick={() => handleAprovar(f)} disabled={updateMutation.isPending}>
                               <CheckCircle className="w-3 h-3 mr-1" />Aprovar
                             </Button>
                             <Button variant="ghost" size="sm" className="h-7 text-red-600 hover:bg-red-50 text-xs"
                               onClick={() => handleRejeitar(f)} disabled={updateMutation.isPending}>
                               <XCircle className="w-3 h-3 mr-1" />Rejeitar
                             </Button>
                           </>
                         )}
                         {canCreate('RH') && (
                           <Button variant="ghost" size="sm" className="h-7 text-xs"
                             onClick={() => { setEditingFerias(f); setFormOpen(true); }}>
                             Editar
                           </Button>
                         )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFerias ? 'Editar Férias' : 'Nova Solicitação de Férias'}</DialogTitle>
          </DialogHeader>
          <FeriasForm
            ferias={editingFerias}
            colaboradores={colaboradores}
            onSubmit={handleSubmit}
            windowMode={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}