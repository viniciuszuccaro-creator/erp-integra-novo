import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { melhoriaPlanPhases, ciclo11Items, ciclo12Items, ciclo13Items, ciclo14Items } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

// Componentes focados
import PlanoMelhoriaVisaoGeral from '@/components/sistema/plano-melhoria/PlanoMelhoriaVisaoGeral';
import PlanoMelhoriaCicloAtual from '@/components/sistema/plano-melhoria/PlanoMelhoriaCicloAtual';
import PlanoMelhoriaSprintBoard from '@/components/sistema/plano-melhoria/PlanoMelhoriaSprintBoard';
import PlanoMelhoriaRoadmapView from '@/components/sistema/plano-melhoria/PlanoMelhoriaRoadmapView';
import PlanoMelhoriaGapsAnalise from '@/components/sistema/plano-melhoria/PlanoMelhoriaGapsAnalise';
import PlanoMelhoriaLiveBacklog from '@/components/sistema/plano-melhoria/PlanoMelhoriaLiveBacklog';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';

import {
  LayoutDashboard, Rocket, MapPin, AlertTriangle, Database, Shield, TrendingUp
} from 'lucide-react';

export default function PlanoMelhoria() {
  const [tab, setTab] = useState('visao-geral');

  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );
  // Ciclo atual = Ciclo 14
  const cicloAtualItems = ciclo14Items;
  const concluidos = cicloAtualItems.filter(i => i.status === 'concluido').length;
  const total = cicloAtualItems.length;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {/* Header compacto */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900 p-5 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <TrendingUp className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black">Plano de Melhorias</h1>
          <p className="text-blue-200 text-sm">ERP Zuccaro V21.5 — Melhoria contínua · Ciclo 11 · Maio 2026</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-500 text-white text-sm px-3 py-1">{totalProgress}% plano geral</Badge>
          <Badge className="bg-blue-500 text-white text-sm px-3 py-1">{concluidos}/{total} ciclo atual</Badge>
        </div>
      </div>

      {/* Abas */}
      <Tabs value={tab} onValueChange={setTab} className="w-full flex-1">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto min-w-max gap-1 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="visao-geral" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-3.5 h-3.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="ciclo-atual" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Rocket className="w-3.5 h-3.5" /> Ciclo Atual
              <Badge className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1">{concluidos}/{total}</Badge>
            </TabsTrigger>
            <TabsTrigger value="backlog" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Database className="w-3.5 h-3.5" /> Backlog Vivo
            </TabsTrigger>
            <TabsTrigger value="analise" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <AlertTriangle className="w-3.5 h-3.5" /> Análise de Gaps
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MapPin className="w-3.5 h-3.5" /> Roadmap
            </TabsTrigger>
            <TabsTrigger value="governanca" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-3.5 h-3.5" /> Governança
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visao-geral" className="mt-4 w-full">
          <PlanoMelhoriaVisaoGeral />
        </TabsContent>

        <TabsContent value="ciclo-atual" className="mt-4 w-full space-y-4">
          <PlanoMelhoriaSprintBoard />
          <PlanoMelhoriaCicloAtual />
        </TabsContent>

        <TabsContent value="backlog" className="mt-4 w-full">
          <PlanoMelhoriaLiveBacklog />
        </TabsContent>

        <TabsContent value="analise" className="mt-4 w-full">
          <PlanoMelhoriaGapsAnalise />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4 w-full">
          <PlanoMelhoriaRoadmapView />
        </TabsContent>

        <TabsContent value="governanca" className="mt-4 w-full">
          <PlanoMelhoriaGovernanca />
        </TabsContent>
      </Tabs>
    </div>
  );
}