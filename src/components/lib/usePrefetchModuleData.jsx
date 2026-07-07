/**
 * usePrefetchModuleData — Fase 2
 * Prefetch inteligente por módulo (disparado no hover da sidebar).
 * Usa o queryClient para pré-popular o cache antes da navegação.
 */
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

// Mapa: título da sidebar → entidades para prefetch (inclui Cadastro Gerais relevantes)
const MODULE_PREFETCH = {
  'CRM - Relacionamento':      [{ e: 'Cliente',           s: 'nome',          d: 'asc'  },
                                { e: 'Oportunidade',     s: 'updated_date',  d: 'desc' },
                                { e: 'SegmentoCliente',   s: 'updated_date',  d: 'desc' },
                                { e: 'RegiaoAtendimento', s: 'updated_date',  d: 'desc' },
                                { e: 'Representante',     s: 'updated_date',  d: 'desc' },
                                { e: 'ContatoB2B',        s: 'updated_date',  d: 'desc' }],
  'Comercial e Vendas':        [{ e: 'Pedido',            s: 'data_pedido',   d: 'desc' },
                                { e: 'Cliente',           s: 'nome',          d: 'asc'  },
                                { e: 'Produto',           s: 'descricao',     d: 'asc'  },
                                { e: 'FormaPagamento',    s: 'descricao',     d: 'asc'  },
                                { e: 'CondicaoComercial', s: 'nome_condicao', d: 'asc'  },
                                { e: 'Transportadora',    s: 'updated_date',  d: 'desc' },
                                { e: 'TabelaPreco',       s: 'nome',          d: 'asc'  },
                                { e: 'Representante',     s: 'updated_date',  d: 'desc' }],
  'Estoque e Almoxarifado':    [{ e: 'Produto',           s: 'descricao',     d: 'asc'  },
                                { e: 'LocalEstoque',      s: 'nome',          d: 'asc'  },
                                { e: 'UnidadeMedida',     s: 'sigla',         d: 'asc'  },
                                { e: 'GrupoProduto',      s: 'nome_grupo',    d: 'asc'  },
                                { e: 'Marca',             s: 'nome_marca',    d: 'asc'  },
                                { e: 'Fornecedor',        s: 'nome',          d: 'asc'  },
                                { e: 'MovimentacaoEstoque', s: 'updated_date', d: 'desc' }],
  'Compras e Suprimentos':     [{ e: 'OrdemCompra',       s: 'data_solicitacao', d: 'desc' },
                                { e: 'Fornecedor',        s: 'nome',          d: 'asc'  },
                                { e: 'Produto',           s: 'descricao',     d: 'asc'  },
                                { e: 'CondicaoComercial', s: 'nome_condicao', d: 'asc'  },
                                { e: 'SolicitacaoCompra', s: 'updated_date',  d: 'desc' }],
  'Financeiro e Contábil':     [{ e: 'ContaReceber',     s: 'data_vencimento', d: 'asc'  },
                                { e: 'ContaPagar',       s: 'data_vencimento', d: 'asc'  },
                                { e: 'Banco',             s: 'codigo_banco',  d: 'asc'  },
                                { e: 'FormaPagamento',    s: 'descricao',     d: 'asc'  },
                                { e: 'PlanoDeContas',     s: 'codigo',        d: 'asc'  },
                                { e: 'CentroCusto',       s: 'codigo',        d: 'asc'  },
                                { e: 'CentroResultado',   s: 'nome',          d: 'asc'  },
                                { e: 'TipoDespesa',       s: 'nome',          d: 'asc'  },
                                { e: 'MoedaIndice',       s: 'codigo',        d: 'asc'  }],
  'Expedição e Logística':     [{ e: 'Entrega',          s: 'updated_date',  d: 'desc' },
                                { e: 'Veiculo',          s: 'placa',         d: 'asc'  },
                                { e: 'Motorista',        s: 'nome_completo', d: 'asc'  },
                                { e: 'Transportadora',    s: 'updated_date',  d: 'desc' },
                                { e: 'RotaPadrao',       s: 'nome_rota',     d: 'asc'  },
                                { e: 'TipoFrete',        s: 'nome',          d: 'asc'  }],
  'Cadastros Gerais':          [{ e: 'Cliente',           s: 'nome',          d: 'asc'  },
                                { e: 'Produto',           s: 'descricao',     d: 'asc'  },
                                { e: 'Fornecedor',        s: 'nome',          d: 'asc'  },
                                { e: 'Transportadora',    s: 'updated_date',  d: 'desc' },
                                { e: 'Banco',             s: 'codigo_banco',  d: 'asc'  },
                                { e: 'FormaPagamento',    s: 'descricao',     d: 'asc'  },
                                { e: 'UnidadeMedida',     s: 'sigla',         d: 'asc'  },
                                { e: 'CondicaoComercial', s: 'nome_condicao', d: 'asc'  }],
  'Fiscal e Tributário':       [{ e: 'NotaFiscal',       s: 'data_emissao',  d: 'desc' },
                                { e: 'TabelaFiscal',      s: 'nome_regra',    d: 'asc'  },
                                { e: 'ConfiguracaoNFe',   s: 'provedor',      d: 'asc'  }],
  'Recursos Humanos':          [{ e: 'Colaborador',      s: 'nome_completo', d: 'asc'  },
                                { e: 'Cargo',            s: 'nome_cargo',    d: 'asc'  },
                                { e: 'Departamento',     s: 'nome_departamento', d: 'asc' },
                                { e: 'Turno',            s: 'nome_turno',    d: 'asc'  }],
  'Produção e Manufatura':     [{ e: 'OrdemProducao',    s: 'data_emissao',  d: 'desc' },
                                { e: 'Produto',          s: 'descricao',     d: 'asc'  },
                                { e: 'Colaborador',       s: 'nome_completo', d: 'asc'  }],
  'Gestão de Contratos':       [{ e: 'Contrato',         s: 'updated_date',  d: 'desc' },
                                { e: 'Cliente',          s: 'nome',          d: 'asc'  },
                                { e: 'Fornecedor',       s: 'nome',          d: 'asc'  }],
};

