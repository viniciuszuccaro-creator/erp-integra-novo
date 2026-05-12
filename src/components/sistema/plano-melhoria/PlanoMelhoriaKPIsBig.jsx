import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, CheckCircle2, Bot, Building2, Shield, Zap, Rocket, BarChart3, Network } from 'lucide-react';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';
import { melhoriaPlanPhases } from './melhoriaPlanData';

const PILARES = [
  { key: 'multiempresa', label: 'Multiempresa', valor: 99, icon: Building2, cor: 'blue' },
  { key: 'rbac', label: 'RBAC + SoD', valor: 99, icon: Shield, cor: 'slate' },
  { key: 'ia', label: 'IA Operacional', valor: 99, icon: Bot, cor: 'purple' },
  { key: 'performance', label: 'Performance', valor: 98, icon: Zap, cor: 'amber' },
  { key: 'auditoria', label: 'Auditoria', valor: 99, icon: CheckCircle2, cor: 'emerald' },
  { key: 'modularizacao', label: 'Modularização', valor: 99, icon: BarChart3, cor: 'cyan' },
  { key: 'integracoes', label: 'Integrações', valor: 98, icon: Network, cor: 'indigo' },
  { key: 'ux', label: 'UX Responsiva', valor: 98, icon: TrendingUp, cor: 'rose' },
];

const corMap = {
  blue: 'bg-blue-600', slate: 'bg-slate-700', purple: 'bg-purple-600',
  amber: 'bg-amber-500', emerald: 'bg-emerald-600', cyan: 'bg-cyan-600',
  indigo: 'bg-indigo-600', rose: 'bg-rose-600',
};
const textCorMap = {
  blue: 'text-blue-700', slate: 'text-slate-700', purple: 'text-purple-700',
  amber: 'text-amber-700', emerald: 'text-emerald-700', cyan: 'text-cyan-700',
  indigo: 'text-indigo-700', rose: 'text-rose-700',
};

export default function PlanoMelhoriaKPIsBig() {
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const totalProgress = Math.round(melhoriaPlanPhases.reduce((s, p) => s + p.progress, 0) / melhoriaPlanPhases.length);
  const modulosTop = moduleEntries.filter(([, v]) => v.progress >= 97).length;
  const fasesConcluidas = melhoriaPlanPhases.filter(p => p.progress >= 95).length;

  return (
    <div className="w-full space-y-4">
      {/* Big KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
            <p className="text-4xl font-black text-emerald-700">{totalProgress}%</p>
            <p className="text-xs text-emerald-600 mt-0.5">Plano geral</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="mx-auto mb-1 h-5 w-5 text-blue-600" />
            <p className="text-4xl font-black text-blue-700">{avgModule}%</p>
            <p className="text-xs text-blue-600 mt-0.5">Módulos médio</p>
          </CardContent>
        </Card>
        <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-purple-600" />
            <p className="text-4xl font-black text-purple-700">{modulosTop}/{moduleEntries.length}</p>
            <p className="text-xs text-purple-600 mt-0.5">Módulos ≥97%</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <Rocket className="mx-auto mb-1 h-5 w-5 text-amber-600" />
            <p className="text-4xl font-black text-amber-700">{fasesConcluidas}/{melhoriaPlanPhases.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">Fases ≥95%</p>
          </CardContent>
        </Card>
      </div>

      {/* Pilares */}
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Scores por pilar — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
            {PILARES.map((pilar) => {
              const Icon = pilar.icon;
              return (
                <div key={pilar.key} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${corMap[pilar.cor]} text-white shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-tight">{pilar.label}</span>
                  </div>
                  <Progress value={pilar.valor} className="h-1.5" />
                  <span className={`text-lg font-black ${textCorMap[pilar.cor]}`}>{pilar.valor}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Módulos em grade completa */}
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Maturidade por módulo ({moduleEntries.length} módulos)</p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {moduleEntries.map(([name, { progress, focus }]) => (
              <div key={name} className={`rounded-xl border p-3 ${progress >= 99 ? 'border-emerald-200 bg-emerald-50/70' : progress >= 97 ? 'border-blue-100 bg-blue-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
                <div className="mb-1.5 flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 text-sm">{name}</span>
                  <Badge className={progress >= 99 ? 'bg-emerald-600 text-white text-xs' : progress >= 97 ? 'bg-blue-100 text-blue-700 text-xs' : 'bg-amber-100 text-amber-700 text-xs'}>
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5 mb-1.5" />
                <p className="text-xs text-slate-500 leading-3.5 line-clamp-2">{focus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}