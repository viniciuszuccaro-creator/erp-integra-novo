import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePermissions from '@/components/lib/usePermissions';
import { Users, Zap, TrendingUp, Target } from 'lucide-react';
import CustomerSegmentationPanel from './CustomerSegmentationPanel';
import LifetimeValueAnalyzer from './LifetimeValueAnalyzer';
import ChurnRiskPanel from './ChurnRiskPanel';
import SatisfactionPulsePanel from './SatisfactionPulsePanel';

export default function CustomerIntelligenceHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('segmentacao');

  // Verificar permissão de CRM
  const canAccessCRM = hasPermission('CRM', null, 'ver');

  if (!canAccessCRM) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar a Inteligência de Clientes.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Clientes Totais', valor: 3125, icone: Users, cor: 'text-blue-400' },
    { label: 'Score Médio NPS', valor: '48', icone: Zap, cor: 'text-emerald-400' },
    { label: 'LTV Médio', valor: 'R$ 82k', icone: TrendingUp, cor: 'text-purple-400' },
    { label: 'Em Risco Crítico', valor: '2', icone: Target, cor: 'text-red-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-400" />
          Customer Intelligence Hub
        </h1>
        <p className="text-slate-400 text-sm mt-2">Segmentação IA • Lifetime Value • Churn Risk • NPS Pulsante</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icone;
            return (
              <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${kpi.cor}`} />
                  <p className="text-xs text-slate-400">{kpi.label}</p>
                </div>
                <p className={`text-lg font-bold ${kpi.cor}`}>{kpi.valor}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="segmentacao" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Segmentação</span>
            </TabsTrigger>
            <TabsTrigger value="ltv" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">LTV</span>
            </TabsTrigger>
            <TabsTrigger value="churn" className="data-[state=active]:bg-red-600">
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Churn Risk</span>
            </TabsTrigger>
            <TabsTrigger value="satisfacao" className="data-[state=active]:bg-emerald-600">
              <Zap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">NPS</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo Abas */}
          <div className="h-full">
            <TabsContent value="segmentacao" className="h-full m-0">
              <CustomerSegmentationPanel />
            </TabsContent>

            <TabsContent value="ltv" className="h-full m-0">
              <LifetimeValueAnalyzer />
            </TabsContent>

            <TabsContent value="churn" className="h-full m-0">
              <ChurnRiskPanel />
            </TabsContent>

            <TabsContent value="satisfacao" className="h-full m-0">
              <SatisfactionPulsePanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}