import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Link2, Brain, Settings } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import OperationsKPIBar from './OperationsKPIBar';
import RealtimeOpsMonitor from './RealtimeOpsMonitor';
import ProcessAutomationCenter from './ProcessAutomationCenter';
import CrossModuleOrchestrator from './CrossModuleOrchestrator';
import PredictiveOpsEngine from './PredictiveOpsEngine';

export default function SmartOperationsHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('realtime');

  const canAccess = hasPermission('Dashboard', null, 'ver') || hasPermission('Comercial', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Permissão insuficiente para o Smart Operations Hub.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-cyan-400" />
              Smart Operations Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Monitoramento Real-time • Automação de Processos • Orquestração Multi-Módulo • IA Preditiva
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-200 animate-pulse">● Sistema Operacional</Badge>
            <Badge className="bg-purple-900 text-purple-200">IA v3.1</Badge>
          </div>
        </div>
        {/* KPI Bar */}
        <OperationsKPIBar />
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="realtime" className="data-[state=active]:bg-emerald-700 text-xs">
              <Activity className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Realtime</span>
            </TabsTrigger>
            <TabsTrigger value="automacoes" className="data-[state=active]:bg-blue-700 text-xs">
              <Zap className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Automações</span>
            </TabsTrigger>
            <TabsTrigger value="orquestrador" className="data-[state=active]:bg-cyan-700 text-xs">
              <Link2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Orquestrador</span>
            </TabsTrigger>
            <TabsTrigger value="preditivo" className="data-[state=active]:bg-purple-700 text-xs">
              <Brain className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Preditivo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="m-0">
            <RealtimeOpsMonitor />
          </TabsContent>
          <TabsContent value="automacoes" className="m-0">
            <ProcessAutomationCenter />
          </TabsContent>
          <TabsContent value="orquestrador" className="m-0">
            <CrossModuleOrchestrator />
          </TabsContent>
          <TabsContent value="preditivo" className="m-0">
            <PredictiveOpsEngine />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}