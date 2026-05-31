import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity, AlertCircle } from 'lucide-react';

export default function CashFlowRealtime() {
  const [periodo, setPeriodo] = useState('7dias');

  const fluxoDiario = [
    { data: '31 Mai', entradas: 185000, saidas: 92000, saldo: 93000 },
    { data: '30 Mai', entradas: 142000, saidas: 78000, saldo: 64000 },
    { data: '29 Mai', entradas: 156000, saidas: 85000, saldo: 71000 },
    { data: '28 Mai', entradas: 198000, saidas: 95000, saldo: 103000 },
    { data: '27 Mai', entradas: 165000, saidas: 82000, saldo: 83000 },
    { data: '26 Mai', entradas: 178000, saidas: 88000, saldo: 90000 },
    { data: '25 Mai', entradas: 152000, saidas: 79000, saldo: 73000 },
  ];

  const fluxoMensal = [
    { mes: 'Janeiro', entradas: 3200000, saidas: 1850000, saldo: 1350000 },
    { mes: 'Fevereiro', entradas: 3450000, saidas: 1920000, saldo: 1530000 },
    { mes: 'Março', entradas: 3800000, saidas: 2100000, saldo: 1700000 },
    { mes: 'Abril', entradas: 4100000, saidas: 2250000, saldo: 1850000 },
    { mes: 'Maio', entradas: 4800000, saidas: 2100000, saldo: 2700000 },
  ];

  const recebiveisVencer = [
    { cliente: 'Cliente A', valor: 450000, diasVencer: 3, status: 'Crítico' },
    { cliente: 'Cliente B', valor: 320000, diasVencer: 7, status: 'Atencao' },
    { cliente: 'Cliente C', valor: 285000, diasVencer: 12, status: 'Ok' },
    { cliente: 'Cliente D', valor: 210000, diasVencer: 15, status: 'Ok' },
  ];

  const pagaveisVencer = [
    { fornecedor: 'Fornecedor X', valor: 180000, diasVencer: 2, status: 'Crítico' },
    { fornecedor: 'Fornecedor Y', valor: 156000, diasVencer: 5, status: 'Atencao' },
    { fornecedor: 'Fornecedor Z', valor: 145000, diasVencer: 10, status: 'Ok' },
    { fornecedor: 'Fornecedor W', valor: 98000, diasVencer: 18, status: 'Ok' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Crítico': return 'bg-red-900 text-red-200';
      case 'Atencao': return 'bg-orange-900 text-orange-200';
      default: return 'bg-green-900 text-green-200';
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Saldo Atual</p>
            <p className="text-2xl font-bold text-emerald-400">R$ 890k</p>
            <p className="text-xs text-green-400">↑ 12.5% mês</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Entradas Hoje</p>
            <p className="text-2xl font-bold text-blue-400">R$ 185k</p>
            <p className="text-xs text-blue-400">+8 cobranças</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Saídas Hoje</p>
            <p className="text-2xl font-bold text-red-400">R$ 92k</p>
            <p className="text-xs text-red-400">-5 pagamentos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Dias de Caixa</p>
            <p className="text-2xl font-bold text-cyan-400">18 dias</p>
            <p className="text-xs text-green-400">Seguro</p>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo Diário vs Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Fluxo Diário (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fluxoDiario}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="data" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Bar dataKey="entradas" fill="#10b981" />
                <Bar dataKey="saidas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={fluxoMensal}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
                <Area type="monotone" dataKey="saldo" stroke="#10b981" fillOpacity={1} fill="url(#colorEntradas)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contas a Receber */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Contas a Receber (Próximos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recebiveisVencer.map((item, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{item.cliente}</p>
                  <Badge className={statusColor(item.status)}>{item.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>Valor: <span className="text-green-400">R$ {(item.valor / 1000).toFixed(0)}k</span></p>
                  <p>Vence em: <span className="text-cyan-400">{item.diasVencer} dias</span></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contas a Pagar */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Contas a Pagar (Próximos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pagaveisVencer.map((item, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{item.fornecedor}</p>
                  <Badge className={statusColor(item.status)}>{item.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>Valor: <span className="text-red-400">R$ {(item.valor / 1000).toFixed(0)}k</span></p>
                  <p>Vence em: <span className="text-cyan-400">{item.diasVencer} dias</span></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}