// Painel Estoque da Central 360° — saldo real dos produtos da negociação
// Somente leitura, escopo grupo/empresa injetado por useRLSQuery e permissão do módulo Estoque.
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';

const numero = (valor) => Number(valor || 0);

const situacaoSaldo = (temCadastro, saldo, necessario) => {
  if (!temCadastro) return 'Sem cadastro';
  if (saldo >= necessario && necessario > 0) return 'Suficiente';
  if (saldo > 0) return 'Saldo parcial';
  return 'Sem saldo';
};

/** Cruza os itens de revenda da negociação com o saldo disponível do cadastro único de produto. */
export function itensComSaldo(itens = [], produtos = []) {
  const mapa = new Map((produtos || []).map((produto) => [produto.id, produto]));
  return (itens || [])
    .filter((item) => item.produto_id && item.tipo !== 'servico')
    .map((item, indice) => {
      const produto = mapa.get(item.produto_id);
      const unidade = produto?.unidade_medida || item.unidade || 'UN';
      const necessario = numero(item.quantidade);
      const saldo = numero(produto?.estoque_disponivel ?? produto?.estoque_atual);
      const minimo = numero(produto?.estoque_minimo);
      return {
        id: item.id || `${item.produto_id}-${indice}`,
        descricao: produto?.descricao || item.descricao || 'Item',
        codigo: produto?.codigo || '—',
        necessario: `${necessario} ${unidade}`,
        disponivel: `${saldo} ${unidade}`,
        minimo: `${minimo} ${unidade}`,
        situacao: situacaoSaldo(Boolean(produto), saldo, necessario),
        quantidade: necessario,
        saldo,
        minimoValor: minimo,
        valor_necessidade: numero(produto?.custo_medio) * necessario,
      };
    });
}

export function totaisEstoque(itens = []) {
  return itens.reduce(
    (acc, item) => {
      acc.itens += 1;
      acc.valor += item.valor_necessidade;
      if (item.situacao !== 'Suficiente') acc.pendentes += 1;
      if (item.situacao === 'Sem saldo') acc.semSaldo += 1;
      if (item.situacao !== 'Sem cadastro' && item.saldo <= item.minimoValor) acc.abaixoMinimo += 1;
      return acc;
    },
    { itens: 0, pendentes: 0, semSaldo: 0, abaixoMinimo: 0, valor: 0 }
  );
}

/**
 * Saldo real dos produtos da negociação selecionada.
 * Sem itens de revenda a consulta não executa e o painel permanece vazio.
 */
export default function usePainelEstoque({ itens = [], ativo = false }) {
  const { hasPermission, isLoading: carregandoPermissao } = usePermissions();
  const permitido = hasPermission('Estoque', null, 'ver');
  const produtoIds = [...new Set((itens || []).filter((item) => item.produto_id).map((item) => item.produto_id))];

  const { data: produtos = [], isLoading } = useRLSQuery(
    'Produto',
    { id: { $in: produtoIds } },
    'descricao',
    produtoIds.length || 1,
    { enabled: ativo && permitido && produtoIds.length > 0, staleTime: 30000 }
  );

  const linhas = itensComSaldo(itens, produtos);

  return {
    itens: linhas,
    totais: totaisEstoque(linhas),
    isLoading: isLoading || carregandoPermissao,
    permitido,
    temItens: produtoIds.length > 0,
  };
}