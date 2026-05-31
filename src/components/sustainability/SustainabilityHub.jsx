/**
 * SustainabilityHub v1.0
 * Hub de Sustentabilidade e ESG
 * Passo 31: Carbono zero, economia circular, compliance ESG
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, real-time
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, TrendingDown, Zap, BarChart3 } from 'lucide-react';
import CarbonFootprint from './CarbonFootprint';
import CircularEconomy from './CircularEconomy';
import ESGScorecard from './ESGScorecard';

export default function SustainabilityHub() {
  const [activeTab, setActiveTab] = useState('carbon');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-green-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-green-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Leaf className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sustainability Hub</h1>
              <p className="text-sm text-slate-300">Carbon Tracking • Circular Economy • ESG Compliance</p>
            </div>
          </div>

          {/* Seletor Empresa */}
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {emp.replace('Zuccaro ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'carbon', label: 'Carbon', icon: TrendingDown },
              { value: 'circular', label: 'Circular', icon: Zap },
              { value: 'esg', label: 'ESG Score', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="carbon" className="flex-1 m-0 overflow-auto">
            <CarbonFootprint empresa={empresa} />
          </TabsContent>
          <TabsContent value="circular" className="flex-1 m-0 overflow-auto">
            <CircularEconomy empresa={empresa} />
          </TabsContent>
          <TabsContent value="esg" className="flex-1 m-0 overflow-auto">
            <ESGScorecard empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}