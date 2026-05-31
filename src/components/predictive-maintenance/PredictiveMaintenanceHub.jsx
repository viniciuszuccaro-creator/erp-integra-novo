/**
 * PredictiveMaintenanceHub v1.0
 * Hub de Manutenção Preditiva com IA de Ativos
 * Passo 36: Previsão inteligente de falhas + otimização de cronograma
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, real-time
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Activity, Calendar, AlertTriangle } from 'lucide-react';
import AssetHealthMonitor from './AssetHealthMonitor';
import MaintenancePredictions from './MaintenancePredictions';
import MaintenanceScheduleOptimizer from './MaintenanceScheduleOptimizer';

export default function PredictiveMaintenanceHub() {
  const [activeTab, setActiveTab] = useState('health');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-orange-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Predictive Maintenance Hub</h1>
              <p className="text-sm text-slate-300">IA de Ativos • Previsão de Falhas • Otimização de Cronograma</p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp ? 'bg-orange-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
              { value: 'health', label: 'Saúde de Ativos', icon: Activity },
              { value: 'predictions', label: 'Previsões IA', icon: AlertTriangle },
              { value: 'schedule', label: 'Cronograma', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="health" className="flex-1 m-0 overflow-auto">
            <AssetHealthMonitor empresa={empresa} />
          </TabsContent>
          <TabsContent value="predictions" className="flex-1 m-0 overflow-auto">
            <MaintenancePredictions empresa={empresa} />
          </TabsContent>
          <TabsContent value="schedule" className="flex-1 m-0 overflow-auto">
            <MaintenanceScheduleOptimizer empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}