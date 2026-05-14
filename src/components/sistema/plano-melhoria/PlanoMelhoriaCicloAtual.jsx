import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ciclo20Items as ciclo11Items } from './melhoriaPlanData';
import { CheckCircle2, Clock, Rocket, AlertTriangle, Search, Filter, Zap } from 'lucide-react';

const STATUS_CONFIG = {
  concluido:   { label: '✅ Concluído',     cls: 'bg-emerald-100 text-emerald-700' },
  em_execucao: { label: '🔄 Em Execução',   cls: 'bg-blue-100 text-blue-700' },
  planejado:   { label: '📅 Planejado',      cls: 'bg-slate-100 text-slate-600' },
  bloqueado:   { label: '🚫 Bloqueado',      cls: 'bg-red-100 text-red-700' },
};

const PRIOR_CONFIG = {
  CRÍTICO: 'bg-red-600 text-white',
  ALTO:    'bg-orange-500 text-white',
  MÉDIO:   'bg-amber-400 text-white',
  BAIXO:   'bg-slate-400 text-white',
};

export default function PlanoMelhoriaCicloAtual() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPilar, setFilterPilar] = useState('todos');

  const pilares = ['todos', ...Array.from(new Set(ciclo11Items.map(i => i.pilar)))];

  const items = ciclo11Items.filter(item => {
    const matchSearch = !search || `${item.titulo} ${item.modulo} ${item.descricao}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || item.status === filterStatus;
    const matchPilar = filterPilar === 'todos' || item.pilar === filterPilar;
    return matchSearch && matchStatus && matchPilar;
  });

  const concluidos = ciclo11Items.filter(i => i.status === 'concluido').length;
  const emExec = ciclo11Items.filter(i => i.status === 'em_execucao').length;
  const planejados = ciclo11Items.filter(i => i.status === 'planejado').length;
  const pct = Math.round((concluidos / ciclo11Items.length) * 100);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Ciclo 20 — Fevereiro 2027</CardTitle>
            <Badge className="bg-blue-600 text-white">{pct}% concluído</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{concluidos}</p>
              <p className="text-xs text-emerald-600 font-medium">Concluídos</p>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{emExec}</p>
              <p className="text-xs text-blue-600 font-medium">Em execução</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{planejados}</p>
              <p className="text-xs text-slate-600 font-medium">Planejados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <Input className="pl-8" placeholder="Buscar item..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="concluido">✅ Concluído</SelectItem>
            <SelectItem value="em_execucao">🔄 Em execução</SelectItem>
            <SelectItem value="planejado">📅 Planejado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPilar} onValueChange={setFilterPilar}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Pilar" /></SelectTrigger>
          <SelectContent>
            {pilares.map(p => <SelectItem key={p} value={p}>{p === 'todos' ? 'Todos pilares' : p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline">{items.length} item(s)</Badge>
      </div>

      {/* Lista de itens */}
      <div className="space-y-2">
        {items.map((item) => {
          const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.planejado;
          return (
            <Card key={item.id} className={`transition-shadow hover:shadow-md ${item.status === 'concluido' ? 'border-emerald-200' : item.status === 'em_execucao' ? 'border-blue-200' : 'border-slate-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{item.titulo}</span>
                      <Badge className={`text-[10px] ${PRIOR_CONFIG[item.prioridade]}`}>{item.prioridade}</Badge>
                      <Badge className={`text-[10px] ${statusCfg.cls}`}>{statusCfg.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-1.5">
                      <span>📦 {item.modulo}</span>
                      <span>🎯 {item.pilar}</span>
                      <span>⚡ Impacto: {item.impacto}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.descricao}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.status === 'concluido'
                      ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      : item.status === 'em_execucao'
                        ? <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
                        : <Clock className="w-6 h-6 text-slate-400" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}