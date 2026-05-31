import React, { useState } from 'react';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function ResilienceMetricsPanel() {
  const [metricas] = useState([
    {
      id: 'MET-001',
      nome: 'Índice de Diversificação de Fornecedores',
      descricao: 'Número médio de fornecedores por matéria-prima crítica',
      valor_atual: 2.3,
      meta: 3.0,
      tendencia: 'crescente',
      impacto_risco: 'Reduz risco de ruptura em 35%',
      confianca_ia: 92
    },
    {
      id: 'MET-002',
      nome: 'Taxa de Redundância de Capacidade',
      descricao: 'Percentual de capacidade excedente para emergências',
      valor_atual: 18,
      meta: 25,
      tendencia: 'estável',
      impacto_risco: 'Permite absorver picos de 18% sem atrasos',
      confianca_ia: 88
    },
    {
      id: 'MET-003',
      nome: 'Índice de Cobertura de Planos BCM',
      descricao: 'Percentual de processos críticos com planos de continuidade',
      valor_atual: 87,
      meta: 100,
      tendencia: 'crescente',
      impacto_risco: '87% de processos protegidos contra disrupções',
      confianca_ia: 95
    },
    {
      id: 'MET-004',
      nome: 'Tempo Médio de Recuperação (RTO)',
      descricao: 'Horas necessárias para restaurar operações críticas',
      valor_atual: 5.2,
      meta: 4.0,
      tendencia: 'decrescente',
      impacto_risco: 'Cada hora reduzida economiza ~R$15k em perdas',
      confianca_ia: 91
    }
  ]);

  const getProgressColor = (atual, meta) => {
    const percentual = (atual / meta) * 100;
    if (percentual >= 95) return 'h-2 bg-emerald-200';
    if (percentual >= 75) return 'h-2 bg-yellow-200';
    return 'h-2 bg-red-200';
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-900">Análise de Resiliência com IA</h3>
            <p className="text-sm text-slate-700 mt-1">
              Sistema de IA monitora continuamente métricas de resiliência e fornece recomendações de melhoria.
            </p>
          </div>
        </div>
      </div>

      {metricas.map((metrica) => {
        const percentualProgresso = (metrica.valor_atual / metrica.meta) * 100;
        return (
          <Card key={metrica.id} className="bg-white border-slate-200 hover:border-purple-400 transition">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{metrica.nome}</CardTitle>
                  <p className="text-xs text-slate-600 mt-1">{metrica.descricao}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-700 font-semibold">
                    Confiança IA: {metrica.confianca_ia}%
                  </p>
                  <Progress value={metrica.confianca_ia} className="w-20 h-1.5 mt-1" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Valores */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-purple-50 p-2 rounded text-center">
                  <p className="text-slate-600 mb-1">Atual</p>
                  <p className="text-lg font-bold text-purple-700">{metrica.valor_atual}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <p className="text-slate-600 mb-1">Meta</p>
                  <p className="text-lg font-bold text-blue-700">{metrica.meta}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded text-center">
                  <p className="text-slate-600 mb-1">% Meta</p>
                  <p className="text-lg font-bold text-emerald-700">{Math.round(percentualProgresso)}%</p>
                </div>
              </div>

              {/* Progresso */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Progresso em Relação à Meta</span>
                  <span className="text-xs font-semibold">{Math.round(percentualProgresso)}%</span>
                </div>
                <Progress value={Math.min(percentualProgresso, 100)} className={getProgressColor(metrica.valor_atual, metrica.meta)} />
              </div>

              {/* Impacto */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded border-l-2 border-emerald-600">
                <p className="text-xs text-slate-600 font-semibold mb-1">Impacto no Risco</p>
                <p className="text-sm text-slate-900">{metrica.impacto_risco}</p>
              </div>

              {/* Tendência */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  metrica.tendencia === 'crescente' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    metrica.tendencia === 'crescente' ? 'text-emerald-600' : 'text-slate-400'
                  }`} />
                </div>
                <span className="text-sm text-slate-700">
                  Tendência: <span className="font-semibold">{metrica.tendencia}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Resumo */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold">Índice Geral de Resiliência:</span>
              <span className="text-2xl font-bold text-purple-600 ml-2">78%</span>
            </p>
            <p className="text-slate-600">
              Sistema recomenda: Aumentar diversificação de fornecedores (11% acima da meta); Implementar 13% mais cobertura BCM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}