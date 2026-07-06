/**
 * useCadastrosAllCounts V7 — Snapshot fixo + contagens via countEntities backend
 *
 * Estratégia: usa countEntities (backend) com limit=1 para contar de forma rápida e precisa.
 * Para Produto usa filtro expandido (group_id + empresa_id) para pegar todos os 828 importados.
 * Snapshot hardcoded como placeholderData para exibição imediata enquanto carrega.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
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

// Snapshot vazio — contagens reais carregadas via countEntities com filtro de contexto.
// Não usar números hardcoded (causa divergência entre badge e tabela).
const SNAPSHOT = {};
// Inicializa todas as entidades com 0
ALL_ENTITIES.forEach(e => { SNAPSHOT[e] = 0; });

// Conta entidade via backend countEntities (retorna número exato sem trazer registros)
async function countEntity(entityName, filter) {
  try {
    const res = await base44.functions.invoke("countEntities", { entityName, filter });
    const n = res?.data?.count ?? res?.data?.total ?? res?.data;
    return typeof n === "number" ? n : 0;
  } catch (_) {
    return 0;
  }
}

export default function useCadastrosAllCounts() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;
  const queryClient = useQueryClient();

  // Contagem precisa: valida TODAS as entidades respeitando contexto + força refetch se contexto muda
  const { data } = useQuery({
    queryKey: ["cadastros-all-counts-v7", groupId, empresaId],
    queryFn: async () => {
      // Se sem contexto ativo, retorna snapshot sem contar
      if (!groupId && !empresaId) return SNAPSHOT;

      const result = { ...SNAPSHOT };
      await Promise.allSettled(
        ALL_ENTITIES.map(async (entityName) => {
          try {
            let filter = {};
            // Determina field e valor baseado no contexto
            if (groupId) {
              filter.group_id = groupId;
            } else if (empresaId) {
              // Algumas entidades têm campo diferente
              if (["Fornecedor","Transportadora"].includes(entityName)) {
                filter.empresa_dona_id = empresaId;
              } else if (["Cliente"].includes(entityName)) {
                filter.empresa_id = empresaId;
              } else if (["Colaborador"].includes(entityName)) {
                filter.empresa_alocada_id = empresaId;
              } else {
                filter.empresa_id = empresaId;
              }
            }
            const n = await countEntity(entityName, filter);
            result[entityName] = Math.max(0, n);
          } catch (_) { /* mantém snapshot */ }
        })
      );
      return result;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });

  // Real-time: incrementa/decrementa sem refetch completo
  useEffect(() => {
    const unsubs = ALL_ENTITIES.map(name => {
      const api = base44.entities?.[name];
      if (!api?.subscribe) return null;
      return api.subscribe((evt) => {
        // Invalida cache para forçar refetch preciso em próxima entrada
        queryClient.invalidateQueries({ queryKey: ["cadastros-all-counts-v7"], type: "all" });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === "function") u(); }); };
  }, [groupId, empresaId, queryClient]);

  const counts = data || SNAPSHOT;
  const isLoadingCount = !data;

  const totals = Object.fromEntries(
    Object.entries(BLOCOS_ENTITIES).map(([bloco, entities]) => [
      bloco,
      entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0),
    ])
  );

  return { counts, totals, isLoading: isLoadingCount };
}