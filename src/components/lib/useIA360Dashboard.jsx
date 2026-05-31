/**
 * useIA360Dashboard v1.0
 * Dashboard 360° com IA que recomenda ações automáticas
 * Regra-Mãe: IA preditiva + auto-otimização + multi-empresa
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useIA360Dashboard() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [predictedIssues, setPredictedIssues] = useState([]);

  // Fetch health metrics
  const { data: metrics } = useQuery({
    queryKey: ['ia360', 'metrics', empresaAtual?.id],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('iaGenerativeContextual', {
          task: 'analyze_system_health',
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id,
          contexto,
        });
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!empresaAtual?.id || contexto === 'grupo',
    staleTime: 300000,
  });

  // Generate AI recommendations
  const generateRecommendations = useCallback(async () => {
    if (!metrics) return;

    try {
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        task: 'generate_optimization_recommendations',
        metrics,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
      });

      const recommendations = res.data?.recommendations || [];
      setAiRecommendations(recommendations);

      // Extract predicted issues
      const issues = recommendations
        .filter(r => r.severity === 'high' || r.severity === 'critical')
        .map(r => ({
          id: `issue_${Date.now()}_${Math.random()}`,
          type: r.type,
          description: r.description,
          predictedAt: new Date().toISOString(),
          probability: r.probability || 0.85,
          suggestedAction: r.suggestedAction,
        }));

      setPredictedIssues(issues);

      // Calculate health score
      const score = Math.max(
        0,
        100 -
          (recommendations.reduce((sum, r) => {
            const severity = { low: 5, medium: 15, high: 25, critical: 40 };
            return sum + (severity[r.severity] || 0);
          }, 0) || 0)
      );
      setHealthScore(score);

      // Log recommendations in AuditLog
      await base44.entities.AuditLog.create({
        usuario: 'IA System',
        acao: 'Análise',
        modulo: 'IA360',
        tipo_auditoria: 'ia',
        entidade: 'Dashboard',
        descricao: `IA gerou ${recommendations.length} recomendações`,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        dados_novos: {
          healthScore: score,
          recommendationCount: recommendations.length,
          predictedIssuesCount: issues.length,
        },
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao gerar recomendações IA:', error);
    }
  }, [metrics, empresaAtual?.id, grupoAtual?.id]);

  // Auto-generate recommendations when metrics change
  useEffect(() => {
    if (metrics) {
      generateRecommendations();
    }
  }, [metrics, generateRecommendations]);

  // Execute auto-optimization
  const executeAutoOptimization = useCallback(async (recommendationId) => {
    const recommendation = aiRecommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;

    try {
      await base44.functions.invoke('iaGenerativeContextual', {
        task: 'execute_optimization',
        recommendation,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
      });

      // Log execution
      await base44.entities.AuditLog.create({
        usuario: 'IA System',
        acao: 'Otimização',
        modulo: 'IA360',
        tipo_auditoria: 'ia',
        entidade: 'AutoOptimization',
        descricao: `IA executou otimização: ${recommendation.action}`,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        dados_novos: recommendation,
        data_hora: new Date().toISOString(),
      });

      // Refresh recommendations
      generateRecommendations();
    } catch (error) {
      console.error('Erro ao executar otimização:', error);
    }
  }, [aiRecommendations, empresaAtual?.id, grupoAtual?.id, generateRecommendations]);

  return {
    healthScore,
    aiRecommendations,
    predictedIssues,
    metrics,
    executeAutoOptimization,
    generateRecommendations,
    isLoading: !metrics,
  };
}