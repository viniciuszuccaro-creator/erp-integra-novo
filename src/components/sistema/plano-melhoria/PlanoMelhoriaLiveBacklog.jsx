import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ListChecks, Plus, Search, RefreshCw, CheckCircle2, Clock, Zap, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Planejado:    'bg-slate-100 text-slate-700',
  'Em Execução':'bg-blue-100 text-blue-700',
  Validando:    'bg-amber-100 text-amber-700',
  Concluído:    'bg-emerald-100 text-emerald-700',
};
const STATUS_ICONS = {
  Planejado: Clock, 'Em Execução': Zap, Validando: RefreshCw, Concluído: CheckCircle2,
};
const PRIOR_COLORS = {
  Crítica: 'bg-red-600 text-white', Alta: 'bg-orange-500 text-white',
  Média: 'bg-amber-400 text-white', Baixa: 'bg-slate-400 text-white',
};

const MODULOS = ['Dashboard','CRM','Comercial','Estoque','Financeiro','Fiscal','RH','Expedição','Compras','Produção','Cadastros','Sistema','Contratos','Agenda','Portal','Hub Atendimento','Gestão Acessos','Todos'];

const EMPTY_FORM = { titulo: '', modulo: 'Sistema', fase: 'Ciclo 11', status: 'Planejado', prioridade: 'Média', descricao: '', percentual: 0 };

export default function PlanoMelhoriaLiveBacklog() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterModulo, setFilterModulo] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['plano-melhoria-backlog'],
    queryFn: () => base44.entities.PlanoMelhoriaItem.list('-updated_date', 50),
  });

  const filtered = items.filter(item => {
    const matchSearch = !search || `${item.titulo} ${item.modulo} ${item.descricao || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || item.status === filterStatus;
    const matchModulo = filterModulo === 'todos' || item.modulo === filterModulo;
    return matchSearch && matchStatus && matchModulo;
  });

  const handleSave = async () => {
    if (!form.titulo.trim()) { toast.error('Título obrigatório'); return; }
    setSaving(true);
    try {
      await base44.entities.PlanoMelhoriaItem.create({ ...form, tipo: 'Governança' });
      toast.success('Item adicionado ao backlog!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['plano-melhoria-backlog'] });
    } catch (e) {
      toast.error('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      const pct = newStatus === 'Concluído' ? 100 : newStatus === 'Validando' ? 75 : newStatus === 'Em Execução' ? 40 : 0;
      await base44.entities.PlanoMelhoriaItem.update(item.id, { status: newStatus, percentual: pct });
      qc.invalidateQueries({ queryKey: ['plano-melhoria-backlog'] });
      toast.success(`Status atualizado: ${newStatus}`);
    } catch (e) { toast.error('Erro: ' + e.message); }
  };

  const concluidos = items.filter(i => i.status === 'Concluído').length;
  const emExec = items.filter(i => i.status === 'Em Execução').length;
  const pct = items.length > 0 ? Math.round((concluidos / items.length) * 100) : 0;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white flex-shrink-0">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Backlog Vivo</h3>
                <p className="text-xs text-slate-500">{items.length} itens · {pct}% concluído · {emExec} em execução</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(v => !v)}>
                <Plus className="w-4 h-4 mr-1" /> Novo Item
              </Button>
            </div>
          </div>
          {items.length > 0 && <Progress value={pct} className="h-2 mt-3" />}
        </CardContent>
      </Card>

      {/* Form inline */}
      {showForm && (
        <Card className="border-blue-300 bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Novo Item de Melhoria</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            <Input placeholder="Descrição / impacto esperado" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={form.modulo} onValueChange={v => setForm(f => ({ ...f, modulo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MODULOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.prioridade} onValueChange={v => setForm(f => ({ ...f, prioridade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Crítica','Alta','Média','Baixa'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Fase (ex: Ciclo 11)" value={form.fase} onChange={e => setForm(f => ({ ...f, fase: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <Input className="pl-8 h-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterModulo} onValueChange={setFilterModulo}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Módulo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos módulos</SelectItem>
            {MODULOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline">{filtered.length} item(s)</Badge>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-sm text-slate-500 p-4 text-center">Carregando backlog...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <ListChecks className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">
            {items.length === 0
              ? 'Backlog vazio. Adicione o primeiro item com "Novo Item".'
              : 'Nenhum item corresponde ao filtro.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const StatusIcon = STATUS_ICONS[item.status] || Clock;
            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${item.status === 'Concluído' ? 'border-emerald-200' : item.status === 'Em Execução' ? 'border-blue-200' : 'border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.titulo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.modulo} · {item.fase}</p>
                    </div>
                    <StatusIcon className={`w-5 h-5 flex-shrink-0 ${item.status === 'Concluído' ? 'text-emerald-500' : item.status === 'Em Execução' ? 'text-blue-500' : 'text-slate-400'}`} />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className={`text-[10px] ${STATUS_COLORS[item.status] || STATUS_COLORS.Planejado}`}>
                      {item.status}
                    </Badge>
                    {item.prioridade && (
                      <Badge className={`text-[10px] ${PRIOR_COLORS[item.prioridade] || PRIOR_COLORS.Média}`}>
                        {item.prioridade}
                      </Badge>
                    )}
                  </div>

                  {item.descricao && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{item.descricao}</p>
                  )}

                  <Progress value={item.percentual || 0} className="h-1.5 mb-2" />

                  <Select value={item.status} onValueChange={(v) => handleStatusChange(item, v)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}