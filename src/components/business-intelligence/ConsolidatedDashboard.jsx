import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

export default function ConsolidatedDashboard() {
  const financialData = [
    { mes: 'Jan', receita: 4.2, custos: 1.8, lucro: 2.4 },
    { mes: 'Fev', receita: 4.5, custos: 1.9, lucro: 2.6 },
    { mes: 'Mar', receita: 4.8, custos: 2.0, lucro: 2.8 },
    { mes: 'Abr', receita: 5.1, custos: 2.1, lucro: 3.0 },
    { mes: 'Mai', receita: 5.4, custos: 2.2, lucro: 3.2 },
  ];

  const operationalData = [
    { area: 'RH', score: 82, tendencia: '↑', meta: 90 },
    { area: 'Logística', score: 78, tendencia: '↑', meta: 85 },
    { area: 'Produção', score: 85, tendencia: '→', meta: 90 },
    { area: 'Comercial', score: 88, tendencia: '↓', meta: 95 },
    { area: 'Financeiro', score: 91, tendencia: '↑', meta: 95 },
  ];

  const departmentMetrics = [
    { dept: 'RH', headcount: 45, turnover: 2.1, satisfaction: 78 },
    { dept: 'Logística', frota: 18, efficiency: 89, ontime: 94 },
    { dept: 'Produção', utilização: 87, qualidade: 98.5, refugo: 1.2 },
    { dept: 'Comercial', pedidos: 284, ticket: 18500, closing: 28 },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Visão Geral Financeira */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Visão Financeira (Últimos 5 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'R$ M', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score de Performance por Área */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Performance por Área
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-64 overflow-y-auto">
            {operationalData.map((item, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-white text-sm">{item.area}</p>
                  <Badge className={item.score >= item.meta - 5 ? 'bg-emerald-900 text-emerald-200' : 'bg-yellow-900 text-yellow-200'}>
                    {item.score}/{item.meta}
                  </Badge>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(item.score / item.meta) * 100}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${item.tendencia === '↑' ? 'text-green-400' : item.tendencia === '↓' ? 'text-red-400' : 'text-yellow-400'}`}>
                  Tendência: {item.tendencia}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Métricas por Departamento */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              Indicadores Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-64 overflow-y-auto">
            {departmentMetrics.map((dept, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="font-semibold text-white text-sm mb-2">{dept.dept}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-600/50 p-2 rounded">
                    <p className="text-slate-400">{Object.keys(dept)[1].split(/(?=[A-Z])/).join(' ')}</p>
                    <p className="text-emerald-400 font-semibold">
                      {dept.headcount || dept.frota || dept.utilização || dept.pedidos}
                      {dept.satisfaction ? '%' : dept.ontime ? '%' : dept.qualidade ? '%' : ''}
                    </p>
                  </div>
                  <div className="bg-slate-600/50 p-2 rounded">
                    <p className="text-slate-400">{Object.keys(dept)[2].split(/(?=[A-Z])/).join(' ')}</p>
                    <p className="text-blue-400 font-semibold">
                      {dept.turnover || dept.efficiency || dept.qualidade || dept.ticket}
                      {dept.turnover ? '%' : dept.efficiency ? '%' : dept.quality ? '%' : dept.ticket ? '' : '%'}
                    </p>
                  </div>
                  <div className="bg-slate-600/50 p-2 rounded">
                    <p className="text-slate-400">{Object.keys(dept)[3].split(/(?=[A-Z])/).join(' ')}</p>
                    <p className="text-purple-400 font-semibold">
                      {dept.satisfaction || dept.ontime || dept.refugo || dept.closing}
                      {dept.satisfaction ? '%' : dept.ontime ? '%' : dept.refugo ? '%' : ' dias'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo Horizontal Despesas vs Receita */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Composição de Receita vs Despesas (Últimas 3 Meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { mes: 'Mar', receita: 4.8, pessoal: 1.2, operacional: 0.6, logistica: 0.2 },
                { mes: 'Abr', receita: 5.1, pessoal: 1.3, operacional: 0.65, logistica: 0.15 },
                { mes: 'Mai', receita: 5.4, pessoal: 1.4, operacional: 0.68, logistica: 0.12 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" />
              <Bar dataKey="pessoal" fill="#ef4444" />
              <Bar dataKey="operacional" fill="#f59e0b" />
              <Bar dataKey="logistica" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}