import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';
import { TrendingUp, CheckCircle2, Rocket, BarChart3, Shield, Zap, Bot, Network, Building2, Sparkles, Workflow, ClipboardCheck } from 'lucide-react';

const PILARES = [
  { key: 'multiempresa', label: 'Multiempresa', valor: 99, icon: Building2, bg: 'bg-indigo-600' },
  { key: 'rbac', label: 'RBAC + SoD', valor: 100, icon: Shield, bg: 'bg-slate-700' },
  { key: 'ia', label: 'IA Operacional', valor: 99, icon: Bot, bg: 'bg-purple-600' },
  { key: 'performance', label: 'Performance', valor: 99, icon: Zap, bg: 'bg-amber-500' },
  { key: 'auditoria', label: 'Auditoria', valor: 100, icon: ClipboardCheck, bg: 'bg-emerald-600' },
  { key: 'modularizacao', label: 'Modularização', valor: 99, icon: Workflow, bg: 'bg-cyan-600' },
  { key: 'integracoes', label: 'Integrações', valor: 99, icon: Network, bg: 'bg-blue-600' },
  { key: 'ux', label: 'UX Responsiva', valor: 99, icon: Sparkles, bg: 'bg-rose-500' },
];

export default function PlanoMelhoriaVisaoGeral() {
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const totalProgress = Math.round(melhoriaPlanPhases.reduce((s, p) => s + p.progress, 0) / melhoriaPlanPhases.length);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const fasesConcluidas = melhoriaPlanPhases.filter(p => p.progress >= 95).length;
  const modulosTop = moduleEntries.filter(([, v]) => v.progress >= 97).length;

  return (
    <div className="w-full space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-6 w-6 text-emerald-600" />
            <p className="text-4xl font-black text-emerald-700">{totalProgress}%</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">Plano Geral</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="mx-auto mb-1 h-6 w-6 text-blue-600" />
            <p className="text-4xl font-black text-blue-700">{avgModule}%</p>
            <p className="text-xs text-blue-600 mt-0.5 font-medium">Média Módulos</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-purple-600" />
            <p className="text-4xl font-black text-purple-700">{modulosTop}/{moduleEntries.length}</p>
            <p className="text-xs text-purple-600 mt-0.5 font-medium">Módulos ≥97%</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <Rocket className="mx-auto mb-1 h-6 w-6 text-amber-600" />
            <p className="text-4xl font-black text-amber-700">{fasesConcluidas}/{melhoriaPlanPhases.length}</p>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">Fases ≥95%</p>
          </CardContent>
        </Card>
      </div>

      {/* Pilares */}
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">
            Scores por pilar — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
            {PILARES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.key} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${p.bg} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">{p.label}</span>
                  <Progress value={p.valor} className="h-1.5" />
                  <span className="text-xl font-black text-slate-800">{p.valor}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fases */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {melhoriaPlanPhases.map((phase) => {
          const Icon = phase.icon;
          return (
            <Card key={phase.id} className={`relative overflow-hidden ${phase.progress >= 99 ? 'border-emerald-200' : 'border-amber-200'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-5`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${phase.color} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{phase.title}</span>
                </div>
                <Progress value={phase.progress} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{phase.progress}%</span>
                  <Badge className={phase.progress >= 99 ? 'bg-emerald-100 text-emerald-700 text-[10px]' : 'bg-amber-100 text-amber-700 text-[10px]'}>
                    {phase.progress >= 99 ? '✅ Concluído' : '🔄 Em andamento'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Módulos */}
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">
            Maturidade por módulo ({moduleEntries.length} módulos)
          </p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {moduleEntries.map(([name, { progress, focus }]) => (
              <div key={name} className={`rounded-xl border p-3 ${progress >= 99 ? 'border-emerald-200 bg-emerald-50/60' : progress >= 97 ? 'border-blue-100 bg-blue-50/40' : 'border-amber-100 bg-amber-50/40'}`}>
                <div className="mb-1.5 flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 text-sm truncate">{name}</span>
                  <Badge className={`text-[10px] flex-shrink-0 ${progress >= 99 ? 'bg-emerald-600 text-white' : progress >= 97 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5 mb-1.5" />
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{focus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}