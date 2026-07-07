/**
 * useCadastrosData — Hook centralizado que ramifica TODAS as entidades
 * de Cadastro Gerais para qualquer módulo do sistema.
 *
 * Usa useQueries do TanStack Query com UMA query por entidade, usando a
 * MESMA queryKey do useRLSQuery — garantindo compartilhamento de cache
 * entre módulos, prefetch e queries independentes.
 *
 * Estratégia em 3 camadas:
 *   1. CORE_ENTITIES   — entidades de uso frequente (Cliente, Produto, Fornecedor, etc.)
 *   2. REF_ENTITIES    — catálogos de referência (Banco, FormaPagamento, UnidadeMedida, etc.)
 *   3. AUX_ENTITIES    — entidades auxiliares (Cargo, Departamento, Turno, Veiculo, etc.)
 *
 * Cada camada pode ser habilitada individualmente para evitar queries desnecessárias.
 */
import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// ── Camada 1: Entidades centrais (uso frequente em vários módulos) ──
export const CORE_ENTITIES = [
  { name: 'Cliente',           sort: '-created_date',     limit: 500 },
  { name: 'Fornecedor',        sort: '-created_date',     limit: 200 },
  { name: 'Produto',           sort: '-created_date',     limit: 500 },
  { name: 'Transportadora',    sort: '-created_date',     limit: 100 },
  { name: 'Colaborador',       sort: '-created_date',     limit: 200 },
  { name: 'Representante',     sort: '-created_date',     limit: 100 },
  { name: 'Empresa',           sort: '-created_date',     limit: 50 },
  { name: 'Pedido',            sort: '-created_date',     limit: 100 },
  { name: 'ContaReceber',      sort: '-data_vencimento',  limit: 100 },
  { name: 'ContaPagar',        sort: '-data_vencimento',  limit: 100 },
  { name: 'NotaFiscal',        sort: '-created_date',     limit: 50 },
  { name: 'Entrega',           sort: '-created_date',     limit: 50 },
  { name: 'OrdemCompra',       sort: '-created_date',     limit: 50 },
  { name: 'OrdemProducao',     sort: '-data_emissao',     limit: 50 },
  { name: 'MovimentacaoEstoque', sort: '-created_date',   limit: 50 },
];

// ── Camada 2: Catálogos de referência (dados compartilhados, pequeno volume) ──
export const REF_ENTITIES = [
  { name: 'Banco',                     sort: 'codigo_banco',   limit: 100 },
  { name: 'FormaPagamento',             sort: 'descricao',      limit: 100 },
  { name: 'UnidadeMedida',              sort: 'sigla',          limit: 100 },
  { name: 'CondicaoComercial',          sort: 'nome_condicao',  limit: 100 },
  { name: 'TipoFrete',                  sort: 'nome',           limit: 50 },
  { name: 'PlanoDeContas',              sort: 'codigo',          limit: 200 },
  { name: 'CentroCusto',                sort: 'codigo',          limit: 200 },
  { name: 'CentroResultado',            sort: 'nome',            limit: 100 },
  { name: 'TipoDespesa',                sort: 'nome',            limit: 100 },
  { name: 'MoedaIndice',                sort: 'codigo',          limit: 50 },
  { name: 'TabelaFiscal',               sort: 'nome_regra',      limit: 100 },
  { name: 'SetorAtividade',             sort: 'nome',            limit: 50 },
  { name: 'GrupoProduto',               sort: 'nome_grupo',      limit: 200 },
  { name: 'Marca',                      sort: 'nome_marca',      limit: 100 },
  { name: 'TabelaPreco',                sort: 'nome',            limit: 100 },
  { name: 'LocalEstoque',               sort: 'nome',            limit: 100 },
  { name: 'SegmentoCliente',            sort: '-created_date',  limit: 50 },
  { name: 'RegiaoAtendimento',          sort: '-created_date',  limit: 50 },
  { name: 'ContatoB2B',                 sort: '-created_date',  limit: 100 },
];

// ── Camada 3: Entidades auxiliares (uso específico por módulo) ──
export const AUX_ENTITIES = [
  { name: 'Veiculo',                    sort: 'placa',           limit: 100 },
  { name: 'Motorista',                  sort: 'nome_completo',  limit: 100 },
  { name: 'RotaPadrao',                 sort: 'nome_rota',       limit: 100 },
  { name: 'ModeloDocumento',            sort: 'nome_modelo',     limit: 50 },
  { name: 'Departamento',               sort: 'nome_departamento', limit: 100 },
  { name: 'Cargo',                      sort: 'nome_cargo',      limit: 100 },
  { name: 'Turno',                      sort: 'nome_turno',      limit: 50 },
  { name: 'PerfilAcesso',               sort: 'nome_perfil',     limit: 50 },
  { name: 'GrupoEmpresarial',           sort: 'nome_do_grupo',   limit: 10 },
  { name: 'OperadorCaixa',              sort: 'codigo_operador', limit: 50 },
  { name: 'KitProduto',                 sort: 'nome_kit',        limit: 50 },
  { name: 'CatalogoWeb',                sort: 'produto_id',     limit: 50 },
  { name: 'Servico',                    sort: 'descricao',       limit: 50 },
  { name: 'ConfiguracaoDespesaRecorrente', sort: '-created_date', limit: 50 },
  { name: 'ConfiguracaoNFe',            sort: 'provedor',        limit: 10 },
  { name: 'GatewayPagamento',           sort: 'nome',            limit: 20 },
  { name: 'EventoNotificacao',          sort: 'nome_evento',     limit: 50 },
  { name: 'ApiExterna',                 sort: 'nome_api',        limit: 20 },
  { name: 'ChatbotCanal',               sort: 'nome_canal',      limit: 20 },
  { name: 'ChatbotIntent',              sort: 'nome_intent',     limit: 20 },
  { name: 'JobAgendado',                sort: 'nome_job',        limit: 20 },
  { name: 'Webhook',                    sort: 'nome_webhook',    limit: 20 },
];

