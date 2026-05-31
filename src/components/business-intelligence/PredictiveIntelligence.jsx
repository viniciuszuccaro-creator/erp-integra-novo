import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, AlertTriangle, Zap } from 'lucide-react';

export default function PredictiveIntelligence() {
  const forecastData = [
    { mes: 'Jun', atual: 5.4, previsto: 5.7, confianca: 92 },
    { mes: 'Jul', atual: null, previsto: 6.1, confianca: 88 },
    { mes: 'Ago', atual: null, previsto: 6.3, confianca: 85 },
    { mes: 'Set', atual: null, previsto: 6.5, confianca: 82 },
    { mes: 'Out', atual: null, previsto: 6.8, confianca: 78 },
  ];

  const anomalies = [
    { tipo: 'Receita', descricao: 'Crescimento 8% acima do padrão sazonal', confianca: 87, impacto: 'Positivo', acao: 'Investigar oportunidades' },
    { tipo: 'RH', descricao: 'Rotatividade subindo (turnover 2.5% vs 1.8% histórico)', confianca: 91, impacto: 'Negativo', acao: 'Revisar retenção' },
    { tipo: 'Logística', descricao: 'Aumento de ocorrências (+15% em 30 dias)', confianca: 85, impacto: 'Negativo', acao: 'Renegociar com transportadoras' },
    { tipo: 'Produção', descricao: 'Índice de refugo reduzindo consistentemente', confianca: 89, impacto: 'Positivo', acao: 'Escalar processo' },
  ];

  const predictions = [
    { metricas: 'Receita em 90 dias', previsto: 'R$ 18.6M', intervalo: 'R$ 17.8M - R$ 19.4M', prob: 87 },
    { metricas: 'Turnover RH (Q3)', previsto: '3.2%', intervalo: '2.8% - 3.6%', prob: 79 },
    { metricas: 'Custo Logística', previsto: 'R$ 580k', intervalo: 'R$ 550k - R$ 610k', prob: 83 },
    { metricas: 'Capacidade Produção', previsto: '92%', intervalo: '88% - 95%', prob: 81 },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Previsão de Receita */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            Previsão de Receita (Próximos 5 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'R$ M', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 p-2 rounded border border-slate-600 text-xs text-slate-200">
                        <p className="font-semibold">{data.mes}</p>
                        {data.atual && <p>Atual: R$ {data.atual}M</p>}
                        <p>Previsto: R$ {data.previsto}M</p>
                        <p className="text-cyan-400">Confiança: {data.confianca}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="previsto" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} />
              {forecastData.filter(d => d.atual).length > 0 && (
                <Line type="monotone" dataKey="atual" stroke="#10b981" strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detecção de Anomalias */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Anomalias Detectadas (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-80 overflow-y-auto">
            {anomalies.map((anom, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${anom.impacto === 'Positivo' ? 'bg-emerald-900/20 border-emerald-600/30' : 'bg-red-900/20 border-red-600/30'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{anom.tipo}</p>
                  <Badge className="bg-purple-900 text-purple-200">{anom.confianca}% conf</Badge>
                </div>
                <p className="text-xs text-slate-400 mb-2">{anom.descricao}</p>
                <div className="flex justify-between text-xs">
                  <Badge className={anom.impacto === 'Positivo' ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'}>
                    {anom.impacto}
                  </Badge>
                  <p className="text-cyan-400">→ {anom.acao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cenários Preditivos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Cenários Preditivos (Próximos 90 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-80 overflow-y-auto">
            {predictions.map((pred, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="font-semibold text-white text-sm mb-1">{pred.metricas}</p>
                <div className="mb-2">
                  <p className="text-xs text-slate-400">Valor Esperado</p>
                  <p className="text-sm font-bold text-emerald-400">{pred.previsto}</p>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-slate-400">Intervalo de Confiança</p>
                  <p className="text-xs text-cyan-400">{pred.intervalo}</p>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full" style={{ width: `${pred.prob}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Probabilidade: {pred.prob}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Modelo IA Performance */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Desempenho dos Modelos Preditivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { modelo: 'Forecast Receita', acuracia: 92, mensagens: 'Excelente' },
              { modelo: 'Detecção Anomalias', acuracia: 87, mensagens: 'Bom' },
              { modelo: 'Previsão Turnover', acuracia: 81, mensagens: 'Bom' },
              { modelo: 'Cenários Financeiros', acuracia: 85, mensagens: 'Bom' },
            ].map((m, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{m.modelo}</p>
                <p className="text-lg font-bold text-blue-400 mb-1">{m.acuracia}%</p>
                <Badge className="text-xs bg-emerald-900 text-emerald-200">{m.mensagens}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}