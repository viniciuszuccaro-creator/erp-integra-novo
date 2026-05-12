import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';
import { CheckCircle2, TrendingUp, Zap, Bot, ShieldCheck, Building2, Gauge, Sparkles } from 'lucide-react';

export default function PlanoMelhoriaKPIsGlobais() {
  const totalProgress = Math.round(melhoriaPlanPhases.reduce((s, p) => s + p.progress, 0) / melhoriaPlanPhases.length);
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const fasesConcluidas = melhoriaPlanPhases.filter(p => p.progress >= 95).length;
  const modulosTop = moduleEntries.filter(([, v]) => v.progress >= 95).length;

  const kpis = [
    { label: 'Plano geral', value: `${totalProgress}%`, sub: `${fasesConcluidas}/${melhoriaPlanPhases.length} fases ≥95%`, icon: TrendingUp, color: 'from-blue-600 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', progress: totalProgress },
    { label: 'Módulos médio', value: `${avgModule}%`, sub: `${modulosTop} módulos ≥95%`, icon: Zap, color: 'from-violet-600 to-purple-500', bg: 'from-violet-50 to-purple-50', border: 'border-violet-100', progress: avgModule },
    { label: 'IA operacional', value: '12', sub: 'Painéis IA em produção', icon: Bot, color: 'from-purple-600 to-indigo-500', bg: 'from-purple-50 to-indigo-50', border: 'border-purple-100', progress: 96 },
    { label: 'Multiempresa', value: '97%', sub: 'Cobertura group/empresa', icon: Building2, color: 'from-indigo-600 to-blue-500', bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-100', progress: 97 },
    { label: 'Controle acesso', value: '93%', sub: 'RBAC + SoD + entityGuard', icon: ShieldCheck, color: 'from-slate-700 to-slate-500', bg: 'from-slate-50 to-gray-50', border: 'border-slate-200', progress: 93 },
    { label: 'Performance', value: '92%', sub: 'Cache IDB + prefetch + opt.', icon: Gauge, color: 'from-emerald-600 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', progress: 92 },
    { label: 'UX responsiva', value: '92%', sub: 'w-full/h-full + multitarefa', icon: Sparkles, color: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', progress: 92 },
    { label: 'Governança', value: '95%', sub: 'AuditLog + LGPD + backup', icon: CheckCircle2, color: 'from-rose-600 to-red-500', bg: 'from-rose-50 to-red-50', border: 'border-rose-100', progress: 95 },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 w-full">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className={`border ${kpi.border} bg-gradient-to-br ${kpi.bg}`}>
            <CardContent className="p-4">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${kpi.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-xs font-semibold text-slate-700">{kpi.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-3">{kpi.sub}</p>
              <Progress value={kpi.progress} className="mt-2 h-1" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}