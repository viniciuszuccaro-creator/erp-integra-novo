import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, DollarSign, AlertTriangle, Heart } from 'lucide-react';

import CustomerScorePinboard from './CustomerScorePinboard';
import SegmentationPanel from './SegmentationPanel';
import LifetimeValueAnalyzer from './LifetimeValueAnalyzer';
import ChurnRiskPanel from './ChurnRiskPanel';
import SatisfactionPulsePanel from './SatisfactionPulsePanel';

const TABS_CONFIG = [
  { value: 'score', label: 'Score', icon: Trophy },
  { value: 'segmentation', label: 'Segmentação', icon: Users },
  { value: 'ltv', label: 'LTV', icon: DollarSign },
  { value: 'churn', label: 'Churn', icon: AlertTriangle },
  { value: 'satisfaction', label: 'Satisfação', icon: Heart },
];

const HEADER_STATS = [
  { label: 'Score Médio', value: '7.8/10', color: 'text-emerald-400' },
  { label: 'Saúde IA', value: '87%', color: 'text-blue-400' },
  { label: 'Clientes Ativos', value: '1,245', color: 'text-slate-300' },
];

export default function CustomerIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('score');

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-emerald-400" />
              Customer Intelligence Hub
            </h1>
            <p className="text-slate-400 mt-2">Segmentação, Score & Retenção com IA</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Grupo: <span className="font-semibold text-slate-200">Zuccaro</span></div>
            <div className="text-sm text-slate-400 mt-1">Dark Mode <span className="text-emerald-400">●</span></div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADER_STATS.map((stat) => (
            <Card key={stat.label} className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border-slate-800/30">
              <CardContent className="pt-4">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b border-slate-800 bg-transparent h-auto p-0 flex-shrink-0 overflow-x-auto">
          {TABS_CONFIG.map(({ value, label, icon: TabIcon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-white/5 data-[state=active]:text-slate-100 text-slate-400 px-4 py-3 text-sm flex-shrink-0 transition-all"
            >
              <TabIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Score Tab */}
        <TabsContent value="score" className="mt-6 w-full">
          <CustomerScorePinboard />
        </TabsContent>

        {/* Segmentation Tab */}
        <TabsContent value="segmentation" className="mt-6 w-full">
          <SegmentationPanel />
        </TabsContent>

        {/* LTV Tab */}
        <TabsContent value="ltv" className="mt-6 w-full">
          <LifetimeValueAnalyzer />
        </TabsContent>

        {/* Churn Tab */}
        <TabsContent value="churn" className="mt-6 w-full">
          <ChurnRiskPanel />
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="mt-6 w-full">
          <SatisfactionPulsePanel />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-emerald-950/40 to-slate-950/40 border-emerald-900/20 mt-8">
        <CardContent className="pt-4">
          <p className="text-xs text-slate-400">
            ℹ️ Dados atualizados em tempo real via IA. Segmentação automática diária. 
            <span className="text-emerald-400 ml-1">→ Próximo passo: Ações personalizadas por segmento</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}