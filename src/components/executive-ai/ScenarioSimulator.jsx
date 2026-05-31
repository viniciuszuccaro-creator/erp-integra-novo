/**
 * ScenarioSimulator v1.0
 * Simulador de cenários estratégicos
 * Passo 33: E se? — IA simula impactos de decisões futuras
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const SCENARIOS = [
  {
    titulo: 'Crescimento 20% Receita',
    descricao: 'Se aumentar preço 5% + 3 vendedores',
    otimista: { receita: '+22%', margem: '+2pp', caixa: '+R$1.2M' },
    base: { receita: '+17%', margem: '+1.5pp', caixa: '+R$890k' },
    pessimista: { receita: '+11%', margem: '+0.8pp', caixa: '+R$420k' },
    probabilidade: { otimista: 25, base: 55, pessimista: 20 },
  },
  {
    titulo: 'Entrada Mercado Nordeste',
    descricao: 'Parceria distribuidora + estoque local',
    otimista: { receita: '+15%', margem: '+1.8pp', caixa: '+R$780k' },
    base: { receita: '+8%', margem: '+0.9pp', caixa: '+R$340k' },
    pessimista: { receita: '+2%', margem: '-0.5pp', caixa: '-R$120k' },
    probabilidade: { otimista: 30, base: 45, pessimista: 25 },
  },
];

export default function ScenarioSimulator({ role, empresa }) {
  const [scenarios] = useState(SCENARIOS);
  const [activeScenario, setActiveScenario] = useState(0);
  const sc = scenarios[activeScenario];

  const CASE_COLORS = {
    otimista: 'text-green-400',
    base: 'text-blue-400',
    pessimista: 'text-red-400',
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-400" />
        Simulador de Cenários
      </h2>

      {/* Seletor de cenário */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenarios.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveScenario(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeScenario === idx ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {s.titulo}
          </button>
        ))}
      </div>

      {/* Detalhes do Cenário */}
      <Card className="p-4 bg-violet-500/10 border border-violet-400/40 rounded-lg">
        <p className="font-bold text-white mb-1">{sc.titulo}</p>
        <p className="text-sm text-slate-400">{sc.descricao}</p>
      </Card>

      {/* Casos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['otimista', 'base', 'pessimista']).map((caso) => (
          <Card key={caso} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className={`font-bold capitalize ${CASE_COLORS[caso]}`}>{caso}</p>
              <Badge className="bg-white/10 text-slate-300">{sc.probabilidade[caso]}%</Badge>
            </div>
            <div className="space-y-2 text-sm">
              {Object.entries(sc[caso]).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-400 capitalize">{k}</span>
                  <span className={`font-bold ${v.startsWith('+') ? 'text-green-400' : v.startsWith('-') ? 'text-red-400' : 'text-white'}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Recomendação */}
      <Card className="p-4 bg-white/5 border border-violet-500/30 rounded-lg">
        <p className="text-sm text-violet-300 font-semibold flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4" /> Recomendação IA
        </p>
        <p className="text-sm text-slate-300">
          Cenário base (55% probabilidade): {sc.base.receita} receita com {sc.base.margem} margem.
          IA sugere avançar com estratégia conservadora e revisar em 90 dias com dados reais.
        </p>
      </Card>
    </div>
  );
}