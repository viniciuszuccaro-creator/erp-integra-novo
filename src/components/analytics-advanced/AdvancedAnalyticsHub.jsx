/**
 * AdvancedAnalyticsHub v1.0
 * Hub de Analytics Avançado + BI 360°
 * Passo 33: Inteligência preditiva + dashboards interativos
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, real-time
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import PredictiveForecastPanel from './PredictiveForecastPanel';
import RevenueIntelligence from './RevenueIntelligence';
import OperationalMetrics from './OperationalMetrics';

export default function AdvancedAnalyticsHub() {
  const [activeTab, setActiveTab] = useState('forecast');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-violet-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Advanced Analytics Hub</h1>
              <p className="text-sm text-slate-300">BI 360° • Previsões IA • Insights Generativos</p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {emp.replace('Zuccaro ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'forecast', label: 'Previsões IA', icon: TrendingUp },
              { value: 'revenue', label: 'Receita', icon: Target },
              { value: 'operational', label: 'Operacional', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="forecast" className="flex-1 m-0 overflow-auto">
            <PredictiveForecastPanel empresa={empresa} />
          </TabsContent>
          <TabsContent value="revenue" className="flex-1 m-0 overflow-auto">
            <RevenueIntelligence empresa={empresa} />
          </TabsContent>
          <TabsContent value="operational" className="flex-1 m-0 overflow-auto">
            <OperationalMetrics empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}