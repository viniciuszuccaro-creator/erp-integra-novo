import React, { useState } from 'react';
import { AlertTriangle, Shield, Zap, TrendingUp, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import usePermissions from '@/components/lib/usePermissions';
import RiskAssessmentPanel from './panels/RiskAssessmentPanel';
import SupplierHealthPanel from './panels/SupplierHealthPanel';
import ContinuityPlanningPanel from './panels/ContinuityPlanningPanel';
import ContingencyScenarioPanel from './panels/ContingencyScenarioPanel';
import ResilienceMetricsPanel from './panels/ResilienceMetricsPanel';

export default function SupplyChainResilienceHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('risco');

  if (!hasPermission('Compras', null, 'ver') && !hasPermission('Expedição', null, 'ver')) {
    return (
      <Card className="bg-red-50 border-red-300 w-full h-full">
        <CardHeader>
          <CardTitle className="text-red-900">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-red-800">
          Você não tem permissão para acessar o Supply Chain Resilience Hub.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Supply Chain Resilience</h1>
            <p className="text-sm text-slate-600 mt-1">Gestão de Riscos & Continuidade da Cadeia</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-xs font-semibold text-orange-700">⚠ 3 Alertas</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-700">🤖 IA Ativa</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
            <CardContent className="pt-4">
              <p className="text-xs text-orange-700 font-medium">Risco Geral</p>
              <p className="text-2xl font-bold text-orange-900">MÉDIO</p>
              <p className="text-xs text-orange-600 mt-1">↓ 15% vs mês anterior</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-xs text-red-700 font-medium">Fornecedores em Risco</p>
              <p className="text-2xl font-bold text-red-900">4</p>
              <p className="text-xs text-red-600 mt-1">Crítico: 1</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-200">
            <CardContent className="pt-4">
              <p className="text-xs text-cyan-700 font-medium">Índice Resiliência</p>
              <p className="text-2xl font-bold text-cyan-900">78%</p>
              <p className="text-xs text-cyan-600 mt-1">Aceitável</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="pt-4">
              <p className="text-xs text-emerald-700 font-medium">Planos Ativados</p>
              <p className="text-2xl font-bold text-emerald-900">2</p>
              <p className="text-xs text-emerald-600 mt-1">1 em execução</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start px-6 py-3 rounded-none border-b border-slate-200 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="risco" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Avaliação de Riscos
            </TabsTrigger>
            <TabsTrigger value="saude" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Saúde Fornecedores
            </TabsTrigger>
            <TabsTrigger value="continuidade" className="gap-2">
              <Shield className="w-4 h-4" />
              Planejamento Continuidade
            </TabsTrigger>
            <TabsTrigger value="contingencia" className="gap-2">
              <Zap className="w-4 h-4" />
              Cenários Contingência
            </TabsTrigger>
            <TabsTrigger value="metricas" className="gap-2">
              <Brain className="w-4 h-4" />
              Métricas Resiliência (IA)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risco" className="flex-1 overflow-auto p-6">
            <RiskAssessmentPanel />
          </TabsContent>

          <TabsContent value="saude" className="flex-1 overflow-auto p-6">
            <SupplierHealthPanel />
          </TabsContent>

          <TabsContent value="continuidade" className="flex-1 overflow-auto p-6">
            <ContinuityPlanningPanel />
          </TabsContent>

          <TabsContent value="contingencia" className="flex-1 overflow-auto p-6">
            <ContingencyScenarioPanel />
          </TabsContent>

          <TabsContent value="metricas" className="flex-1 overflow-auto p-6">
            <ResilienceMetricsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}