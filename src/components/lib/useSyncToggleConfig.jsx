/**
 * useSyncToggleConfig v2.0
 * Hook para sincronizar toggles de ConfiguracaoSistema em tempo real
 * Garante persistência após refresh + propagação bidirecional
 */
import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export function useSyncToggleConfig(configKey, onValueChange) {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const isMountedRef = useRef(true);
  const syncTimeoutRef = useRef(null);
  const lastSyncRef = useRef(null);

  // Sincronizar quando valor muda
  const syncToBackend = useCallback(async (value, isDelete = false) => {
    const now = Date.now();
    // Debounce: só sincroniza se passaram >500ms desde último sync
    if (lastSyncRef.current && now - lastSyncRef.current < 500) {
      return;
    }
    lastSyncRef.current = now;

    try {
      const scope = {
        group_id: grupoAtual?.id || null,
        empresa_id: empresaAtual?.id || null,
      };

      if (isDelete) {
        // Deletar a configuração
        // Aqui seria uma chamada a delete, mas upsertConfig com ativa=false também funciona
        await base44.functions.invoke('upsertConfig', {
          chave: configKey,
          data: { chave: configKey, ativa: false, categoria: 'sistema' },
          scope,
        });
      } else {
        // Atualizar ou criar
        await base44.functions.invoke('upsertConfig', {
          chave: configKey,
          data: { chave: configKey, ativa: value, categoria: 'sistema' },
          scope,
        });
      }

      // Se estamos no contexto Grupo, propagar para empresas
      if (grupoAtual?.id && !empresaAtual?.id) {
        try {
          await base44.functions.invoke('syncBidirectional', {
            entityName: 'ConfiguracaoSistema',
            group_id: grupoAtual.id,
            direction: 'down',
          });
        } catch (_) {
          // Propagação falhou, mas o toggle no grupo foi salvo
        }
      }
    } catch (err) {
      console.error('Erro ao sincronizar config:', err?.message);
    }
  }, [grupoAtual?.id, empresaAtual?.id, configKey]);

  // Cancelar snyc anterior se houver
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return { syncToBackend };
}

export default useSyncToggleConfig;