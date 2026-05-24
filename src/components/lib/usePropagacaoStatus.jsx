/**
 * usePropagacaoStatus v1.0
 * Hook para verificar status de propagação de registros
 * e executar sync manual
 */

import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function usePropagacaoStatus() {
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  /**
   * Verifica se existe réplica de um registro nas empresas
   */
  const checkReplicas = useCallback(async (entityName, recordId) => {
    if (!grupoAtual?.id) return [];
    try {
      return await base44.entities[entityName].filter(
        { documento_grupo_id: recordId },
        null,
        50
      );
    } catch (_) {
      return [];
    }
  }, [grupoAtual]);

  /**
   * Força re-propagação de um registro específico
   */
  const forceSync = useCallback(async (entityName, entityId, data) => {
    setSyncing(true);
    setLastSyncResult(null);
    try {
      const result = await base44.functions.invoke('syncBidirectional', {
        entity_name: entityName,
        entity_id: entityId,
        event: { type: 'update', entity_name: entityName, entity_id: entityId },
        data: {
          ...data,
          id: entityId,
          group_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
        },
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
      });
      setLastSyncResult({ ok: true, ...result?.data });
      return result;
    } catch (err) {
      setLastSyncResult({ ok: false, error: err.message });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [grupoAtual, empresaAtual]);

  /**
   * Propaga configurações do grupo para todas as empresas
   */
  const propagateGroupToAll = useCallback(async (entityName, entityId, data) => {
    setSyncing(true);
    try {
      const result = await base44.functions.invoke('syncBidirectional', {
        entity_name: entityName,
        entity_id: entityId,
        event: { type: 'create', entity_name: entityName, entity_id: entityId },
        data: { ...data, group_id: grupoAtual?.id },
        group_id: grupoAtual?.id,
        direction: 'down',
      });
      setLastSyncResult({ ok: true, ...result?.data });
      return result;
    } catch (err) {
      setLastSyncResult({ ok: false, error: err.message });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [grupoAtual]);

  /**
   * Sobe registro da empresa para o grupo
   */
  const propagateToGroup = useCallback(async (entityName, entityId, data) => {
    setSyncing(true);
    try {
      const result = await base44.functions.invoke('syncBidirectional', {
        entity_name: entityName,
        entity_id: entityId,
        event: { type: 'create', entity_name: entityName, entity_id: entityId },
        data: { ...data, empresa_id: empresaAtual?.id, group_id: grupoAtual?.id },
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
        direction: 'up',
      });
      setLastSyncResult({ ok: true, ...result?.data });
      return result;
    } catch (err) {
      setLastSyncResult({ ok: false, error: err.message });
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [grupoAtual, empresaAtual]);

  return {
    syncing,
    lastSyncResult,
    checkReplicas,
    forceSync,
    propagateGroupToAll,
    propagateToGroup,
    contexto,
    grupoAtual,
    empresaAtual,
  };
}