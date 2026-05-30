import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook central para propagação bidirecional Grupo ↔ Empresas
 * Garante que toda operação CRUD propague automaticamente
 */
export function usePropagacaoBidirecional() {
  const { grupoAtual, empresaAtual, contexto, empresasDoGrupo } = useContextoVisual();

  /**
   * Criar registro com propagação automática
   * Se estiver no contexto GRUPO → replica para todas empresas
   * Se estiver em EMPRESA → sobe para o grupo
   */
  const createComPropagacao = useCallback(async (entityName, data, opcoes = {}) => {
    const { propagarParaEmpresas = true, propagarParaGrupo = true } = opcoes;
    
    const dataComContexto = {
      ...data,
      ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
      ...(contexto !== "grupo" && empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
    };

    // Criar o registro principal
    const created = await base44.entities[entityName].create(dataComContexto);

    // PROPAGAÇÃO GRUPO → EMPRESAS
    if (contexto === "grupo" && propagarParaEmpresas && grupoAtual?.id) {
      try {
        await base44.functions.invoke("propagateGroupData", {
          action: "create",
          entityName,
          data: dataComContexto,
          groupId: grupoAtual.id,
          mode: "down",
        });
      } catch (err) {
        console.warn("[PROPAGAÇÃO] Erro ao propagar para empresas:", err.message);
      }
    }

    // PROPAGAÇÃO EMPRESA → GRUPO
    if (contexto === "empresa" && propagarParaGrupo && empresaAtual?.id && grupoAtual?.id) {
      try {
        await base44.functions.invoke("propagateGroupData", {
          action: "create",
          entityName,
          data: { ...dataComContexto },
          empresaId: empresaAtual.id,
          groupId: grupoAtual.id,
          mode: "up",
        });
      } catch (err) {
        console.warn("[PROPAGAÇÃO] Erro ao sincronizar com grupo:", err.message);
      }
    }

    return created;
  }, [grupoAtual, empresaAtual, contexto]);

  /**
   * Atualizar registro com propagação automática
   */
  const updateComPropagacao = useCallback(async (entityName, id, data, opcoes = {}) => {
    const { propagarParaEmpresas = true } = opcoes;
    
    const updated = await base44.entities[entityName].update(id, data);

    if (contexto === "grupo" && propagarParaEmpresas && grupoAtual?.id) {
      try {
        await base44.functions.invoke("propagateGroupData", {
          action: "update",
          entityName,
          entityId: id,
          data,
          groupId: grupoAtual.id,
        });
      } catch (err) {
        console.warn("[PROPAGAÇÃO] Erro ao propagar atualização:", err.message);
      }
    }

    return updated;
  }, [grupoAtual, contexto]);

  /**
   * Utilitário para baixar um título e propagar para empresa correspondente
   */
  const baixarTitulo = useCallback(async (tituloId, dadosBaixa) => {
    const titulo = await base44.entities.ContaReceber.update(tituloId, dadosBaixa);

    // Se estiver no grupo, propagar a baixa para a empresa
    if (contexto === "grupo" && titulo?.empresa_id) {
      try {
        const registrosEmpresa = await base44.entities.ContaReceber.filter(
          { empresa_id: titulo.empresa_id, $or: [{ ref_id: tituloId }, { id: tituloId }] },
          "-updated_date",
          1
        );
        for (const reg of registrosEmpresa) {
          if (reg.id !== tituloId) {
            await base44.entities.ContaReceber.update(reg.id, dadosBaixa);
          }
        }
      } catch (err) {
        console.warn("[PROPAGAÇÃO] Erro ao baixar título na empresa:", err.message);
      }
    }

    return titulo;
  }, [contexto]);

  return {
    createComPropagacao,
    updateComPropagacao,
    baixarTitulo,
    contextoAtual: contexto,
    empresaAtual,
    grupoAtual,
    empresasDoGrupo,
  };
}

export default usePropagacaoBidirecional;