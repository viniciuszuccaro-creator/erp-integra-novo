/**
 * PredictiveAnalytics v1.0
 * Análises preditivas para 30, 60, 90 dias
 * Regra-Mãe: forecasting, churn prediction, demanda
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const PREDICOES = [
  {
    metrica: 'Demanda Vendas',
    periodo: '30 dias',
    valor_atual: 45230,
    valor_previsto: 52450,
    variacao: '+15.9%',
    confianca: 94,
    cor: 'text-green-600',
  },
  {
    metrica: 'Estoque Crítico',
    periodo: '30 dias',
    valor_atual: 3,
    valor_previsto: 8,
    variacao: '+167%',
    confianca: 91,
    cor: 'text-red-600',
  },
  {
    metrica: 'Taxa Churn',
    periodo: '60 dias',
    valor_atual: 2.3,
    valor_previsto: 3.1,
    variacao: '+35%',
    confianca: 87,
    cor: 'text-orange-600',
  },
  {
    metrica: 'Receita',
    periodo: '90 dias',
    valor_atual: 145000,
    valor_previsto: 198750,
    variacao: '+37%',
    confianca: 89,
    cor: 'text-green-600',
  },
];

export default function PredictiveAnalytics() {
  const [predicoes] = useState(PREDICOES);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Análises Preditivas
        </h2>
      </div>

      {/* Grid de Previsões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predicoes.map((pred, idx) => (
          <Card key={idx} className="p-4 rounded-lg bg-white border border-slate-200">
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-900">{pred.metrica}</p>
                  <p className="text-xs text-slate-600">{pred.periodo}</p>
                </div>
                <Badge className="bg-slate-100 text-slate-800">{pred.confianca}%</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600">Valor Atual</p>
                <p className="text-lg font-bold text-slate-900">{pred.valor_atual.toLocaleString('pt-BR')}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600">Previsto</p>
                <p className="text-lg font-bold text-slate-900">{pred.valor_previsto.toLocaleString('pt-BR')}</p>
              </div>

              <div className={`p-2 rounded-lg flex items-center gap-2 ${pred.cor === 'text-green-600' ? 'bg-green-50' : 'bg-red-50'}`}>
                {pred.variacao.includes('-') ? (
                  <TrendingDown className={`w-4 h-4 ${pred.cor}`} />
                ) : (
                  <TrendingUp className={`w-4 h-4 ${pred.cor}`} />
                )}
                <span className={`font-bold ${pred.cor}`}>{pred.variacao}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alertas Críticos */}
      <Card className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Alertas Críticos</p>
            <ul className="text-sm text-red-800 mt-2 space-y-1">
              <li>• Estoque crítico em 8 SKUs (previsão para 30 dias)</li>
              <li>• Taxa de churn pode aumentar 35% em 60 dias</li>
              <li>• Demanda pico em dias 20-25 (preparar estoque)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Confiança Geral */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Confiança Média', value: '90%', bg: 'bg-blue-50' },
          { label: 'Modelos Ativos', value: '7', bg: 'bg-green-50' },
          { label: 'Atualizações/dia', value: '24', bg: 'bg-purple-50' },
        ].map((item, idx) => (
          <Card key={idx} className={`p-3 rounded-lg border border-slate-200 ${item.bg}`}>
            <p className="text-xs text-slate-600 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}