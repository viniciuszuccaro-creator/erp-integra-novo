import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';

export default function ProfitabilityAnalyzer() {
  const departamentosProfitabilidade = [
    { depto: 'Comercial', receita: 4800000, custo: 1890000, lucro: 2910000, margem: 60.6 },
    { depto: 'Logística', receita: 1200000, custo: 680000, lucro: 520000, margem: 43.3 },
    { depto: 'Produção', receita: 2100000, custo: 1400000, lucro: 700000, margem: 33.3 },
    { depto: 'Serviços', receita: 890000, custo: 320000, lucro: 570000, margem: 64.0 },
  ];

  const linhasProduto = [
    { linha: 'Linha A (Premium)', receita: 2300000, lucro: 1380000, margem: 60 },
    { linha: 'Linha B (Standard)', receita: 1800000, lucro: 900000, margem: 50 },
    { linha: 'Linha C (Econômica)', receita: 1200000, lucro: 360000, margem: 30 },
    { linha: 'Linha D (Serviços)', receita: 500000, margem: 75, lucro: 375000 },
  ];

  const composicaoReceitaData = [
    { name: 'Comercial', value: 4800000, color: '#10b981' },
    { name: 'Logística', value: 1200000, color: '#3b82f6' },
    { name: 'Produção', value: 2100000, color: '#8b5cf6' },
    { name: 'Serviços', value: 890000, color: '#f59e0b' },
  ];

  const analiseMargenData = [
    { categoria: 'Premium', meta: 65, realizado: 60.6 },
    { categoria: 'Standard', meta: 50, realizado: 50.0 },
    { categoria: 'Econômica', meta: 35, realizado: 30.0 },
    { categoria: 'Serviços', meta: 70, realizado: 64.0 },
  ];

  const formatCurrency = (value) => `R$ ${(value / 1000000).toFixed(1)}M`;
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Receita Total</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(8990000)}</p>
            <p className="text-xs text-green-400">↑ 15% vs período</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Custos Totais</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(4290000)}</p>
            <p className="text-xs text-red-400">↓ 5% otimização</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Lucro Bruto</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(4700000)}</p>
            <p className="text-xs text-emerald-400">Margem 52.3%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Lucro Líquido</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(2700000)}</p>
            <p className="text-xs text-emerald-400">ROI 30.1%</p>
          </CardContent>
        </Card>
      </div>

      {/* Composição vs Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Receita por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={composicaoReceitaData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, value }) => `${name}\nR$ ${(value / 1000000).toFixed(1)}M`}
                  outerRadius={80} fill="#8884d8" dataKey="value">
                  {composicaoReceitaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Margem vs Meta por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analiseMargenData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="categoria" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="meta" fill="#3b82f6" />
                <Bar dataKey="realizado" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profitabilidade por Departamento */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Análise de Profitabilidade por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {departamentosProfitabilidade.map((depto, idx) => (
            <div key={idx} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-white">{depto.depto}</p>
                <Badge className="bg-emerald-900 text-emerald-200">{formatPercentage(depto.margem)}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                <div>
                  <p className="text-slate-400">Receita</p>
                  <p className="text-green-400 font-semibold">{formatCurrency(depto.receita)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Custos</p>
                  <p className="text-red-400 font-semibold">{formatCurrency(depto.custo)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Lucro</p>
                  <p className="text-emerald-400 font-semibold">{formatCurrency(depto.lucro)}</p>
                </div>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(depto.margem, 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Linhas de Produto */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Performance por Linha de Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {linhasProduto.map((linha, idx) => (
            <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-white text-sm">{linha.linha}</p>
                <Badge className="bg-blue-900 text-blue-200">{formatPercentage(linha.margem)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <p>Receita: <span className="text-green-400">{formatCurrency(linha.receita)}</span></p>
                <p>Lucro: <span className="text-emerald-400">{formatCurrency(linha.lucro)}</span></p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}