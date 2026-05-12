import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, ShieldCheck } from 'lucide-react';

export default function PlanoMelhoriaHeader({ totalProgress }) {
  return (
    <Card className="w-full overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/10 text-white hover:bg-white/10">
              Regra-Mãe • Acrescentar • Reorganizar • Conectar • Melhorar
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Plano de Melhoria Contínua</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100 md:text-base">
                Central executiva para evoluir os módulos existentes com multiempresa, controle de acesso, IA, performance, responsividade e governança sem apagar funcionalidades.
              </p>
            </div>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Rocket className="mb-3 h-6 w-6 text-cyan-200" />
              <p className="text-3xl font-black">{totalProgress}%</p>
              <p className="text-xs text-blue-100">avanço geral</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mb-3 h-6 w-6 text-emerald-200" />
              <p className="text-3xl font-black">10</p>
              <p className="text-xs text-blue-100">frentes ativas</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur col-span-2">
              <p className="text-xs text-blue-200 mb-1 font-semibold uppercase tracking-wide">Módulos com IA ativa</p>
              <p className="text-3xl font-black">17</p>
              <p className="text-xs text-blue-100">módulos × pilares executados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}