/**
 * useCadastrosAllCounts V5 — Contagens definitivas para Cadastros Gerais
 *
 * CORREÇÕES:
 * - Filtro simplificado: passa empresa_id ou group_id diretamente (sem buildContextFilter complexo)
 * - O backend countEntities e entityListSorted já expandem corretamente os filtros simples
 * - staleTime reduzido para 30s para contagens imediatas após cadastros
 * - Invalida ao montar + ao trocar empresa/grupo
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";
import { useEffect, useRef } from "react";

// Entidades de cada bloco
export const BLOCOS_ENTITIES = {
  bloco1: ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  bloco2: ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  bloco3: ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  bloco4: ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  bloco5: ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno","PerfilAcesso"],
  bloco6: ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","GatewayPagamento","EventoNotificacao"],
};

const ALL_ENTITIES = Object.values(BLOCOS_ENTITIES).flat();

/**
 * Filtro simples e direto: o backend (countEntities + entityListSorted)
 * já faz a expansão para empresa_dona_id, empresa_alocada_id, etc.
 * Não usar buildContextFilter complexo aqui — causa $or aninhado que quebra o count.
 */
function buildSimpleFilter(entityName, empresaId, groupId) {
  if (SIMPLE_CATALOG.has(entityName)) return {};
  // Contexto de grupo: usa group_id para o backend expandir para todas as empresas
  if (groupId && !empresaId) return { group_id: groupId };
  // Contexto de empresa: usa empresa_id para o backend expandir para todos os campos
  if (empresaId) return { empresa_id: empresaId };
  // Sem contexto: conta tudo (admin)
  return {};
}

export default function useCadastrosAllCounts() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cadastros-all-counts-v6", empresaId, groupId],
    queryFn: async () => {
      const result = {};

      // SDK DIRETO (sem overhead de funções backend serverless → 5x mais rápido)
      await Promise.allSettled(
        ALL_ENTITIES.map(async (entityName) => {
          try {
            const api = base44.entities?.[entityName];
            if (!api?.filter) { result[entityName] = 0; return; }
            const filter = buildSimpleFilter(entityName, empresaId, groupId);
            const rows = await api.filter(filter, '-created_date', 9999);
            result[entityName] = Array.isArray(rows) ? rows.length : 0;
          } catch (_) {
            result[entityName] = 0;
          }
        })
      );

      const full = {};
      ALL_ENTITIES.forEach(e => { full[e] = Number(result[e]) || 0; });
      return full;
    },
    staleTime: 60_000,
    gcTime: 20 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });

  // Invalida ao trocar empresa/grupo (debounce)
  const invalidateRef = useRef(null);
  useEffect(() => {
    clearTimeout(invalidateRef.current);
    invalidateRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["cadastros-all-counts-v6"] });
    }, 200);
    return () => clearTimeout(invalidateRef.current);
  }, [empresaId, groupId, queryClient]);

  // Subscrição real-time: invalida ao criar/editar/deletar qualquer entidade
  useEffect(() => {
    const unsubs = ALL_ENTITIES.map(name => {
      const api = base44.entities?.[name];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: ["cadastros-all-counts-v6"] });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [empresaId, groupId, queryClient]);

  const counts = data || {};

  // Totais por bloco (soma de todas as entidades do bloco)
  const totals = Object.fromEntries(
    Object.entries(BLOCOS_ENTITIES).map(([bloco, entities]) => [
      bloco,
      entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0),
    ])
  );

  return { counts, totals, isLoading };
}