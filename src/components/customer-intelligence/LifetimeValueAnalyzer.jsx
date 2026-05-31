import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Zap } from 'lucide-react';

export default function LifetimeValueAnalyzer() {
  const [sortBy, setSortBy] = useState('ltv');

  const ltvData = [
    { id: 'CLI001', nome: 'Metalúrgica ABC', ltv: 125000, valor_gasto: 45000, compras: 24, dias_cliente: 1200, retencao: 95, potencial: 'Alto' },
    { id: 'CLI002', nome: 'Construção XYZ', ltv: 89000, valor_gasto: 38000, compras: 18, dias_cliente: 950, retencao: 88, potencial: 'Médio' },
    { id: 'CLI003', nome: 'Ind. Têxtil M', ltv: 156000, valor_gasto: 52000, compras: 32, dias_cliente: 1400, retencao: 98, potencial: 'Alto' },
    { id: 'CLI004', nome: 'Serv. Logística', ltv: 67000, valor_gasto: 28000, compras: 12, dias_cliente: 600, retencao: 75, potencial: 'Médio' },
    { id: 'CLI005', nome: 'Varejo Online', ltv: 234000, valor_gasto: 78000, compras: 48, dias_cliente: 1800, retencao: 96, potencial: 'Alto' },
    { id: 'CLI006', nome: 'Pequena Obra', ltv: 32000, valor_gasto: 12000, compras: 6, dias_cliente: 300, retencao: 62, potencial: 'Baixo' },
  ];

  const projecaoLTV = [
    { mes: 'Jun', base: 82000, otimista: 95000, conservadora: 72000 },
    { mes: 'Jul', base: 88000, otimista: 105000, conservadora: 76000 },
    { mes: 'Ago', base: 92000, otimista: 115000, conservadora: 80000 },
    { mes: 'Set', base: 98000, otimista: 128000, conservadora: 85000 },
    { mes: 'Out', base: 105000, otimista: 142000, conservadora: 91000 },
  ];

  const scatterData = ltvData.map(cli => ({
    x: cli.valor_gasto,
    y: cli.compras,
    z: cli.ltv,
    nome: cli.nome.substring(0, 10),
    r: Math.sqrt(cli.ltv) / 10,
  }));

  const sortedData = [...ltvData].sort((a, b) => {
    if (sortBy === 'ltv') return b.ltv - a.ltv;
    if (sortBy === 'potencial') return b.valor_gasto - a.valor_gasto;
    if (sortBy === 'risco') return a.retencao - b.retencao;
    return 0;
  });

  const estatisticas = {
    ltv_medio: Math.round(ltvData.reduce((acc, c) => acc + c.ltv, 0) / ltvData.length),
    ltv_total: ltvData.reduce((acc, c) => acc + c.ltv, 0),
    clientes_alto_valor: ltvData.filter(c => c.ltv > 100000).length,
    retencao_media: Math.round(ltvData.reduce((acc, c) => acc + c.retencao, 0) / ltvData.length),
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">LTV Médio</p>
            <p className="text-lg font-bold text-emerald-400">
              R$ {(estatisticas.ltv_medio / 1000).toFixed(0)}k
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">LTV Total</p>
            <p className="text-lg font-bold text-blue-400">
              R$ {(estatisticas.ltv_total / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Clientes Premium</p>
            <p className="text-lg font-bold text-purple-400">{estatisticas.clientes_alto_valor}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Retenção Média</p>
            <p className="text-lg font-bold text-cyan-400">{estatisticas.retencao_media}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Projeção LTV */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Projeção LTV (Próximos 5 Meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projecaoLTV}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="conservadora" fill="#f59e0b" name="Conservadora" />
              <Bar dataKey="base" fill="#3b82f6" name="Base" />
              <Bar dataKey="otimista" fill="#10b981" name="Otimista" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter: Gasto vs Compras */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Análise: Valor Gasto vs Frequência de Compra</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="x" stroke="#94a3b8" name="Valor Gasto (R$)" />
              <YAxis type="number" dataKey="y" stroke="#94a3b8" name="Compras/Ano" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b' }} />
              <Scatter name="Clientes" data={scatterData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-white">Ranking de Clientes</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('ltv')}
                className={`px-2 py-1 text-xs rounded ${sortBy === 'ltv' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                LTV
              </button>
              <button
                onClick={() => setSortBy('potencial')}
                className={`px-2 py-1 text-xs rounded ${sortBy === 'potencial' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                Potencial
              </button>
              <button
                onClick={() => setSortBy('risco')}
                className={`px-2 py-1 text-xs rounded ${sortBy === 'risco' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                Risco
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {sortedData.map((cli, idx) => (
            <div key={cli.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">
                    #{idx + 1} — {cli.nome}
                  </p>
                  <p className="text-xs text-slate-400">{cli.id}</p>
                </div>
                <Badge
                  className={
                    cli.potencial === 'Alto'
                      ? 'bg-emerald-900 text-emerald-200'
                      : cli.potencial === 'Médio'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-red-900 text-red-200'
                  }
                >
                  {cli.potencial}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">LTV</p>
                  <p className="text-emerald-400 font-bold">R$ {(cli.ltv / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-slate-400">Compras</p>
                  <p className="text-blue-400 font-bold">{cli.compras}/ano</p>
                </div>
                <div>
                  <p className="text-slate-400">Retenção</p>
                  <p className="text-cyan-400 font-bold">{cli.retencao}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Cliente há</p>
                  <p className="text-purple-400 font-bold">{Math.floor(cli.dias_cliente / 365)} anos</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}