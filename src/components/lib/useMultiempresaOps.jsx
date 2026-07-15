/**
 * useMultiempresaOps v1.0
 * Hook para operações CRUD com propagação automática Grupo↔Empresas
 * Simplifica uso em componentes: basta usar create/update/delete deste hook
 */

import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useMultiempresaOps(entityName) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  /**
   * Cria registro com contexto automático e propagação
   */
  const create = useCallback(async (data) => {
    const scopedData = {
      ...data,
      ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
      ...(contexto !== 'grupo' && empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
    };

    const result = await base44.entities[entityName].create(scopedData);

    // Propagação assíncrona (não bloqueia UI)
    setTimeout(async () => {
      try {
        await base44.functions.invoke('syncBidirectional', {
          entity_name: entityName,
          entity_id: result?.id,
          event: { type: 'create', entity_name: entityName, entity_id: result?.id },
          data: scopedData,
          group_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
        });
      } catch (_) { console.error('[lib] catch:', _); }
    }, 0);

    return result;
  }, [entityName, empresaAtual, grupoAtual, contexto]);

  /**
   * Atualiza registro com propagação
   */
  const update = useCallback(async (id, data) => {
    const result = await base44.entities[entityName].update(id, data);

    // Propagação assíncrona
    setTimeout(async () => {
      try {
        await base44.functions.invoke('syncBidirectional', {
          entity_name: entityName,
          entity_id: id,
          event: { type: 'update', entity_name: entityName, entity_id: id },
          data: { ...data, id, group_id: grupoAtual?.id, empresa_id: empresaAtual?.id },
          group_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
        });
      } catch (_) { console.error('[lib] catch:', _); }
    }, 0);

    return result;
  }, [entityName, empresaAtual, grupoAtual]);

  /**
   * Remove registro com propagação (remove réplicas nas empresas)
   */
  const remove = useCallback(async (id) => {
    const result = await base44.entities[entityName].delete(id);

    // Propagação de delete assíncrona
    setTimeout(async () => {
      try {
        await base44.functions.invoke('syncBidirectional', {
          entity_name: entityName,
          entity_id: id,
          event: { type: 'delete', entity_name: entityName, entity_id: id },
          data: { id, group_id: grupoAtual?.id, empresa_id: empresaAtual?.id },
          group_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
        });
      } catch (_) { console.error('[lib] catch:', _); }
    }, 0);

    return result;
  }, [entityName, empresaAtual, grupoAtual]);

  /**
   * Lista registros no contexto atual
   */
  const list = useCallback(async (order, limit = 50) => {
    const filter = {};
    if (grupoAtual?.id) filter.group_id = grupoAtual.id;
    if (contexto !== 'grupo' && empresaAtual?.id) filter.empresa_id = empresaAtual.id;

    if (Object.keys(filter).length === 0) {
      return await base44.entities[entityName].list(order, limit);
    }

    return await base44.entities[entityName].filter(filter, order, limit);
  }, [entityName, empresaAtual, grupoAtual, contexto]);

  /**
   * Filtra registros com contexto automático
   */
  const filter = useCallback(async (criteria = {}, order, limit = 50) => {
    const scopedCriteria = {
      ...criteria,
      ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
      ...(contexto !== 'grupo' && empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
    };

    return await base44.entities[entityName].filter(scopedCriteria, order, limit);
  }, [entityName, empresaAtual, grupoAtual, contexto]);

  /**
   * Força sincronização manual de um registro
   */
  const syncRecord = useCallback(async (id, data) => {
    return await base44.functions.invoke('syncBidirectional', {
      entity_name: entityName,
      entity_id: id,
      event: { type: 'update', entity_name: entityName, entity_id: id },
      data: { ...data, id, group_id: grupoAtual?.id, empresa_id: empresaAtual?.id },
      group_id: grupoAtual?.id,
      empresa_id: empresaAtual?.id,
    });
  }, [entityName, empresaAtual, grupoAtual]);

  return {
    create,
    update,
    remove,
    list,
    filter,
    syncRecord,
    contexto,
    empresaAtual,
    grupoAtual,
  };
}