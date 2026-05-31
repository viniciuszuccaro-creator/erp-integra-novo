/**
 * WorkforceIntelligenceHub v1.0 — Passo 38
 * Hub de Inteligência de RH + Workforce Analytics em Tempo Real
 * Regra-Mãe: w-full h-full, multi-empresa, IA, capital humano otimizado
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Zap, BarChart3, Target } from 'lucide-react';
import EmployeeProductivityPanel from './EmployeeProductivityPanel';
import TurnoverPredictionAI from './TurnoverPredictionAI';
import CompensationOptimizer from './CompensationOptimizer';
import TeamPerformanceDashboard from './TeamPerformanceDashboard';

const EMPRESAS = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

const TABS_CONFIG = [
  { value: 'productivity', label: 'Produtividade', TabIcon: TrendingUp },
  { value: 'turnover',     label: 'Rotatividade', TabIcon: Users },
  { value: 'compensation', label: 'Compensação',  TabIcon: Zap },
  { value: 'performance',  label: 'Performance',  TabIcon: BarChart3 },
  { value: 'strategy',     label: 'Estratégia',   TabIcon: Target },
];

export default function WorkforceIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('productivity');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-emerald-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Users className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Workforce Intelligence Hub</h1>
              <p className="text-sm text-slate-300">IA de RH • Capital Humano Otimizado • Analytics em Tempo Real</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Índice de Satisfação</p>
              <p className="text-xl font-black text-emerald-300">8.7/10</p>
            </div>
            <div className="flex gap-2">
              {EMPRESAS.map((emp) => (
                <button
                  key={emp}
                  onClick={() => setEmpresa(emp)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    empresa === emp
                      ? 'bg-emerald-600 text-white shadow-lg'
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
          <TabsList className="w-full rounded-none border-b border-white/10 bg-white/5 h-auto p-0 flex-shrink-0 overflow-x-auto">
            {TABS_CONFIG.map(({ value, label, TabIcon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-3 py-3 text-xs sm:text-sm flex-shrink-0"
              >
                <TabIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="productivity"   className="flex-1 m-0 overflow-auto"><EmployeeProductivityPanel empresa={empresa} /></TabsContent>
          <TabsContent value="turnover"       className="flex-1 m-0 overflow-auto"><TurnoverPredictionAI empresa={empresa} /></TabsContent>
          <TabsContent value="compensation"   className="flex-1 m-0 overflow-auto"><CompensationOptimizer empresa={empresa} /></TabsContent>
          <TabsContent value="performance"    className="flex-1 m-0 overflow-auto"><TeamPerformanceDashboard empresa={empresa} /></TabsContent>
          <TabsContent value="strategy"       className="flex-1 m-0 overflow-auto">
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-400">
              <p>🚀 Aba Estratégia em desenvolvimento — RH 4.0</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}