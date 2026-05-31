import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, TrendingDown, CheckCircle } from 'lucide-react';

export default function RoutingAIOptimizer() {
  const [selectedDia, setSelectedDia] = useState('seg');

  const otimizacaoData = [
    { dia: 'Seg', tempoAntes: 285, tempoOtimizado: 245, economia: 40 },
    { dia: 'Ter', tempoAntes: 292, tempoOtimizado: 248, economia: 44 },
    { dia: 'Qua', tempoAntes: 278, tempoOtimizado: 235, economia: 43 },
    { dia: 'Qui', tempoAntes: 295, tempoOtimizado: 252, economia: 43 },
    { dia: 'Sex', tempoAntes: 310, tempoOtimizado: 262, economia: 48 },
    { dia: 'Sab', tempoAntes: 240, tempoOtimizado: 198, economia: 42 },
    { dia: 'Dom', tempoAntes: 210, tempoOtimizado: 172, economia: 38 },
  ];

  const consumoData = [
    { dia: 'Seg', consumoAntes: 425, consumoOtimizado: 358, economia: 67 },
    { dia: 'Ter', tempoAntes: 438, consumoOtimizado: 369, economia: 69 },
    { dia: 'Qua', consumoAntes: 412, consumoOtimizado: 348, economia: 64 },
    { dia: 'Qui', consumoAntes: 445, consumoOtimizado: 375, economia: 70 },
    { dia: 'Sex', consumoAntes: 468, consumoOtimizado: 392, economia: 76 },
  ];

  const rotas = [
    { id: 1, nome: 'Rota SP Centro', paradas: 24, distancia: 58.3, tempo: '3h 20m', economia: 'R$ 245', status: 'Otimizada' },
    { id: 2, nome: 'Rota ABC Paulista', paradas: 18, distancia: 42.7, tempo: '2h 45m', economia: 'R$ 178', status: 'Otimizada' },
    { id: 3, nome: 'Rota Zona Leste', paradas: 31, distancia: 67.2, tempo: '4h 15m', economia: 'R$ 312', status: 'Otimizando' },
    { id: 4, nome: 'Rota Guarulhos/Arujá', paradas: 15, distancia: 38.4, tempo: '2h 30m', economia: 'R$ 142', status: 'Otimizada' },
  ];

  const insights = [
    { tipo: 'Pico', descricao: 'Terça-feira 14:00-16:00 máxima concentração de entregas', acao: 'Realocar 8 veículos adicionais' },
    { tipo: 'Garrafa', descricao: 'Ponte São Paulo (SP→Guarulhos) 15-17h tráfego crítico', acao: 'Antecipar 12 rotas para 14h' },
    { tipo: 'Oportunidade', descricao: 'Consolidar 5 paradas no Morumbi em 1 rota', acao: 'Economizar 45min + R$95 combustível' },
    { tipo: 'Risco', descricao: 'Chuva prevista para 17h (70% probabilidade)', acao: 'Acelerar rotas da zona oeste' },
  ];

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Economia Semanal</p>
            <p className="text-2xl font-bold text-green-400">R$ 8.942</p>
            <p className="text-xs text-green-400">15.2% redução</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Tempo Economizado</p>
            <p className="text-2xl font-bold text-blue-400">28.2h</p>
            <p className="text-xs text-blue-400">Média 4h/dia</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Rotas Otimizadas</p>
            <p className="text-2xl font-bold text-cyan-400">47</p>
            <p className="text-xs text-cyan-400">De 52 totais</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">CO₂ Reduzido</p>
            <p className="text-2xl font-bold text-green-400">2.1t</p>
            <p className="text-xs text-green-400">Sustentável</p>
          </CardContent>
        </Card>
      </div>

      {/* Tempo de Rota */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-400" />
            Tempo de Rota: Antes vs. Otimizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={otimizacaoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="dia" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="tempoAntes" fill="#ef4444" />
              <Bar dataKey="tempoOtimizado" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rotas Ativas */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Rotas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rotas.map((rota) => (
              <div key={rota.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-white text-sm">{rota.nome}</p>
                  <Badge className={rota.status === 'Otimizada' ? 'bg-green-900 text-green-200' : 'bg-blue-900 text-blue-200'}>
                    {rota.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>{rota.paradas} paradas | {rota.distancia}km</p>
                  <p className="text-right text-green-400">Economia: {rota.economia}</p>
                </div>
                <p className="text-xs text-cyan-400 mt-1">Tempo otimizado: {rota.tempo}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights IA */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Insights IA Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                insight.tipo === 'Risco' ? 'bg-red-900/20 border-red-600/30' :
                insight.tipo === 'Pico' ? 'bg-orange-900/20 border-orange-600/30' :
                insight.tipo === 'Oportunidade' ? 'bg-green-900/20 border-green-600/30' :
                'bg-blue-900/20 border-blue-600/30'
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <p className={`font-semibold text-sm ${
                    insight.tipo === 'Risco' ? 'text-red-300' :
                    insight.tipo === 'Pico' ? 'text-orange-300' :
                    insight.tipo === 'Oportunidade' ? 'text-green-300' :
                    'text-blue-300'
                  }`}>{insight.tipo}</p>
                </div>
                <p className="text-xs text-slate-300 mb-1">{insight.descricao}</p>
                <p className="text-xs text-cyan-400">→ {insight.acao}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Consumo de Combustível */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Otimização de Combustível (Liters)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={consumoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="dia" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="consumoAntes" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="consumoOtimizado" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}