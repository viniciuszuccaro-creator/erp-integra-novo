import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { planoModuleSprints } from './planoExecucaoData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const priorityClass = {
  Crítica: 'bg-red-100 text-red-700 hover:bg-red-100',
  Alta: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  Média: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
};

const statusClass = {
  'Concluído': 'bg-emerald-100 text-emerald-700',
  'Validando': 'bg-teal-100 text-teal-700',
  'Em execução': 'bg-blue-100 text-blue-700',
  'Planejado': 'bg-slate-100 text-slate-700',
};

export default function PlanoMelhoriaSprintPanel() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Sprints por módulo existente</CardTitle>
        <p className="text-sm text-slate-500">Prioridades organizadas sem apagar funcionalidades: acrescentar, reorganizar, conectar e melhorar.</p>
      </CardHeader>
      <CardContent className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3">
        {planoModuleSprints.map((sprint) => {
          const modStatus = MODULE_IMPROVEMENT_STATUS[sprint.module];
          const progress = modStatus?.progress || 80;
          return (
            <div key={sprint.module} className="flex h-full w-full flex-col rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{sprint.module}</h3>
                <div className="flex items-center gap-1.5">
                  <Badge className={statusClass[sprint.status] || statusClass.Planejado}>{sprint.status}</Badge>
                  <Badge className={priorityClass[sprint.priority] || priorityClass.Média}>{sprint.priority}</Badge>
                </div>
              </div>
              <p className="flex-1 text-sm leading-5 text-slate-600 mb-3">{sprint.focus}</p>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs font-bold text-slate-700 w-10 text-right">{progress}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs text-slate-500">
                <span>{sprint.owner}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}