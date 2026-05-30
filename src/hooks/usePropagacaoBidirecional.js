import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * usePropagacaoBidirecional v2.0
 * Hook central para CRUD com propagação automática Grupo ↔ Empresas
 *
 * Uso:
 *   const { createComPropagacao, updateComPropagacao, deleteComPropagacao } = usePropagacaoBidirecional();
 *   await createComPropagacao("Cliente", dadosCliente);
 */
export function usePropagacaoBidirecional() {
  const { grupoAtual, empresaAtual, contexto, carimbarContexto } = useContextoVisual();

  const propagate = useCallback(
    async (action, entityName, data, entityId = null) => {
      try {
        // Usa syncBidirectional — mais robusto com anti-loop e deduplicação
        await base44.functions.invoke("syncBidirectional", {
          entity_name: entityName,
          entity_id: entityId,
          event: { type: action, entity_name: entityName, entity_id: entityId },
          data,
          group_id: grupoAtual?.id || null,
          empresa_id: contexto !== "grupo" ? (empresaAtual?.id || null) : null,
          direction: contexto === "grupo" ? "down" : "up",
        });
      } catch (err) {
        // Propagação não bloqueia a operação principal — apenas loga
        console.warn(`[PROPAGAÇÃO] ${entityName}.${action} falhou silenciosamente:`, err.message);
      }
    },
    [grupoAtual?.id, empresaAtual?.id, contexto]
  );

  /**
   * Cria um registro com carimbo de contexto e propaga automaticamente
   */
  const createComPropagacao = useCallback(
    async (entityName, dados) => {
      const dataComContexto = carimbarContexto(dados);
      const created = await base44.entities[entityName].create(dataComContexto);
      await propagate("create", entityName, dataComContexto, created?.id);
      return created;
    },
    [carimbarContexto, propagate]
  );

  /**
   * Atualiza um registro e propaga a mudança
   */
  const updateComPropagacao = useCallback(
    async (entityName, id, dados) => {
      const updated = await base44.entities[entityName].update(id, dados);
      await propagate("update", entityName, dados, id);
      return updated;
    },
    [propagate]
  );

  /**
   * Exclui um registro e propaga (para logs de auditoria)
   */
  const deleteComPropagacao = useCallback(
    async (entityName, id) => {
      const deleted = await base44.entities[entityName].delete(id);
      await propagate("delete", entityName, { id }, id);
      return deleted;
    },
    [propagate]
  );

  /**
   * Baixa um título financeiro (ContaReceber/ContaPagar) com propagação
   */
  const baixarTituloMultiempresa = useCallback(
    async (entityName, id, dadosBaixa) => {
      const updated = await base44.entities[entityName].update(id, {
        ...dadosBaixa,
        status: "Recebido",
        data_liquidacao: dadosBaixa.data_liquidacao || new Date().toISOString().split("T")[0],
      });
      await propagate("update", entityName, dadosBaixa, id);
      return updated;
    },
    [propagate]
  );

  return {
    createComPropagacao,
    updateComPropagacao,
    deleteComPropagacao,
    baixarTituloMultiempresa,
    propagate,
  };
}

export default usePropagacaoBidirecional;