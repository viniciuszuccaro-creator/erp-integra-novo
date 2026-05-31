import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';

export default function PredictiveAnalyticsPanel() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Simulated predictive data (em produção, chamar biForecastPreditivo)
        const mockPredictions = [
          {
            id: '1',
            titulo: 'Previsão de Churn',
            descricao: 'Clientes em risco de desativação',
            confianca: 87,
            impacto: 'Alto',
            recomendacao: 'Implementar programa de retenção'
          },
          {
            id: '2',
            titulo: 'Demanda de Produtos',
            descricao: 'Aumento de 23% em peças no próximo mês',
            confianca: 92,
            impacto: 'Alto',
            recomendacao: 'Aumentar estoque preventivamente'
          },
          {
            id: '3',
            titulo: 'Anomalia de Crédito',
            descricao: 'Padrão incomum detectado em 5 contas',
            confianca: 78,
            impacto: 'Médio',
            recomendacao: 'Revisar limites de crédito'
          }
        ];
        setPredictions(mockPredictions);
      } catch (error) {
        console.error('Erro ao buscar previsões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return <div className="text-slate-400">Carregando previsões...</div>;
  }

  return (
    <div className="w-full space-y-4">
      {predictions.map((pred) => (
        <Card key={pred.id} className="bg-slate-800/30 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                {pred.titulo}
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded ${
                pred.impacto === 'Alto' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'
              }`}>
                {pred.impacto}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{pred.descricao}</p>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Confiança */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Confiança</span>
                <span className="text-sm font-semibold text-white">{pred.confianca}%</span>
              </div>
              <Progress value={pred.confianca} className="h-2" />
            </div>

            {/* Recomendação */}
            <div className="bg-slate-700/50 rounded p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">{pred.recomendacao}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}