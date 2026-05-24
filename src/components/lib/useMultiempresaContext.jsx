/**
 * useMultiempresaContext — Hook centralizado para operações multiempresa.
 * Fornece helpers para carimbar contexto, filtrar por escopo e criar/atualizar entidades.
 * Reutilizável em qualquer módulo (Financeiro, Comercial, Estoque, etc).
 */
import { useCallback } from "react";
import { useContextoVisual } from "./useContextoVisual";

export function useMultiempresaContext() {
  const ctx = useContextoVisual();
  const { empresaAtual, grupoAtual, estaNoGrupo, createInContext, updateInContext, deleteInContext, filterInContext, carimbarContexto } = ctx;

  /** Retorna o scope atual { group_id?, empresa_id? } */
  const getScope = useCallback(() => {
    const s = {};
    if (grupoAtual?.id) s.group_id = grupoAtual.id;
    if (!estaNoGrupo && empresaAtual?.id) s.empresa_id = empresaAtual.id;
    return s;
  }, [grupoAtual?.id, empresaAtual?.id, estaNoGrupo]);

  /** Verifica se há um contexto ativo (grupo ou empresa) */
  const hasContext = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  /** Label amigável do contexto atual */
  const contextoLabel = estaNoGrupo
    ? (grupoAtual?.nome_do_grupo || grupoAtual?.id || "Grupo")
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || empresaAtual?.id || "Empresa");

  /** Cria registro com contexto automático */
  const create = useCallback(
    (entityName, data, campo = "empresa_id") => createInContext(entityName, data, campo),
    [createInContext]
  );

  /** Atualiza registro com contexto automático */
  const update = useCallback(
    (entityName, id, data, campo = "empresa_id") => updateInContext(entityName, id, data, campo),
    [updateInContext]
  );

  /** Remove registro com auditoria */
  const remove = useCallback(
    (entityName, id) => deleteInContext(entityName, id),
    [deleteInContext]
  );

  /** Lista registros filtrados pelo contexto atual */
  const list = useCallback(
    (entityName, criterios = {}, order, limit) => filterInContext(entityName, criterios, order, limit),
    [filterInContext]
  );

  return {
    empresaAtual,
    grupoAtual,
    estaNoGrupo,
    hasContext,
    contextoLabel,
    getScope,
    carimbar: carimbarContexto,
    create,
    update,
    remove,
    list,
  };
}

export default useMultiempresaContext;