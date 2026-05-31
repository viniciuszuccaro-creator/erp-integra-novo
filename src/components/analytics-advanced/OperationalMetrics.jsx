/**
 * OperationalMetrics v1.0
 * Métricas operacionais consolidadas
 * Passo 33: KPIs cruzados por módulo com IA
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const RADAR_DATA = [
  { modulo: 'Produção', score: 87 },
  { modulo: 'Estoque', score: 79 },
  { modulo: 'Logística', score: 91 },
  { modulo: 'Financeiro', score: 83 },
  { modulo: 'Comercial', score: 94 },
  { modulo: 'RH', score: 76 },
];

const MODULE_KPIS = [
  { modulo: 'Comercial', kpi: 'Pedidos', valor: '423', meta: '500', percentual: 84, trend: 'up' },
  { modulo: 'Estoque', kpi: 'Giro', valor: '12.4x', meta: '15x', percentual: 83, trend: 'up' },
  { modulo: 'Logística', kpi: 'OTIF', valor: '94.2%', meta: '98%', percentual: 96, trend: 'up' },
  { modulo: 'Produção', kpi: 'OEE', valor: '87.4%', meta: '90%', percentual: 97, trend: 'down' },
];

export default function OperationalMetrics({ empresa }) {
  const scoreGeral = Math.round(RADAR_DATA.reduce((acc, d) => acc + d.score, 0) / RADAR_DATA.length);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Zap className="w-6 h-6 text-violet-400" />
        Operational Intelligence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar */}
        <Card className="p-4 bg-white/5 border border-violet-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Score por Módulo</p>
            <Badge className="bg-violet-500/20 text-violet-300">Geral: {scoreGeral}/100</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="modulo" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #7c3aed44', borderRadius: 8, color: '#fff' }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* KPIs por Módulo */}
        <div className="flex flex-col gap-3">
          {MODULE_KPIS.map((kpi, idx) => (
            <Card key={idx} className="p-4 bg-white/5 border border-violet-500/30 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-400">{kpi.modulo}</p>
                  <p className="font-bold text-white">{kpi.kpi}: <span className="text-violet-300">{kpi.valor}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up'
                    ? <TrendingUp className="w-4 h-4 text-green-400" />
                    : <TrendingDown className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs text-slate-400">Meta: {kpi.meta}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.percentual >= 95 ? 'bg-green-500' : kpi.percentual >= 80 ? 'bg-violet-500' : 'bg-amber-500'}`}
                    style={{ width: `${kpi.percentual}%` }}
                  />
                </div>
                <span className="text-xs text-white font-bold">{kpi.percentual}%</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <Card className="p-4 bg-violet-500/10 border border-violet-400/40 rounded-lg">
        <p className="text-sm font-semibold text-violet-300 mb-2">🤖 Resumo Executivo IA</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Comercial: melhor módulo (94)</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Logística OTIF 94.2% acima do setor</div>
          <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-amber-400" /> RH: oportunidade de melhoria (76)</div>
          <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-amber-400" /> Estoque: giro abaixo da meta</div>
        </div>
      </Card>
    </div>
  );
}