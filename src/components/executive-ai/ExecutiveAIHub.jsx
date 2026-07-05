/**
 * ExecutiveAIHub v1.0
 * Hub do Assistente Executivo IA
 * Passo 33: Copiloto CEO/CFO/COO com decisões inteligentes
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, RBAC
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import ExecutiveBriefing from './ExecutiveBriefing';
import DecisionEngine from './DecisionEngine';

export default function ExecutiveAIHub() {
  const [activeTab, setActiveTab] = useState('briefing');
  const [role, setRole] = useState('CEO');
  const [empresa, setEmpresa] = useState('Zuccaro Brasil');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];
  const roles = ['CEO', 'CFO', 'COO', 'CSO'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-violet-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Executive AI Assistant</h1>
              <p className="text-sm text-slate-300">Copiloto Inteligente para Tomada de Decisão</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role */}
            <div className="flex gap-1">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    role === r ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {/* Empresa */}
            <div className="flex gap-1">
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
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'briefing', label: 'Briefing Diário', icon: Brain },
              { value: 'decisions', label: 'Decisões', icon: Target },
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

          <TabsContent value="briefing" className="flex-1 m-0 overflow-auto">
            <ExecutiveBriefing role={role} empresa={empresa} />
          </TabsContent>
          <TabsContent value="decisions" className="flex-1 m-0 overflow-auto">
            <DecisionEngine role={role} empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}