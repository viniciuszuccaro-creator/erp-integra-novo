import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';

export default function RealtimeAnomalyMonitor() {
  const realtimeData = [
    { tempo: '14:00', financeiro: 92, rh: 78, logistica: 89, producao: 96 },
    { tempo: '14:15', financeiro: 91, rh: 79, logistica: 87, producao: 95 },
    { tempo: '14:30', financeiro: 89, rh: 75, logistica: 84, producao: 94 },
    { tempo: '14:45', financeiro: 87, rh: 72, logistica: 81, producao: 92 },
    { tempo: '15:00', financeiro: 85, rh: 68, logistica: 78, producao: 90 },
  ];

  const anomaliasAtivas = [
    {
      id: 1,
      area: 'RH',
      descricao: 'Turnover subindo 45% em 48h - Possível problema retenção',
      severidade: 'Crítico',
      tempo: 'Agora',
      confianca: 94,
      trend: 'Piorando'
    },
    {
      id: 2,
      area: 'Logística',
      descricao: 'Atraso em entregas: 8 ocorrências vs 2 esperadas (4x acima)',
      severidade: 'Alto',
      tempo: '15min',
      confianca: 89,
      trend: 'Piorando'
    },
    {
      id: 3,
      area: 'Financeiro',
      descricao: 'Fluxo de caixa 12% abaixo projeção - Possível inadimplência',
      severidade: 'Alto',
      tempo: '32min',
      confianca: 87,
      trend: 'Estável'
    },
    {
      id: 4,
      area: 'Produção',
      descricao: 'Indice de refugo +2.3% em 4 horas - Máquina A suspeita',
      severidade: 'Médio',
      tempo: '45min',
      confianca: 82,
      trend: 'Melhorando'
    },
    {
      id: 5,
      area: 'Comercial',
      descricao: 'Taxa de conversão caindo 8% - Possível problema sistema',
      severidade: 'Médio',
      tempo: '1h2m',
      confianca: 79,
      trend: 'Estável'
    },
  ];

  const severityColor = (sev) => {
    switch (sev) {
      case 'Crítico': return 'bg-red-900 text-red-200 border-red-600';
      case 'Alto': return 'bg-orange-900 text-orange-200 border-orange-600';
      case 'Médio': return 'bg-yellow-900 text-yellow-200 border-yellow-600';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const trendColor = (trend) => {
    if (trend === 'Piorando') return 'text-red-400';
    if (trend === 'Melhorando') return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Gráfico em Tempo Real */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Saúde de Áreas (Últimos 60 Minutos)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="tempo" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="financeiro" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="rh" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="logistica" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="producao" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalias em Tempo Real */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-pulse" />
            Anomalias Detectadas (Ao Vivo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {anomaliasAtivas.map((anom) => (
            <div
              key={anom.id}
              className={`p-3 rounded-lg border-2 ${severityColor(anom.severidade)} bg-opacity-20`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-white text-sm">{anom.area}</p>
                <div className="flex items-center gap-1">
                  <Badge className={severityColor(anom.severidade)}>
                    {anom.severidade}
                  </Badge>
                  <Badge className="bg-slate-700 text-slate-200 text-xs">{anom.confianca}%</Badge>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-2">{anom.descricao}</p>

              <div className="flex justify-between text-xs text-slate-400">
                <span>Detectado: {anom.tempo} atrás</span>
                <span className={`font-semibold ${trendColor(anom.trend)}`}>
                  📈 {anom.trend}
                </span>
              </div>

              {/* Indicador visual de severidade */}
              <div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-1 ${
                    anom.severidade === 'Crítico'
                      ? 'bg-red-500'
                      : anom.severidade === 'Alto'
                      ? 'bg-orange-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{
                    width: anom.severidade === 'Crítico' ? '100%' : anom.severidade === 'Alto' ? '75%' : '50%'
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumo de Detecção */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Estatísticas de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: 'Anomalias Críticas', valor: 2, cor: 'text-red-400' },
              { label: 'Anomalias Altas', valor: 2, cor: 'text-orange-400' },
              { label: 'Anomalias Médias', valor: 3, cor: 'text-yellow-400' },
              { label: 'Taxa Detecção', valor: '94%', cor: 'text-blue-400' },
              { label: 'Alertas/hora', valor: '8.3', cor: 'text-purple-400' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-700/50 p-2 rounded border border-slate-600 text-center">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.cor}`}>{stat.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}