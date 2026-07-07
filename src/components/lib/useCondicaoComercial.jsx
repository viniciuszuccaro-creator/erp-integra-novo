import { useMemo } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

/**
 * Hook centralizado para gerenciar condições comerciais (Cadastros Gerais)
 * Multi-tenant — usa useRLSQuery (compartilha cache com todos os módulos)
 */
export function useCondicaoComercial(filtros = {}) {
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const { data: allCondicoes = [], isLoading: loading } = useRLSQuery(
    'CondicaoComercial', {}, 'nome_condicao', 100,
    { staleTime: 300000, enabled: !!(empresaAtual?.id || grupoAtual?.id) }
  );

  const condicoesComerciais = useMemo(() => {
    return allCondicoes
      .filter(c => c.ativo !== false)
      .filter(c => {
        if (!filtros || Object.keys(filtros).length === 0) return true;
        return Object.entries(filtros).every(([k, v]) => c[k] === v);
      });
  }, [allCondicoes, filtros]);

  const condicoesPagamento = useMemo(() => {
    return condicoesComerciais.filter(c => c.tipo_condicao === 'Pagamento' || !c.tipo_condicao);
  }, [condicoesComerciais]);

  const obterCondicaoPorNome = (nome) => {
    return condicoesComerciais.find(c => c.nome_condicao === nome || c.codigo === nome);
  };

  const obterCondicaoPorPrazo = (prazoDias) => {
    return condicoesComerciais.find(c => c.prazo_pagamento_dias === prazoDias);
  };

  return {
    condicoesComerciais,
    condicoesPagamento,
    isLoading: loading,
    obterCondicaoPorNome,
    obterCondicaoPorPrazo
  };
}

export default useCondicaoComercial;