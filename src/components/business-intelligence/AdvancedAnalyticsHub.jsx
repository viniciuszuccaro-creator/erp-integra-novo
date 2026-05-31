import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import ConsolidatedDashboard from './ConsolidatedDashboard';
import PredictiveIntelligence from './PredictiveIntelligence';
import BusinessMetricsPanel from './BusinessMetricsPanel';
import DataVisualizationEngine from './DataVisualizationEngine';

export default function AdvancedAnalyticsHub() {
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [activeTab, setActiveTab] = useState('consolidado');

  // RBAC Check: Executivos/Diretoria apenas
  if (!hasPermission('Dashboard', null, 'visualizar') && !hasPermission('Financeiro', null, 'visualizar')) {
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
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Business Intelligence Consolidado
          </h1>
          <p className="text-slate-400 text-sm mt-1">Análises preditivas, métricas cross-funcional e recomendações estratégicas</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-900 text-blue-200">V42.0</Badge>
          <Badge className="bg-emerald-900 text-emerald-200">Multi-empresa</Badge>
          {contexto === 'grupo' && grupoAtual && (
            <Badge className="bg-purple-900 text-purple-200">Grupo: {grupoAtual.nome_do_grupo?.substring(0, 20)}</Badge>
          )}
          {contexto !== 'grupo' && empresaAtual && (
            <Badge className="bg-purple-900 text-purple-200">{empresaAtual.nome_fantasia?.substring(0, 20)}</Badge>
          )}
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Saúde Geral</p>
            <p className="text-lg font-bold text-emerald-400">87%</p>
            <p className="text-xs text-green-400">↑ +5%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Anomalias Detectadas</p>
            <p className="text-lg font-bold text-orange-400">4</p>
            <p className="text-xs text-orange-400">2 críticas</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Recomendações IA</p>
            <p className="text-lg font-bold text-blue-400">12</p>
            <p className="text-xs text-blue-400">Impacto: R$ 2.1M</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Confiança IA</p>
            <p className="text-lg font-bold text-purple-400">94%</p>
            <p className="text-xs text-purple-400">Excelente</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Score de Risco</p>
            <p className="text-lg font-bold text-red-400">4.9/10</p>
            <p className="text-xs text-yellow-400">Monitorando</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="consolidado" className="text-xs">Dashboard Consolidado</TabsTrigger>
          <TabsTrigger value="previsoes" className="text-xs">Análises Preditivas</TabsTrigger>
          <TabsTrigger value="metricas" className="text-xs">Métricas de Negócio</TabsTrigger>
          <TabsTrigger value="visualizacao" className="text-xs">Visualizações</TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="consolidado" className="w-full h-full">
            <ConsolidatedDashboard />
          </TabsContent>
          <TabsContent value="previsoes" className="w-full h-full">
            <PredictiveIntelligence />
          </TabsContent>
          <TabsContent value="metricas" className="w-full h-full">
            <BusinessMetricsPanel />
          </TabsContent>
          <TabsContent value="visualizacao" className="w-full h-full">
            <DataVisualizationEngine />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}