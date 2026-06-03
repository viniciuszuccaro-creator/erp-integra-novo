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
 * Filtro para contagem dos blocos de Cadastros Gerais.
 * Entidades de catálogo (SIMPLE_CATALOG) filtram por group_id quando disponível,
 * garantindo que apenas os registros do grupo ativo sejam contados no snapshot.
 * Entidades de negócio (Cliente, Fornecedor, etc.) usam empresa_id ou group_id.
 */
function buildSimpleFilter(entityName, empresaId, groupId) {
  if (SIMPLE_CATALOG.has(entityName)) {
    // Entidades de catálogo: filtra pelo grupo quando disponível
    if (groupId) return { group_id: groupId };
    if (empresaId) return { empresa_id: empresaId };
    return {};
  }
  // Entidades de negócio: filtro padrão
  if (groupId && !empresaId) return { group_id: groupId };
  if (empresaId) return { empresa_id: empresaId };
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
      const BATCH_SIZE = 6;      // 6 por vez → seguro contra 429
      const BATCH_DELAY = 180;   // 180ms entre batches → ~54 entidades em ~1.8s

      for (let i = 0; i < ALL_ENTITIES.length; i += BATCH_SIZE) {
        if (i > 0) await new Promise(r => setTimeout(r, BATCH_DELAY));
        const batch = ALL_ENTITIES.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(async (entityName) => {
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
      }

      const full = {};
      ALL_ENTITIES.forEach(e => { full[e] = Number(result[e]) || 0; });
      return full;
    },
    staleTime: 5 * 60_000,       // 5 min — não re-fetch desnecessário
    gcTime: 30 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: false,        // usa cache entre navegações
    retry: 0,                     // sem retry — evita duplicar 429
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