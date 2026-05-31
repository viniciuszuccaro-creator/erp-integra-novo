/**
 * useSyncedAlerts v1.0
 * Hook que sincroniza alertas entre abas/janelas
 * Regra-Mãe: multi-janelas + broadcast
 */
import { useEffect, useCallback } from 'react';
import useIntelligentAlerts from './useIntelligentAlerts';
import useCacheCleanup from './useCacheCleanup';

export default function useSyncedAlerts(counts = {}, enabled = true) {
  const { alertedEntities } = useIntelligentAlerts(counts, enabled);
  const { cleanupOldCache } = useCacheCleanup();

  // Broadcast de alertas para outras abas/janelas
  useEffect(() => {
    const channel = new BroadcastChannel('erp_alerts');
    
    const handleAlerts = () => {
      channel.postMessage({
        type: 'ALERT_SYNC',
        alertedEntities: Array.from(alertedEntities),
        timestamp: Date.now(),
      });
    };

    // Enviar quando alertas mudarem
    handleAlerts();

    const interval = setInterval(handleAlerts, 30000);
    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, [alertedEntities]);

  // Sincronizar cleanup entre abas
  useEffect(() => {
    const channel = new BroadcastChannel('erp_cache');
    
    const handleMessage = (event) => {
      if (event.data.type === 'CLEANUP_REQUEST') {
        cleanupOldCache();
      }
    };

    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [cleanupOldCache]);

  return { alertedEntities };
}