import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Gauge, Thermometer, AlertTriangle, TrendingUp } from 'lucide-react';

export default function MachineMonitor({ machineId = 'M001' }) {
  const [view, setView] = useState('performance');

  // Dados simulados
  const timeseriesData = [
    { time: '10:00', oee: 92, temp: 65, vibra: 0.3, umidade: 45 },
    { time: '10:15', oee: 91, temp: 66, vibra: 0.4, umidade: 46 },
    { time: '10:30', oee: 93, temp: 65, vibra: 0.3, umidade: 45 },
    { time: '10:45', oee: 90, temp: 67, vibra: 0.5, umidade: 47 },
    { time: '11:00', oee: 92, temp: 66, vibra: 0.4, umidade: 46 },
  ];

  const producaoData = [
    { horario: '10h', producao: 48, meta: 50 },
    { horario: '11h', producao: 52, meta: 50 },
    { horario: '12h', producao: 50, meta: 50 },
  ];

  const manutencoes = [
    { tipo: 'Preventiva', proxima: '3 dias', criticidade: 'Média' },
    { tipo: 'Lubrificação', proxima: '5 dias', criticidade: 'Baixa' },
    { tipo: 'Calibragem', proxima: '15 dias', criticidade: 'Alta' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Header com seletor */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Corte A1 (M001)</h2>
              <p className="text-xs text-slate-400">Monitorando em tempo real • Status: Operando</p>
            </div>
            <div className="flex gap-2">
              {['performance', 'producao', 'manutencao'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1 text-sm rounded-lg font-semibold ${view === v ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {v === 'performance' ? 'Performance' : v === 'producao' ? 'Produção' : 'Manutenção'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gauge className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">OEE</p>
                <p className="text-2xl font-bold text-blue-400">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Temperatura</p>
                <p className="text-2xl font-bold text-emerald-400">65°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Vibração</p>
                <p className="text-2xl font-bold text-purple-400">0.3 mm/s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">Umidade</p>
                <p className="text-2xl font-bold text-amber-400">45%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      {view === 'performance' && (
        <>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">OEE e Temperatura (Últimas 5h)</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Line type="monotone" dataKey="oee" stroke="#3b82f6" name="OEE (%)" />
                  <Line type="monotone" dataKey="temp" stroke="#10b981" name="Temp (°C)" yAxisId="right" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Vibração & Umidade</CardTitle>
            </CardHeader>
            <CardContent className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Area type="monotone" dataKey="vibra" stroke="#8b5cf6" fill="#8b5cf620" name="Vibração (mm/s)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Produção */}
      {view === 'producao' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Produção vs Meta</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={producaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="horario" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="producao" fill="#3b82f6" name="Realizado" />
                <Bar dataKey="meta" fill="#10b98120" name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Manutenção */}
      {view === 'manutencao' && (
        <div className="space-y-2">
          {manutencoes.map((m, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white text-sm">{m.tipo}</p>
                    <p className="text-xs text-slate-400">Próxima: {m.proxima}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${m.criticidade === 'Alta' ? 'bg-red-900 text-red-200' : m.criticidade === 'Média' ? 'bg-amber-900 text-amber-200' : 'bg-emerald-900 text-emerald-200'}`}>
                    {m.criticidade}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}