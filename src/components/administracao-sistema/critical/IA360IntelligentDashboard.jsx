/**
 * IA360IntelligentDashboard v1.0
 * Dashboard 360° com recomendações inteligentes de IA
 * Regra-Mãe: w-full, h-full, responsivo, auto-otimização
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle2, Loader } from 'lucide-react';
import useIA360Dashboard from '@/components/lib/useIA360Dashboard';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function IA360IntelligentDashboard() {
  const { healthScore, aiRecommendations, predictedIssues, isLoading, executeAutoOptimization } =
    useIA360Dashboard();
  const { empresaAtual, contexto } = useContextoVisual();
  const [executingId, setExecutingId] = useState(null);

  const handleExecuteOptimization = async (recId) => {
    setExecutingId(recId);
    await executeAutoOptimization(recId);
    setExecutingId(null);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-50 border-blue-200 text-blue-900',
      medium: 'bg-amber-50 border-amber-200 text-amber-900',
      high: 'bg-red-50 border-red-200 text-red-900',
      critical: 'bg-red-100 border-red-300 text-red-900',
    };
    return colors[severity] || 'bg-slate-50 border-slate-200';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      low: <TrendingUp className="w-4 h-4" />,
      medium: <AlertTriangle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      critical: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[severity];
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-indigo-600" />
          IA360 Dashboard Inteligente
        </h2>
        <p className="text-slate-600">
          {contexto === 'grupo' ? 'Análise consolidada do grupo' : `Análise de ${empresaAtual?.nome_fantasia}`}
        </p>
      </div>

      {/* Health Score */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Score de Saúde do Sistema</h3>
          {isLoading && <Loader className="w-4 h-4 animate-spin text-indigo-600" />}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeDasharray={`${healthScore * 2.827} 282`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">{healthScore}%</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Recomendações</p>
                <p className="text-2xl font-bold text-slate-900">{aiRecommendations.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Problemas Previstos</p>
                <p className="text-2xl font-bold text-red-600">{predictedIssues.length}</p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled data-action="Sistema.IA.otimizar" data-sensitive="true">
                <Zap className="w-4 h-4 mr-2" />
                Auto-Otimizar Tudo
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          Recomendações de IA ({aiRecommendations.length})
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {aiRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-slate-600">Sistema em perfeitas condições!</p>
            </div>
          ) : (
            aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(rec.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(rec.severity)}
                    <div>
                      <p className="font-semibold">{rec.action}</p>
                      <p className="text-sm opacity-90 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                    {Math.round((rec.probability || 0.85) * 100)}% confiança
                  </span>
                </div>

                {rec.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs font-semibold mb-2">Ação Sugerida:</p>
                    <p className="text-sm opacity-90 mb-3">{rec.suggestedAction}</p>
                    <Button
                      onClick={() => handleExecuteOptimization(rec.id)}
                      disabled={executingId === rec.id}
                      className="w-full text-xs bg-white/30 hover:bg-white/50 text-inherit"
                    >
                      {executingId === rec.id ? (
                        <>
                          <Loader className="w-3 h-3 mr-1 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Executar Otimização
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Predicted Issues */}
      {predictedIssues.length > 0 && (
        <Card className="w-full p-6 bg-red-50 border-2 border-red-200 rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Problemas Previstos pela IA
          </h3>

          <div className="space-y-2">
            {predictedIssues.map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-red-900">{issue.description}</p>
                  <p className="text-xs text-red-700 mt-1">
                    Probabilidade: {Math.round(issue.probability * 100)}%
                  </p>
                  {issue.suggestedAction && (
                    <p className="text-xs text-red-800 mt-1 font-medium">
                      Ação: {issue.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        <p>IA360 atualiza a cada 5 minutos | Algoritmo de previsão: Machine Learning + Pattern Analysis</p>
      </div>
    </div>
  );
}