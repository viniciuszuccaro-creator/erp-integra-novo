import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, TrendingUp, Zap, Shield, Building2, Bot, Network, Gauge, Sparkles, Lock, ClipboardCheck } from 'lucide-react';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const pillarIcons = {
  estabilidade: Shield,
  multiempresa: Building2,
  acesso: Lock,
  modularizacao: Zap,
  performance: Gauge,
  ux: Sparkles,
  ia: Bot,
  integracoes: Network,
  governanca: ClipboardCheck,
};

export default function PlanoMelhoriaResumoFinal() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, p) => sum + p.progress, 0) / melhoriaPlanPhases.length
  );
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const concluidos = melhoriaPlanPhases.filter(p => p.progress >= 95).length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-black text-emerald-700">{totalProgress}%</p>
            <p className="mt-1 text-xs text-emerald-600">Plano geral</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-black text-blue-700">{avgModule}%</p>
            <p className="mt-1 text-xs text-blue-600">Módulos médio</p>
          </CardContent>
        </Card>
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-black text-violet-700">{melhoriaPlanPhases.length}</p>
            <p className="mt-1 text-xs text-violet-600">Fases no plano</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-black text-amber-700">{moduleEntries.length}</p>
            <p className="mt-1 text-xs text-amber-600">Módulos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Fases do plano com progresso visual */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Progresso de todas as fases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {melhoriaPlanPhases.map((phase) => {
              const Icon = pillarIcons[phase.id] || Zap;
              const done = phase.progress >= 95;
              return (
                <div key={phase.id} className={`rounded-xl border p-4 ${done ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? 'bg-emerald-600' : 'bg-blue-600'} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{phase.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      <Badge className={done ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                        {phase.progress}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={phase.progress} className="h-2" />
                  <p className="mt-2 text-xs text-slate-500">{phase.goal}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Módulos com progresso */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <Zap className="h-5 w-5 text-violet-600" />
            Status de maturidade por módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleEntries.map(([name, { progress, focus }]) => (
              <div key={name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{name}</span>
                  <Badge className={progress >= 95 ? 'bg-emerald-100 text-emerald-700' : progress >= 90 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5 mb-2" />
                <p className="text-xs text-slate-500 leading-4">{focus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}