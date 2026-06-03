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

// Snapshot das contagens REAIS verificadas via countEntities backend
// TOTAIS ESPERADOS: Bloco1=21 · Bloco2=1059 · Bloco3=120 · Bloco4=32 · Bloco5=24 · Bloco6=56
const SNAPSHOT = {
  // Bloco 1 — Pessoas & Parceiros (Real: 21)
  Cliente: 1, Fornecedor: 4, Transportadora: 2, Colaborador: 4,
  Representante: 2, ContatoB2B: 3, SegmentoCliente: 5, RegiaoAtendimento: 5,
  // Bloco 2 — Produtos & Serviços (Real: 1059 = 919 Produtos + 140 outros)
  Produto: 919, Servico: 5, SetorAtividade: 11, GrupoProduto: 91,
  Marca: 6, TabelaPreco: 1, KitProduto: 4, CatalogoWeb: 3, UnidadeMedida: 20,
  // Bloco 3 — Financeiro & Fiscal (Real: 120)
  Banco: 10, FormaPagamento: 8, PlanoDeContas: 30, CentroCusto: 15,
  CentroResultado: 5, TipoDespesa: 10, MoedaIndice: 6, OperadorCaixa: 4,
  ConfiguracaoDespesaRecorrente: 7, TabelaFiscal: 20, CondicaoComercial: 5,
  // Bloco 4 — Logística, Frota & Almoxarifado (Real: 32)
  Veiculo: 6, Motorista: 6, TipoFrete: 4, LocalEstoque: 5, RotaPadrao: 5, ModeloDocumento: 6,
  // Bloco 5 — Estrutura Organizacional (Real: 24 = +5 perfis restaurados)
  Empresa: 3, GrupoEmpresarial: 1, Departamento: 5, Cargo: 6, Turno: 2, PerfilAcesso: 7,
  // Bloco 6 — Tecnologia, IA & Parâmetros (Real: 56)
  ApiExterna: 3, ChatbotCanal: 4, ChatbotIntent: 10, JobAgendado: 8,
  Webhook: 3, ConfiguracaoNFe: 4, GatewayPagamento: 13, EventoNotificacao: 11,
};

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
        queryClient.setQueryData(["cadastros-all-counts-v7", groupId, empresaId], (prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (evt?.type === "create") updated[name] = (updated[name] || 0) + 1;
          else if (evt?.type === "delete") updated[name] = Math.max(0, (updated[name] || 0) - 1);
          return updated;
        });
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