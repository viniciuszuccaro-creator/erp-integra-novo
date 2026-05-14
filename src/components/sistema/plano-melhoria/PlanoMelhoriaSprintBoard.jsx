import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ciclo15Items, ciclo16Items } from './melhoriaPlanData';
import { Zap } from 'lucide-react';

const COLS = [
  { key: 'planejado',   label: '📅 Planejado',   cls: 'bg-slate-50  border-slate-200',   header: 'bg-slate-100  text-slate-700' },
  { key: 'em_execucao', label: '🔄 Em Execução', cls: 'bg-blue-50   border-blue-200',    header: 'bg-blue-600   text-white' },
  { key: 'concluido',   label: '✅ Concluído',   cls: 'bg-emerald-50 border-emerald-200', header: 'bg-emerald-600 text-white' },
];

const PRIOR_CLS = {
  CRÍTICO: 'bg-red-100 text-red-700',
  ALTO:    'bg-orange-100 text-orange-700',
  MÉDIO:   'bg-amber-100 text-amber-700',
  BAIXO:   'bg-slate-100 text-slate-600',
};

export default function PlanoMelhoriaSprintBoard() {
  const [cicloView, setCicloView] = useState('c16');
  const activeItems = cicloView === 'c16' ? ciclo16Items : ciclo15Items;
  const cicloLabel = cicloView === 'c16' ? 'Ciclo 16 — Outubro 2026' : 'Ciclo 15 — Setembro 2026';

  const byStatus = COLS.reduce((acc, col) => {
    acc[col.key] = activeItems.filter(i => i.status === col.key);
    return acc;
  }, {});

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Zap className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900">Sprint Board — {cicloLabel}</h3>
        <Badge className="bg-blue-600 text-white">{activeItems.length} itens</Badge>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setCicloView('c15')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${cicloView === 'c15' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            Ciclo 15
          </button>
          <button
            onClick={() => setCicloView('c16')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${cicloView === 'c16' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            Ciclo 16 ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map((col) => {
          const colItems = byStatus[col.key] || [];
          return (
            <div key={col.key} className={`rounded-xl border-2 ${col.cls}`}>
              <div className={`rounded-t-lg px-4 py-2.5 flex items-center justify-between ${col.header}`}>
                <span className="font-semibold text-sm">{col.label}</span>
                <Badge className="bg-white/20 text-inherit text-xs">{colItems.length}</Badge>
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {colItems.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-6">Nenhum item</div>
                )}
                {colItems.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-slate-900 leading-snug mb-1.5">{item.titulo}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-[9px] ${PRIOR_CLS[item.prioridade] || PRIOR_CLS.BAIXO}`}>{item.prioridade}</Badge>
                      <Badge variant="outline" className="text-[9px]">{item.modulo}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}