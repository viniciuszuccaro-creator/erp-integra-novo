import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, Eye, Activity } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import RealtimeAnomalyMonitor from './RealtimeAnomalyMonitor';
import AlertOrchestration from './AlertOrchestration';
import AutonomousActionRecommender from './AutonomousActionRecommender';
import HealthScoreEngine from './HealthScoreEngine';

export default function ExecutiveMonitoringHub() {
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [activeTab, setActiveTab] = useState('monitoramento');

  if (!hasPermission('Dashboard', null, 'visualizar')) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <p className="text-white font-semibold">Acesso Negado</p>
          <p className="text-slate-400 text-sm">Apenas Executivos e Diretoria podem acessar este hub.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-red-400" />
            Executive Monitoring & Real-time Alerts
          </h1>
          <p className="text-slate-400 text-sm mt-1">Vigilância em tempo real, alertas inteligentes, ações autônomas e score consolidado</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-red-900 text-red-200 animate-pulse">🔴 Ao Vivo</Badge>
          <Badge className="bg-blue-900 text-blue-200">V43.0</Badge>
          <Badge className="bg-emerald-900 text-emerald-200">Multi-empresa</Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Status Geral</p>
            <p className="text-lg font-bold text-yellow-400">⚠️ ATENÇÃO</p>
            <p className="text-xs text-yellow-400">3 alertas críticos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Anomalias Ativas</p>
            <p className="text-lg font-bold text-orange-400">7</p>
            <p className="text-xs text-orange-400">2 urgentes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Ações Recomendadas</p>
            <p className="text-lg font-bold text-blue-400">5</p>
            <p className="text-xs text-blue-400">Impacto: R$ 1.2M</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Score Saúde</p>
            <p className="text-lg font-bold text-emerald-400">7.8/10</p>
            <p className="text-xs text-green-400">↑ Melhorando</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Tempo Resposta</p>
            <p className="text-lg font-bold text-purple-400">4.2min</p>
            <p className="text-xs text-purple-400">Dentro do SLA</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="monitoramento" className="text-xs flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="alertas" className="text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="acoes" className="text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Ações
          </TabsTrigger>
          <TabsTrigger value="saude" className="text-xs">Score Saúde</TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="monitoramento" className="w-full h-full">
            <RealtimeAnomalyMonitor />
          </TabsContent>
          <TabsContent value="alertas" className="w-full h-full">
            <AlertOrchestration />
          </TabsContent>
          <TabsContent value="acoes" className="w-full h-full">
            <AutonomousActionRecommender />
          </TabsContent>
          <TabsContent value="saude" className="w-full h-full">
            <HealthScoreEngine />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}