/**
 * useCounterWithNotification v1.0
 * Hook que conta entidades + notifica se circuit abre
 * Regra-Mãe: alertar usuário, melhor experiência
 */
import { useEffect, useCallback } from 'react';
import useCountEntitiesOptimized from './useCountEntitiesOptimized';
import { useToast } from '@/components/ui/use-toast';

export default function useCounterWithNotification(entityNames = [], options = {}) {
  const { toast } = useToast();
  const { counts, circuitState, loadCounts, isProtected } = useCountEntitiesOptimized(entityNames);
  const prevStateRef = { current: null };

  // Notificar quando circuit abre/fecha
  useEffect(() => {
    if (circuitState === 'OPEN' && prevStateRef.current !== 'OPEN') {
      toast({
        title: '🚨 Proteção Ativada',
        description: 'Muitas requisições. Sistema em modo proteção por 60s.',
        variant: 'destructive',
      });
      prevStateRef.current = 'OPEN';
    } else if (circuitState === 'CLOSED' && prevStateRef.current === 'OPEN') {
      toast({
        title: '✅ Sistema Recuperado',
        description: 'Conexão restaurada. Operações retomadas.',
      });
      prevStateRef.current = 'CLOSED';
    }
  }, [circuitState, toast]);

  // Carregador auto com opção de intervalo
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadCounts();
      
      if (options.pollInterval) {
        const interval = setInterval(loadCounts, options.pollInterval);
        return () => clearInterval(interval);
      }
    }
  }, [loadCounts, options]);

  return { counts, circuitState, isProtected, loadCounts };
}