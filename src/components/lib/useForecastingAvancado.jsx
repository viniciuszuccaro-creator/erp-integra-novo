/**
 * useForecastingAvancado v1.0
 * Forecasting com 60-90 dias + ML preditivo + confiança %
 * Regra-Mãe: multi-empresa, IA, inovação, melhoria contínua
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useForecastingAvancado() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [forecasts, setForecasts] = useState({});
  const [accuracy, setAccuracy] = useState({});

  // Buscar previsões
  const { data: forecastData } = useQuery({
    queryKey: ['forecasting', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('iaGenerativeContextual', {
          task: 'generate_forecasts',
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id,
          horizon_days: 90,
          metrics: [
            'vendas_diarias',
            'estoque_necessario',
            'demanda_produtos',
            'capacidade_producao',
            'comportamento_cliente',
            'sazonalidade',
          ],
        });

        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!empresaAtual?.id || (contexto === 'grupo' && !!grupoAtual?.id),
    staleTime: 3600000, // 1 hora
  });

  // Processar previsões
  useEffect(() => {
    if (!forecastData) return;

    const processedForecasts = {
      vendas: {
        actual: forecastData.vendas_actual || 0,
        forecast_30d: forecastData.vendas_30d || 0,
        forecast_60d: forecastData.vendas_60d || 0,
        forecast_90d: forecastData.vendas_90d || 0,
        trend: forecastData.vendas_trend || 0,
        confidence: forecastData.vendas_confidence || 0,
        historico: forecastData.vendas_history || [],
      },
      estoque: {
        actual: forecastData.estoque_actual || 0,
        forecast_30d: forecastData.estoque_30d || 0,
        forecast_60d: forecastData.estoque_60d || 0,
        forecast_90d: forecastData.estoque_90d || 0,
        alerta_falta: forecastData.estoque_alerta || false,
        dias_para_falta: forecastData.dias_falta || null,
        confidence: forecastData.estoque_confidence || 0,
      },
      demanda: {
        top_produtos: forecastData.demanda_top || [],
        sazonalidade: forecastData.sazonalidade || {},
        crescimento_anual: forecastData.crescimento || 0,
        confidence: forecastData.demanda_confidence || 0,
      },
      producao: {
        capacidade_atual: forecastData.producao_capacidade || 0,
        necessario_30d: forecastData.producao_necessario_30d || 0,
        gargalo_identificado: forecastData.producao_gargalo || null,
        recomendacao: forecastData.producao_recomendacao || null,
        confidence: forecastData.producao_confidence || 0,
      },
    };

    setForecasts(processedForecasts);

    // Calcular acurácia média (comparando com dados reais passados)
    const accuracyData = {
      vendas: forecastData.vendas_accuracy || 0,
      estoque: forecastData.estoque_accuracy || 0,
      demanda: forecastData.demanda_accuracy || 0,
      producao: forecastData.producao_accuracy || 0,
      media: (
        (forecastData.vendas_accuracy ||
          0 +
            forecastData.estoque_accuracy ||
          0 +
            forecastData.demanda_accuracy ||
          0 +
            forecastData.producao_accuracy ||
          0) / 4
      ).toFixed(1),
    };

    setAccuracy(accuracyData);

    // Log previsões
    base44.entities.AuditLog.create({
      usuario: 'IA Forecasting',
      acao: 'Previsão',
      modulo: 'Forecasting',
      tipo_auditoria: 'ia',
      entidade: 'Previsoes',
      descricao: `Previsões geradas: vendas=${processedForecasts.vendas.forecast_90d}, demanda top=${processedForecasts.demanda.top_produtos.length}`,
      empresa_id: empresaAtual?.id,
      group_id: grupoAtual?.id,
      dados_novos: {
        forecasts: processedForecasts,
        accuracy: accuracyData,
      },
      data_hora: new Date().toISOString(),
    });
  }, [forecastData, empresaAtual?.id, grupoAtual?.id]);

  // Simular cenário "E se?"
  const simulateScenario = useCallback(
    async (cenario) => {
      try {
        const res = await base44.functions.invoke('iaGenerativeContextual', {
          task: 'simulate_scenario',
          empresa_id: empresaAtual?.id,
          scenario: cenario, // ex: {aumento_preco: 10, reducao_marketing: 20}
        });

        const resultado = res.data;

        // Log simulação
        await base44.entities.AuditLog.create({
          usuario: 'Usuário',
          acao: 'Simulação',
          modulo: 'Forecasting',
          tipo_auditoria: 'simulacao',
          entidade: 'CenarioSimulado',
          descricao: `Simulação: ${JSON.stringify(cenario)}`,
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id,
          dados_novos: resultado,
          data_hora: new Date().toISOString(),
        });

        return resultado;
      } catch (error) {
        console.error('Erro ao simular cenário:', error);
        return null;
      }
    },
    [empresaAtual?.id, grupoAtual?.id]
  );

  // Alertas preditivos
  const getPredictiveAlerts = useCallback(() => {
    const alerts = [];

    if (forecasts.estoque?.alerta_falta) {
      alerts.push({
        tipo: 'critical',
        titulo: 'Falta de Estoque Prevista',
        descricao: `Em ${forecasts.estoque.dias_para_falta} dias faltará estoque`,
        acao: 'Aumentar produção ou compra imediata',
      });
    }

    if (forecasts.producao?.gargalo_identificado) {
      alerts.push({
        tipo: 'warning',
        titulo: 'Gargalo de Produção',
        descricao: forecasts.producao.recomendacao,
        acao: 'Revisar alocação de recursos',
      });
    }

    if (forecasts.vendas?.trend < -10) {
      alerts.push({
        tipo: 'warning',
        titulo: 'Queda de Vendas Prevista',
        descricao: `Redução de ${Math.abs(forecasts.vendas.trend).toFixed(1)}% nos próximos 30 dias`,
        acao: 'Aumentar ações de marketing',
      });
    }

    return alerts;
  }, [forecasts]);

  return {
    forecasts,
    accuracy,
    simulateScenario,
    getPredictiveAlerts: getPredictiveAlerts(),
    isLoading: !forecastData,
  };
}