// TTL do prefetch: não refaz se dado tiver menos de 60s
const PREFETCH_STALE_MS = 60_000;
// Limite de itens por entidade no prefetch (leve)
const PREFETCH_LIMIT = 20;

export function usePrefetchModuleData() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, contexto, filterInContext } = useContextoVisual();

  const prefetch = useCallback((moduleTitle) => {
    const specs = MODULE_PREFETCH[moduleTitle];
    if (!specs || !specs.length) return;

    const empresaId = empresaAtual?.id;
    const groupId = grupoAtual?.id;
    if (!empresaId && !groupId && contexto !== 'grupo') return;

    const scopeKey = `${empresaId || 'all'}:${groupId || 'nogroup'}:${contexto}`;

    specs.forEach(({ e: entityName, s: sortField, d: sortDirection }) => {
      const order = `${sortDirection === 'desc' ? '-' : ''}${sortField}`;
      // Query key IGUAL ao useRLSQuery para compartilhar cache
      const qKey = [entityName, scopeKey, '{}', order, PREFETCH_LIMIT];

      const existing = queryClient.getQueryState(qKey);
      if (existing?.dataUpdatedAt && Date.now() - existing.dataUpdatedAt < PREFETCH_STALE_MS) return;

      queryClient.prefetchQuery({
        queryKey: qKey,
        queryFn: async () => {
          try {
            const rows = await filterInContext(entityName, {}, order, PREFETCH_LIMIT);
            return Array.isArray(rows) ? rows : [];
          } catch (_) { return []; }
        },
        staleTime: PREFETCH_STALE_MS,
      });
    });
  }, [queryClient, empresaAtual?.id, grupoAtual?.id, contexto, filterInContext]);

  return { prefetch };
}

export default usePrefetchModuleData;