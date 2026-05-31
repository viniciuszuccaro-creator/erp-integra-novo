/**
 * SupplyChainAIOptimizer v1.0
 * Recomendações IA para otimização da supply chain
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: 1, titulo: 'Rebalancear Estoque', urgencia: 'high', economia: 'R$ 47k/mês', acao: 'Reduzir SKU-001 em 30%', score: 94 },
  { id: 2, titulo: 'Diversificar Fornecedor', urgencia: 'medium', economia: 'R$ 18k/mês', acao: 'Adicionar Fornecedor F', score: 87 },
  { id: 3, titulo: 'Otimizar Rota Logística', urgencia: 'low', economia: 'R$ 8k/mês', acao: 'Consolidar entregas terça-feira', score: 76 },
  { id: 4, titulo: 'Reducir Lead Time', urgencia: 'high', economia: 'R$ 32k/mês', acao: 'Aumentar frequência com Fornecedor D', score: 91 },
];

const INSIGHTS = [
  { tipo: 'oportunidade', texto: 'Economia potencial: R$ 105k/mês com implementação de todas as recomendações' },
  { tipo: 'alerta', texto: 'Fornecedor C com atraso de 2 dias — considerar reduzir volume' },
  { tipo: 'sucesso', texto: 'Lead time global reduzido 12% nos últimos 30 dias' },
];

export default function SupplyChainAIOptimizer({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-cyan-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
        IA Otimizador — Supply Chain
      </h2>

      {/* Recommendations */}
      <div className="space-y-3">
        {RECOMMENDATIONS.map((rec) => (
          <Card key={rec.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg hover:border-cyan-400/60 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{rec.titulo}</p>
                <p className="text-xs text-slate-400 mt-1">{rec.acao}</p>
              </div>
              <Badge className={
                rec.urgencia === 'high' ? 'bg-red-500/20 text-red-300' :
                rec.urgencia === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                'bg-green-500/20 text-green-300'
              }>
                {rec.urgencia === 'high' ? '⚡ Alta' : rec.urgencia === 'medium' ? '⚠️ Média' : '✓ Baixa'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-400">Economia/mês:</span>
                <p className="font-bold text-green-400">{rec.economia}</p>
              </div>
              <div>
                <span className="text-slate-400">Confiança IA:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${rec.score}%` }} />
                  </div>
                  <span className="font-bold text-white">{rec.score}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors">
                Implementar
              </button>
              <button className="flex-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-md transition-colors">
                Detalhes
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {INSIGHTS.map((insight, idx) => (
          <div key={idx} className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
            insight.tipo === 'oportunidade' ? 'bg-green-500/10 border border-green-500/30 text-green-200' :
            insight.tipo === 'alerta' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200' :
            'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
          }`}>
            {insight.tipo === 'oportunidade' ? <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
             insight.tipo === 'alerta' ? <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
             <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{insight.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}