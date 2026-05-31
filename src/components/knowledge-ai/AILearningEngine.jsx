/**
 * AILearningEngine v1.0
 * Motor de aprendizado contínuo da IA
 * Passo 35: Padrões aprendidos, gaps de conhecimento, recomendações
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const LEARNING_STATS = {
  documentsProcessed: 1247,
  patternsDiscovered: 48,
  accuracy: 96.3,
  lastUpdate: '2026-05-31 14:30:00',
};

const LEARNING_INSIGHTS = [
  {
    tipo: 'pattern',
    titulo: 'Padrão: 73% das dúvidas sobre NF-e são no período de fechamento (25-30)',
    confianca: 94,
    acao: 'Criar procedimento automatizado para período crítico',
  },
  {
    tipo: 'gap',
    titulo: 'Gap detectado: Falta documentação sobre integração Google Drive',
    confianca: 87,
    acao: 'Gerar documento automaticamente com IA',
  },
  {
    tipo: 'recommendation',
    titulo: 'Recomendação: Atualizar FAQ Financeiro com novo cenário de DRE Consolidado',
    confianca: 91,
    acao: 'Adicionar 3 novos tópicos',
  },
  {
    tipo: 'trend',
    titulo: 'Tendência: Busca por "Churn de clientes" aumentou 220% em 30 dias',
    confianca: 95,
    acao: 'Priorizar conteúdo de retention',
  },
];

const TIPO_CONFIG = {
  pattern: { icon: TrendingUp, color: 'bg-blue-500/20 text-blue-300', label: '📊 Padrão' },
  gap: { icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-300', label: '⚠️ Gap' },
  recommendation: { icon: Lightbulb, color: 'bg-green-500/20 text-green-300', label: '💡 Recomendação' },
  trend: { icon: TrendingUp, color: 'bg-violet-500/20 text-violet-300', label: '📈 Tendência' },
};

export default function AILearningEngine({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
        Motor de Aprendizado IA
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-white/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs text-slate-400">Documentos Processados</p>
          <p className="text-2xl font-black text-indigo-300">{LEARNING_STATS.documentsProcessed}</p>
        </Card>
        <Card className="p-4 bg-white/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs text-slate-400">Padrões Descobertos</p>
          <p className="text-2xl font-black text-indigo-300">{LEARNING_STATS.patternsDiscovered}</p>
        </Card>
        <Card className="p-4 bg-white/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs text-slate-400">Acurácia</p>
          <p className="text-2xl font-black text-green-400">{LEARNING_STATS.accuracy}%</p>
        </Card>
        <Card className="p-4 bg-white/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs text-slate-400">Atualização</p>
          <p className="text-xs text-indigo-300 font-mono">{LEARNING_STATS.lastUpdate.split(' ')[1]}</p>
        </Card>
      </div>

      {/* Learning Insights */}
      <div className="space-y-3">
        {LEARNING_INSIGHTS.map((insight, idx) => {
          const cfg = TIPO_CONFIG[insight.tipo];
          return (
            <Card key={idx} className={`p-4 border rounded-lg ${cfg.color} bg-white/5`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-white flex-1">{insight.titulo}</p>
                <Badge className={cfg.color}>{cfg.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">✓ {insight.acao}</p>
                <span className="text-xs font-bold text-white">{insight.confianca}%</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next Training */}
      <Card className="p-4 bg-indigo-500/10 border border-indigo-400/40 rounded-lg">
        <p className="text-sm font-semibold text-indigo-300 mb-1">🤖 Próximo Ciclo de Aprendizado</p>
        <p className="text-xs text-slate-300">IA processa novos documentos e padrões a cada 4 horas. Próximo: 18:30 hoje.</p>
      </Card>
    </div>
  );
}