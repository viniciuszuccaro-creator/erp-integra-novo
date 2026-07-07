/**
 * useRLSQuery — wrapper do TanStack Query com RLS automático
 *
 * Substitui o padrão:
 *   useQuery({ queryKey: [...], queryFn: () => base44.entities.X.filter({ empresa_id }) })
 * Por:
 *   useRLSQuery('Pedido', { status: 'Aberto' }, '-data_pedido', 50)
 *
 * - Escopo empresa_id / group_id injetado automaticamente
 * - queryKey inclui contexto (reativo a troca de empresa)
 * - staleTime padrão de 2 min
 *
 * Uso:
 *   const { data: pedidos, isLoading } = useRLSQuery('Pedido', { status: 'Aberto' });
 *   const { data: produtos } = useRLSQuery('Produto', {}, '-descricao', 200, { staleTime: 60000 });
 */
import { useQuery } from '@tanstack/react-query';
import { useContextoVisual } from './useContextoVisual';

/**
 * @param {string} entityName       Nome da entidade (ex: 'Pedido')
 * @param {object} criterios        Filtros adicionais (sem escopo — injetado automaticamente)
 * @param {string} order            Campo de ordenação (ex: '-data_pedido')
 * @param {number} limit            Máximo de registros (padrão: 100)
 * @param {object} queryOptions     Opções extras do useQuery (staleTime, enabled, etc.)
 */
export function useRLSQuery(
  entityName,
  criterios = {},
  order = undefined,
  limit = 100,
  queryOptions = {}
) {
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();

  const scopeKey = `${empresaAtual?.id || 'all'}:${grupoAtual?.id || 'nogroup'}:${contexto}`;
  const criteriosKey = JSON.stringify(criterios);

  return useQuery({
    queryKey: [entityName, scopeKey, criteriosKey, order, limit],
    queryFn: () => filterInContext(entityName, criterios, order, limit),
    staleTime: queryOptions.staleTime ?? 30_000,
    gcTime: queryOptions.gcTime ?? 300_000,
    enabled: queryOptions.enabled !== undefined
      ? queryOptions.enabled
      : !!(empresaAtual?.id || grupoAtual?.id || contexto === 'grupo'),
    retry: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

export default useRLSQuery;