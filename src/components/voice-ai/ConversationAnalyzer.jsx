import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Brain, TrendingUp, AlertCircle, Smile } from 'lucide-react';

export default function ConversationAnalyzer() {
  const sentimentoData = [
    { nome: 'Positivo', valor: 42, cor: '#10b981' },
    { nome: 'Neutro', valor: 38, cor: '#6b7280' },
    { nome: 'Negativo', valor: 20, cor: '#ef4444' },
  ];

  const intencoesData = [
    { intencao: 'Consulta', freq: 245, acerto: 94 },
    { intencao: 'Compra', freq: 187, acerto: 88 },
    { intencao: 'Suporte', freq: 156, acerto: 91 },
    { intencao: 'Reclamação', freq: 89, acerto: 85 },
    { intencao: 'Outro', freq: 45, acerto: 72 },
  ];

  const conversas = [
    { id: 'C001', usuario: 'Cliente XYZ', sentimento: 'Positivo', intencao: 'Compra', confianca: 96, resolucao: 'IA' },
    { id: 'C002', usuario: 'João Silva', sentimento: 'Neutro', intencao: 'Consulta', confianca: 89, resolucao: 'IA' },
    { id: 'C003', usuario: 'Maria Santos', sentimento: 'Negativo', intencao: 'Reclamação', confianca: 84, resolucao: 'Agente' },
    { id: 'C004', usuario: 'Pedro Costa', sentimento: 'Positivo', intencao: 'Compra', confianca: 92, resolucao: 'IA' },
  ];

  const getSentimentoColor = (s) => {
    if (s === 'Positivo') return 'text-emerald-400 bg-emerald-900/30';
    if (s === 'Negativo') return 'text-red-400 bg-red-900/30';
    return 'text-slate-300 bg-slate-700/30';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Satisfação Média</p>
                <p className="text-xl font-bold text-emerald-400">8.4/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Acerto IA</p>
                <p className="text-xl font-bold text-purple-400">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentimento */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Distribuição de Sentimento</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sentimentoData} dataKey="valor" cx="50%" cy="50%" innerRadius={50} outerRadius={70}>
                {sentimentoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Intenções */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Intenções Detectadas</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intencoesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="intencao" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="freq" fill="#8b5cf6" name="Frequência" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise de Conversas */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Análise de Conversas</h3>
        {conversas.map(c => (
          <Card key={c.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{c.usuario}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Intenção: {c.intencao} • Confiança: {c.confianca}%</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${getSentimentoColor(c.sentimento)}`}>
                    {c.sentimento}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-900 text-blue-200 font-semibold">
                    {c.resolucao}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}