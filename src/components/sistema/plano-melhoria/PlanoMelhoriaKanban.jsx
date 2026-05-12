import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, CheckCircle2, PlayCircle, Clock, Rocket } from 'lucide-react';
import { planoModuleSprints } from './planoExecucaoData';

const COLS = [
  { id: 'Planejado', label: 'Planejado', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { id: 'Em execução', label: 'Em execução', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Validando', label: 'Validando', icon: Rocket, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'Concluído', label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const priorityBadge = {
  Crítica: 'bg-red-100 text-red-700',
  Alta: 'bg-orange-100 text-orange-700',
  Média: 'bg-blue-100 text-blue-700',
};

export default function PlanoMelhoriaKanban() {
  const [items, setItems] = useState(planoModuleSprints);

  const moveItem = (module, newStatus) => {
    setItems(prev => prev.map(it => it.module === module ? { ...it, status: newStatus } : it));
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-900">Kanban do Plano de Melhoria</CardTitle>
            <p className="text-sm text-slate-500">Arraste e avance sprints por módulo de forma visual.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4">
        <div className="flex min-w-[760px] gap-4">
          {COLS.map((col) => {
            const Icon = col.icon;
            const colItems = items.filter(it => it.status === col.id);
            return (
              <div key={col.id} className={`flex flex-1 flex-col gap-3 rounded-2xl border ${col.border} ${col.bg} p-3`}>
                <div className={`flex items-center gap-2 text-sm font-semibold ${col.color}`}>
                  <Icon className="h-4 w-4" />
                  {col.label}
                  <Badge variant="outline" className="ml-auto text-xs">{colItems.length}</Badge>
                </div>
                {colItems.map((sprint) => (
                  <div key={sprint.module} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{sprint.module}</span>
                      <Badge className={`text-xs ${priorityBadge[sprint.priority] || priorityBadge.Média}`}>{sprint.priority}</Badge>
                    </div>
                    <p className="mb-3 text-xs leading-5 text-slate-600 line-clamp-2">{sprint.focus}</p>
                    <div className="flex flex-wrap gap-1">
                      {COLS.filter(c => c.id !== sprint.status).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => moveItem(sprint.module, c.id)}
                          className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${c.bg} ${c.color} border ${c.border} hover:opacity-80`}
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Nenhum sprint aqui
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}