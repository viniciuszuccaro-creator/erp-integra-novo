import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Factory, Play, Pause, AlertTriangle } from 'lucide-react';

export default function ProductionRealtime() {
  const [view, setView] = useState('maquinas');

  const maquinas = [
    { id: 'M01', nome: 'Linha A - Corte CNC', status: 'Produzindo', eficiencia: 94, ciclos: 842, refugo: 1.2, temp: 68, velocidade: 98 },
    { id: 'M02', nome: 'Linha B - Dobra', status: 'Produzindo', eficiencia: 88, ciclos: 712, refugo: 2.1, temp: 72, velocidade: 91 },
    { id: 'M03', nome: 'Linha C - Solda', status: 'Parada', eficiencia: 0, ciclos: 0, refugo: 0, temp: 45, velocidade: 0 },
    { id: 'M04', nome: 'Linha D - Acabamento', status: 'Manutenção', eficiencia: 0, ciclos: 0, refugo: 0, temp: 38, velocidade: 0 },
    { id: 'M05', nome: 'Linha E - Embalagem', status: 'Produzindo', eficiencia: 97, ciclos: 1243, refugo: 0.4, temp: 55, velocidade: 100 },
  ];

  const producaoTimeline = [
    { hora: '06h', meta: 200, realizado: 185, refugo: 8 },
    { hora: '07h', meta: 200, realizado: 198, refugo: 5 },
    { hora: '08h', meta: 200, realizado: 212, refugo: 3 },
    { hora: '09h', meta: 200, realizado: 195, refugo: 9 },
    { hora: '10h', meta: 200, realizado: 208, refugo: 4 },
    { hora: '11h', meta: 200, realizado: 178, refugo: 12 },
    { hora: '12h', meta: 200, realizado: 190, refugo: 7 },
  ];

  const oeeData = [
    { dia: 'Seg', oee: 82, disponibilidade: 91, performance: 88, qualidade: 97 },
    { dia: 'Ter', oee: 85, disponibilidade: 93, performance: 90, qualidade: 98 },
    { dia: 'Qua', oee: 79, disponibilidade: 87, performance: 86, qualidade: 96 },
    { dia: 'Qui', oee: 88, disponibilidade: 95, performance: 92, qualidade: 98 },
    { dia: 'Sex', oee: 84, disponibilidade: 92, performance: 89, qualidade: 97 },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Produzindo': return 'bg-emerald-900 text-emerald-200';
      case 'Parada': return 'bg-red-900 text-red-200';
      case 'Manutenção': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const statusBorder = (status) => {
    switch (status) {
      case 'Produzindo': return 'border-emerald-600';
      case 'Parada': return 'border-red-600';
      case 'Manutenção': return 'border-yellow-600';
      default: return 'border-slate-600';
    }
  };

  const resumo = {
    maquinas_ativas: maquinas.filter(m => m.status === 'Produzindo').length,
    oee_medio: Math.round(maquinas.filter(m => m.eficiencia > 0).reduce((acc, m) => acc + m.eficiencia, 0) / maquinas.filter(m => m.eficiencia > 0).length),
    refugo_medio: (maquinas.filter(m => m.refugo > 0).reduce((acc, m) => acc + m.refugo, 0) / maquinas.filter(m => m.refugo > 0).length).toFixed(1),
    total_ciclos: maquinas.reduce((acc, m) => acc + m.ciclos, 0),
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-emerald-900/30 border-emerald-600">
          <CardContent className="p-3">
            <p className="text-xs text-emerald-400">Linhas Ativas</p>
            <p className="text-2xl font-bold text-emerald-400">{resumo.maquinas_ativas}/{maquinas.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">OEE Médio</p>
            <p className="text-2xl font-bold text-blue-400">{resumo.oee_medio}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Refugo Médio</p>
            <p className="text-2xl font-bold text-yellow-400">{resumo.refugo_medio}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Ciclos Hoje</p>
            <p className="text-2xl font-bold text-purple-400">{resumo.total_ciclos.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {['maquinas', 'producao', 'oee'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold capitalize ${view === v ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {v === 'maquinas' ? 'Máquinas' : v === 'producao' ? 'Produção' : 'OEE'}
          </button>
        ))}
      </div>

      {/* Status Máquinas */}
      {view === 'maquinas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {maquinas.map((m) => (
            <Card key={m.id} className={`bg-slate-800 border-2 ${statusBorder(m.status)}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">{m.nome}</p>
                    <p className="text-xs text-slate-400">{m.id}</p>
                  </div>
                  <Badge className={statusColor(m.status)}>
                    {m.status === 'Produzindo' ? <Play className="w-3 h-3 mr-1" /> : m.status === 'Parada' ? <Pause className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {m.status}
                  </Badge>
                </div>
                {m.eficiencia > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-700/50 p-2 rounded">
                      <p className="text-slate-400">Eficiência</p>
                      <p className="text-emerald-400 font-bold">{m.eficiencia}%</p>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                      <p className="text-slate-400">Refugo</p>
                      <p className="text-yellow-400 font-bold">{m.refugo}%</p>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                      <p className="text-slate-400">Temp</p>
                      <p className="text-blue-400 font-bold">{m.temp}°C</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Produção Timeline */}
      {view === 'producao' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Produção por Hora vs Meta</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={producaoTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hora" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Bar dataKey="meta" fill="#475569" name="Meta" />
                <Bar dataKey="realizado" fill="#10b981" name="Realizado" />
                <Bar dataKey="refugo" fill="#ef4444" name="Refugo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* OEE */}
      {view === 'oee' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">OEE Semanal (Disponib. × Performance × Qualidade)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="dia" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[70, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Line type="monotone" dataKey="oee" stroke="#3b82f6" strokeWidth={3} name="OEE" />
                <Line type="monotone" dataKey="disponibilidade" stroke="#10b981" strokeWidth={1.5} name="Disponibilidade" />
                <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={1.5} name="Performance" />
                <Line type="monotone" dataKey="qualidade" stroke="#8b5cf6" strokeWidth={1.5} name="Qualidade" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}