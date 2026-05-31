/**
 * MaintenancePredictions v1.0
 * Previsões de manutenção com IA
 * Passo 36: Algoritmos de predição + probabilidade de falha
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingDown, AlertTriangle } from 'lucide-react';

const PREDICTIONS = [
  {
    id: 1,
    ativo: 'Compressor-D',
    tipoFalha: 'Desgaste de válvulas',
    dias: 2,
    probabilidade: 91,
    impacto: 'Parada produção 8h',
    acao: 'Manutenção emergencial urgente',
  },
  {
    id: 2,
    ativo: 'Bomba-B',
    tipoFalha: 'Sobrecarga hidráulica',
    dias: 7,
    probabilidade: 76,
    impacto: 'Redução 30% eficiência',
    acao: 'Agendar revisão completa',
  },
  {
    id: 3,
    ativo: 'CNC-A',
    tipoFalha: 'Desgaste de mancal',
    dias: 15,
    probabilidade: 64,
    impacto: 'Risco de desalinhamento',
    acao: 'Monitorar diariamente',
  },
  {
    id: 4,
    ativo: 'Transformador-C',
    tipoFalha: 'Aumento de temperatura',
    dias: 28,
    probabilidade: 48,
    impacto: 'Redução vida útil',
    acao: 'Verificação preventiva',
  },
];

export default function MaintenancePredictions({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-orange-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Brain className="w-6 h-6 text-orange-400 animate-pulse" />
        Previsões IA — Próximas Falhas
      </h2>

      <div className="space-y-3">
        {PREDICTIONS.map((pred) => {
          const urgencia = pred.probabilidade >= 80 ? 'critical' : pred.probabilidade >= 60 ? 'warning' : 'low';
          const colors = {
            critical: 'border-red-500/40 bg-red-500/5',
            warning: 'border-amber-500/40 bg-amber-500/5',
            low: 'border-blue-500/40 bg-blue-500/5',
          };

          return (
            <Card key={pred.id} className={`p-4 border rounded-lg ${colors[urgencia]} bg-white/5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{pred.ativo}</p>
                  <p className="text-xs text-slate-400">{pred.tipoFalha}</p>
                </div>
                <Badge className={
                  urgencia === 'critical' ? 'bg-red-500/20 text-red-300' :
                  urgencia === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-blue-500/20 text-blue-300'
                }>
                  {pred.dias}d
                </Badge>
              </div>

              {/* Probabilidade */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">Probabilidade de Falha</span>
                  <span className="text-sm font-bold text-white">{pred.probabilidade}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pred.probabilidade >= 80 ? 'bg-red-500' : pred.probabilidade >= 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${pred.probabilidade}%` }}
                  />
                </div>
              </div>

              {/* Impacto e Ação */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-slate-400">Impacto</p>
                  <p className="text-white font-semibold">{pred.impacto}</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-slate-400">Ação Recomendada</p>
                  <p className="text-white font-semibold">{pred.acao}</p>
                </div>
              </div>

              {/* CTA */}
              <button className={`mt-2 w-full px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                urgencia === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' :
                urgencia === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                {urgencia === 'critical' ? '🚨 Agendar Agora' : 'Agendar Manutenção'}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}