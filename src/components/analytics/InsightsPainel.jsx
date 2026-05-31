/**
 * InsightsPainel v1.0
 * Painel de insights acionáveis com recomendações de IA
 * Regra-Mãe: IA, inovação, recomendações personalizadas
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const INSIGHTS_DEFAULT = [
  {
    id: 1,
    titulo: 'Oportunidade de Upsell',
    descricao: 'Clientes classe A mostram potencial 45% maior em produtos complementares.',
    tipo: 'opportunity',
    acao: 'Visualizar Clientes A',
    impacto: '+R$ 125k',
  },
  {
    id: 2,
    titulo: 'Churn em Risco',
    descricao: '8 clientes não compraram há 90 dias. Risco de perda estimado em R$ 85k.',
    tipo: 'alert',
    acao: 'Criar Campanha',
    impacto: '-R$ 85k',
  },
  {
    id: 3,
    titulo: 'Sazonalidade Detectada',
    descricao: 'Vendas de inverno (jul-ago) crescem 32% vs média anual.',
    tipo: 'insight',
    acao: 'Aumentar Estoque',
    impacto: '+40% receita',
  },
  {
    id: 4,
    titulo: 'Produto com Giro Baixo',
    descricao: 'Sku SKU-001 parado há 120 dias. Considere descontinuar.',
    tipo: 'warning',
    acao: 'Analisar',
    impacto: '-R$ 45k',
  },
  {
    id: 5,
    titulo: 'Padrão de Compra Emergente',
    descricao: 'WhatsApp gerando 23% das vendas em últimas 2 semanas (crescimento 180%).',
    tipo: 'opportunity',
    acao: 'Investir em WhatsApp',
    impacto: '+60% canal',
  },
];

export default function InsightsPainel() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Em produção, chamar IA para gerar insights reais
      setInsights(INSIGHTS_DEFAULT);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightColor = (tipo) => {
    const colors = {
      opportunity: 'border-green-200 bg-green-50 text-green-900',
      alert: 'border-red-200 bg-red-50 text-red-900',
      warning: 'border-amber-200 bg-amber-50 text-amber-900',
      insight: 'border-blue-200 bg-blue-50 text-blue-900',
    };
    return colors[tipo] || 'border-slate-200 bg-slate-50';
  };

  const getInsightIcon = (tipo) => {
    const icons = {
      opportunity: <TrendingUp className="w-5 h-5 text-green-600" />,
      alert: <AlertCircle className="w-5 h-5 text-red-600" />,
      warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
      insight: <Lightbulb className="w-5 h-5 text-blue-600" />,
    };
    return icons[tipo] || <Lightbulb className="w-5 h-5" />;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      opportunity: '💡 Oportunidade',
      alert: '🚨 Alerta',
      warning: '⚠️ Atenção',
      insight: '🔍 Insight',
    };
    return labels[tipo] || 'Info';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Lightbulb className="w-8 h-8 text-amber-500" />
        Insights Acionáveis (IA)
      </h2>

      <div className="space-y-3">
        {insights.map((insight) => (
          <Card key={insight.id} className={`border-2 rounded-lg p-5 ${getInsightColor(insight.tipo)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{getInsightIcon(insight.tipo)}</div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{insight.titulo}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/50 font-semibold">
                    {getTipoLabel(insight.tipo)}
                  </span>
                </div>

                <p className="text-sm mb-3 opacity-90">{insight.descricao}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold px-3 py-1 bg-white/30 rounded">
                      Impacto: {insight.impacto}
                    </span>
                  </div>

                  <Button className="text-xs bg-white/80 hover:bg-white text-slate-900 font-semibold">
                    {insight.acao}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={loadInsights} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-auto">
        {loading ? 'Gerando insights...' : '🔄 Regenerar Insights (IA)'}
      </Button>
    </div>
  );
}