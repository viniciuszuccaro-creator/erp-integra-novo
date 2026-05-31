/**
 * IABusinessIntelligence v1.0
 * BI Avançado com análise preditiva, anomalias e recomendações
 * Regra-Mãe: w-full, h-full, multi-empresa, IA
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function IABusinessIntelligence() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!empresaAtual?.id && !grupoAtual?.id) return;
    loadIntelligence();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      // Chamar função IA de análise
      const result = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros: {
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id,
        },
        previsao_estoque: { enabled: true, horizon_days: 30 },
      });

      // Processar insights
      if (result?.data) {
        setInsights(result.data.insights || []);
        setAnomalies(result.data.anomalies || []);
        setRecommendations(result.data.recommendations || []);
      }
    } catch (error) {
      console.error('Erro ao carregar IA insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          IA Business Intelligence
        </h2>
        <button
          onClick={loadIntelligence}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? '⏳ Analisando...' : '🔄 Atualizar'}
        </button>
      </div>

      {/* Insights */}
      <Card className="w-full p-4 bg-white border-l-4 border-purple-500">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Insights Detectados ({insights.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-sm text-slate-900">{insight.titulo}</p>
              <p className="text-xs text-slate-600 mt-1">{insight.descricao}</p>
              <p className="text-xs font-mono text-purple-600 mt-2">{insight.metrica}</p>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-sm text-slate-500 col-span-2">Nenhum insight ainda...</p>
          )}
        </div>
      </Card>

      {/* Anomalias */}
      <Card className="w-full p-4 bg-white border-l-4 border-red-500">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Anomalias Detectadas ({anomalies.length})
        </h3>
        <div className="space-y-2">
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{anomaly.tipo}</p>
                  <p className="text-xs text-slate-600 mt-1">{anomaly.descricao}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  anomaly.severidade === 'CRÍTICA' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {anomaly.severidade}
                </span>
              </div>
            </div>
          ))}
          {anomalies.length === 0 && (
            <p className="text-sm text-slate-500">Sem anomalias detectadas ✓</p>
          )}
        </div>
      </Card>

      {/* Recomendações */}
      <Card className="w-full p-4 bg-white border-l-4 border-green-500">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-green-600" />
          Recomendações da IA ({recommendations.length})
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-sm text-slate-900">{rec.acao}</p>
              <p className="text-xs text-slate-600 mt-1">{rec.descricao}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-green-600">Impacto: {rec.impacto}</span>
                <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  Aplicar
                </button>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-sm text-slate-500">Nenhuma recomendação no momento</p>
          )}
        </div>
      </Card>
    </div>
  );
}