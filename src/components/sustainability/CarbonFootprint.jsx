/**
 * CarbonFootprint v1.0
 * Rastreamento de pegada de carbono
 * Passo 31: CO2 por operação, rota, produto
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Target } from 'lucide-react';

const CARBON_DATA = [
  { fonte: 'Logística', co2: 245, unidade: 'ton CO2/mês', reducao: '-12%', meta: 200 },
  { fonte: 'Produção', co2: 189, unidade: 'ton CO2/mês', reducao: '-8%', meta: 150 },
  { fonte: 'Energia', co2: 78, unidade: 'ton CO2/mês', reducao: '-15%', meta: 60 },
  { fonte: 'Resíduos', co2: 34, unidade: 'ton CO2/mês', reducao: '-22%', meta: 20 },
];

export default function CarbonFootprint({ empresa }) {
  const [carbon] = useState(CARBON_DATA);

  const totalCO2 = carbon.reduce((acc, c) => acc + c.co2, 0);
  const totalMeta = carbon.reduce((acc, c) => acc + c.meta, 0);
  const percentualMeta = Math.round((totalMeta / totalCO2) * 100);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-green-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-green-400" />
        Carbon Footprint Tracker
      </h2>

      {/* Total CO2 */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/40 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total CO2 Emitido</p>
            <p className="text-4xl font-black text-green-400 mt-1">{totalCO2} ton</p>
            <p className="text-sm text-slate-300 mt-2">Este mês</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Meta: {totalMeta} ton</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{percentualMeta}%</p>
            <p className="text-xs text-slate-400 mt-1">de progresso</p>
          </div>
        </div>
      </Card>

      {/* Fontes */}
      <div className="space-y-3">
        {carbon.map((item, idx) => {
          const percentualAtingido = Math.round((item.meta / item.co2) * 100);
          return (
            <Card key={idx} className="p-4 bg-white/5 border border-green-500/30 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{item.fonte}</p>
                  <p className="text-xs text-slate-400">{item.unidade}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">{item.reducao}</Badge>
              </div>

              <div className="flex items-end gap-3 mb-2">
                <p className="text-2xl font-bold text-white">{item.co2}</p>
                <p className="text-xs text-slate-400">vs meta {item.meta}</p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percentualAtingido >= 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (item.meta / item.co2) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-300">{percentualAtingido}%</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Insight */}
      <Card className="p-4 bg-green-500/10 border border-green-400/40 rounded-lg">
        <p className="text-sm text-green-300 font-semibold mb-1">🎯 Insight IA</p>
        <p className="text-xs text-slate-300">
          Redução de 14% YoY. Se mantiver ritmo, atinge meta anual 47 ton CO2 em outubro. Maior ganho: energia (−15%), maior oportunidade: logística (+48 ton acima).
        </p>
      </Card>
    </div>
  );
}