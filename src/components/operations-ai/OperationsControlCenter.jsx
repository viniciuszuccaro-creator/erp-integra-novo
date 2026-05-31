/**
 * OperationsControlCenter v1.0
 * Centro de Controle de Operações Autônomo + Orquestração de Processos
 * Passo 36: IA orquestra todas as operações em tempo real
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, autonomia total
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, AlertTriangle, Cpu } from 'lucide-react';
import ProcessOrchestrator from './ProcessOrchestrator';
import RealtimeAnomalyDetection from './RealtimeAnomalyDetection';
import AutonomousActionExecutor from './AutonomousActionExecutor';

export default function OperationsControlCenter() {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];
  const systemHealth = 96.8;
  const autonomousLevel = 94;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-orange-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Cpu className="w-8 h-8 text-orange-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Autonomous Operations Center</h1>
              <p className="text-sm text-slate-300">Real-Time Orchestration • 100% Autônomo • IA Decisiva</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Saúde do Sistema</p>
              <p className="text-xl font-black text-orange-300">{systemHealth}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Autonomia</p>
              <p className="text-xl font-black text-green-400">{autonomousLevel}%</p>
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
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'orchestrator', label: 'Orquestrador', icon: Activity },
              { value: 'anomaly', label: 'Anomalias', icon: AlertTriangle },
              { value: 'executor', label: 'Executor', icon: Zap },
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

          <TabsContent value="orchestrator" className="flex-1 m-0 overflow-auto">
            <ProcessOrchestrator empresa={empresa} />
          </TabsContent>
          <TabsContent value="anomaly" className="flex-1 m-0 overflow-auto">
            <RealtimeAnomalyDetection empresa={empresa} />
          </TabsContent>
          <TabsContent value="executor" className="flex-1 m-0 overflow-auto">
            <AutonomousActionExecutor empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}