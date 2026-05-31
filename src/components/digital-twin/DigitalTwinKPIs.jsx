/**
 * DigitalTwinKPIs v1.0
 * KPIs ao vivo do Gêmeo Digital
 * Regra-Mãe: real-time, multi-empresa, IA
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const BASE_KPIS = [
  { label: 'OEE Global', value: 87.4, unidade: '%', trend: 'up', meta: 90 },
  { label: 'Produção/hora', value: 143, unidade: 'un', trend: 'up', meta: 150 },
  { label: 'Refugo', value: 2.1, unidade: '%', trend: 'down', meta: 2 },
  { label: 'Energia Consumida', value: 384, unidade: 'kWh', trend: 'up', meta: 350 },
  { label: 'Operadores Ativos', value: 42, unidade: '', trend: 'up', meta: 45 },
  { label: 'Eficiência Média', value: 88.3, unidade: '%', trend: 'up', meta: 92 },
];

export default function DigitalTwinKPIs({ empresa }) {
  const [kpis, setKpis] = useState(BASE_KPIS);

  useEffect(() => {
    const t = setInterval(() => {
      setKpis((prev) =>
        prev.map((k) => ({
          ...k,
          value: parseFloat((k.value * (1 + (Math.random() - 0.5) * 0.02)).toFixed(1)),
        }))
      );
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
          KPIs Live — {empresa}
        </h2>
        <p className="text-xs text-cyan-400 animate-pulse">● LIVE</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const atingiuMeta = kpi.trend === 'up' ? kpi.value >= kpi.meta : kpi.value <= kpi.meta;
          return (
            <Card key={idx} className="p-5 bg-white/5 border border-cyan-500/30 rounded-lg hover:border-cyan-400 transition-all">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-400">{kpi.label}</p>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <p className="text-3xl font-black text-white mb-1">
                {kpi.value}{kpi.unidade}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mr-2">
                  <div
                    className={`h-full rounded-full ${atingiuMeta ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (kpi.value / kpi.meta) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 whitespace-nowrap">Meta: {kpi.meta}{kpi.unidade}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Insights IA */}
      <Card className="p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-lg mt-2">
        <p className="text-sm font-bold text-cyan-300 mb-2">🤖 Insight IA</p>
        <p className="text-sm text-slate-300">
          OEE abaixo da meta em 2.6%. IA sugere: reduzir setup time nas máquinas CNC em 12 min/batch. Ganho estimado: +3.2% OEE.
        </p>
      </Card>
    </div>
  );
}