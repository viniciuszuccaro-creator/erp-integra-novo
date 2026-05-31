/**
 * IntelligenceCenterHub v1.0
 * Hub centralizado que consolida analytics, insights, relatórios, previsões
 * Regra-Mãe: w-full, h-full, multi-empresa, tudo integrado
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BarChart3, Lightbulb, TrendingUp, FileText } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import InsightsPainel from './InsightsPainel';

export default function IntelligenceCenterHub() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-indigo-900">
      {/* Header Premium */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Brain className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Intelligence Center</h1>
              <p className="text-sm text-slate-300">Analytics · Insights · Previsões · Relatórios</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-300">Powered by IA</p>
            <p className="text-2xl font-bold text-indigo-300">V21.9</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'analytics', label: 'Analytics', icon: BarChart3 },
              { value: 'insights', label: 'Insights IA', icon: Lightbulb },
              { value: 'forecasting', label: 'Forecasting', icon: TrendingUp },
              { value: 'relatorios', label: 'Relatórios', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics" className="flex-1 m-0">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="flex-1 m-0">
            <InsightsPainel />
          </TabsContent>

          {/* Forecasting */}
          <TabsContent value="forecasting" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-4">Previsões 90 Dias</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { metrica: 'Vendas', valor: '+18%', cor: 'text-green-400' },
                    { metrica: 'Estoque Crítico', valor: '-12%', cor: 'text-amber-400' },
                    { metrica: 'Churn', valor: '+5%', cor: 'text-red-400' },
                    { metrica: 'Sazonalidade', valor: '+35%', cor: 'text-blue-400' },
                  ].map((f, idx) => (
                    <div key={idx} className="p-4 bg-white/10 rounded-lg border border-white/20">
                      <p className="text-xs text-slate-300 mb-1">{f.metrica}</p>
                      <p className={`text-2xl font-bold ${f.cor}`}>{f.valor}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <Card className="p-6 bg-white/10 backdrop-blur border border-white/20 rounded-lg">
                <h3 className="font-bold text-lg text-white mb-4">Relatórios Disponíveis</h3>
                <div className="space-y-2">
                  {[
                    'Vendas Mensais',
                    'Performance por Produto',
                    'Análise de Clientes',
                    'Saúde Financeira',
                    'Comparativo Períodos',
                    'Previsão Estoque',
                  ].map((rel, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
                      <p className="text-white">{rel}</p>
                      <Button className="text-xs bg-indigo-500 hover:bg-indigo-600">Gerar</Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}