import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, ShieldCheck, Bot, Building2, Gauge, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

export default function PlanoMelhoriaHeader({ totalProgress }) {
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const fasesConcluidas = melhoriaPlanPhases.filter(p => p.progress >= 95).length;
  const modulosTop = moduleEntries.filter(([, v]) => v.progress >= 95).length;

  return (
    <Card className="w-full overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <Badge className="w-fit bg-white/10 text-white hover:bg-white/10">
              Regra-Mãe • Acrescentar • Reorganizar • Conectar • Melhorar
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Plano de Melhoria Contínua</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100 md:text-base">
                Central executiva para evoluir os módulos existentes com multiempresa, controle de acesso, IA, performance, responsividade e governança sem apagar funcionalidades. Ciclos contínuos de inovação futurista.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">✅ Multiempresa 97%</Badge>
              <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30">🔒 RBAC + SoD ativo</Badge>
              <Badge className="bg-purple-500/20 text-purple-200 border border-purple-500/30">🤖 12 painéis IA</Badge>
              <Badge className="bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">⚡ Cache IDB offline</Badge>
              <Badge className="bg-rose-500/20 text-rose-200 border border-rose-500/30">🔐 LGPD + piiEncryptor</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:min-w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Rocket className="mb-2 h-5 w-5 text-cyan-200" />
              <p className="text-3xl font-black">{totalProgress}%</p>
              <p className="text-xs text-blue-100">avanço geral</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Bot className="mb-2 h-5 w-5 text-purple-200" />
              <p className="text-3xl font-black">{avgModule}%</p>
              <p className="text-xs text-blue-100">módulos médio</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-200" />
              <p className="text-3xl font-black">{fasesConcluidas}<span className="text-lg font-bold text-blue-200">/{melhoriaPlanPhases.length}</span></p>
              <p className="text-xs text-blue-100">fases ≥95%</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Zap className="mb-2 h-5 w-5 text-amber-200" />
              <p className="text-3xl font-black">{modulosTop}<span className="text-lg font-bold text-blue-200">/{moduleEntries.length}</span></p>
              <p className="text-xs text-blue-100">módulos ≥95%</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mb-2 h-5 w-5 text-emerald-200" />
              <p className="text-2xl font-black">Regra-Mãe ativa</p>
              <p className="text-xs text-blue-100 mt-0.5">10 frentes • 15 módulos • 12 automações IA • Ciclos contínuos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}