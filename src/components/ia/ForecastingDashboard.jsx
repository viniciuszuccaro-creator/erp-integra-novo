/**
 * ForecastingDashboard v1.0
 * Dashboard de previsões com gráficos + simulador de cenários
 * Regra-Mãe: w-full, h-full, responsivo, IA avançada
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Zap, Eye } from 'lucide-react';
import useForecastingAvancado from '@/components/lib/useForecastingAvancado';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ForecastingDashboard() {
  const { empresaAtual } = useContextoVisual();
  const { forecasts, accuracy, simulateScenario, getPredictiveAlerts, isLoading } =
    useForecastingAvancado();
  const [cenarioAtivo, setCenarioAtivo] = useState(null);
  const [resultadoSimulacao, setResultadoSimulacao] = useState(null);

  const handleSimulate = async (cenario) => {
    const resultado = await simulateScenario(cenario);
    setResultadoSimulacao(resultado);
    setCenarioAtivo(cenario);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Carregando previsões...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-8 h-8 text-indigo-600" />
        Forecasting Avançado - Previsões 90 dias
      </h2>

      {/* Acurácia */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">📊 Acurácia do Modelo ML</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">Média</p>
            <p className="text-2xl font-bold text-indigo-600">{accuracy.media}%</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">Vendas</p>
            <p className="text-2xl font-bold text-green-600">{accuracy.vendas}%</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">Estoque</p>
            <p className="text-2xl font-bold text-blue-600">{accuracy.estoque}%</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">Demanda</p>
            <p className="text-2xl font-bold text-purple-600">{accuracy.demanda}%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">Produção</p>
            <p className="text-2xl font-bold text-orange-600">{accuracy.producao}%</p>
          </div>
        </div>
      </Card>

      {/* Previsões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendas */}
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">💰 Previsão de Vendas</h3>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">30 dias</span>
              <span className="font-bold text-slate-900">R$ {forecasts.vendas?.forecast_30d.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">60 dias</span>
              <span className="font-bold text-slate-900">R$ {forecasts.vendas?.forecast_60d.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">90 dias</span>
              <span className="font-bold text-slate-900">R$ {forecasts.vendas?.forecast_90d.toLocaleString('pt-BR')}</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Tendência</p>
              <p className={`font-bold ${forecasts.vendas?.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {forecasts.vendas?.trend >= 0 ? '+' : ''}{forecasts.vendas?.trend.toFixed(1)}% ao mês
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Confiança</p>
              <p className="font-bold text-purple-600">{forecasts.vendas?.confidence.toFixed(0)}%</p>
            </div>
          </div>
        </Card>

        {/* Estoque */}
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">📦 Previsão de Estoque</h3>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Atual</span>
              <span className="font-bold text-slate-900">{forecasts.estoque?.actual.toLocaleString('pt-BR')} un</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Previsto (30d)</span>
              <span className="font-bold text-slate-900">{forecasts.estoque?.forecast_30d.toLocaleString('pt-BR')} un</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Previsto (90d)</span>
              <span className="font-bold text-slate-900">{forecasts.estoque?.forecast_90d.toLocaleString('pt-BR')} un</span>
            </div>

            {forecasts.estoque?.alerta_falta && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 font-bold">⚠️ Falta prevista em {forecasts.estoque?.dias_para_falta} dias</p>
              </div>
            )}
          </div>
        </Card>

        {/* Demanda */}
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">📈 Previsão de Demanda</h3>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3">Top 5 Produtos:</p>
            {(forecasts.demanda?.top_produtos || []).map((produto, idx) => (
              <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-700">{produto.nome}</span>
                <span className="font-bold text-slate-900">{produto.quantidade} un</span>
              </div>
            ))}

            <div className="p-3 bg-green-50 rounded-lg mt-3">
              <p className="text-xs text-slate-600 mb-1">Crescimento Anual</p>
              <p className="font-bold text-green-600">+{forecasts.demanda?.crescimento_anual.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Produção */}
        <Card className="w-full p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">🏭 Previsão de Produção</h3>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Capacidade Atual</span>
              <span className="font-bold text-slate-900">{forecasts.producao?.capacidade_atual.toLocaleString('pt-BR')} un/dia</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Necessário (30d)</span>
              <span className="font-bold text-slate-900">{forecasts.producao?.necessario_30d.toLocaleString('pt-BR')} un/dia</span>
            </div>

            {forecasts.producao?.gargalo_identificado && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700 font-bold">🔧 Gargalo: {forecasts.producao?.gargalo_identificado}</p>
                <p className="text-xs text-orange-600 mt-1">{forecasts.producao?.recomendacao}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Alertas Preditivos */}
      {getPredictiveAlerts.length > 0 && (
        <Card className="w-full p-6 bg-red-50 rounded-lg shadow-md border-2 border-red-200">
          <h3 className="font-bold text-lg text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas Preditivos
          </h3>

          <div className="space-y-3">
            {getPredictiveAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  alert.tipo === 'critical'
                    ? 'bg-red-100 border-red-300'
                    : 'bg-orange-100 border-orange-300'
                }`}
              >
                <p className={`font-bold ${alert.tipo === 'critical' ? 'text-red-900' : 'text-orange-900'}`}>
                  {alert.titulo}
                </p>
                <p className={`text-sm mt-1 ${alert.tipo === 'critical' ? 'text-red-800' : 'text-orange-800'}`}>
                  {alert.descricao}
                </p>
                <p className={`text-xs font-semibold mt-2 ${alert.tipo === 'critical' ? 'text-red-700' : 'text-orange-700'}`}>
                  ➜ {alert.acao}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Simulador de Cenários */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-600" />
          Simulador "E se?" - Testar Cenários
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => handleSimulate({ aumento_preco: 10 })}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-left h-auto p-4"
          >
            <div>
              <p className="font-bold">📈 Aumentar Preço 10%</p>
              <p className="text-xs opacity-80">Impacto nas vendas?</p>
            </div>
          </Button>

          <Button
            onClick={() => handleSimulate({ aumento_marketing: 20 })}
            className="bg-green-100 hover:bg-green-200 text-green-900 text-left h-auto p-4"
          >
            <div>
              <p className="font-bold">📢 +20% Marketing</p>
              <p className="text-xs opacity-80">ROI esperado?</p>
            </div>
          </Button>

          <Button
            onClick={() => handleSimulate({ expansion_producao: 30 })}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 text-left h-auto p-4"
          >
            <div>
              <p className="font-bold">🏭 Expandir 30%</p>
              <p className="text-xs opacity-80">Viabilidade?</p>
            </div>
          </Button>

          <Button
            onClick={() => handleSimulate({ reducao_custo: 15 })}
            className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-left h-auto p-4"
          >
            <div>
              <p className="font-bold">💰 Reduzir Custo 15%</p>
              <p className="text-xs opacity-80">Margem melhora?</p>
            </div>
          </Button>
        </div>

        {resultadoSimulacao && (
          <div className="p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200">
            <p className="font-bold text-indigo-900 mb-3">📊 Resultado da Simulação</p>
            <div className="space-y-2 text-sm text-indigo-800">
              <p>
                <span className="font-semibold">Vendas Esperadas:</span> R${' '}
                {resultadoSimulacao.vendas_esperadas?.toLocaleString('pt-BR')}
              </p>
              <p>
                <span className="font-semibold">Lucro Estimado:</span> R${' '}
                {resultadoSimulacao.lucro_estimado?.toLocaleString('pt-BR')}
              </p>
              <p>
                <span className="font-semibold">Margem:</span> {resultadoSimulacao.margem_estimada?.toFixed(1)}%
              </p>
              <p className="text-xs opacity-90 mt-3">{resultadoSimulacao.recomendacao}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}