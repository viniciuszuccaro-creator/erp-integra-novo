import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Plus, TrendingUp } from 'lucide-react';

export default function RecruitmentForecastAI() {
  const forecastData = [
    { mes: 'Junho', necessidade: 2, hired: 0, confidence: 88 },
    { mes: 'Julho', necessidade: 4, hired: 0, confidence: 92 },
    { mes: 'Agosto', necessidade: 3, hired: 0, confidence: 85 },
  ];

  const recruits = [
    { cargo: 'Programador Senior', qty: 2, investimento: 'R$ 180k', timing: 'Junho', risco: 'baixo' },
    { cargo: 'Designer UI/UX', qty: 1, investimento: 'R$ 60k', timing: 'Junho', risco: 'médio' },
    { cargo: 'QA Automatizado', qty: 4, investimento: 'R$ 220k', timing: 'Julho', risco: 'alto' },
    { cargo: 'Gerente de Projeto', qty: 1, investimento: 'R$ 150k', timing: 'Agosto', risco: 'baixo' },
  ];

  const riskConfig = {
    baixo: 'bg-green-500/20 text-green-400 border-green-500/30',
    médio: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    alto: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Summary */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Necessidade Total (3M)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">9 pessoas</div>
          <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">3 meses</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Investimento Estimado</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">R$ 610k</div>
          <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-0">Orçado</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Confiança IA Média</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">88%</div>
          <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-0">Acurácia alta</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Requisições Criadas</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">4</div>
          <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-0">Via IA</Badge>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Gráfico */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Tendência de Necessidades (3 Meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="necessidade" stroke="#3b82f6" strokeWidth={2} name="Previsão" />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confiança (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Requisições */}
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Previsões de Recrutamento (IA)
            </h3>
          </div>
          <div className="space-y-3">
            {recruits.map((rec, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{rec.cargo}</h4>
                        <p className="text-xs text-slate-400 mt-1">Necessidade: <span className="text-blue-400 font-semibold">{rec.qty} pessoas</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs border-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {rec.investimento}
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-xs border-0">{rec.timing}</Badge>
                      <Badge className={`text-xs border ${riskConfig[rec.risco]}`}>
                        Risco: {rec.risco}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-3 h-3 mr-1" />
                    Requisição
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights IA */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Insight da IA</h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>• Maior pico de necessidade em Julho (4 pessoas). Início recrutamento em Maio recomendado.</li>
            <li>• QA Automatizado tem maior risco (alto). Considere treinamento interno + contratação.</li>
            <li>• Economia: Realoque 1 Designer de MG para SP economiza R$ 40k em contratação.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}