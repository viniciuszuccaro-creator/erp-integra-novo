import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function OperationsKPIPanel() {
  const kpis = [
    { nome: 'OEE Geral', valor: '83%', meta: '85%', trend: 'up', delta: '+2%', cor: 'text-emerald-400' },
    { nome: 'On-Time Delivery', valor: '92%', meta: '95%', trend: 'stable', delta: '0%', cor: 'text-blue-400' },
    { nome: 'Lead Time Médio', valor: '3.2d', meta: '3.0d', trend: 'down', delta: '-0.1d', cor: 'text-yellow-400' },
    { nome: 'Cost Per Unit', valor: 'R$ 8.45', meta: 'R$ 8.20', trend: 'down', delta: '+R$0.12', cor: 'text-red-400' },
    { nome: 'Taxa de Refugo', valor: '1.8%', meta: '1.5%', trend: 'down', delta: '-0.3%', cor: 'text-orange-400' },
    { nome: 'Utilização Capacidade', valor: '76%', meta: '80%', trend: 'up', delta: '+4%', cor: 'text-purple-400' },
    { nome: 'Paradas Não-Planej.', valor: '3', meta: '2', trend: 'stable', delta: '0', cor: 'text-cyan-400' },
    { nome: 'Satisfação Qualidade', valor: '4.6/5', meta: '4.5/5', trend: 'up', delta: '+0.1', cor: 'text-emerald-400' },
  ];

  const trendData = [
    { semana: 'S1', oee: 79, otd: 90, refugo: 2.4 },
    { semana: 'S2', oee: 81, otd: 91, refugo: 2.1 },
    { semana: 'S3', oee: 80, otd: 92, refugo: 2.0 },
    { semana: 'S4', oee: 83, otd: 92, refugo: 1.8 },
  ];

  const radarData = [
    { area: 'Qualidade', valor: 88, meta: 90 },
    { area: 'Velocidade', valor: 83, meta: 85 },
    { area: 'Confiabilidade', valor: 79, meta: 85 },
    { area: 'Custo', valor: 72, meta: 80 },
    { area: 'Flex.', valor: 85, meta: 82 },
    { area: 'Segurança', valor: 95, meta: 95 },
  ];

  const insights = [
    { tipo: 'success', texto: 'OEE +2% na última semana. Meta de 85% a 2pp de distância.' },
    { tipo: 'warning', texto: 'Cost Per Unit acima da meta. Investigar desperdício em linha B.' },
    { tipo: 'info', texto: 'On-Time Delivery estável em 92%. Próxima meta: 95% via roteamento IA.' },
    { tipo: 'danger', texto: 'Taxa de refugo melhorou mas ainda acima da meta 1.5%. Foco em linha C-Solda.' },
  ];

  const insightColor = (tipo) => {
    switch (tipo) {
      case 'success': return 'border-emerald-600 bg-emerald-900/20 text-emerald-200';
      case 'warning': return 'border-yellow-600 bg-yellow-900/20 text-yellow-200';
      case 'danger': return 'border-red-600 bg-red-900/20 text-red-200';
      default: return 'border-blue-600 bg-blue-900/20 text-blue-200';
    }
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Grid KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <p className="text-xs text-slate-400 mb-1">{kpi.nome}</p>
              <div className="flex items-center justify-between">
                <p className={`text-lg font-bold ${kpi.cor}`}>{kpi.valor}</p>
                <TrendIcon trend={kpi.trend} />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Meta: {kpi.meta}</span>
                <span className={kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'}>
                  {kpi.delta}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Evolução Semanal — OEE, OTD e Refugo</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="semana" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Area type="monotone" dataKey="oee" stroke="#3b82f6" fill="#3b82f620" name="OEE%" />
              <Area type="monotone" dataKey="otd" stroke="#10b981" fill="#10b98120" name="OTD%" />
              <Area type="monotone" dataKey="refugo" stroke="#ef4444" fill="#ef444420" name="Refugo%" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar de Excelência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Radar de Excelência Operacional</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="area" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#94a3b8" domain={[0, 100]} />
                <Radar name="Atual" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Meta" dataKey="meta" stroke="#10b981" fill="none" strokeDasharray="5 5" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights IA */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Insights IA — Análise Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-56 overflow-y-auto">
            {insights.map((ins, idx) => (
              <div key={idx} className={`p-3 rounded-lg border text-xs ${insightColor(ins.tipo)}`}>
                {ins.texto}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}