import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const previsaoDemanda = [
  { mes: 'Jun', realizado: 480, previsto: 490, confianca: 92 },
  { mes: 'Jul', realizado: null, previsto: 510, confianca: 88 },
  { mes: 'Ago', realizado: null, previsto: 535, confianca: 82 },
  { mes: 'Set', realizado: null, previsto: 560, confianca: 76 },
  { mes: 'Out', realizado: null, previsto: 590, confianca: 68 },
];

const riscoOperacional = [
  { area: 'Estoque', risco: 72, trend: '+5%', acao: 'Aumentar buffer safety stock' },
  { area: 'Produção', risco: 45, trend: '-2%', acao: 'Monitorar preventivo Máq A' },
  { area: 'Logística', risco: 68, trend: '+8%', acao: 'Contrato backup transportadora' },
  { area: 'RH', risco: 81, trend: '+12%', acao: 'Plano retenção talentos críticos' },
  { area: 'Financeiro', risco: 38, trend: '-4%', acao: 'Manter reservas de liquidez' },
];

const insightsIA = [
  { prioridade: 'Crítico', titulo: 'Ruptura de Bitola 10mm prevista em 4 dias', confianca: 94, impacto: 'R$ 45k em pedidos parados', acao: 'Emitir OC emergencial hoje' },
  { prioridade: 'Alto', titulo: 'Sazonalidade: demanda +18% em Agosto', confianca: 87, impacto: '+R$ 95k em oportunidade', acao: 'Aumentar produção e estoque agora' },
  { prioridade: 'Médio', titulo: 'Custo frete SP-RJ subindo (tendência 30d)', confianca: 78, impacto: 'R$ 12k extra/mês', acao: 'Renegociar contrato transportadora' },
  { prioridade: 'Baixo', titulo: 'Eficiência logística melhorável na Zona Norte', confianca: 71, impacto: 'Economia R$ 3k/mês', acao: 'Consolidar cargas por região' },
];

const prioridadeColor = (p) => {
  switch (p) {
    case 'Crítico': return 'bg-red-900 text-red-200';
    case 'Alto': return 'bg-orange-900 text-orange-200';
    case 'Médio': return 'bg-yellow-900 text-yellow-200';
    default: return 'bg-slate-700 text-slate-200';
  }
};

const riscoColor = (r) => {
  if (r >= 75) return 'text-red-400';
  if (r >= 55) return 'text-orange-400';
  if (r >= 35) return 'text-yellow-400';
  return 'text-emerald-400';
};

export default function PredictiveOpsEngine() {
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700 rounded-lg p-3">
        <Brain className="w-6 h-6 text-purple-400" />
        <div>
          <p className="text-sm font-semibold text-white">Motor Preditivo IA v3.1</p>
          <p className="text-xs text-slate-400">Modelos treinados em 24 meses de dados • Atualizado há 5min</p>
        </div>
        <Badge className="ml-auto bg-purple-900 text-purple-200 animate-pulse">IA Ativa</Badge>
      </div>

      {/* Previsão de Demanda */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Previsão de Demanda — Próximos 4 Meses
          </CardTitle>
        </CardHeader>
        <CardContent className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={previsaoDemanda}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="realizado" fill="#10b981" name="Realizado (ton)" />
              <Bar dataKey="previsto" fill="#3b82f6" name="Previsto (ton)" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risco Operacional por Área */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Score de Risco Operacional por Área
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {riscoOperacional.map((area, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedArea === idx ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}
              onClick={() => setSelectedArea(selectedArea === idx ? null : idx)}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-white text-sm">{area.area}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400">{area.trend}</p>
                  <p className={`text-lg font-bold ${riscoColor(area.risco)}`}>{area.risco}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${area.risco >= 75 ? 'bg-red-500' : area.risco >= 55 ? 'bg-orange-500' : area.risco >= 35 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${area.risco}%` }}
                />
              </div>
              {selectedArea === idx && (
                <p className="text-xs text-blue-300 font-semibold">→ {area.acao}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights IA */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Insights Preditivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insightsIA.map((insight, idx) => (
            <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-white text-sm flex-1 pr-2">{insight.titulo}</p>
                <Badge className={prioridadeColor(insight.prioridade)}>{insight.prioridade}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-400">Impacto</p>
                  <p className="text-orange-400 font-semibold">{insight.impacto}</p>
                </div>
                <div>
                  <p className="text-slate-400">Confiança IA</p>
                  <p className="text-purple-400 font-semibold">{insight.confianca}%</p>
                </div>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-700 p-2 rounded">
                <p className="text-xs text-emerald-300 font-semibold">→ {insight.acao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}