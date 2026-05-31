import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

export default function CustomerSegmentationPanel() {
  const [segmentFilter, setSegmentFilter] = useState('todos');

  const segmentacaoData = [
    { name: 'Premium Elite', valor: 32, cor: '#ef4444', clientes: 234, receita: 'R$ 2.8M', margin: 38 },
    { name: 'Growth High', valor: 28, cor: '#3b82f6', clientes: 456, receita: 'R$ 1.9M', margin: 22 },
    { name: 'Standard Core', valor: 25, cor: '#10b981', clientes: 892, receita: 'R$ 1.2M', margin: 18 },
    { name: 'Budget Mass', valor: 15, cor: '#f59e0b', clientes: 1543, receita: 'R$ 0.8M', margin: 12 },
  ];

  const comportamentoSegmentos = [
    { segmento: 'Premium Elite', compras_ano: 24, ticket: 11900, dias_medio: 15, satisfacao: 4.8 },
    { segmento: 'Growth High', compras_ano: 18, ticket: 4200, dias_medio: 20, satisfacao: 4.5 },
    { segmento: 'Standard Core', compras_ano: 12, ticket: 1350, dias_medio: 28, satisfacao: 4.1 },
    { segmento: 'Budget Mass', compras_ano: 8, ticket: 520, dias_medio: 35, satisfacao: 3.8 },
  ];

  const recomendacoesSegmento = [
    { segmento: 'Premium Elite', acao: 'VIP Program + Eventos exclusivos + Account manager dedicado', impacto: '+8% retenção' },
    { segmento: 'Growth High', acao: 'Upsell/Cross-sell targeting + Programas de fidelidade', impacto: '+12% LTV' },
    { segmento: 'Standard Core', acao: 'Automação marketing + Self-service + Community building', impacto: '+6% engagement' },
    { segmento: 'Budget Mass', acao: 'Freemium upgrade path + Volume discounts + Referral program', impacto: '+15% conversão' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Distribuição por Segmento (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentacaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, valor }) => `${name} ${valor}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {segmentacaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cards de Segmentos */}
        <div className="space-y-2 overflow-y-auto h-64">
          {segmentacaoData.map((seg) => (
            <Card key={seg.name} className="bg-slate-700/50 border-slate-600 cursor-pointer hover:border-slate-500">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: seg.cor }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{seg.name}</p>
                      <p className="text-xs text-slate-400">{seg.clientes} clientes</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">{seg.valor}%</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/50 p-1 rounded">
                    <p className="text-slate-400">Receita</p>
                    <p className="text-emerald-400 font-semibold">{seg.receita}</p>
                  </div>
                  <div className="bg-slate-800/50 p-1 rounded">
                    <p className="text-slate-400">Margem</p>
                    <p className="text-blue-400 font-semibold">{seg.margin}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comportamento */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Comportamento de Compra por Segmento</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comportamentoSegmentos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="segmento" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="compras_ano" fill="#3b82f6" name="Compras/Ano" />
              <Bar dataKey="dias_medio" fill="#f59e0b" name="Dias Médio" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recomendações por Segmento */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Estratégias de Retenção & Crescimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recomendacoesSegmento.map((rec) => (
            <div key={rec.segmento} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-white text-sm">{rec.segmento}</p>
                <Badge className="bg-emerald-900 text-emerald-200 text-xs">{rec.impacto}</Badge>
              </div>
              <p className="text-xs text-slate-400">{rec.acao}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}