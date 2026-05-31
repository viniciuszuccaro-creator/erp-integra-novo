import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';

export default function RiskAssessmentIA() {
  const riskMatrixData = [
    { x: 25, y: 85, name: 'Inadimplência Cliente A', id: 1 },
    { x: 60, y: 45, name: 'Flutuação Cambial', id: 2 },
    { x: 35, y: 70, name: 'Preço Matéria-Prima', id: 3 },
    { x: 80, y: 30, name: 'Aumento Energia', id: 4 },
    { x: 45, y: 55, name: 'Concorrência Preço', id: 5 },
    { x: 70, y: 40, name: 'Sazonalidade Vendas', id: 6 },
  ];

  const riskTrendData = [
    { mes: 'Jan', score: 4.2, tendencia: 'Estável' },
    { mes: 'Fev', score: 4.5, tendencia: 'Crescente' },
    { mes: 'Mar', score: 5.1, tendencia: 'Crescente' },
    { mes: 'Abr', score: 5.8, tendencia: 'Crescente' },
    { mes: 'Mai', score: 5.3, tendencia: 'Reduzindo' },
    { mes: 'Jun', score: 4.9, tendencia: 'Reduzindo' },
  ];

  const riscosDetectados = [
    { tipo: 'Crédito', descricao: 'Cliente A: Atraso 45 dias (R$ 450k)', severidade: 'Crítico', probabilidade: 85, impacto: 'Alto' },
    { tipo: 'Mercado', descricao: 'Queda 12% demanda nos últimos 30 dias', severidade: 'Alto', probabilidade: 60, impacto: 'Alto' },
    { tipo: 'Operacional', descricao: 'Falta de estoque para pedidos (3 sku)', severidade: 'Médio', probabilidade: 35, impacto: 'Médio' },
    { tipo: 'Câmbio', descricao: 'USD +8% vs mês anterior', severidade: 'Médio', probabilidade: 45, impacto: 'Médio' },
  ];

  const mitigacoes = [
    { risco: 'Inadimplência Cliente A', acao: 'Suspender crédito + cobrança com advogado', status: 'Ativo', dataInicio: '2026-05-20' },
    { risco: 'Pressão Margens', acao: 'Otimizar custos fixos (-R$ 150k/mês)', status: 'Em progresso', dataInicio: '2026-05-25' },
    { risco: 'Sazonalidade', acao: 'Aumentar mix de produtos anti-sazonais', status: 'Planejado', dataInicio: '2026-06-01' },
  ];

  const severityColor = (severidade) => {
    switch (severidade) {
      case 'Crítico': return 'bg-red-900 text-red-200';
      case 'Alto': return 'bg-orange-900 text-orange-200';
      case 'Médio': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-green-900 text-green-200';
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Score de Risco</p>
            <p className="text-2xl font-bold text-orange-400">4.9/10</p>
            <p className="text-xs text-orange-400">↓ Melhorando</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Riscos Identificados</p>
            <p className="text-2xl font-bold text-orange-400">6</p>
            <p className="text-xs text-red-400">1 crítico</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Exposição Financeira</p>
            <p className="text-2xl font-bold text-red-400">R$ 850k</p>
            <p className="text-xs text-red-400">9.5% da receita</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Planos de Ação</p>
            <p className="text-2xl font-bold text-emerald-400">3</p>
            <p className="text-xs text-green-400">1 crítico ativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Matriz de Risco */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Matriz de Risco (Probabilidade vs Impacto)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="x" stroke="#94a3b8" label={{ value: 'Probabilidade (%)', position: 'right', offset: 10 }} />
              <YAxis type="number" dataKey="y" stroke="#94a3b8" label={{ value: 'Impacto (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    return (
                      <div className="bg-slate-900 p-2 rounded border border-slate-600 text-xs text-slate-200">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Riscos" data={riskMatrixData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução Score */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Evolução do Score de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Riscos Detectados */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Riscos Detectados (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riscosDetectados.map((risco, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{risco.tipo}</p>
                  <Badge className={severityColor(risco.severidade)}>{risco.severidade}</Badge>
                </div>
                <p className="text-xs text-slate-400 mb-1">{risco.descricao}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>Prob: <span className="text-orange-400">{risco.probabilidade}%</span></p>
                  <p>Impacto: <span className="text-red-400">{risco.impacto}</span></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Planos de Mitigação */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Planos de Mitigação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mitigacoes.map((mit, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="font-semibold text-white text-sm mb-1">{mit.risco}</p>
                <p className="text-xs text-slate-400 mb-1">{mit.acao}</p>
                <div className="flex justify-between text-xs">
                  <Badge className={mit.status === 'Ativo' ? 'bg-red-900 text-red-200' : mit.status === 'Em progresso' ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'}>
                    {mit.status}
                  </Badge>
                  <p className="text-slate-400">Desde: {mit.dataInicio}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}