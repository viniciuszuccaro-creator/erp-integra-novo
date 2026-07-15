/**
 * useEntityCounts V6 — contagem robusta multiempresa
 * - SEM cache em memória (COUNT_CACHE removido — causava contagens stale após mutações)
 * - Usa batch API do countEntities (1 request para N entidades)
 * - React Query com staleTime=30s controla a frequência de re-fetch
 * - Invalidação automática via subscribe por entidade
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect } from "react";

// Entidades que NÃO precisam de empresa_id para serem visualizadas (catálogos de grupo)
// Têm group_id no schema — filtram por group_id no contexto de grupo
export const SIMPLE_CATALOG = new Set([
  'Banco','FormaPagamento','TipoDespesa','MoedaIndice','TipoFrete',
  'UnidadeMedida','Departamento','Cargo','Turno','GrupoProduto','Marca',
  'SetorAtividade','LocalEstoque','TabelaFiscal','CentroResultado',
  'OperadorCaixa','RotaPadrao','ModeloDocumento','KitProduto','CatalogoWeb',
  'Servico','CondicaoComercial','TabelaPreco','PerfilAcesso',
  'ConfiguracaoNFe','ConfiguracaoBoletos','ConfiguracaoWhatsApp',
  'GatewayPagamento','ApiExterna','Webhook','ChatbotIntent','ChatbotCanal',
  'JobAgendado','EventoNotificacao','SegmentoCliente','RegiaoAtendimento',
  'ContatoB2B','CentroCusto','PlanoDeContas','PlanoContas',
  'Veiculo','Motorista','Representante','GrupoEmpresarial','Empresa',
  'ConfiguracaoDespesaRecorrente',
]);

// Entidades SEM group_id no schema — verdadeiramente globais (não filtram por nada)
// MoedaIndice: catálogo de referência (BRL, USD, etc.) sem group_id
// GrupoEmpresarial: é o próprio grupo — não se filtra por group_id
const TRULY_GLOBAL = new Set(['MoedaIndice', 'GrupoEmpresarial']);

const CAMPO_CTX = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};

const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

/**
 * buildContextFilter — mantido para compatibilidade com imports externos.
 * Internamente o hook agora usa filtro simples (o backend expande).
 */
export function buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  // Verdadeiramente globais (sem group_id no schema) — não filtram
  if (TRULY_GLOBAL.has(entityName)) return {};
  // SIMPLE_CATALOG com group_id: filtra por group_id no contexto de grupo
  if (SIMPLE_CATALOG.has(entityName)) {
    if (groupId) return { group_id: groupId };
    return {};
  }
  // Entidades operacionais: filtro normal por empresa/grupo
  if (groupId && !empresaId) return { group_id: groupId };
  if (empresaId) return { empresa_id: empresaId };
  return {};
}

// Contagem individual via SDK direto (sem overhead de função backend)
async function countSingle(entityName, filter) {
  try {
    const api = base44.entities?.[entityName];
    if (!api?.filter) return 0;
    const rows = await api.filter(filter || {}, '-created_date', 9999);
    return Array.isArray(rows) ? rows.length : 0;
  } catch (_) { console.error('[lib] catch:', _); }
  return 0;
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;

  const normalized = useMemo(() => {
    const arr = Array.isArray(entities) ? entities : [entities];
    return arr.filter(Boolean);
  }, [entities.join ? entities.join(',') : JSON.stringify(entities)]); // eslint-disable-line

  const entitiesKey = useMemo(() => [...normalized].sort().join(','), [normalized]);

  const grupoEmpIdsKey = useMemo(
    () => (Array.isArray(empresasDoGrupo) ? empresasDoGrupo.map(e => e.id).filter(Boolean).sort().join(',') : ''),
    [empresasDoGrupo]
  );

  const queryKey = ['entityCounts_v5', entitiesKey, groupId, empresaId, grupoEmpIdsKey];

  // Sempre busca — se não há contexto, usa filtro vazio (conta tudo) ou
  // contexto do grupo/empresa quando disponível
  const canFetch = normalized.length > 0;

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};

      // Vol 14.3/23.1: contagem server-side via countEntities (não carrega registros no cliente)
      // Usa filtros pré-construídos do buildContextFilter para garantir consistência com filterInContext da listagem
      const entitiesPayload = normalized.map(entityName => ({
        entityName,
        filter: buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) ?? {},
      }));

      try {
        const res = await base44.functions.invoke('countEntities', { entities: entitiesPayload });
        const countsData = res?.data?.counts || res?.counts || {};
        const result = {};
        for (const e of normalized) {
          const n = countsData[e];
          if (typeof n === 'number') result[e] = Math.max(0, n);
        }
        return result;
      } catch (err) {
        // Fallback: SDK direto apenas se backend falhar (rate limit/timeout)
        if (String(err?.message || '').includes('Rate limit') || err?.response?.status === 429) {
          const result = {};
          await Promise.allSettled(
            normalized.map(async (entityName) => {
              const ctxFilter = buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) ?? {};
              result[entityName] = await countSingle(entityName, ctxFilter);
            })
          );
          return result;
        }
        throw err;
      }
    },
    staleTime: 15_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled: canFetch,
  });

  // Invalidar quando registros mudam
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map(entity => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [entitiesKey, queryClient]); // eslint-disable-line

  const total = useMemo(
    () => normalized.reduce((acc, e) => acc + (Number(counts[e]) || 0), 0),
    [counts, normalized]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;