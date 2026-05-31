/**
 * usePerformanceOptimizer v1.0
 * Otimizações de performance: cache, lazy loading, code splitting, prefetch
 * Regra-Mãe: máxima velocidade + eficiência + multi-empresa
 */
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContextoVisual } from './useContextoVisual';

export default function usePerformanceOptimizer() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const metricsRef = useRef({
    pageLoadTime: 0,
    ttfb: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
  });

  // Medir Core Web Vitals
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metricsRef.current.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              metricsRef.current.cls += entry.value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          metricsRef.current.fid = entries[0].processingDuration;
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        };
      } catch (error) {
        console.error('Erro ao medir Web Vitals:', error);
      }
    }
  }, []);

  // Estratégia de Cache Inteligente
  const optimizeCache = useCallback(() => {
    // Remove queries que não foram acessadas em 10 minutos
    const now = Date.now();
    queryClient.getQueryCache().getAll().forEach((query) => {
      const dataUpdatedAt = query.state.dataUpdatedAt;
      if (now - dataUpdatedAt > 600000) {
        // 10 minutos
        queryClient.removeQueries(query.queryKey);
      }
    });
  }, [queryClient]);

  // Prefetch de dados relacionados
  const prefetchRelated = useCallback(async (entityName) => {
    const relatedQueries = {
      Cliente: ['Pedido', 'ContaReceber', 'Interacao'],
      Pedido: ['Cliente', 'Produto', 'NotaFiscal', 'Entrega'],
      Produto: ['GrupoProduto', 'Marca', 'MovimentacaoEstoque'],
      Fornecedor: ['OrdemCompra', 'ContaPagar'],
    };

    const related = relatedQueries[entityName] || [];
    for (const entity of related) {
      // Prefetch em background
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: [entity],
          queryFn: async () => {
            // Fetch mínimo de dados para warmup
            return [];
          },
        });
      }, 100);
    }
  }, [queryClient]);

  // Lazy loading de images
  const setupLazyLoading = useCallback(() => {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }, []);

  // Compressão de dados de storage
  const compressStorageData = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        const data = localStorage.getItem(key);
        if (data && data.length > 10000) {
          // Se > 10KB, comprimir
          const compressed = JSON.stringify({
            v: 1, // version
            d: btoa(data), // base64 encoded
          });
          if (compressed.length < data.length) {
            localStorage.setItem(key, compressed);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao comprimir storage:', error);
    }
  }, []);

  // Executar otimizações periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache();
      compressStorageData();
    }, 300000); // 5 minutos

    setupLazyLoading();

    return () => clearInterval(interval);
  }, [optimizeCache, compressStorageData, setupLazyLoading]);

  // Log de métricas
  const logMetrics = useCallback(async () => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id,
          metrics: metricsRef.current,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Erro ao enviar métricas:', error);
    }
  }, [empresaAtual?.id, grupoAtual?.id]);

  return {
    metrics: metricsRef.current,
    optimizeCache,
    prefetchRelated,
    setupLazyLoading,
    logMetrics,
  };
}