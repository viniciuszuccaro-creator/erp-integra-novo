import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, AlertTriangle, Clock, CheckCircle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PredictiveMaintenancePanel() {
  const [filter, setFilter] = useState('todos');

  const assets = [
    {
      id: 'EQ01', nome: 'Compressor Industrial A', tipo: 'Compressor',
      saude: 42, risco: 'Crítico', proximo_falha_dias: 8,
      horas_operacao: 12450, ultima_manutencao: '2026-03-15',
      sinais: ['Vibração +35% acima normal', 'Temperatura 82°C (limite 80°C)', 'Pressão instável'],
      custo_preventivo: 3500, custo_corretivo_estimado: 28000,
      acao: 'Substituição rolamentos + revisão pressão',
      urgencia: 'Urgente',
    },
    {
      id: 'EQ02', nome: 'CNC Router B12', tipo: 'Máquina CNC',
      saude: 68, risco: 'Alto', proximo_falha_dias: 21,
      horas_operacao: 8900, ultima_manutencao: '2026-04-01',
      sinais: ['Desvio de precisão +0.15mm', 'Lubrificação baixa', 'Encoder com falhas intermitentes'],
      custo_preventivo: 1200, custo_corretivo_estimado: 12000,
      acao: 'Calibração + lubrificação + verificação encoder',
      urgencia: 'Alta',
    },
    {
      id: 'EQ03', nome: 'Esteira Transportadora C', tipo: 'Transportador',
      saude: 85, risco: 'Médio', proximo_falha_dias: 45,
      horas_operacao: 5200, ultima_manutencao: '2026-04-20',
      sinais: ['Desgaste correia 18%', 'Motor com aquecimento leve'],
      custo_preventivo: 800, custo_corretivo_estimado: 4500,
      acao: 'Revisão correia + limpeza motor',
      urgencia: 'Planejada',
    },
    {
      id: 'EQ04', nome: 'Prensa Hidráulica D', tipo: 'Prensa',
      saude: 91, risco: 'Baixo', proximo_falha_dias: 90,
      horas_operacao: 3100, ultima_manutencao: '2026-05-01',
      sinais: ['Nível óleo hidráulico 15% abaixo'],
      custo_preventivo: 300, custo_corretivo_estimado: 8000,
      acao: 'Reabastecimento óleo hidráulico',
      urgencia: 'Normal',
    },
  ];

  const custoComparativo = [
    { equipamento: 'EQ01', preventivo: 3500, corretivo: 28000 },
    { equipamento: 'EQ02', preventivo: 1200, corretivo: 12000 },
    { equipamento: 'EQ03', preventivo: 800, corretivo: 4500 },
    { equipamento: 'EQ04', preventivo: 300, corretivo: 8000 },
  ];

  const urgenciaColor = (u) => {
    switch (u) {
      case 'Urgente': return 'bg-red-900 text-red-200';
      case 'Alta': return 'bg-orange-900 text-orange-200';
      case 'Planejada': return 'bg-yellow-900 text-yellow-200';
      case 'Normal': return 'bg-emerald-900 text-emerald-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const saudeBg = (s) => {
    if (s < 50) return 'bg-red-500';
    if (s < 70) return 'bg-orange-500';
    if (s < 85) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const filteredAssets = assets.filter(a => {
    if (filter === 'criticos') return a.risco === 'Crítico';
    if (filter === 'altos') return a.risco === 'Alto';
    return true;
  });

  const totalEconomia = assets.reduce((acc, a) => acc + (a.custo_corretivo_estimado - a.custo_preventivo), 0);

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-red-900/30 border-red-600">
          <CardContent className="p-3">
            <p className="text-xs text-red-400">Críticos</p>
            <p className="text-2xl font-bold text-red-400">{assets.filter(a => a.risco === 'Crítico').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Saúde Média</p>
            <p className="text-2xl font-bold text-emerald-400">
              {Math.round(assets.reduce((acc, a) => acc + a.saude, 0) / assets.length)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-900/30 border-emerald-600">
          <CardContent className="p-3">
            <p className="text-xs text-emerald-400">Economia Potencial</p>
            <p className="text-lg font-bold text-emerald-400">R$ {(totalEconomia / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Equipamentos</p>
            <p className="text-2xl font-bold text-blue-400">{assets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos', 'criticos', 'altos'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {f === 'todos' ? `Todos (${assets.length})` : f === 'criticos' ? `Críticos (${assets.filter(a => a.risco === 'Crítico').length})` : `Altos (${assets.filter(a => a.risco === 'Alto').length})`}
          </button>
        ))}
      </div>

      {/* Lista de Assets */}
      <div className="space-y-3">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-white text-sm">{asset.nome}</p>
                  <p className="text-xs text-slate-400">{asset.id} · {asset.tipo} · {asset.horas_operacao.toLocaleString()}h operação</p>
                </div>
                <Badge className={urgenciaColor(asset.urgencia)}>
                  <Wrench className="w-3 h-3 mr-1" />
                  {asset.urgencia}
                </Badge>
              </div>

              {/* Saúde */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-slate-400">Saúde do Equipamento</p>
                  <p className="text-xs font-bold text-white">{asset.saude}%</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${saudeBg(asset.saude)}`} style={{ width: `${asset.saude}%` }} />
                </div>
              </div>

              {/* Previsão */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-yellow-400 font-semibold">
                  Previsão de falha: <strong>{asset.proximo_falha_dias} dias</strong>
                </p>
              </div>

              {/* Sinais */}
              <div className="bg-slate-700/50 p-2 rounded mb-3">
                <p className="text-xs text-slate-400 mb-1 font-semibold">Sinais Detectados (IA)</p>
                {asset.sinais.map((s, i) => (
                  <p key={i} className="text-xs text-orange-300 flex gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {s}
                  </p>
                ))}
              </div>

              {/* Custo */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-emerald-900/30 p-2 rounded border border-emerald-700">
                  <p className="text-emerald-400">Manutenção Preventiva</p>
                  <p className="text-emerald-300 font-bold">R$ {asset.custo_preventivo.toLocaleString()}</p>
                </div>
                <div className="bg-red-900/30 p-2 rounded border border-red-700">
                  <p className="text-red-400">Custo Corretivo (se falhar)</p>
                  <p className="text-red-300 font-bold">R$ {asset.custo_corretivo_estimado.toLocaleString()}</p>
                </div>
              </div>

              {/* Ação */}
              <div className="flex gap-2">
                <div className="flex-1 bg-blue-900/30 p-2 rounded border border-blue-600">
                  <p className="text-xs text-blue-200">{asset.acao}</p>
                </div>
                <button className="px-3 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap">
                  Agendar OS
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custo Comparativo */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Preventivo vs Corretivo por Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={custoComparativo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="equipamento" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} formatter={(v) => `R$ ${v.toLocaleString()}`} />
              <Bar dataKey="preventivo" fill="#10b981" name="Preventivo" />
              <Bar dataKey="corretivo" fill="#ef4444" name="Corretivo" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}