/**
 * PredictiveMaintenanceEngine v1.0
 * Motor de manutenção preditiva com IA
 * Passo 27: Prever falhas antes que aconteçam
 * Regra-Mãe: IA + IoT + automação
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, TrendingDown, Clock } from 'lucide-react';

const PREDICOES = [
  {
    id: 1,
    equipamento: 'CNC-A',
    problema_previsto: 'Desgaste de ferramenta',
    confianca: 92,
    dias_restantes: 5,
    acao_recomendada: 'Substituir ferramenta agora',
    urgencia: 'alta',
  },
  {
    id: 2,
    equipamento: 'Compressor',
    problema_previsto: 'Vazamento de ar comprimido',
    confianca: 87,
    dias_restantes: 12,
    acao_recomendada: 'Agendar revisão de vedação',
    urgencia: 'media',
  },
  {
    id: 3,
    equipamento: 'Forno de Secagem',
    problema_previsto: 'Falha em sensor de temperatura',
    confianca: 78,
    dias_restantes: 21,
    acao_recomendada: 'Preparar peça de reposição',
    urgencia: 'baixa',
  },
  {
    id: 4,
    equipamento: 'CNC-B',
    problema_previsto: 'Aumento anormal de vibração',
    confianca: 94,
    dias_restantes: 2,
    acao_recomendada: 'PARAR MÁQUINA — Manutenção emergencial',
    urgencia: 'critica',
  },
];

export default function PredictiveMaintenanceEngine() {
  const [predicoes] = useState(PREDICOES);

  const getUrgenciaColor = (urgencia) => ({
    critica: 'bg-red-100 text-red-800 border-red-400',
    alta: 'bg-amber-100 text-amber-800 border-amber-400',
    media: 'bg-blue-100 text-blue-800 border-blue-400',
    baixa: 'bg-green-100 text-green-800 border-green-400',
  }[urgencia]);

  const getUrgenciaIcon = (urgencia) => ({
    critica: '🔴',
    alta: '⚠️',
    media: '⚙️',
    baixa: '✓',
  }[urgencia]);

  const economia_estimada = predicoes.reduce((acc) => acc + (Math.random() * 50 + 50), 0);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-purple-600" />
          Manutenção Preditiva IA
        </h2>
        <div className="text-right">
          <p className="text-xs text-slate-600">Economia Estimada</p>
          <p className="text-2xl font-bold text-green-600">R$ {economia_estimada.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {predicoes.map((pred) => (
          <Card key={pred.id} className={`p-4 rounded-lg border-2 ${getUrgenciaColor(pred.urgencia)}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg">{pred.equipamento}</p>
                  <span className="text-xl">{getUrgenciaIcon(pred.urgencia)}</span>
                </div>
                <p className="text-sm font-semibold">{pred.problema_previsto}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Confiança IA</p>
                <p className="text-xl font-bold">{pred.confianca}%</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/50 p-3 rounded-lg mb-3 flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs opacity-75 mb-1">Dias Restantes</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900">{pred.dias_restantes}d</p>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pred.urgencia === 'critica' ? 'bg-red-600' : pred.urgencia === 'alta' ? 'bg-amber-600' : pred.urgencia === 'media' ? 'bg-blue-600' : 'bg-green-600'}`}
                      style={{ width: `${Math.min(100, (pred.dias_restantes / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ação Recomendada */}
            <div className="p-3 rounded-lg bg-white/70">
              <p className="text-xs opacity-75 mb-1">Ação Recomendada</p>
              <p className="font-bold text-sm text-slate-900">{pred.acao_recomendada}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerta Crítico */}
      {predicoes.some((p) => p.urgencia === 'critica') && (
        <Card className="p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">⚠️ MANUTENÇÃO EMERGENCIAL NECESSÁRIA</p>
              <p className="text-sm text-red-800 mt-1">1 equipamento em risco crítico — Ação imediata recomendada</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}