import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function StrategicRecommendations() {
  const recomendacoes = [
    {
      id: 1,
      titulo: 'Otimizar Mix de Produtos',
      descricao: 'Aumentar vendas da Linha A (Premium) que tem margem 60.6%',
      impactoEstimado: '+R$ 420k/mês',
      esforço: 'Médio',
      prazo: '30 dias',
      risco: 'Baixo',
      score: 9.2,
      status: 'Recomendado'
    },
    {
      id: 2,
      titulo: 'Renegociar Contratos de Fornecedores',
      descricao: 'Reduzir custos de matéria-prima com bulk discounts (Fornecedores B e C)',
      impactoEstimado: '-R$ 280k/mês',
      esforço: 'Baixo',
      prazo: '45 dias',
      risco: 'Médio',
      score: 8.8,
      status: 'Crítico'
    },
    {
      id: 3,
      titulo: 'Implementar Automação RPA',
      descricao: 'Automatizar processos de Contas a Pagar e Receber (-30% tempo)',
      impactoEstimado: '+R$ 150k/mês',
      esforço: 'Alto',
      prazo: '90 dias',
      risco: 'Médio',
      score: 8.5,
      status: 'Planejado'
    },
    {
      id: 4,
      titulo: 'Expandir para Novo Mercado',
      descricao: 'Abertura em região Centro-Oeste (estimativa +15% receita)',
      impactoEstimado: '+R$ 720k/mês',
      esforço: 'Alto',
      prazo: '180 dias',
      risco: 'Alto',
      score: 8.2,
      status: 'Exploração'
    },
    {
      id: 5,
      titulo: 'Implementar Gestão de Crédito IA',
      descricao: 'Reduzir inadimplência com scoring automático (atualmente 2.5%)',
      impactoEstimado: '+R$ 95k/mês',
      esforço: 'Médio',
      prazo: '60 dias',
      risco: 'Baixo',
      score: 8.9,
      status: 'Urgente'
    },
    {
      id: 6,
      titulo: 'Diversificar Canais de Venda',
      descricao: 'Integrar vendas marketplace (B2B + e-commerce)',
      impactoEstimado: '+R$ 380k/mês',
      esforço: 'Médio',
      prazo: '120 dias',
      risco: 'Médio',
      score: 8.1,
      status: 'Avaliação'
    },
  ];

  const quickWins = [
    { acao: 'Reduzir despesas operacionais (energia, água)', economia: 'R$ 25k/mês', tempo: '2 semanas' },
    { acao: 'Revisar contratos de logística com transportadoras', economia: 'R$ 45k/mês', tempo: '3 semanas' },
    { acao: 'Implementar políticas de cobrança mais agressivas', economia: 'R$ 30k/mês', tempo: '1 semana' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Urgente': return 'bg-red-900 text-red-200';
      case 'Crítico': return 'bg-orange-900 text-orange-200';
      case 'Recomendado': return 'bg-emerald-900 text-emerald-200';
      case 'Planejado': return 'bg-blue-900 text-blue-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const esforçoColor = (esforço) => {
    switch (esforço) {
      case 'Baixo': return 'text-green-400';
      case 'Médio': return 'text-yellow-400';
      case 'Alto': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Recomendações Ativas</p>
            <p className="text-2xl font-bold text-emerald-400">6</p>
            <p className="text-xs text-green-400">Impacto potencial R$ 1.9M</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Score Médio</p>
            <p className="text-2xl font-bold text-blue-400">8.5</p>
            <p className="text-xs text-blue-400">Muito bom</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Quick Wins</p>
            <p className="text-2xl font-bold text-emerald-400">3</p>
            <p className="text-xs text-green-400">R$ 100k/mês fácil</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Confiança IA</p>
            <p className="text-2xl font-bold text-purple-400">92%</p>
            <p className="text-xs text-purple-400">Baseado em dados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Wins */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Quick Wins (Implementação Rápida)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickWins.map((win, idx) => (
            <div key={idx} className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-600/30">
              <p className="font-semibold text-white text-sm mb-1">{win.acao}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p className="text-emerald-400">Economia: {win.economia}</p>
                <p className="text-cyan-400">Tempo: {win.tempo}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recomendações Detalhadas */}
      <div className="space-y-3">
        {recomendacoes.map((rec) => (
          <Card key={rec.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{rec.titulo}</p>
                  <p className="text-xs text-slate-400 mt-1">{rec.descricao}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={statusColor(rec.status)}>{rec.status}</Badge>
                  <Badge className="bg-purple-900 text-purple-200">Score: {rec.score}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-slate-400">Impacto</p>
                  <p className="font-semibold text-green-400">{rec.impactoEstimado}</p>
                </div>
                <div>
                  <p className="text-slate-400">Esforço</p>
                  <p className={`font-semibold ${esforçoColor(rec.esforço)}`}>{rec.esforço}</p>
                </div>
                <div>
                  <p className="text-slate-400">Prazo</p>
                  <p className="font-semibold text-cyan-400">{rec.prazo}</p>
                </div>
                <div>
                  <p className="text-slate-400">Risco</p>
                  <p className={rec.risco === 'Baixo' ? 'font-semibold text-green-400' : rec.risco === 'Médio' ? 'font-semibold text-yellow-400' : 'font-semibold text-red-400'}>
                    {rec.risco}
                  </p>
                </div>
                <div className="md:col-span-1">
                  <p className="text-slate-400">ROI Est.</p>
                  <p className="font-semibold text-emerald-400">
                    {Math.round((rec.score / 10) * 100)}%
                  </p>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full"
                  style={{ width: `${rec.score * 10}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roadmap */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Roadmap de Implementação (90 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-white mb-2">30 dias (Quick Wins + Crítico)</p>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: '33%' }} />
              <p className="text-xs text-slate-400 mt-1">Renegociação + Redução de Despesas = R$ 325k</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-2">60 dias (Recomendado + Implementações)</p>
              <div className="bg-gradient-to-r from-yellow-500 to-emerald-500 h-2 rounded-full" style={{ width: '66%' }} />
              <p className="text-xs text-slate-400 mt-1">Mix de Produtos + Gestão de Crédito = R$ 515k</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-2">90 dias (RPA + Diversificação)</p>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
              <p className="text-xs text-slate-400 mt-1">Automação + Marketplace = R$ 1.05M acumulado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}