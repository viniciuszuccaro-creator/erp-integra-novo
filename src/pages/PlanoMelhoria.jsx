import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { melhoriaPlanPhases, ciclo26Items } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

// Componentes focados
import PlanoMelhoriaVisaoGeral from '@/components/sistema/plano-melhoria/PlanoMelhoriaVisaoGeral';
import PlanoMelhoriaCicloAtual from '@/components/sistema/plano-melhoria/PlanoMelhoriaCicloAtual';
import PlanoMelhoriaSprintBoard from '@/components/sistema/plano-melhoria/PlanoMelhoriaSprintBoard';
import PlanoMelhoriaRoadmapView from '@/components/sistema/plano-melhoria/PlanoMelhoriaRoadmapView';
import PlanoMelhoriaGapsAnalise from '@/components/sistema/plano-melhoria/PlanoMelhoriaGapsAnalise';
import PlanoMelhoriaLiveBacklog from '@/components/sistema/plano-melhoria/PlanoMelhoriaLiveBacklog';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';
import PlanoMelhoriaCriticalCommandCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCommandCenter';
import PlanoMelhoriaIACockpit from '@/components/sistema/plano-melhoria/PlanoMelhoriaIACockpit';
import PlanoMelhoriaModulosDashboard from '@/components/sistema/plano-melhoria/PlanoMelhoriaModulosDashboard';
import PlanoMelhoriaTimelineExecutiva from '@/components/sistema/plano-melhoria/PlanoMelhoriaTimelineExecutiva';
import PlanoMelhoriaProximasAcoes from '@/components/sistema/plano-melhoria/PlanoMelhoriaProximasAcoes';
import PlanoMelhoriaRiskPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaRiskPanel';
import PlanoMelhoriaDashboardFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaDashboardFinal';
import CicloExecucaoPanel from '@/components/sistema/plano-melhoria/CicloExecucaoPanel';

import {
  LayoutDashboard, Rocket, MapPin, AlertTriangle, Database, Shield, TrendingUp, Zap, Brain, CheckSquare, Clock
} from 'lucide-react';

export default function PlanoMelhoria() {
  const [tab, setTab] = useState('dashboard-final');

  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );
  // Ciclo atual = Ciclo 26 (Setembro 2026)
  const cicloAtualItems = ciclo26Items;
  const concluidos = cicloAtualItems.filter(i => i.status === 'concluido').length;
  const total = cicloAtualItems.length;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header compacto */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900 p-5 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <TrendingUp className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black">Plano de Melhorias</h1>
          <p className="text-blue-200 text-sm">ERP Zuccaro V26 — Melhoria contínua · Ciclo 26 · Setembro 2026</p>
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
            <TabsTrigger value="dashboard-final" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="comando-critico" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <AlertTriangle className="w-3.5 h-3.5" /> Comando
            </TabsTrigger>
            <TabsTrigger value="execucao-ciclo-21" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Zap className="w-3.5 h-3.5" /> Execução
            </TabsTrigger>
            <TabsTrigger value="visao-geral" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-3.5 h-3.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="modulos" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Database className="w-3.5 h-3.5" /> Módulos
            </TabsTrigger>
            <TabsTrigger value="ciclo-atual" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Rocket className="w-3.5 h-3.5" /> Sprint
              <Badge className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1">{concluidos}/{total}</Badge>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Clock className="w-3.5 h-3.5" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="backlog" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CheckSquare className="w-3.5 h-3.5" /> Backlog
            </TabsTrigger>
            <TabsTrigger value="ia-cockpit" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Brain className="w-3.5 h-3.5" /> IA
            </TabsTrigger>
            <TabsTrigger value="riscos" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Shield className="w-3.5 h-3.5" /> Riscos
            </TabsTrigger>
            <TabsTrigger value="acoes" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CheckSquare className="w-3.5 h-3.5" /> Ações
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard-final" className="mt-4 w-full">
          <PlanoMelhoriaDashboardFinal />
        </TabsContent>

        <TabsContent value="comando-critico" className="mt-4 w-full space-y-4">
          <PlanoMelhoriaCriticalCommandCenter />
          <PlanoMelhoriaProximasAcoes />
        </TabsContent>

        <TabsContent value="execucao-ciclo-21" className="mt-4 w-full">
          <CicloExecucaoPanel />
        </TabsContent>

        <TabsContent value="visao-geral" className="mt-4 w-full">
          <PlanoMelhoriaVisaoGeral />
        </TabsContent>

        <TabsContent value="modulos" className="mt-4 w-full">
          <PlanoMelhoriaModulosDashboard />
        </TabsContent>

        <TabsContent value="ciclo-atual" className="mt-4 w-full space-y-4">
          <PlanoMelhoriaSprintBoard />
          <PlanoMelhoriaCicloAtual />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4 w-full space-y-4">
          <PlanoMelhoriaTimelineExecutiva />
          <PlanoMelhoriaRoadmapView />
        </TabsContent>

        <TabsContent value="backlog" className="mt-4 w-full space-y-4">
          <PlanoMelhoriaLiveBacklog />
          <PlanoMelhoriaGapsAnalise />
        </TabsContent>

        <TabsContent value="ia-cockpit" className="mt-4 w-full">
          <PlanoMelhoriaIACockpit />
        </TabsContent>

        <TabsContent value="riscos" className="mt-4 w-full">
          <PlanoMelhoriaRiskPanel />
        </TabsContent>

        <TabsContent value="acoes" className="mt-4 w-full">
          <PlanoMelhoriaProximasAcoes />
        </TabsContent>
      </Tabs>
    </div>
  );
}