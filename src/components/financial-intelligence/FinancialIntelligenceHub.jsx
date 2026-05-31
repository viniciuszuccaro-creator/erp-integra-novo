import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, AlertCircle, BarChart3, Zap, Brain } from 'lucide-react';
import CashFlowRealtime from './CashFlowRealtime';
import ProfitabilityAnalyzer from './ProfitabilityAnalyzer';
import RiskAssessmentIA from './RiskAssessmentIA';
import ScenarioSimulator from './ScenarioSimulator';
import StrategicRecommendations from './StrategicRecommendations';
import usePermissions from '@/components/lib/usePermissions';

export default function FinancialIntelligenceHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('cashflow');

  if (!hasPermission('Financeiro', null, 'ver') && !hasPermission('Dashboard', null, 'ver')) {
    return (
      <div className="p-10 text-center text-slate-600">
        Acesso negado. Apenas Financeiro e Diretoria podem acessar este hub.
      </div>
    );
  }

  const tabs = [
    { id: 'cashflow', label: 'Fluxo de Caixa Tempo Real', icon: DollarSign },
    { id: 'profitability', label: 'Análise de Rentabilidade', icon: TrendingUp },
    { id: 'risk', label: 'Avaliação de Risco (IA)', icon: AlertCircle },
    { id: 'scenario', label: 'Simulador de Cenários', icon: BarChart3 },
    { id: 'recommendations', label: 'Recomendações IA', icon: Brain },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Financial Intelligence Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Inteligência financeira integrada: Fluxo de Caixa + Rentabilidade + Riscos + IA Estratégica
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-100 border border-emerald-600">
              Multi-Empresa
            </Badge>
            <Badge className="bg-purple-900 text-purple-100 border border-purple-600">
              IA Ativa
            </Badge>
          </div>
        </div>
      </div>

      {/* Macro KPIs */}
      <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Receita Acumulada</p>
            <p className="text-lg font-bold text-emerald-400">R$ 4.8M</p>
            <p className="text-xs text-green-400">↑ 12% vs período</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Despesas Totais</p>
            <p className="text-lg font-bold text-red-400">R$ 2.1M</p>
            <p className="text-xs text-red-400">↓ 3% otimização</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Lucro Líquido</p>
            <p className="text-lg font-bold text-emerald-400">R$ 2.7M</p>
            <p className="text-xs text-emerald-400">Margem 56.3%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Saldo em Caixa</p>
            <p className="text-lg font-bold text-blue-400">R$ 890k</p>
            <p className="text-xs text-green-400">Suficiente 18 dias</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Score Financeiro</p>
            <p className="text-lg font-bold text-emerald-400">8.7/10</p>
            <p className="text-xs text-emerald-400">Saudável</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 py-3 border-b border-slate-700 bg-slate-800/20">
            <TabsList className="bg-slate-800 border border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-emerald-900 data-[state=active]:text-emerald-100 text-slate-400 flex items-center gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="cashflow" className="p-6 h-full">
              <CashFlowRealtime />
            </TabsContent>

            <TabsContent value="profitability" className="p-6 h-full">
              <ProfitabilityAnalyzer />
            </TabsContent>

            <TabsContent value="risk" className="p-6 h-full">
              <RiskAssessmentIA />
            </TabsContent>

            <TabsContent value="scenario" className="p-6 h-full">
              <ScenarioSimulator />
            </TabsContent>

            <TabsContent value="recommendations" className="p-6 h-full">
              <StrategicRecommendations />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}