import React, { useState } from 'react';
import { BarChart3, Zap, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePermissions from '@/components/lib/usePermissions';
import AIDecisionEngine from './AIDecisionEngine';
import PredictiveAnalyticsPanel from './PredictiveAnalyticsPanel';
import AutomationOrchestrator from './AutomationOrchestrator';

export default function AutonomousIntelligenceHub() {
  const { hasPermission, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('engine');

  if (!hasPermission('Dashboard', null, 'ver') && !isAdmin()) {
    return (
      <div className="p-8 text-center text-slate-600">
        Acesso negado. Autonomous Intelligence Engine requer permissões elevadas.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Autonomous Intelligence Engine</h1>
          <p className="text-slate-400 text-sm">IA Generativa • Análise Preditiva • Automação Inteligente</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="engine" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Motor IA</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Preditivo</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Automação</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engine" className="w-full">
          <AIDecisionEngine />
        </TabsContent>

        <TabsContent value="predictive" className="w-full">
          <PredictiveAnalyticsPanel />
        </TabsContent>

        <TabsContent value="automation" className="w-full">
          <AutomationOrchestrator />
        </TabsContent>
      </Tabs>
    </div>
  );
}