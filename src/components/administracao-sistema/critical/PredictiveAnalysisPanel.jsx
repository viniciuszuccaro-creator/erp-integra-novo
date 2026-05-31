/**
 * PredictiveAnalysisPanel v1.0
 * Análise preditiva de padrões de 429s
 * Regra-Mãe: IA deteta padrões, previne proativamente
 */
import { useEffect, useState } from 'react';
import { Brain, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function PredictiveAnalysisPanel() {
  const { empresaAtual } = useContextoVisual();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzePatterns = async () => {
      try {
        // Buscar últimos 7 dias de logs
        const logs = await base44.entities.AuditLog.filter({
          tipo_auditoria: 'sistema',
          empresa_id: empresaAtual?.id,
        }, '-data_hora', 10000);

        // Análise de padrões
        const errors429ByHour = {};
        logs.forEach(log => {
          if (log.descricao?.includes('429')) {
            const hour = new Date(log.data_hora).getHours();
            errors429ByHour[hour] = (errors429ByHour[hour] || 0) + 1;
          }
        });

        // Detectar pico horário
        const peakHour = Object.entries(errors429ByHour).sort((a, b) => b[1] - a[1])[0];
        const avgErrors = Object.values(errors429ByHour).reduce((a, b) => a + b, 0) / 24;

        // Usar IA para previsão
        const prediction = await base44.integrations.Core.InvokeLLM({
          prompt: `Analise estes dados de erros 429 (rate limit):
          - Pico horário: ${peakHour?.[0]}h com ${peakHour?.[1]} erros
          - Média por hora: ${avgErrors.toFixed(2)}
          - Total na semana: ${Object.values(errors429ByHour).reduce((a, b) => a + b, 0)}
          
          Forneça: (1) Risco de sobrecarga (baixo/médio/alto), (2) Recomendação acionável, (3) ETA de próximo pico`,
          response_json_schema: {
            type: 'object',
            properties: {
              risk_level: { type: 'string' },
              recommendation: { type: 'string' },
              peak_eta_hours: { type: 'number' },
            }
          }
        });

        setPrediction({
          peakHour: peakHour?.[0],
          avgErrors: avgErrors.toFixed(2),
          ...prediction.data,
        });
      } catch (error) {
        console.error('Erro na análise:', error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaAtual?.id) {
      analyzePatterns();
    }
  }, [empresaAtual?.id]);

  if (loading) {
    return (
      <Card className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
          <p className="text-sm text-slate-600">Analisando padrões...</p>
        </div>
      </Card>
    );
  }

  const riskColors = {
    'baixo': 'bg-green-50 border-green-200',
    'médio': 'bg-amber-50 border-amber-200',
    'alto': 'bg-red-50 border-red-200',
  };

  const riskIcons = {
    'baixo': <TrendingDown className="w-5 h-5 text-green-600" />,
    'médio': <AlertTriangle className="w-5 h-5 text-amber-600" />,
    'alto': <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />,
  };

  return (
    <Card className={`w-full p-6 border ${riskColors[prediction?.risk_level?.toLowerCase()] || 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="font-bold text-lg">Análise Preditiva</h3>
        {riskIcons[prediction?.risk_level?.toLowerCase()]}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-600 mb-1">Risco Detectado</p>
          <p className="text-lg font-semibold capitalize">{prediction?.risk_level}</p>
        </div>

        <div>
          <p className="text-xs text-slate-600 mb-1">Pico Horário</p>
          <p className="text-sm">~{prediction?.peakHour}h ({prediction?.avgErrors} erros/hora)</p>
        </div>

        <div>
          <p className="text-xs text-slate-600 mb-1">Recomendação</p>
          <p className="text-sm font-medium">{prediction?.recommendation}</p>
        </div>

        <div>
          <p className="text-xs text-slate-600 mb-1">Próximo Pico Previsto</p>
          <p className="text-sm">Em ~{prediction?.peak_eta_hours}h</p>
        </div>
      </div>
    </Card>
  );
}