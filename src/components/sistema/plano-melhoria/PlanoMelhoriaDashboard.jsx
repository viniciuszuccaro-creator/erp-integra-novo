import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Rocket, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

export default function PlanoMelhoriaDashboard() {
  const phases = melhoriaPlanPhases;
  const totalProgress = Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length);
  const concluidos = phases.filter(p => p.progress >= 100).length;
  const emExecucao = phases.filter(p => p.progress >= 70 && p.progress < 100).length;

  const modules = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(modules.reduce((s, [, v]) => s + v.progress, 0) / modules.length);
  const top3 = [...modules].sort((a, b) => b[1].progress - a[1].progress).slice(0, 3);
  const gap3 = [...modules].sort((a, b) => a[1].progress - b[1].progress).slice(0, 3);

  const stats = [
    { label: 'Progresso geral', value: `${totalProgress}%`, icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Fases concluídas', value: `${concluidos}/${phases.length}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Em execução', value: `${emExecucao}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Módulos avg', value: `${avgModule}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="w-full">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall progress */}
      <Card className="w-full">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-900">Progresso consolidado do Plano de Melhoria</span>
            </div>
            <Badge className="bg-blue-600 text-white text-base px-3 py-1">{totalProgress}%</Badge>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            {phases.slice(0, 10).map((phase) => (
              <div key={phase.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-slate-600 font-medium">{phase.title.split(' ')[0]}</span>
                  <span className="font-bold text-slate-800">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top / Gap modules */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">Módulos mais maduros</span>
            </div>
            <div className="flex flex-col gap-3">
              {top3.map(([name, info]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-800">{name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800">{info.progress}%</Badge>
                  </div>
                  <Progress value={info.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-slate-900">Módulos com maior oportunidade</span>
            </div>
            <div className="flex flex-col gap-3">
              {gap3.map(([name, info]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-800">{name}</span>
                    <Badge className="bg-amber-100 text-amber-800">{info.progress}%</Badge>
                  </div>
                  <Progress value={info.progress} className="h-1.5" />
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{info.focus}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}