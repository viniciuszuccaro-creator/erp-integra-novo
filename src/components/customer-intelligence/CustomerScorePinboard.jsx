import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Zap, Users, Award } from 'lucide-react';

const SCORE_DATA = {
  score: 7.8,
  trend: '+0.3',
  rfm: 8.1,
  nps: 7.2,
  engagement: 7.5,
  ltv: 8.4,
};

const RADAR_DATA = [
  { metric: 'RFM', value: 81, fullMark: 100 },
  { metric: 'NPS', value: 72, fullMark: 100 },
  { metric: 'Engajamento', value: 75, fullMark: 100 },
  { metric: 'LTV', value: 84, fullMark: 100 },
  { metric: 'Retenção', value: 78, fullMark: 100 },
  { metric: 'Satisfação', value: 80, fullMark: 100 },
];

const TREND_DATA = [
  { month: 'Jan', score: 7.2 },
  { month: 'Fev', score: 7.4 },
  { month: 'Mar', score: 7.5 },
  { month: 'Abr', score: 7.6 },
  { month: 'Mai', score: 7.8 },
];

export default function CustomerScorePinboard() {
  return (
    <div className="w-full space-y-4">
      {/* Score Overview */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Score 360°
            </span>
            <span className="text-2xl font-bold text-emerald-400">{SCORE_DATA.score}</span>
          </CardTitle>
          <CardDescription className="text-slate-400">Tendência: {SCORE_DATA.trend} (vs. mês anterior)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'RFM', value: SCORE_DATA.rfm, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'NPS', value: SCORE_DATA.nps, icon: Users, color: 'text-blue-400' },
              { label: 'Engajamento', value: SCORE_DATA.engagement, icon: Zap, color: 'text-amber-400' },
              { label: 'LTV', value: SCORE_DATA.ltv, icon: Award, color: 'text-violet-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-lg font-bold text-slate-200 mt-1">{value.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200">Dimensões (Radar 360°)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 text-sm">Evolução do Score (Últimos 5 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[7, 8]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="score" stroke="#10b981" dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}