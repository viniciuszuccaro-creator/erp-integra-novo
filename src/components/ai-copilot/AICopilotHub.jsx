/**
 * AICopilotHub v1.0 — Passo 37
 * Hub do IA Copiloto Adaptativo — aprende com o usuário
 * Regra-Mãe: w-full h-full, multi-empresa, IA, futurista
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, TrendingUp, Lightbulb } from 'lucide-react';
import CopilotChat from './CopilotChat';
import CopilotInsightsFeed from './CopilotInsightsFeed';
import CopilotLearningPanel from './CopilotLearningPanel';
import CopilotFinancialIntelligence from './CopilotFinancialIntelligence';

const EMPRESAS = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

const TABS = [
  { value: 'chat',     label: 'CoPilot Chat',     Icon: Bot },
  { value: 'insights', label: 'Insights Feed',    Icon: Lightbulb },
  { value: 'finance',  label: 'Intel. Financeira', Icon: TrendingUp },
  { value: 'learning', label: 'Aprendizado IA',   Icon: Brain },
];

export default function AICopilotHub() {
  const [activeTab, setActiveTab] = useState('chat');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-violet-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl">
              <Bot className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">IA CoPilot Adaptativo</h1>
              <p className="text-sm text-slate-300">Aprende • Prevê • Decide • Otimiza em Tempo Real</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Precisão do Modelo</p>
              <p className="text-xl font-black text-violet-300">97.4%</p>
            </div>
            <div className="flex gap-2">
              {EMPRESAS.map((emp) => (
                <button
                  key={emp}
                  onClick={() => setEmpresa(emp)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    empresa === emp
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
          <TabsList className="w-full rounded-none border-b border-white/10 bg-white/5 h-auto p-0 flex-shrink-0">
            {TABS.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-3 py-3 text-xs sm:text-sm"
              >
                <Icon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="chat"     className="flex-1 m-0 overflow-hidden"><CopilotChat empresa={empresa} /></TabsContent>
          <TabsContent value="insights" className="flex-1 m-0 overflow-auto"><CopilotInsightsFeed empresa={empresa} /></TabsContent>
          <TabsContent value="finance"  className="flex-1 m-0 overflow-auto"><CopilotFinancialIntelligence empresa={empresa} /></TabsContent>
          <TabsContent value="learning" className="flex-1 m-0 overflow-auto"><CopilotLearningPanel empresa={empresa} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}