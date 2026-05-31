/**
 * AIRecommendationEngine v1.0
 * Motor de recomendações inteligentes baseado em IA
 * Regra-Mãe: multi-módulo, contextual, real-time
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const RECOMENDACOES = [
  {
    id: 1,
    modulo: 'Estoque',
    titulo: 'Repor SKU-001',
    descricao: 'Estoque crítico detectado. Demanda estimada em +40% nos próximos 7 dias.',
    confianca: 94,
    impacto: 'Alto',
    acao: 'Criar OC',
    economia: 'R$ 12.450',
  },
  {
    id: 2,
    modulo: 'Preço',
    titulo: 'Aumentar margem em Produto XYZ',
    descricao: 'Concorrentes 15% acima de nosso preço. Oportunidade de margem.',
    confianca: 87,
    impacto: 'Médio',
    acao: 'Ajustar Preço',
    economia: 'R$ 8.900',
  },
  {
    id: 3,
    modulo: 'CRM',
    titulo: 'Contatar Cliente B urgente',
    descricao: 'Risco de churn 78%. Sem pedido há 45 dias. Recomenda-se contato.',
    confianca: 92,
    impacto: 'Alto',
    acao: 'Enviar WhatsApp',
    economia: 'Reter R$ 45k',
  },
  {
    id: 4,
    modulo: 'Logística',
    titulo: 'Otimizar rota de entrega',
    descricao: 'Rota atual pode ser reduzida em 23% combinando 3 entregas.',
    confianca: 85,
    impacto: 'Médio',
    acao: 'Revisar Rota',
    economia: 'R$ 3.200',
  },
];

export default function AIRecommendationEngine() {
  const [recomendacoes] = useState(RECOMENDACOES);
  const [filtroModulo, setFiltroModulo] = useState('todos');

  const modulos = ['todos', ...new Set(recomendacoes.map((r) => r.modulo))];
  const recomendacoesFiltradas =
    filtroModulo === 'todos' ? recomendacoes : recomendacoes.filter((r) => r.modulo === filtroModulo);

  const getImpactoColor = (impacto) => {
    const colors = {
      Alto: 'text-red-600',
      Médio: 'text-amber-600',
      Baixo: 'text-blue-600',
    };
    return colors[impacto];
  };

  const getConfiancaIcon = (confianca) => {
    if (confianca >= 90) return '🎯';
    if (confianca >= 80) return '✅';
    return '⚠️';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-amber-500" />
          Motor de Recomendações IA
        </h2>
        <Badge className="px-4 py-2 bg-blue-100 text-blue-800 text-lg">
          {recomendacoes.length} Ativas
        </Badge>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {modulos.map((mod) => (
          <button
            key={mod}
            onClick={() => setFiltroModulo(mod)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              filtroModulo === mod
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {mod === 'todos' ? 'Todas' : mod}
          </button>
        ))}
      </div>

      {/* Recomendações */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {recomendacoesFiltradas.map((rec) => (
          <Card key={rec.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-2xl mt-1">{getConfiancaIcon(rec.confianca)}</div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-slate-100 text-slate-800">{rec.modulo}</Badge>
                      <p className="font-bold text-slate-900">{rec.titulo}</p>
                    </div>
                    <p className="text-sm text-slate-600">{rec.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getImpactoColor(rec.impacto)}`}>{rec.impacto}</p>
                    <p className="text-xs text-slate-600">{rec.confianca}% confiança</p>
                  </div>
                </div>

                {/* Economia */}
                <div className="p-2 bg-slate-50 rounded-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-700 text-sm">{rec.economia}</span>
                </div>

                {/* Ação */}
                <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
                  {rec.acao}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Resumo de Impacto */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Impacto Potencial</p>
            <p className="text-sm text-slate-600">Se implementadas todas as recomendações</p>
          </div>
          <p className="text-3xl font-bold text-green-600">R$ 70.550</p>
        </div>
      </Card>
    </div>
  );
}