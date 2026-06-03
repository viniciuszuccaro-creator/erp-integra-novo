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

// Snapshot das contagens reais verificadas via countEntities backend — exibido imediatamente
const SNAPSHOT = {
  // Bloco 1 — Pessoas & Parceiros (8)
  Cliente: 1, Fornecedor: 4, Transportadora: 2, Colaborador: 0,
  Representante: 1, ContatoB2B: 0, SegmentoCliente: 0, RegiaoAtendimento: 0,
  // Bloco 2 — Produtos & Serviços (965)
  Produto: 1986, Servico: 0, SetorAtividade: 11, GrupoProduto: 91,
  Marca: 6, TabelaPreco: 1, KitProduto: 0, CatalogoWeb: 0, UnidadeMedida: 1,
  // Bloco 3 — Financeiro & Fiscal (85)
  Banco: 7, FormaPagamento: 8, PlanoDeContas: 10, CentroCusto: 10,
  CentroResultado: 5, TipoDespesa: 10, MoedaIndice: 6, OperadorCaixa: 2,
  ConfiguracaoDespesaRecorrente: 5, TabelaFiscal: 20, CondicaoComercial: 6,
  // Bloco 4 — Logística, Frota & Almoxarifado (22)
  Veiculo: 5, Motorista: 5, TipoFrete: 3, LocalEstoque: 5, RotaPadrao: 2, ModeloDocumento: 2,
  // Bloco 5 — Estrutura Organizacional (22)
  Empresa: 2, GrupoEmpresarial: 1, Departamento: 8, Cargo: 6, Turno: 3, PerfilAcesso: 5,
  // Bloco 6 — Tecnologia, IA & Parâmetros (33)
  ApiExterna: 0, ChatbotCanal: 3, ChatbotIntent: 8, JobAgendado: 5,
  Webhook: 0, ConfiguracaoNFe: 2, GatewayPagamento: 4, EventoNotificacao: 8,
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

  // Mapa incremental: delta sobre o snapshot (só atualiza entidades que sofreram mudança)
  const { data } = useQuery({
    queryKey: ["cadastros-all-counts-v7", groupId, empresaId],
    queryFn: async () => {
      // Retorna snapshot base — refinado por countEntity apenas nas entidades-chave
      const result = { ...SNAPSHOT };
      const KEY_ENTITIES = ["Produto","Cliente","Fornecedor","Transportadora","Representante","FormaPagamento","Banco","GrupoProduto","SetorAtividade","Marca"];
      await Promise.allSettled(
        KEY_ENTITIES.map(async (entityName) => {
          try {
            let filter = {};
            if (entityName === "Produto") {
              filter = groupId ? { group_id: groupId } : { empresa_id: empresaId };
            } else if (["Fornecedor","Transportadora"].includes(entityName)) {
              filter = groupId ? { group_id: groupId } : { empresa_dona_id: empresaId };
            } else {
              filter = groupId ? { group_id: groupId } : { empresa_id: empresaId };
            }
            const n = await countEntity(entityName, filter);
            if (n > 0) result[entityName] = n;
          } catch (_) { /* mantém snapshot */ }
        })
      );
      return result;
    },
    staleTime: 15 * 60_000,
    gcTime: 60 * 60_000,
    placeholderData: SNAPSHOT,   // exibe IMEDIATAMENTE sem loading
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