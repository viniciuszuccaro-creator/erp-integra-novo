/**
 * AIInsightsHub v1.0
 * Hub central de insights e recomendações IA
 * Regra-Mãe: w-full, h-full, integrado com 24 passos
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, Zap } from 'lucide-react';
import AIRecommendationEngine from './AIRecommendationEngine';
import PredictiveAnalytics from './PredictiveAnalytics';

export default function AIInsightsHub() {
  const [activeTab, setActiveTab] = useState('recomendacoes');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header Premium */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Lightbulb className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Insights Hub</h1>
              <p className="text-sm text-slate-300">Recomendações · Previsões · Análises Inteligentes</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-300">Impacto Potencial</p>
            <p className="text-2xl font-bold text-amber-300">R$ 70.550</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'recomendacoes', label: 'Recomendações', icon: Lightbulb },
              { value: 'predicoes', label: 'Previsões', icon: TrendingUp },
              { value: 'insights', label: 'Insights', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Recomendações */}
          <TabsContent value="recomendacoes" className="flex-1 m-0">
            <AIRecommendationEngine />
          </TabsContent>

          {/* Previsões */}
          <TabsContent value="predicoes" className="flex-1 m-0">
            <PredictiveAnalytics />
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Insights Inteligentes</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    titulo: 'Tendência de Vendas',
                    descricao: 'Vendas em alta de 15.9%. Produtos de maior saída: SKU-001, SKU-004, SKU-005.',
                    impacto: 'Positivo',
                    icon: '📈',
                  },
                  {
                    titulo: 'Risco de Churn',
                    descricao: '12 clientes com risco crítico. Cliente B: 78%, Cliente D: 71%, Cliente H: 69%.',
                    impacto: 'Crítico',
                    icon: '⚠️',
                  },
                  {
                    titulo: 'Oportunidade de Margem',
                    descricao: '7 produtos com oportunidade de aumento de preço (até +22%).',
                    impacto: 'Alto',
                    icon: '💰',
                  },
                  {
                    titulo: 'Eficiência Logística',
                    descricao: '4 rotas podem ser otimizadas. Economia estimada: R$ 12.450/mês.',
                    impacto: 'Moderado',
                    icon: '🚀',
                  },
                ].map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{insight.titulo}</h3>
                        <p className="text-sm text-slate-300 mb-2">{insight.descricao}</p>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            insight.impacto === 'Crítico'
                              ? 'bg-red-500/20 text-red-300'
                              : insight.impacto === 'Positivo'
                              ? 'bg-green-500/20 text-green-300'
                              : insight.impacto === 'Alto'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {insight.impacto}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estatísticas */}
              <div className="p-6 rounded-lg bg-white/10 border border-white/20 mt-6">
                <h3 className="font-bold text-white mb-3">Estatísticas do Motor IA</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Recomendações', value: '4', icon: '💡' },
                    { label: 'Confiança Média', value: '90%', icon: '🎯' },
                    { label: 'Impacto Potencial', value: 'R$ 70k', icon: '💰' },
                    { label: 'Modelos ML', value: '7', icon: '🤖' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xl mb-1">{stat.icon}</p>
                      <p className="text-xs text-slate-300">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}