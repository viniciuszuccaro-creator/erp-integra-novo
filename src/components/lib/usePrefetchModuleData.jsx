/**
 * usePrefetchModuleData — Fase 2
 * Prefetch inteligente por módulo (disparado no hover da sidebar).
 * Usa o queryClient para pré-popular o cache antes da navegação.
 */
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

// Mapa: título da sidebar → entidades para prefetch (limite leve, sem sobrecarregar)
const MODULE_PREFETCH = {
  'CRM - Relacionamento':      [{ e: 'Cliente',        s: 'nome',         d: 'asc'  },
                                { e: 'Oportunidade',   s: 'updated_date', d: 'desc' }],
  'Comercial e Vendas':        [{ e: 'Pedido',         s: 'data_pedido',  d: 'desc' }],
  'Estoque e Almoxarifado':    [{ e: 'Produto',        s: 'descricao',    d: 'asc'  }],
  'Compras e Suprimentos':     [{ e: 'OrdemCompra',    s: 'data_solicitacao', d: 'desc' },
                                { e: 'Fornecedor',     s: 'nome',         d: 'asc'  }],
  'Financeiro e Contábil':     [{ e: 'ContaReceber',   s: 'data_vencimento', d: 'asc' },
                                { e: 'ContaPagar',     s: 'data_vencimento', d: 'asc' }],
  'Expedição e Logística':     [{ e: 'Entrega',        s: 'updated_date', d: 'desc' }],
  'Cadastros Gerais':          [{ e: 'Cliente',        s: 'nome',         d: 'asc'  },
                                { e: 'Produto',        s: 'descricao',    d: 'asc'  },
                                { e: 'Fornecedor',     s: 'nome',         d: 'asc'  }],
  'Fiscal e Tributário':       [{ e: 'NotaFiscal',     s: 'data_emissao', d: 'desc' }],
  'Recursos Humanos':          [{ e: 'Colaborador',    s: 'nome_completo', d: 'asc' }],
};

// TTL do prefetch: não refaz se dado tiver menos de 60s
const PREFETCH_STALE_MS = 60_000;
// Limite de itens por entidade no prefetch (leve)
const PREFETCH_LIMIT = 20;

export function usePrefetchModuleData() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const prefetch = useCallback((moduleTitle) => {
    const specs = MODULE_PREFETCH[moduleTitle];
    if (!specs || !specs.length) return;

    const empresaId = empresaAtual?.id;
    const groupId = grupoAtual?.id;
    if (!empresaId && !groupId) return;

    // Monta filtro de contexto
    const ctxFilter = {};
    if (groupId) ctxFilter.group_id = groupId;
    else if (empresaId) ctxFilter.empresa_id = empresaId;

    specs.forEach(({ e: entityName, s: sortField, d: sortDirection }) => {
      const qKey = ['entityListSorted', entityName,
        JSON.stringify(ctxFilter), sortField, sortDirection,
        PREFETCH_LIMIT, 1, PREFETCH_LIMIT];

      // Só prefetch se não houver dado fresco
      const existing = queryClient.getQueryState(qKey);
      if (existing?.dataUpdatedAt && Date.now() - existing.dataUpdatedAt < PREFETCH_STALE_MS) return;

      queryClient.prefetchQuery({
        queryKey: qKey,
        queryFn: async () => {
          try {
            const api = base44.entities?.[entityName];
            if (!api?.filter) return [];
            const sortPrefix = sortDirection === 'asc' ? '' : '-';
            const rows = await api.filter(ctxFilter, `${sortPrefix}${sortField}`, PREFETCH_LIMIT);
            return Array.isArray(rows) ? rows : [];
          } catch (_) { return []; }
        },
        staleTime: PREFETCH_STALE_MS,
      });
    });
  }, [queryClient, empresaAtual?.id, grupoAtual?.id]);

  return { prefetch };
}

export default usePrefetchModuleData;