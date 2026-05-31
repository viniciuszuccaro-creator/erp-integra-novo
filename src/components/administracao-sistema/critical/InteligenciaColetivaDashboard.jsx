/**
 * InteligenciaColetivaDashboard v1.0
 * Dashboard de inteligência coletiva com benchmarks globais
 * Regra-Mãe: w-full, h-full, multi-empresa, insights globais
 */
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Lightbulb, Target } from 'lucide-react';
import useInteligenciaColetiva from '@/components/lib/useInteligenciaColetiva';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function InteligenciaColetivaDashboard() {
  const { benchmarks, insights, bestPractices, isLoading, getComparisonWithGroup } =
    useInteligenciaColetiva();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const comparison = getComparisonWithGroup();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-slate-600">Carregando análise coletiva...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Users className="w-8 h-8 text-blue-600" />
        Inteligência Coletiva do Grupo
      </h2>

      {/* Comparação com Grupo */}
      {comparison && (
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Sua Posição vs. Grupo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Uptime */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <p className="text-sm text-slate-600 mb-2">Uptime</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-green-700">{comparison.uptime.empresa}%</span>
                <span className="text-xs text-slate-600">(média grupo: {comparison.uptime.media_grupo}%)</span>
              </div>
              <p className="text-xs font-semibold text-green-700">
                {comparison.uptime.posicao === 1 ? '🏆 #1 do grupo' : `Posição ${comparison.uptime.posicao}`}
              </p>
            </div>

            {/* Latência */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="text-sm text-slate-600 mb-2">Latência Média</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-700">{comparison.latencia.empresa}ms</span>
                <span className="text-xs text-slate-600">(média: {comparison.latencia.media_grupo}ms)</span>
              </div>
              <p className="text-xs font-semibold text-blue-700">
                {comparison.latencia.posicao === 1
                  ? '⚡ Mais rápido'
                  : `${comparison.latencia.empresa > comparison.latencia.media_grupo ? '↑ Mais lento' : '↓ Mais rápido'}`}
              </p>
            </div>

            {/* Cache Hit Rate */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <p className="text-sm text-slate-600 mb-2">Cache Hit Rate</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-purple-700">{comparison.cache_hit.empresa}%</span>
                <span className="text-xs text-slate-600">(média: {comparison.cache_hit.media_grupo}%)</span>
              </div>
              <p className="text-xs font-semibold text-purple-700">
                {comparison.cache_hit.posicao === 1 ? '📈 Otimizado' : 'Há espaço para melhoria'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Benchmarks Globais */}
      {benchmarks && (
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Benchmarks do Grupo (Todas Empresas)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uptime Benchmarks */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="font-semibold text-sm text-slate-900 mb-3">Uptime</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Melhor empresa:</span>
                  <span className="font-bold text-green-600">{benchmarks.uptime.melhor}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Média grupo:</span>
                  <span className="font-bold text-slate-900">{benchmarks.uptime.media}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pior empresa:</span>
                  <span className="font-bold text-orange-600">{benchmarks.uptime.pior}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Desvio padrão:</span>
                  <span className="font-bold text-slate-600">±{benchmarks.uptime.desvio}%</span>
                </div>
              </div>
            </div>

            {/* Latência Benchmarks */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="font-semibold text-sm text-slate-900 mb-3">Latência</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Mais rápida:</span>
                  <span className="font-bold text-green-600">{benchmarks.latencia.melhor}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Média grupo:</span>
                  <span className="font-bold text-slate-900">{benchmarks.latencia.media}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mais lenta:</span>
                  <span className="font-bold text-orange-600">{benchmarks.latencia.pior}ms</span>
                </div>
              </div>
            </div>

            {/* Cache Hit Rate Benchmarks */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="font-semibold text-sm text-slate-900 mb-3">Cache Hit Rate</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Melhor:</span>
                  <span className="font-bold text-green-600">{benchmarks.cache_hit_rate.melhor}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Média grupo:</span>
                  <span className="font-bold text-slate-900">{benchmarks.cache_hit_rate.media}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pior:</span>
                  <span className="font-bold text-orange-600">{benchmarks.cache_hit_rate.pior}%</span>
                </div>
              </div>
            </div>

            {/* Recovery Auto */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="font-semibold text-sm text-slate-900 mb-3">Auto-Recovery</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Média grupo:</span>
                  <span className="font-bold text-slate-900">{benchmarks.recuperacao_auto.media}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxa sucesso:</span>
                  <span className="font-bold text-green-600">{benchmarks.recuperacao_auto.taxa_sucesso}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Insights Globais */}
      {insights.length > 0 && (
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Insights Globais ({insights.length})
          </h3>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="font-semibold text-sm text-slate-900">{insight.titulo}</p>
                <p className="text-xs text-slate-600 mt-2">{insight.descricao}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-mono text-slate-600">Impacto: {insight.impacto}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                    {insight.tipo_insight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Best Practices */}
      {bestPractices.length > 0 && (
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">⭐ Best Practices do Grupo ({bestPractices.length})</h3>

          <div className="space-y-3">
            {bestPractices.map((practice, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm text-slate-900 flex-1">{practice.titulo}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800 ml-2">
                    {practice.empresa_origem}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{practice.descricao}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2 rounded bg-white border border-green-100">
                    <p className="text-slate-500">Impacto</p>
                    <p className="font-bold text-green-700">{practice.impacto_estimado}</p>
                  </div>
                  <div className="p-2 rounded bg-white border border-green-100">
                    <p className="text-slate-500">Facilidade</p>
                    <p className="font-bold text-slate-900">{practice.facilidade_implementacao}</p>
                  </div>
                  <div className="p-2 rounded bg-white border border-green-100">
                    <p className="text-slate-500">Economia</p>
                    <p className="font-bold text-green-700">{practice.economia_potencial}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}