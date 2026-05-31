/**
 * useInteligenciaColetiva v1.0
 * Inteligência coletiva: comparação entre empresas, benchmarks, insights globais
 * Regra-Mãe: multi-empresa, IA, controle de acesso, inovação
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useInteligenciaColetiva() {
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const [benchmarks, setBenchmarks] = useState(null);
  const [insights, setInsights] = useState([]);
  const [bestPractices, setBestPractices] = useState([]);

  // Fetch dados consolidados do grupo
  const { data: grupoData, isLoading } = useQuery({
    queryKey: ['inteligencia_coletiva', grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return null;

      try {
        const res = await base44.functions.invoke('iaGenerativeContextual', {
          task: 'analyze_group_intelligence',
          group_id: grupoAtual.id,
          analise_type: 'collective_benchmarks',
        });

        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!grupoAtual?.id && contexto === 'grupo',
    staleTime: 600000, // 10 minutos
  });

  // Processar benchmarks
  useEffect(() => {
    if (!grupoData) return;

    // Extrair benchmarks
    const benchmarkData = {
      uptime: {
        media: grupoData.uptime_media || 0,
        melhor: grupoData.uptime_melhor || 0,
        pior: grupoData.uptime_pior || 0,
        desvio: grupoData.uptime_desvio || 0,
      },
      latencia: {
        media: grupoData.latencia_media || 0,
        melhor: grupoData.latencia_melhor || 0,
        pior: grupoData.latencia_pior || 0,
      },
      cache_hit_rate: {
        media: grupoData.cache_hit_rate_media || 0,
        melhor: grupoData.cache_hit_rate_melhor || 0,
        pior: grupoData.cache_hit_rate_pior || 0,
      },
      recuperacao_auto: {
        media: grupoData.recuperacao_auto_media || 0,
        taxa_sucesso: grupoData.recuperacao_auto_sucesso || 0,
      },
    };

    setBenchmarks(benchmarkData);

    // Extrair insights globais
    const insightsGlobais = grupoData.insights_globais || [];
    setInsights(insightsGlobais);

    // Extrair best practices
    const practices = grupoData.best_practices || [];
    setBestPractices(practices);

    // Log em AuditLog
    base44.entities.AuditLog.create({
      usuario: 'IA Coletiva',
      acao: 'Análise',
      modulo: 'Inteligência Coletiva',
      tipo_auditoria: 'ia',
      entidade: 'Grupo',
      descricao: `Análise coletiva do grupo: ${insightsGlobais.length} insights, ${practices.length} best practices`,
      group_id: grupoAtual?.id,
      dados_novos: {
        benchmarks_count: Object.keys(benchmarkData).length,
        insights_count: insightsGlobais.length,
        practices_count: practices.length,
      },
      data_hora: new Date().toISOString(),
    });
  }, [grupoData, grupoAtual?.id]);

  // Comparar empresa atual com grupo
  const getComparisonWithGroup = () => {
    if (!benchmarks || !empresaAtual) return null;

    return {
      uptime: {
        empresa: grupoData?.empresa_uptime || 0,
        media_grupo: benchmarks.uptime.media,
        posicao: grupoData?.empresa_uptime_posicao || 0,
      },
      latencia: {
        empresa: grupoData?.empresa_latencia || 0,
        media_grupo: benchmarks.latencia.media,
        posicao: grupoData?.empresa_latencia_posicao || 0,
      },
      cache_hit: {
        empresa: grupoData?.empresa_cache_hit || 0,
        media_grupo: benchmarks.cache_hit_rate.media,
        posicao: grupoData?.empresa_cache_hit_posicao || 0,
      },
    };
  };

  // Recomendações baseadas em best practices do grupo
  const getRecommendationsFromGroup = () => {
    return bestPractices.map((practice) => ({
      id: practice.id,
      titulo: practice.titulo,
      descricao: practice.descricao,
      empresa_origem: practice.empresa_origem,
      impacto_estimado: practice.impacto_estimado,
      facilidade_implementacao: practice.facilidade_implementacao,
      economia_potencial: practice.economia_potencial,
    }));
  };

  return {
    benchmarks,
    insights,
    bestPractices,
    isLoading,
    getComparisonWithGroup,
    getRecommendationsFromGroup,
    grupoData,
  };
}