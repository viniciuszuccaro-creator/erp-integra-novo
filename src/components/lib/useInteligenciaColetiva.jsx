/**
 * useInteligenciaColetiva v1.0
 * Compartilha aprendizados entre empresas (com isolamento de dados sensíveis)
 * Regra-Mãe: multi-empresa, IA, inovação, melhoria contínua
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useInteligenciaColetiva() {
  const { empresaAtual, grupoAtual, contexto, filterInContext } = useContextoVisual();
  const [insights, setInsights] = useState([]);
  const [benchmarks, setBenchmarks] = useState({});
  const [bestPractices, setBestPractices] = useState([]);

  // Buscar insights coletivos (agregado, sem PII)
  const { data: coletiveData } = useQuery({
    queryKey: ['inteligencia-coletiva', grupoAtual?.id],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('iaGenerativeContextual', {
          task: 'aggregate_group_insights',
          group_id: grupoAtual?.id,
          exclude_sensitive: true,
        });
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!grupoAtual?.id && contexto === 'grupo',
    staleTime: 600000, // 10 minutos
  });

  // Gerar benchmarks entre empresas
  const generateBenchmarks = useCallback(async () => {
    if (!grupoAtual?.id) return;

    try {
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        task: 'generate_group_benchmarks',
        group_id: grupoAtual.id,
        metrics: [
          'uptime',
          'average_response_time',
          'cache_hit_rate',
          'error_rate',
          'user_satisfaction',
        ],
      });

      const benchmarkData = res.data?.benchmarks || {};
      setBenchmarks(benchmarkData);

      // Log benchmark comparison
      await base44.entities.AuditLog.create({
        usuario: 'IA Sistema',
        acao: 'Análise',
        modulo: 'InteligenciaColetiva',
        tipo_auditoria: 'ia',
        entidade: 'Benchmarks',
        descricao: `Benchmarks gerados para ${grupoAtual.id}`,
        group_id: grupoAtual.id,
        dados_novos: benchmarkData,
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao gerar benchmarks:', error);
    }
  }, [grupoAtual?.id]);

  // Extrair best practices do histórico coletivo
  const extractBestPractices = useCallback(async () => {
    if (!grupoAtual?.id) return;

    try {
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        task: 'extract_best_practices',
        group_id: grupoAtual.id,
      });

      const practices = res.data?.practices || [];
      setBestPractices(practices);

      // Log practices extraction
      await base44.entities.AuditLog.create({
        usuario: 'IA Sistema',
        acao: 'Análise',
        modulo: 'InteligenciaColetiva',
        tipo_auditoria: 'ia',
        entidade: 'BestPractices',
        descricao: `${practices.length} melhores práticas extraídas`,
        group_id: grupoAtual.id,
        dados_novos: { count: practices.length },
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao extrair best practices:', error);
    }
  }, [grupoAtual?.id]);

  // Propagar melhoria para outras empresas
  const propagateBestPractice = useCallback(async (practiceId) => {
    if (!grupoAtual?.id) return;

    try {
      const practice = bestPractices.find((p) => p.id === practiceId);
      if (!practice) return;

      // Buscar todas empresas do grupo
      const empresas = await base44.entities.Empresa.filter({
        group_id: grupoAtual.id,
      });

      // Propagar para cada empresa (com approval workflow)
      for (const empresa of empresas) {
        if (empresa.id === empresaAtual?.id) continue; // Skip própria empresa

        await base44.entities.AuditLog.create({
          usuario: 'IA Sistema',
          acao: 'Propagação',
          modulo: 'InteligenciaColetiva',
          tipo_auditoria: 'ia',
          entidade: 'PracticePropagate',
          descricao: `Best practice propagada para ${empresa.nome_fantasia}`,
          empresa_id: empresa.id,
          group_id: grupoAtual.id,
          dados_novos: {
            practice_id: practiceId,
            status: 'pending_approval',
            from_empresa_id: empresaAtual?.id,
          },
          data_hora: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao propagar best practice:', error);
    }
  }, [grupoAtual?.id, empresaAtual?.id, bestPractices]);

  // Gerar insights coletivos
  useEffect(() => {
    if (coletiveData) {
      setInsights(coletiveData.insights || []);
    }
  }, [coletiveData]);

  // Gerar benchmarks e best practices quando grupo mudar
  useEffect(() => {
    if (grupoAtual?.id && contexto === 'grupo') {
      generateBenchmarks();
      extractBestPractices();
    }
  }, [grupoAtual?.id, contexto, generateBenchmarks, extractBestPractices]);

  return {
    insights,
    benchmarks,
    bestPractices,
    generateBenchmarks,
    propagateBestPractice,
    isLoading: !coletiveData,
  };
}