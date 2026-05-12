import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Rocket, ShieldCheck } from 'lucide-react';
import CriticalModuleExecutionCard from './CriticalModuleExecutionCard';
import CriticalValidationRail from './CriticalValidationRail';
import { criticalPriorityModules } from './criticalPriorityData';

export default function PlanoMelhoriaCriticalCommandCenter() {
  const average = Math.round(criticalPriorityModules.reduce((sum, item) => sum + item.progress, 0) / criticalPriorityModules.length);

  return (
    <section className="flex h-full w-full flex-col gap-4">
      <Card className="w-full overflow-hidden border-red-100 bg-gradient-to-r from-red-50 via-white to-blue-50 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-100 p-3 text-red-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">Prioridade crítica • melhoria completa</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Centro de execução crítica</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Consolidação dos módulos que sustentam operação, caixa, estoque, pedido e segurança, sempre com multiempresa, acesso, auditoria, IA e performance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white bg-white/80 p-3 text-center shadow-sm">
              <Rocket className="mx-auto h-4 w-4 text-blue-600" />
              <p className="mt-1 text-xl font-bold text-slate-900">{average}%</p>
              <p className="text-xs text-slate-500">maturidade crítica</p>
            </div>
            <div className="rounded-xl border border-white bg-white/80 p-3 text-center shadow-sm">
              <ShieldCheck className="mx-auto h-4 w-4 text-emerald-600" />
              <p className="mt-1 text-xl font-bold text-slate-900">6</p>
              <p className="text-xs text-slate-500">controles padrão</p>
            </div>
            <div className="rounded-xl border border-white bg-white/80 p-3 text-center shadow-sm col-span-2 sm:col-span-1">
              <AlertTriangle className="mx-auto h-4 w-4 text-red-600" />
              <p className="mt-1 text-xl font-bold text-slate-900">{criticalPriorityModules.length}</p>
              <p className="text-xs text-slate-500">módulos críticos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CriticalValidationRail />

      <div className="grid w-full gap-4 xl:grid-cols-2">
        {criticalPriorityModules.map((item) => (
          <CriticalModuleExecutionCard key={item.module} item={item} />
        ))}
      </div>
    </section>
  );
}