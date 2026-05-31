import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';

export default function TransportationFleetOptimizer() {
  const utilizacaoData = [
    { dia: 'Seg', proprio: 92, agregado: 85, terceirizado: 78 },
    { dia: 'Ter', proprio: 94, agregado: 87, terceirizado: 80 },
    { dia: 'Qua', proprio: 91, agregado: 83, terceirizado: 76 },
    { dia: 'Qui', proprio: 95, agregado: 89, terceirizado: 82 },
    { dia: 'Sex', proprio: 93, agregado: 88, terceirizado: 79 },
    { dia: 'Sab', proprio: 78, agregado: 71, terceirizado: 68 },
    { dia: 'Dom', proprio: 65, agregado: 58, terceirizado: 52 },
  ];

  const custoMensalData = [
    { transportadora: 'Própria', custo: 145000, economia: 12000 },
    { transportadora: 'Agregados', custo: 98000, economia: 8500 },
    { transportadora: 'Terceirizada', custo: 120000, economia: 10200 },
  ];

  const frotas = [
    { id: 1, tipo: 'Caminhão 3/4', total: 34, disponivel: 31, em_uso: 3, eficiencia: '91%' },
    { id: 2, tipo: 'Caminhão Toco', total: 28, disponivel: 24, em_uso: 4, eficiencia: '86%' },
    { id: 3, tipo: 'Caminhão Truck', total: 18, disponivel: 15, em_uso: 3, eficiencia: '83%' },
    { id: 4, tipo: 'Van', total: 42, disponivel: 38, em_uso: 4, eficiencia: '90%' },
    { id: 5, tipo: 'Moto', total: 34, disponivel: 32, em_uso: 2, eficiencia: '94%' },
  ];

  const manutencoes = [
    { veiculo: 'CAM-001', tipo: 'Revisão', proxima: '2026-06-15', status: 'No prazo', km: 45230 },
    { veiculo: 'CAM-012', tipo: 'Pneus', proxima: '2026-06-08', status: 'Urgente', km: 89450 },
    { veiculo: 'VAN-005', tipo: 'Óleo', proxima: '2026-06-20', status: 'No prazo', km: 23400 },
    { veiculo: 'CAM-023', tipo: 'Freios', proxima: '2026-06-02', status: 'Crítico', km: 156230 },
  ];

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Frota Total</p>
            <p className="text-2xl font-bold text-cyan-400">156</p>
            <p className="text-xs text-green-400">91% operacional</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Utilização Média</p>
            <p className="text-2xl font-bold text-cyan-400">86%</p>
            <p className="text-xs text-green-400">↑ 4% vs mês</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Km Rodados (Mês)</p>
            <p className="text-2xl font-bold text-cyan-400">487k</p>
            <p className="text-xs text-yellow-400">Consumo otimizado</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Manutenções Pendentes</p>
            <p className="text-2xl font-bold text-red-400">4</p>
            <p className="text-xs text-red-400">1 crítica</p>
          </CardContent>
        </Card>
      </div>

      {/* Utilização Semanal */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Utilização Semanal por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={utilizacaoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="dia" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Line type="monotone" dataKey="proprio" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="agregado" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="terceirizado" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Composição de Frota */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Composição de Frota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {frotas.map((frota) => (
              <div key={frota.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-white text-sm">{frota.tipo}</p>
                  <Badge className="bg-cyan-900 text-cyan-200 text-xs">{frota.eficiencia}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <p>Total: <span className="text-cyan-400">{frota.total}</span></p>
                  <p>Disponível: <span className="text-green-400">{frota.disponivel}</span></p>
                  <p>Em uso: <span className="text-orange-400">{frota.em_uso}</span></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Manutenções Programadas */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Manutenções Programadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {manutencoes.map((manut, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                manut.status === 'Crítico' ? 'bg-red-900/20 border-red-600/50' : 'bg-slate-700/50 border-slate-600'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{manut.veiculo}</p>
                  <Badge className={manut.status === 'Crítico' ? 'bg-red-900 text-red-200' : manut.status === 'Urgente' ? 'bg-orange-900 text-orange-200' : 'bg-green-900 text-green-200'}>
                    {manut.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <p>{manut.tipo}</p>
                  <p>Próx: {manut.proxima}</p>
                  <p className="text-cyan-400">{manut.km.toLocaleString()} km</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Custo Mensal por Transportadora */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Custo Mensal vs. Economia IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={custoMensalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="transportadora" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                formatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Bar dataKey="custo" fill="#3b82f6" />
              <Bar dataKey="economia" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}