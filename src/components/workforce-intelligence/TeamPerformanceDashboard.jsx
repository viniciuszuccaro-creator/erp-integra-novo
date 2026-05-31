/**
 * TeamPerformanceDashboard v1.0 — Passo 38
 * Dashboard de performance por time + competências
 * Regra-Mãe: w-full h-full, IA, análise de desempenho
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Star, Users } from 'lucide-react';

const TEAM_DATA = [
  { nome: 'Vendas', score: 92, membros: 8, meta: '100%', realizado: '94%', skills: [92, 88, 85, 90, 86] },
  { nome: 'Estoque', score: 88, membros: 5, meta: '100%', realizado: '88%', skills: [98, 85, 87, 82, 80] },
  { nome: 'Produção', score: 91, membros: 12, meta: '100%', realizado: '91%', skills: [99, 89, 92, 88, 85] },
  { nome: 'Financeiro', score: 85, membros: 4, meta: '100%', realizado: '85%', skills: [88, 92, 80, 84, 79] },
];

const COMPETENCIAS = [
  { area: 'Qualidade', value: 92 },
  { area: 'Produtividade', value: 88 },
  { area: 'Prazos', value: 87 },
  { area: 'Atendimento', value: 91 },
  { area: 'Inovação', value: 84 },
];

const TOP_PERFORMERS = [
  { nome: 'João Silva', score: 98, area: 'Vendas', skill: 'Fechamento' },
  { nome: 'Pedro Costa', score: 96, area: 'Produção', skill: 'Qualidade' },
  { nome: 'Maria Santos', score: 94, area: 'Estoque', skill: 'Acuracidade' },
];

export default function TeamPerformanceDashboard({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-emerald-950 overflow-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-shrink-0">
        <Users className="w-5 h-5 text-emerald-400" />
        Performance de Times — {empresa}
      </h2>

      {/* Times Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {TEAM_DATA.map((t) => (
          <Card key={t.nome} className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{t.nome}</p>
            <p className="text-2xl font-black text-emerald-400">{t.score}</p>
            <p className="text-xs text-slate-400 mt-1">{t.membros} membros</p>
          </Card>
        ))}
      </div>

      {/* Desempenho por Time */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3">📊 Desempenho vs Meta</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={TEAM_DATA}>
            <XAxis dataKey="nome" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #059669', borderRadius: 8 }} />
            <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} name="Score" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Competências Agregadas */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3">🎯 Competências Agregadas</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={COMPETENCIAS}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          Top 3 Performers
        </p>
        <div className="space-y-2">
          {TOP_PERFORMERS.map((p, idx) => (
            <div key={p.nome} className="flex items-center justify-between p-2 bg-white/10 rounded">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-300 font-black">#{idx + 1}</Badge>
                <div>
                  <p className="text-xs font-bold text-white">{p.nome}</p>
                  <p className="text-xs text-slate-400">{p.area} • {p.skill}</p>
                </div>
              </div>
              <p className="text-sm font-black text-emerald-400">{p.score}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}