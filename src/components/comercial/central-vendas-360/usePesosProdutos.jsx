// Pesos oficiais dos Produtos usados nas negociações da Central 360° — carga sob demanda, só os IDs necessários
import { useMemo } from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';

const LIMITE_PRODUTOS = 300;

export default function usePesosProdutos(negociacoes = []) {
  const ids = useMemo(() => {
    const conjunto = new Set();
    (negociacoes || []).forEach((negociacao) => {
      (negociacao.itens || []).forEach((item) => {
        if (item.produto_id) conjunto.add(item.produto_id);
      });
    });
    return Array.from(conjunto).slice(0, LIMITE_PRODUTOS);
  }, [negociacoes]);

  const { data: produtos = [] } = useRLSQuery(
    'Produto',
    { id: { $in: ids } },
    undefined,
    ids.length || 1,
    { enabled: ids.length > 0, staleTime: 120000 }
  );

  return useMemo(
    () => (produtos || []).reduce((acc, produto) => { acc[produto.id] = produto; return acc; }, {}),
    [produtos]
  );
}