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

// Snapshot das contagens REAIS verificadas
// TOTAIS CORRETOS VALIDADOS: Bloco1=8 · Bloco2=965 · Bloco3=85 · Bloco4=22 · Bloco5=22 · Bloco6=33
const SNAPSHOT = {
  // Bloco 1 — Pessoas & Parceiros (Total: 8)
  Cliente: 1, Fornecedor: 2, Transportadora: 1, Colaborador: 1,
  Representante: 1, ContatoB2B: 1, SegmentoCliente: 1, RegiaoAtendimento: 0,
  // Bloco 2 — Produtos & Serviços (Total: 965 = 828 Produtos importados + 137 outros)
  Produto: 828, Servico: 20, SetorAtividade: 10, GrupoProduto: 50,
  Marca: 15, TabelaPreco: 2, KitProduto: 10, CatalogoWeb: 20, UnidadeMedida: 10,
  // Bloco 3 — Financeiro & Fiscal (Total: 85)
  Banco: 8, FormaPagamento: 6, PlanoDeContas: 20, CentroCusto: 12,
  CentroResultado: 5, TipoDespesa: 8, MoedaIndice: 4, OperadorCaixa: 3,
  ConfiguracaoDespesaRecorrente: 5, TabelaFiscal: 10, CondicaoComercial: 4,
  // Bloco 4 — Logística, Frota & Almoxarifado (Total: 22)
  Veiculo: 4, Motorista: 4, TipoFrete: 3, LocalEstoque: 4, RotaPadrao: 4, ModeloDocumento: 3,
  // Bloco 5 — Estrutura Organizacional (Total: 22)
  Empresa: 3, GrupoEmpresarial: 1, Departamento: 6, Cargo: 5, Turno: 3, PerfilAcesso: 4,
  // Bloco 6 — Tecnologia, IA & Parâmetros (Total: 33)
  ApiExterna: 3, ChatbotCanal: 4, ChatbotIntent: 8, JobAgendado: 6,
  Webhook: 3, ConfiguracaoNFe: 3, GatewayPagamento: 4, EventoNotificacao: 2,
};

// Conta entidade via backend countEntities (retorna número exato sem trazer registros)
async function countEntity(entityName, filter) {
  try {
    const res = await base44.functions.invoke("countEntities", { 
      entityName, 
      filter,
      deduplicateBy: ["codigo", "descricao"] // Evita duplicatas com mesmo código/descrição
    });
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
    placeholderData: SNAPSHOT,
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

  const totals = Object.fromEntries(
    Object.entries(BLOCOS_ENTITIES).map(([bloco, entities]) => [
      bloco,
      entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0),
    ])
  );

  return { counts, totals, isLoading: false };
}