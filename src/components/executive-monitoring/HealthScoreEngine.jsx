import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function HealthScoreEngine() {
  const healthScoreData = [
    { metric: 'Financeiro', score: 85, meta: 90 },
    { metric: 'RH', score: 72, meta: 85 },
    { metric: 'Logística', score: 78, meta: 90 },
    { metric: 'Produção', score: 90, meta: 90 },
    { metric: 'Comercial', score: 88, meta: 95 },
  ];

  const historicalData = [
    { mes: 'Fev', geral: 6.8, financeiro: 8.2, rh: 6.5, logistica: 7.2, producao: 8.8 },
    { mes: 'Mar', geral: 7.1, financeiro: 8.4, rh: 6.8, logistica: 7.5, producao: 8.9 },
    { mes: 'Abr', geral: 7.4, financeiro: 8.5, rh: 7.2, logistica: 7.8, producao: 8.95 },
    { mes: 'Mai', geral: 7.6, financeiro: 8.6, rh: 7.5, logistica: 8.0, producao: 9.0 },
    { mes: 'Jun', geral: 7.8, financeiro: 8.5, rh: 7.2, logistica: 7.8, producao: 9.0 },
  ];

  const healthStatus = (score) => {
    if (score >= 85) return { label: 'Excelente', color: 'text-emerald-400', bg: 'bg-emerald-900/30' };
    if (score >= 75) return { label: 'Bom', color: 'text-blue-400', bg: 'bg-blue-900/30' };
    if (score >= 65) return { label: 'Aceitável', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const globalScore = Math.round((85 + 72 + 78 + 90 + 88) / 5 * 10) / 10;

  const insights = [
    { area: 'Produção', destaque: '🚀 Excelente performance - mantendo 9.0/10', tendencia: '↑' },
    { area: 'Financeiro', destaque: '⚠️ Pequena queda (-0.1) por inadimplência', tendencia: '→' },
    { area: 'Logística', destaque: '📉 Risco elevado (+1 anomalia crítica)', tendencia: '↓' },
    { area: 'RH', destaque: '🚨 Crítico - Turnover acelerado (-0.3)', tendencia: '↓' },
    { area: 'Comercial', destaque: '⚠️ Conversão caindo (taxa de fechamento -2%)', tendencia: '↓' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Score Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Macro */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Score Geral</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${(globalScore / 10) * 2 * Math.PI * 54} ${2 * Math.PI * 54}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-emerald-400">{globalScore}</p>
                <p className="text-xs text-slate-400">/10</p>
              </div>
            </div>
            <Badge className="mt-4 bg-emerald-900 text-emerald-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              {healthStatus(globalScore * 10).label}
            </Badge>
          </CardContent>
        </Card>

        {/* Scores por Área */}
        <Card className="bg-slate-800 border-slate-700 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Scores por Área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-40 overflow-y-auto">
            {healthScoreData.map((item) => {
              const status = healthStatus(item.score);
              return (
                <div key={item.metric} className={`p-2 rounded-lg border border-slate-600 ${status.bg}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-white">{item.metric}</p>
                    <p className={`text-sm font-bold ${status.color}`}>{item.score}/{item.meta}</p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${status.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(item.score / item.meta) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Radar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Análise Radar - Saúde Consolidada</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={healthScoreData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
              <PolarRadiusAxis stroke="#94a3b8" angle={90} domain={[0, 100]} />
              <Radar name="Score Atual" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Meta" dataKey="meta" stroke="#10b981" fill="none" strokeDasharray="5 5" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução Histórica */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Evolução de Saúde (Últimos 5 Meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="geral" stroke="#3b82f6" strokeWidth={3} name="Score Geral" />
              <Line type="monotone" dataKey="financeiro" stroke="#10b981" strokeWidth={1.5} name="Financeiro" />
              <Line type="monotone" dataKey="rh" stroke="#ef4444" strokeWidth={1.5} name="RH" />
              <Line type="monotone" dataKey="logistica" stroke="#f59e0b" strokeWidth={1.5} name="Logística" />
              <Line type="monotone" dataKey="producao" stroke="#8b5cf6" strokeWidth={1.5} name="Produção" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, idx) => {
            const trendColor = insight.tendencia === '↑' ? 'text-green-400' : insight.tendencia === '↓' ? 'text-red-400' : 'text-yellow-400';
            return (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">{insight.area}</p>
                    <p className="text-xs text-slate-400">{insight.destaque}</p>
                  </div>
                  <span className={`text-lg font-bold ${trendColor}`}>{insight.tendencia}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recomendação Geral */}
      <Card className="bg-blue-900/30 border-blue-600">
        <CardContent className="p-4">
          <p className="text-sm text-blue-200 font-semibold mb-2">💡 Recomendação Geral</p>
          <p className="text-xs text-blue-200">
            Foco imediato em RH (turnover crítico) e Logística (atrasos em alta). Produção mantém excelência. 
            Projeção: Score 8.1 em 30 dias se ações críticas forem executadas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}