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

// Catálogos puros sem escopo de empresa (contam global — são dados de referência)
const PURE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'TabelaFiscal', 'CentroOperacao',
]);

// Campo de empresa por entidade (igual ao VisualizadorUniversalEntidadeV24)
const ENTITY_CONTEXT_FIELD = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};
const SHARED_ENTITIES = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

// Conta entidade via backend countEntities (retorna número exato sem trazer registros)
// Usa o MESMO filtro $or da tabela para garantir que contagem bate com exibição
async function countEntity(entityName, filter, empresasDoGrupo) {
  try {
    // Catálogos puros — contam global
    if (PURE_CATALOG.has(entityName)) {
      const res = await base44.functions.invoke("countEntities", { entityName, filter: {} });
      const n = res?.data?.count ?? res?.data?.total ?? res?.data;
      return typeof n === "number" ? n : 0;
    }

    // Se o filtro já tem $or (passado pelo caller), usa direto
    if (filter.$or || filter.$and) {
      const res = await base44.functions.invoke("countEntities", { entityName, filter });
      const n = res?.data?.count ?? res?.data?.total ?? res?.data;
      return typeof n === "number" ? n : 0;
    }

    // Constrói o mesmo $or que a tabela usa
    const groupId = filter.group_id || null;
    const empresaId = filter.empresa_id || filter.empresa_dona_id || filter.empresa_alocada_id || null;
    const ctxCampo = ENTITY_CONTEXT_FIELD[entityName] || 'empresa_id';
    const orConds = [];

    if (empresaId) {
      orConds.push({ [ctxCampo]: empresaId });
      if (entityName === 'Cliente') {
        orConds.push({ empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
      } else if (SHARED_ENTITIES.has(entityName)) {
        orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
      }
    }
    if (groupId) {
      orConds.push({ group_id: groupId });
      orConds.push({ empresa_id: null, group_id: null });
      if (!empresaId && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length) {
        const ids = empresasDoGrupo.map(e => e.id).filter(Boolean);
        if (ids.length) {
          if (entityName === 'Cliente') {
            orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } }, { empresas_compartilhadas_ids: { $in: ids } });
          } else if (entityName === 'Fornecedor' || entityName === 'Transportadora') {
            orConds.push({ empresa_dona_id: { $in: ids } }, { empresas_compartilhadas_ids: { $in: ids } });
          } else if (entityName === 'Colaborador') {
            orConds.push({ empresa_alocada_id: { $in: ids } });
          } else {
            orConds.push({ [ctxCampo]: { $in: ids } });
          }
        }
      }
    }

    const finalFilter = orConds.length ? { $or: orConds } : {};
    const res = await base44.functions.invoke("countEntities", { entityName, filter: finalFilter });
    const n = res?.data?.count ?? res?.data?.total ?? res?.data;
    return typeof n === "number" ? n : 0;
  } catch (_) {
    return 0;
  }
}

export default function useCadastrosAllCounts() {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;
  const queryClient = useQueryClient();

  // Contagem precisa: valida TODAS as entidades respeitando contexto + força refetch se contexto muda
  const { data } = useQuery({
    queryKey: ["cadastros-all-counts-v7", groupId, empresaId, empresasDoGrupo?.length],
    queryFn: async () => {
      // Se sem contexto ativo, conta globalmente (catálogos puros)
      const result = { ...SNAPSHOT };
      await Promise.allSettled(
        ALL_ENTITIES.map(async (entityName) => {
          try {
            let filter = {};
            if (groupId) {
              filter.group_id = groupId;
            } else if (empresaId) {
              if (["Fornecedor","Transportadora"].includes(entityName)) {
                filter.empresa_dona_id = empresaId;
              } else if (["Colaborador"].includes(entityName)) {
                filter.empresa_alocada_id = empresaId;
              } else {
                filter.empresa_id = empresaId;
              }
            }
            const n = await countEntity(entityName, filter, empresasDoGrupo);
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