const ALL_LAYERS = { core: CORE_ENTITIES, ref: REF_ENTITIES, aux: AUX_ENTITIES };
const ALL_LOOKUP = [...CORE_ENTITIES, ...REF_ENTITIES, ...AUX_ENTITIES];

/**
 * Hook principal: retorna dados de Cadastro Gerais ramificados para qualquer módulo.
 *
 * Usa useQueries com queryKey IGUAL ao useRLSQuery — compartilha cache com
 * todas as queries independentes e com o prefetch do Layout.
 *
 * @param {object} options
 * @param {boolean} options.core — carrega entidades centrais (default: true)
 * @param {boolean} options.ref  — carrega catálogos de referência (default: false)
 * @param {boolean} options.aux  — carrega entidades auxiliares (default: false)
 * @param {string[]} options.only — lista específica de nomes de entidade (sobrepõe camadas)
 * @returns {object} { data: mapa entityName → array, isLoading: boolean }
 */
export function useCadastrosData({ core = true, ref = false, aux = false, only = null } = {}) {
  const { empresaAtual, grupoAtual, contexto, filterInContext } = useContextoVisual();
  const hasContext = Boolean(empresaAtual?.id || grupoAtual?.id || contexto === 'grupo');

  const scopeKey = `${empresaAtual?.id || 'all'}:${grupoAtual?.id || 'nogroup'}:${contexto}`;

  // Determina entidades fixas (não muda entre renders para mesmas options)
  const entities = useMemo(() => {
    if (only && Array.isArray(only) && only.length) {
      return only.map(n => ALL_LOOKUP.find(e => e.name === n) || { name: n, sort: '-created_date', limit: 100 });
    }
    let list = [];
    if (core) list = list.concat(CORE_ENTITIES);
    if (ref)  list = list.concat(REF_ENTITIES);
    if (aux)  list = list.concat(AUX_ENTITIES);
    return list;
  }, [core, ref, aux, only?.join(',')]);

  // Uma query por entidade — queryKey IGUAL ao useRLSQuery para compartilhar cache
  const queries = useQueries({
    queries: entities.map(({ name, sort, limit }) => ({
      queryKey: [name, scopeKey, '{}', sort, limit],
      queryFn: async () => {
        try {
          const rows = await filterInContext(name, {}, sort, limit);
          return Array.isArray(rows) ? rows : [];
        } catch {
          return [];
        }
      },
      enabled: hasContext,
      staleTime: 120_000,
      gcTime: 600_000,
      retry: 0,
      refetchOnWindowFocus: false,
    })),
  });

  // Monta o mapa entityName → array a partir dos resultados
  const data = useMemo(() => {
    const map = {};
    entities.forEach((spec, idx) => {
      const result = queries[idx];
      map[spec.name] = (result?.data && Array.isArray(result.data)) ? result.data : [];
    });
    return map;
  }, [entities, queries]);

  const isLoading = queries.some(q => q.isLoading);

  return { data, isLoading };
}

/**
 * Prefetch de entidades de Cadastro Gerais para pré-popular o cache.
 * Chamado no Layout (idle) ou antes de abrir um módulo.
 * Usa a MESMA queryKey do useRLSQuery para compartilhar cache.
 */
export function usePrefetchCadastrosData() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, contexto, filterInContext } = useContextoVisual();

  return useCallback(async (layer = 'core') => {
    const hasContext = Boolean(empresaAtual?.id || grupoAtual?.id || contexto === 'grupo');
    if (!hasContext) return;

    const specs = ALL_LAYERS[layer] || ALL_LAYERS.core;
    const scopeKey = `${empresaAtual?.id || 'all'}:${grupoAtual?.id || 'nogroup'}:${contexto}`;

    for (const { name, sort, limit } of specs) {
      // queryKey IGUAL ao useRLSQuery — compartilha cache
      const qKey = [name, scopeKey, '{}', sort, limit];
      const existing = queryClient.getQueryState(qKey);
      if (existing?.dataUpdatedAt && Date.now() - existing.dataUpdatedAt < 60_000) continue;

      queryClient.prefetchQuery({
        queryKey: qKey,
        queryFn: () => filterInContext(name, {}, sort, limit),
        staleTime: 60_000,
      });
    }
  }, [queryClient, empresaAtual?.id, grupoAtual?.id, contexto, filterInContext]);
}

export default useCadastrosData;