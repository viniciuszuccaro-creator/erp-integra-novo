import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Smile, Meh, Frown, TrendingUp } from 'lucide-react';

const NPS_DATA = {
  nps: 7.2,
  trend: '+0.4',
  promoters: 58,
  passives: 28,
  detractors: 14,
};

const SENTIMENT_DATA = [
  { name: 'Positivo', value: 58, color: '#10b981' },
  { name: 'Neutro', value: 28, color: '#64748b' },
  { name: 'Negativo', value: 14, color: '#ef4444' },
];

const DRIVERS_DATA = [
  { driver: 'Qualidade Produto', score: 8.2 },
  { driver: 'Entrega On-time', score: 7.8 },
  { driver: 'Atendimento', score: 7.5 },
  { driver: 'Preço/Valor', score: 6.9 },
  { driver: 'Inovação', score: 7.1 },
];

const RECENT_FEEDBACK = [
  { id: 1, customer: 'Const. MRV', text: '✅ Produto excelente, entrega rápida', sentiment: 'positive' },
  { id: 2, customer: 'Vale Siderúrgica', text: '⚠️ Preço competitivo, mas com margem', sentiment: 'neutral' },
  { id: 3, customer: 'Metal Arts', text: '❌ Atraso na entrega última semana', sentiment: 'negative' },
  { id: 4, customer: 'Reforma & Cia', text: '✅ Muito satisfeito com atendimento', sentiment: 'positive' },
];

export default function SatisfactionPulsePanel() {
  return (
    <div className="w-full space-y-4">
      {/* NPS Overview */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Net Promoter Score (NPS)
            </span>
            <span className="text-3xl font-bold text-emerald-400">{NPS_DATA.nps}</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-2">Tendência: {NPS_DATA.trend} (vs. mês anterior)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={SENTIMENT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {SENTIMENT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Promotores', count: NPS_DATA.promoters, icon: Smile, color: 'text-emerald-400' },
          { label: 'Passivos', count: NPS_DATA.passives, icon: Meh, color: 'text-slate-400' },
          { label: 'Detratores', count: NPS_DATA.detractors, icon: Frown, color: 'text-red-400' },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border-slate-800/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-2xl font-bold text-slate-200 mt-1">{count}%</p>
                </div>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Satisfaction Drivers */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 text-sm">Drivers de Satisfação (0-10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DRIVERS_DATA} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="driver" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 text-sm">Feedback Recente (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RECENT_FEEDBACK.map((fb) => (
            <div key={fb.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">{fb.customer}</p>
                  <p className="text-sm text-slate-400 mt-1">{fb.text}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  fb.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300' :
                  fb.sentiment === 'neutral' ? 'bg-slate-500/20 text-slate-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {fb.sentiment === 'positive' ? 'Positivo' : fb.sentiment === 'neutral' ? 'Neutro' : 'Negativo'}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}