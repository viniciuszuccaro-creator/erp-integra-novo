/**
 * useRLS — Row-Level Security centralizado (multi-empresa)
 *
 * Hook leve que expõe apenas as operações de dados com escopo
 * automático de empresa_id / group_id, reutilizando useContextoVisual.
 *
 * Uso:
 *   const { query, create, update, remove, scope } = useRLS();
 *   const pedidos = await query('Pedido', { status: 'Aberto' }, '-data_pedido', 50);
 *   await create('Pedido', { numero_pedido: '001', ... });
 *   await update('Pedido', id, { status: 'Faturado' });
 *   await remove('Pedido', id);
 *   // scope → { empresa_id?, group_id? } para injetar manualmente quando necessário
 */
import { useContextoVisual } from './useContextoVisual';

export function useRLS() {
  const {
    filterInContext,
    createInContext,
    updateInContext,
    deleteInContext,
    carimbarContexto,
    getFiltroContexto,
    empresaAtual,
    grupoAtual,
    contexto,
  } = useContextoVisual();

  /** Escopo atual para injeção manual em chamadas externas */
  const scope = {
    ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
    ...(contexto !== 'grupo' && empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
  };

  /**
   * query — busca com escopo RLS automático
   * @param {string} entityName
   * @param {object} criterios  filtros extras (sem empresa_id/group_id — injetados automaticamente)
   * @param {string} order      ex: '-updated_date'
   * @param {number} limit      padrão 100
   */
  const query = (entityName, criterios = {}, order = undefined, limit = 100) =>
    filterInContext(entityName, criterios, order, limit);

  /**
   * create — cria com carimbo de empresa_id / group_id
   */
  const create = (entityName, dados) =>
    createInContext(entityName, dados);

  /**
   * update — atualiza mantendo escopo multiempresa
   */
  const update = (entityName, id, dados) =>
    updateInContext(entityName, id, dados);

  /**
   * remove — exclui com auditoria de contexto
   */
  const remove = (entityName, id) =>
    deleteInContext(entityName, id);

  /**
   * stamp — aplica escopo num objeto antes de salvar manualmente
   */
  const stamp = (dados) => carimbarContexto(dados);

  /**
   * getFilter — retorna filtro de escopo para uso em queries manuais
   */
  const getFilter = (campo = 'empresa_id', incluirGrupo = true) =>
    getFiltroContexto(campo, incluirGrupo);

  return {
    query,
    create,
    update,
    remove,
    stamp,
    getFilter,
    scope,
    empresaAtual,
    grupoAtual,
    contexto,
  };
}

export default useRLS;