import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Gauge } from 'lucide-react';

export default function BusinessMetricsPanel() {
  const profitabilityByDept = [
    { dept: 'Comercial', lucro: 2400, margem: 58, target: 60 },
    { dept: 'Logística', lucro: 850, margem: 35, target: 40 },
    { dept: 'Produção', lucro: 1200, margem: 45, target: 50 },
    { dept: 'Financeiro', lucro: 380, margem: 62, target: 65 },
  ];

  const eficienciaData = [
    { nome: 'RH - Produtividade', value: 82, fill: '#3b82f6' },
    { nome: 'Logística - On-time', value: 94, fill: '#10b981' },
    { nome: 'Produção - Qualidade', value: 98.5, fill: '#8b5cf6' },
    { nome: 'Comercial - Closing Rate', value: 28, fill: '#f59e0b' },
    { nome: 'Financeiro - Acurácia', value: 96, fill: '#ef4444' },
  ];

  const metricsOverview = [
    {
      categoria: 'RH',
      metricas: [
        { nome: 'Headcount', valor: 156, meta: 160, status: 'Acima' },
        { nome: 'Turnover Anual', valor: 2.1, meta: 1.8, status: 'Abaixo' },
        { nome: 'Satisfação', valor: 78, meta: 85, status: 'Abaixo' },
        { nome: 'Produtividade', valor: 82, meta: 85, status: 'Perto' },
      ]
    },
    {
      categoria: 'Logística',
      metricas: [
        { nome: 'Taxa On-time', valor: 94, meta: 96, status: 'Perto' },
        { nome: 'Custo/Km', valor: 3.2, meta: 3.0, status: 'Abaixo' },
        { nome: 'Avarias', valor: 0.8, meta: 1.0, status: 'Acima' },
        { nome: 'Utilização Frota', valor: 87, meta: 90, status: 'Perto' },
      ]
    },
    {
      categoria: 'Produção',
      metricas: [
        { nome: 'Utilização', valor: 87, meta: 90, status: 'Perto' },
        { nome: 'Qualidade', valor: 98.5, meta: 99, status: 'Perto' },
        { nome: 'Refugo %', valor: 1.2, meta: 1.0, status: 'Abaixo' },
        { nome: 'Lead Time', valor: 4.2, meta: 4.0, status: 'Abaixo' },
      ]
    },
    {
      categoria: 'Comercial',
      metricas: [
        { nome: 'Ticket Médio', valor: 18500, meta: 20000, status: 'Abaixo' },
        { nome: 'Closing Rate', valor: 28, meta: 30, status: 'Perto' },
        { nome: 'Churn', valor: 2.1, meta: 1.5, status: 'Abaixo' },
        { nome: 'NPS', valor: 72, meta: 80, status: 'Abaixo' },
      ]
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Acima': return 'bg-emerald-900 text-emerald-200';
      case 'Abaixo': return 'bg-red-900 text-red-200';
      case 'Perto': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Rentabilidade por Departamento */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Rentabilidade por Departamento</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitabilityByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="dept" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro (k)" />
              <Bar dataKey="margem" fill="#10b981" name="Margem %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Eficiência por Área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Indicadores de Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eficienciaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, value }) => `${nome}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eficienciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPIs Críticos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              KPIs Críticos (Vs Meta)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-64 overflow-y-auto">
            {[
              { kpi: 'Receita Mensal', atual: 'R$ 5.4M', meta: 'R$ 5.8M', perf: 93 },
              { kpi: 'Lucro Operacional', atual: 'R$ 3.2M', meta: 'R$ 3.5M', perf: 91 },
              { kpi: 'Taxa de Inadimplência', atual: '2.1%', meta: '1.5%', perf: 71 },
              { kpi: 'Índice de Rotação', atual: 89, meta: 95, perf: 94 },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-700/50 p-2 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-white">{item.kpi}</p>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">{item.atual}</Badge>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Meta: {item.meta}</span>
                  <span className={item.perf >= 90 ? 'text-green-400' : item.perf >= 80 ? 'text-yellow-400' : 'text-red-400'}>
                    {item.perf}%
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.perf >= 90 ? 'bg-emerald-500' : item.perf >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(item.perf, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas por Categoria */}
      <div className="space-y-3">
        {metricsOverview.map((category, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">{category.categoria}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.metricas.map((m, midx) => (
                  <div key={midx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">{m.nome}</p>
                    <p className="text-sm font-bold text-cyan-400 mb-1">
                      {typeof m.valor === 'number' && m.valor > 100 ? m.valor.toFixed(0) : m.valor}
                    </p>
                    <div className="flex justify-between text-xs">
                      <p className="text-slate-400">Meta: {m.meta}</p>
                      <Badge className={statusColor(m.status)}>{m.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}