/**
 * AutomationCenterHub v1.0
 * Hub centralizado de RPA e automações inteligentes
 * Regra-Mãe: w-full, h-full, integração total
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Workflow, BarChart3 } from 'lucide-react';
import AutomationBuilder from './AutomationBuilder';
import WorkflowDashboard from './WorkflowDashboard';

export default function AutomationCenterHub() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header Premium */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Automation Center</h1>
              <p className="text-sm text-slate-300">RPA · Workflows · Inteligência</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-300">Automações Ativas</p>
            <p className="text-2xl font-bold text-purple-300">24/7</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'builder', label: 'Builder', icon: Zap },
              { value: 'workflows', label: 'Workflows', icon: Workflow },
              { value: 'metricas', label: 'Métricas', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Builder */}
          <TabsContent value="builder" className="flex-1 m-0">
            <AutomationBuilder />
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="flex-1 m-0">
            <WorkflowDashboard />
          </TabsContent>

          {/* Métricas */}
          <TabsContent value="metricas" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Automações', value: '24', cor: 'bg-purple-500' },
                  { label: 'Ativas Agora', value: '22', cor: 'bg-green-500' },
                  { label: 'Taxa Erro', value: '0.8%', cor: 'bg-red-500' },
                  { label: 'Economia Mês', value: '180h', cor: 'bg-yellow-500' },
                ].map((metric, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${metric.cor}/20 border border-${metric.cor.replace('bg-', '')}/50`}>
                    <p className="text-xs text-slate-300 mb-1">{metric.label}</p>
                    <p className={`text-2xl font-bold text-${metric.cor.replace('bg-', '')}-300`}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}