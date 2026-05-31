/**
 * CopilotFinancialIntelligence v1.0 — Passo 37
 * Inteligência financeira em tempo real com IA
 * Regra-Mãe: w-full h-full, multi-empresa, dashboards financeiros adaptativos
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { base44 } from '@/api/base44Client';

const RECEITA_DATA = [
  { mes: 'Dez', real: 2340, previsto: 2200 },
  { mes: 'Jan', real: 2780, previsto: 2600 },
  { mes: 'Fev', real: 2420, previsto: 2500 },
  { mes: 'Mar', real: 3100, previsto: 2900 },
  { mes: 'Abr', real: 2950, previsto: 3000 },
  { mes: 'Mai', real: 3380, previsto: 3200 },
  { mes: 'Jun', real: null, previsto: 3500 },
];

const FLUXO_DATA = [
  { dia: 'Seg', entrada: 145, saida: 98 },
  { dia: 'Ter', entrada: 230, saida: 140 },
  { dia: 'Qua', entrada: 175, saida: 120 },
  { dia: 'Qui', entrada: 310, saida: 190 },
  { dia: 'Sex', entrada: 280, saida: 160 },
];

const KPI_CARDS = [
  { label: 'Receita Maio', value: 'R$ 3,38M', trend: '+14.8%', up: true },
  { label: 'Margem Líquida', value: '18.4%', trend: '+2.1pp', up: true },
  { label: 'Inadimplência', value: 'R$ 143k', trend: '+8.3%', up: false },
  { label: 'Fluxo 30 dias', value: 'R$ 890k', trend: 'positivo', up: true },
];

export default function CopilotFinancialIntelligence({ empresa }) {
  const [analise, setAnalise] = useState('');
  const [loading, setLoading] = useState(false);

  const gerarAnalise = async () => {
    setLoading(true);
    setAnalise('');
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é CFO do ERP Zuccaro — empresa ${empresa}.
Com base nos dados: Receita Maio R$ 3.38M (+14.8%), Margem 18.4% (+2.1pp), Inadimplência R$ 143k (+8.3%), Fluxo 30d R$ 890k.
Gere uma análise financeira executiva de 3 linhas com recomendações táticas imediatas. Use emojis relevantes.`,
      });
      setAnalise(typeof res === 'string' ? res : res?.response || JSON.stringify(res));
    } catch {
      setAnalise('⚠️ Erro ao gerar análise. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-violet-400" />
          Inteligência Financeira — {empresa}
        </h2>
        <button
          onClick={gerarAnalise}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-white text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Análise IA
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.label} className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
            <p className="text-lg font-black text-white">{kpi.value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
              {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.trend}
            </div>
          </Card>
        ))}
      </div>

      {/* IA Analysis */}
      {analise && (
        <Card className="p-4 bg-violet-500/10 border border-violet-400/40 rounded-xl flex-shrink-0">
          <Badge className="bg-violet-500/30 text-violet-200 mb-2">🤖 Análise CFO IA</Badge>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{analise}</p>
        </Card>
      )}

      {/* Receita Chart */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          Receita Real vs Previsto (R$ mil)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={RECEITA_DATA}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 8 }} />
            <Area type="monotone" dataKey="real" stroke="#7c3aed" fill="url(#colorReal)" name="Real" strokeWidth={2} />
            <Area type="monotone" dataKey="previsto" stroke="#4ade80" fill="url(#colorPrev)" name="Previsto" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Fluxo Semanal */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3">📊 Fluxo de Caixa Semanal (R$ mil)</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={FLUXO_DATA}>
            <XAxis dataKey="dia" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 8 }} />
            <Bar dataKey="entrada" fill="#4ade80" name="Entrada" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saida" fill="#f87171" name="Saída" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}