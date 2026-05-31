import React, { useState } from 'react';
import { Monitor, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const radarData = [
  { subject: 'Vendas', A: 85 },
  { subject: 'Estoque', A: 72 },
  { subject: 'Finanças', A: 90 },
  { subject: 'RH', A: 78 },
  { subject: 'Produção', A: 65 },
  { subject: 'Logística', A: 88 },
];

const areaData = [
  { hora: '08:00', operacoes: 45, usuarios: 12 },
  { hora: '10:00', operacoes: 124, usuarios: 38 },
  { hora: '12:00', operacoes: 89, usuarios: 27 },
  { hora: '14:00', operacoes: 201, usuarios: 54 },
  { hora: '16:00', operacoes: 167, usuarios: 48 },
  { hora: '18:00', operacoes: 98, usuarios: 23 },
];

export default function HolographicDashboardPanel() {
  const [widgets] = useState([
    { id: 1, titulo: 'Receita em Tempo Real', valor: 'R$ 842.400', variacao: '+12.4%', cor: 'emerald', icone: '💰' },
    { id: 2, titulo: 'Pedidos Ativos', valor: '347', variacao: '+8.2%', cor: 'blue', icone: '📦' },
    { id: 3, titulo: 'Eficiência Produção', valor: '94.3%', variacao: '+2.1%', cor: 'purple', icone: '⚙️' },
    { id: 4, titulo: 'NPS Score', valor: '72', variacao: '+5pts', cor: 'orange', icone: '⭐' },
  ]);

  return (
    <div className="w-full h-full space-y-6">
      {/* Banner holográfico */}
      <div className="relative bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900 rounded-xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-32 h-32 border border-violet-400 rounded-full animate-ping" />
          <div className="absolute top-8 right-20 w-24 h-24 border border-blue-400 rounded-full animate-pulse" />
          <div className="absolute bottom-4 left-1/2 w-48 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
        </div>
        <div className="relative text-white">
          <p className="text-violet-300 text-sm mb-1">Projeção Holográfica Ativa — ERP Zuccaro XR v1.0</p>
          <h2 className="text-2xl font-bold mb-2">Dashboard 3D em Tempo Real</h2>
          <div className="flex gap-3">
            <Badge className="bg-violet-600/50 border border-violet-400">XR Mode: ON</Badge>
            <Badge className="bg-blue-600/50 border border-blue-400">Hologram: Ativo</Badge>
            <Badge className="bg-emerald-600/50 border border-emerald-400">48 usuários online</Badge>
          </div>
        </div>
      </div>

      {/* KPIs holográficos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <Card key={w.id} className={`bg-gradient-to-br from-${w.cor}-50 to-${w.cor}-100 border-${w.cor}-200 hover:shadow-lg transition-shadow`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{w.icone}</span>
                <Badge className="bg-emerald-600 text-xs">{w.variacao}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{w.valor}</p>
              <p className="text-xs text-slate-600 mt-1">{w.titulo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-600" />
              Radar de Performance Modular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Atividade em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="operacoes" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Operações" />
                <Area type="monotone" dataKey="usuarios" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Usuários" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}