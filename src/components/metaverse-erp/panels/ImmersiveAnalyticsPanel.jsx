import React, { useState } from 'react';
import { Cpu, TrendingUp, Globe, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const radialData = [
  { name: 'Vendas', value: 87, fill: '#6366f1' },
  { name: 'Produção', value: 73, fill: '#8b5cf6' },
  { name: 'Financeiro', value: 91, fill: '#06b6d4' },
  { name: 'Logística', value: 82, fill: '#10b981' },
];

const barData = [
  { modulo: 'CRM', sessoes: 145, engajamento: 78 },
  { modulo: 'Vendas', sessoes: 234, engajamento: 89 },
  { modulo: 'Estoque', sessoes: 98, engajamento: 65 },
  { modulo: 'Financeiro', sessoes: 187, engajamento: 82 },
  { modulo: 'RH', sessoes: 67, engajamento: 71 },
];

export default function ImmersiveAnalyticsPanel() {
  const [insights] = useState([
    {
      id: 'IA-MV-001',
      titulo: 'Módulo Comercial — Pico de Uso XR',
      descricao: 'Sessões imersivas aumentaram 34% comparado à semana anterior',
      impacto: 'Redução de 18% no tempo de decisão de compra',
      confianca_ia: 94,
      tipo: 'oportunidade',
      prioridade: 'alta'
    },
    {
      id: 'IA-MV-002',
      titulo: 'AR Products — Alta Conversão',
      descricao: 'Produtos com modelo AR têm 2.8x mais conversão que sem AR',
      impacto: '+28% nas vendas de produtos com visualização 3D',
      confianca_ia: 96,
      tipo: 'sucesso',
      prioridade: 'alta'
    },
    {
      id: 'IA-MV-003',
      titulo: 'Colaboração Virtual — Adoção Crescente',
      descricao: 'Tempo médio de reunião reduziu 22min com salas XR',
      impacto: 'Economia estimada de 4h/semana por equipe',
      confianca_ia: 88,
      tipo: 'oportunidade',
      prioridade: 'media'
    },
  ]);

  const getTipoColor = (tipo) => {
    if (tipo === 'sucesso') return 'bg-emerald-50 border-emerald-300';
    if (tipo === 'oportunidade') return 'bg-blue-50 border-blue-300';
    return 'bg-yellow-50 border-yellow-300';
  };

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-violet-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Immersive Analytics — IA + XR Insights</h3>
            <p className="text-sm text-slate-600">Análises comportamentais e preditivas em ambiente imersivo</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-violet-600">IA Ativa</Badge>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-600" />
              Performance por Módulo (Score %)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData}>
                <RadialBar minAngle={15} dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Sessões XR por Módulo (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="modulo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="sessoes" fill="#6366f1" name="Sessões" radius={[3, 3, 0, 0]} />
                <Bar dataKey="engajamento" fill="#8b5cf6" name="Engajamento%" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* IA Insights */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">IA Insights — Ambiente Imersivo</h3>
        {insights.map((insight) => (
          <Card key={insight.id} className={`border-2 ${getTipoColor(insight.tipo)}`}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-sm text-slate-900">{insight.titulo}</h4>
                <Badge className={insight.prioridade === 'alta' ? 'bg-orange-600' : 'bg-blue-600'} >
                  {insight.prioridade.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-700">{insight.descricao}</p>
              <p className="text-xs text-emerald-700 font-semibold">{insight.impacto}</p>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">Confiança IA</span>
                  <span className="text-xs font-semibold">{insight.confianca_ia}%</span>
                </div>
                <Progress value={insight.confianca_ia} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}