/**
 * CopilotInsightsFeed v1.0 — Passo 37
 * Feed de insights proativos gerados pela IA em tempo real
 * Regra-Mãe: w-full h-full, multi-empresa, IA proativa
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATIC_INSIGHTS = [
  {
    id: 1,
    tipo: 'oportunidade',
    modulo: 'Comercial',
    titulo: 'Upsell identificado: 12 clientes prontos para upgrade',
    descricao: 'IA detectou padrão de compra recorrente que indica potencial para produto premium. Valor estimado: R$ 84.000/mês.',
    impacto: '+R$ 84k/mês',
    confianca: 91,
    acao: 'Acionar vendedores para contato',
    icon: TrendingUp,
    color: 'border-green-500/40 bg-green-500/5',
    badgeColor: 'bg-green-500/20 text-green-300',
  },
  {
    id: 2,
    tipo: 'risco',
    modulo: 'Financeiro',
    titulo: 'Inadimplência crescente: 3 clientes em risco elevado',
    descricao: 'Score de pagamento caiu abaixo de 40 em 3 contas. Total em risco: R$ 143.500. Histórico aponta atraso médio de 22 dias.',
    impacto: 'Risco R$ 143k',
    confianca: 88,
    acao: 'Bloquear crédito + acionar cobrança',
    icon: AlertTriangle,
    color: 'border-red-500/40 bg-red-500/5',
    badgeColor: 'bg-red-500/20 text-red-300',
  },
  {
    id: 3,
    tipo: 'eficiencia',
    modulo: 'Estoque',
    titulo: 'Giro baixo: 34 SKUs sem movimento há 90+ dias',
    descricao: 'Capital imobilizado estimado em R$ 212.000. Sugestão: promoção relâmpago com desconto 20% para girar estoque parado.',
    impacto: 'Capital R$ 212k',
    confianca: 96,
    acao: 'Criar campanha de queima',
    icon: TrendingDown,
    color: 'border-amber-500/40 bg-amber-500/5',
    badgeColor: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 4,
    tipo: 'melhoria',
    modulo: 'Produção',
    titulo: 'Setup de máquinas otimizável: economia de 2.4h/dia',
    descricao: 'Algoritmo de sequenciamento identificou ordem de produção 31% mais eficiente. Projeção: R$ 18.200/mês de redução de custo.',
    impacto: '-R$ 18.2k custo/mês',
    confianca: 84,
    acao: 'Aplicar novo sequenciamento',
    icon: CheckCircle2,
    color: 'border-blue-500/40 bg-blue-500/5',
    badgeColor: 'bg-blue-500/20 text-blue-300',
  },
];

export default function CopilotInsightsFeed({ empresa }) {
  const [insights, setInsights] = useState(STATIC_INSIGHTS);
  const [loading, setLoading] = useState(false);
  const [iaInsight, setIaInsight] = useState(null);

  const generateIAInsight = async () => {
    setLoading(true);
    setIaInsight(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um analista de BI sênior do ERP Zuccaro da empresa ${empresa}.
Gere 1 insight estratégico inovador e acionável sobre o negócio, considerando as áreas: financeiro, estoque, comercial ou produção.
Responda em JSON com os campos: titulo (string), descricao (string, 2 frases), impacto (string ex: "+R$ 50k"), acao (string curta).`,
        response_json_schema: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            impacto: { type: 'string' },
            acao: { type: 'string' },
          },
        },
      });
      setIaInsight(res);
    } catch {
      setIaInsight({ titulo: 'Erro ao gerar insight', descricao: 'Tente novamente em instantes.', impacto: '—', acao: '—' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-violet-400" />
          Insights Proativos — {empresa}
        </h2>
        <button
          onClick={generateIAInsight}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-white text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Gerar com IA
        </button>
      </div>

      {/* IA Generated Insight */}
      {iaInsight && (
        <Card className="p-4 bg-violet-500/10 border border-violet-400/50 rounded-xl">
          <Badge className="bg-violet-500/30 text-violet-200 mb-2">✨ Gerado pela IA agora</Badge>
          <p className="text-sm font-bold text-white mb-1">{iaInsight.titulo}</p>
          <p className="text-xs text-slate-300 mb-2">{iaInsight.descricao}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-300 font-semibold">{iaInsight.impacto}</span>
            <span className="text-slate-400">{iaInsight.acao}</span>
          </div>
        </Card>
      )}

      {/* Static Insights */}
      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <Card key={insight.id} className={`p-4 border rounded-xl ${insight.color} bg-white/5`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={insight.badgeColor}>{insight.modulo}</Badge>
                    <span className="text-xs text-slate-400">{insight.confianca}% confiança</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{insight.titulo}</p>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{insight.descricao}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{insight.impacto}</span>
                    <button className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                      {insight.acao}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}