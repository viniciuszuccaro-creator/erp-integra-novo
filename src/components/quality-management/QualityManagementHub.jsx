import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, BarChart3, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import usePermissions from '@/components/lib/usePermissions';
import QualityRealtimePanel from './panels/QualityRealtimePanel';
import InspecaoAuditoriaPanel from './panels/InspecaoAuditoriaPanel';
import NaoConformidadePanel from './panels/NaoConformidadePanel';
import MelhoriasContinuasPanel from './panels/MelhoriasContinuasPanel';
import AnaliseDefeitosPanel from './panels/AnaliseDefeitosPanel';

export default function QualityManagementHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('realtime');

  if (!hasPermission('Producao', null, 'ver')) {
    return (
      <Card className="bg-red-50 border-red-300 w-full h-full">
        <CardHeader>
          <CardTitle className="text-red-900">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-red-800">
          Você não tem permissão para acessar o Quality Management Hub.
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
            <h1 className="text-3xl font-bold text-slate-900">Quality Management</h1>
            <p className="text-sm text-slate-600 mt-1">Gestão Integrada de Qualidade & Processos</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700">✓ Sistema Ativo</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-700">🤖 IA Habilitada</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="pt-4">
              <p className="text-xs text-emerald-700 font-medium">Taxa Conformidade</p>
              <p className="text-2xl font-bold text-emerald-900">96.8%</p>
              <p className="text-xs text-emerald-600 mt-1">↑ 2.3% vs mês anterior</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-200">
            <CardContent className="pt-4">
              <p className="text-xs text-cyan-700 font-medium">NCRs Abertas</p>
              <p className="text-2xl font-bold text-cyan-900">7</p>
              <p className="text-xs text-cyan-600 mt-1">3 críticas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-pink-200">
            <CardContent className="pt-4">
              <p className="text-xs text-pink-700 font-medium">Inspeções Hoje</p>
              <p className="text-2xl font-bold text-pink-900">24</p>
              <p className="text-xs text-pink-600 mt-1">100% concluídas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="pt-4">
              <p className="text-xs text-orange-700 font-medium">Melhorias Ativas</p>
              <p className="text-2xl font-bold text-orange-900">12</p>
              <p className="text-xs text-orange-600 mt-1">8 em progresso</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start px-6 py-3 rounded-none border-b border-slate-200 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="realtime" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Tempo Real
            </TabsTrigger>
            <TabsTrigger value="inspecao" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Inspeções & Auditorias
            </TabsTrigger>
            <TabsTrigger value="ncr" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Não-Conformidades
            </TabsTrigger>
            <TabsTrigger value="melhorias" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Melhorias Contínuas
            </TabsTrigger>
            <TabsTrigger value="defeitos" className="gap-2">
              <Brain className="w-4 h-4" />
              Análise de Defeitos (IA)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="flex-1 overflow-auto p-6">
            <QualityRealtimePanel />
          </TabsContent>

          <TabsContent value="inspecao" className="flex-1 overflow-auto p-6">
            <InspecaoAuditoriaPanel />
          </TabsContent>

          <TabsContent value="ncr" className="flex-1 overflow-auto p-6">
            <NaoConformidadePanel />
          </TabsContent>

          <TabsContent value="melhorias" className="flex-1 overflow-auto p-6">
            <MelhoriasContinuasPanel />
          </TabsContent>

          <TabsContent value="defeitos" className="flex-1 overflow-auto p-6">
            <AnaliseDefeitosPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}