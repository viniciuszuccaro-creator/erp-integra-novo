import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { SmilePlus, Frown, Meh } from 'lucide-react';

export default function SatisfactionPulsePanel() {
  const [period, setPeriod] = useState('mes');

  const npsData = [
    { categoria: 'Qualidade Produto', score: 8.5, industria: 7.8 },
    { categoria: 'Atendimento', score: 8.2, industria: 7.5 },
    { categoria: 'Prazo Entrega', score: 7.8, industria: 8.1 },
    { categoria: 'Preço/Valor', score: 7.2, industria: 7.3 },
    { categoria: 'Pós-venda', score: 8.8, industria: 7.9 },
  ];

  const npsTimeline = [
    { mes: 'Jan', nps: 32, promotores: 55, passivos: 32, detratores: 13 },
    { mes: 'Fev', nps: 35, promotores: 57, passivos: 30, detratores: 13 },
    { mes: 'Mar', nps: 38, promotores: 60, passivos: 28, detratores: 12 },
    { mes: 'Abr', nps: 42, promotores: 64, passivos: 26, detratores: 10 },
    { mes: 'Mai', nps: 45, promotores: 67, passivos: 24, detratores: 9 },
    { mes: 'Jun', nps: 48, promotores: 70, passivos: 22, detratores: 8 },
  ];

  const satisfacaoSegmentos = [
    { segmento: 'Premium Elite', nps: 72, sentimento: 'Excelente', respondentes: 234 },
    { segmento: 'Growth High', nps: 52, sentimento: 'Bom', respondentes: 456 },
    { segmento: 'Standard Core', nps: 35, sentimento: 'Neutro', respondentes: 892 },
    { segmento: 'Budget Mass', nps: 18, sentimento: 'Crítico', respondentes: 1543 },
  ];

  const feedback = [
    { tipo: 'Positivo', tema: 'Qualidade excepcional dos produtos', contagem: 128, trend: '↑' },
    { tipo: 'Positivo', tema: 'Pós-venda e suporte muito bom', contagem: 94, trend: '↑' },
    { tipo: 'Neutro', tema: 'Prazo de entrega aceitável', contagem: 76, trend: '→' },
    { tipo: 'Negativo', tema: 'Atrasos em entregas recentes', contagem: 48, trend: '↑' },
    { tipo: 'Negativo', tema: 'Preço competitivo com concorrentes', contagem: 32, trend: '↓' },
  ];

  const feedbackColor = (tipo) => {
    switch (tipo) {
      case 'Positivo': return 'bg-emerald-900/30 border-emerald-600 text-emerald-200';
      case 'Negativo': return 'bg-red-900/30 border-red-600 text-red-200';
      default: return 'bg-yellow-900/30 border-yellow-600 text-yellow-200';
    }
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Score Geral NPS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NPS Geral */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Score NPS Atual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <p className="text-4xl font-bold text-emerald-400">48</p>
            <p className="text-xs text-slate-400 mt-2">Acima da média (42)</p>
            <Badge className="mt-4 bg-emerald-900 text-emerald-200 flex items-center gap-1">
              <SmilePlus className="w-3 h-3" />
              +3 vs Mês Anterior
            </Badge>
          </CardContent>
        </Card>

        {/* Distribuição */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Distribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-40">
            <div>
              <p className="text-xs text-slate-400 mb-1">Promotores (9-10)</p>
              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '70%' }} />
              </div>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">70%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Passivos (7-8)</p>
              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: '22%' }} />
              </div>
              <p className="text-xs text-yellow-400 mt-1 font-semibold">22%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Detratores (0-6)</p>
              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: '8%' }} />
              </div>
              <p className="text-xs text-red-400 mt-1 font-semibold">8%</p>
            </div>
          </CardContent>
        </Card>

        {/* Insight Rápido */}
        <Card className="bg-blue-900/30 border-blue-600">
          <CardContent className="p-4 h-40 flex flex-col justify-center">
            <p className="text-xs text-blue-400 mb-2 font-semibold">💡 Insight</p>
            <p className="text-sm text-blue-200">
              NPS crescente (+3). Premium Elite com 72% satisfação. Focus: Budget Mass (18%) para evitar churn.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evolução NPS */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Evolução NPS (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={npsTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="promotores" stackId="a" fill="#10b981" name="Promotores" />
              <Bar dataKey="passivos" stackId="a" fill="#f59e0b" name="Passivos" />
              <Bar dataKey="detratores" stackId="a" fill="#ef4444" name="Detratores" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Satisfação por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={npsData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" domain={[0, 10]} />
                <Radar name="Nossa Empresa" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Média Indústria" dataKey="industria" stroke="#10b981" strokeDasharray="5 5" fill="none" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segmentos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Satisfação por Segmento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-64 overflow-y-auto">
            {satisfacaoSegmentos.map((seg) => (
              <div key={seg.segmento} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-white text-sm">{seg.segmento}</p>
                  <Badge className={
                    seg.nps >= 50 ? 'bg-emerald-900 text-emerald-200' :
                    seg.nps >= 30 ? 'bg-yellow-900 text-yellow-200' :
                    'bg-red-900 text-red-200'
                  }>
                    {seg.nps}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <p className="text-slate-400">{seg.respondentes} respondentes</p>
                  <p className="text-slate-300">{seg.sentimento}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Temas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Feedback: Temas Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex justify-between items-start ${feedbackColor(item.tipo)}`}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.tema}</p>
                <p className="text-xs mt-1 opacity-75">{item.contagem} menções</p>
              </div>
              <span className="text-lg font-bold ml-2">{item.trend}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}