import { useState, useMemo } from 'react';

export function useRentabilidadeProduto(produtos, pedidos, periodo, ordenacao) {
  return useMemo(() => {
    const hoje = new Date();
    const dataCorte = new Date(hoje.getFullYear(), hoje.getMonth() - periodo, hoje.getDate());
    const porProduto = {};

    pedidos
      .filter(p => {
        const dataPedido = new Date(p.data_pedido);
        return p.status !== 'Cancelado' && dataPedido >= dataCorte;
      })
      .forEach(pedido => {
        (pedido.itens_revenda || []).forEach(item => {
          const key = item.produto_id || item.codigo_sku || item.descricao;
          if (!key) return;

          if (!porProduto[key]) {
            const produto = produtos.find(p => p.id === item.produto_id || p.codigo === item.codigo_sku);
            porProduto[key] = {
              produto_id: item.produto_id,
              codigo: item.codigo_sku || produto?.codigo,
              descricao: item.descricao || produto?.descricao,
              unidade: item.unidade || produto?.unidade_medida,
              classificacao_abc: produto?.classificacao_abc || 'Novo',
              grupo: produto?.grupo || 'Outros',
              quantidade_vendida: 0, receita_total: 0, custo_total: 0,
              margem_valor: 0, margem_percentual: 0, quantidade_pedidos: 0,
              preco_medio_venda: 0, custo_medio: produto?.custo_medio || 0,
              estoque_atual: produto?.estoque_atual || 0, giro_estoque: 0,
            };
          }

          const custoItem = (item.custo_unitario || 0) * (item.quantidade || 0);
          porProduto[key].quantidade_vendida += item.quantidade || 0;
          porProduto[key].receita_total += item.valor_item || 0;
          porProduto[key].custo_total += custoItem;
          porProduto[key].quantidade_pedidos += 1;
        });
      });

    return Object.values(porProduto)
      .map(p => {
        p.margem_valor = p.receita_total - p.custo_total;
        p.margem_percentual = p.receita_total > 0 ? ((p.margem_valor / p.receita_total) * 100) : 0;
        p.preco_medio_venda = p.quantidade_vendida > 0 ? p.receita_total / p.quantidade_vendida : 0;
        p.giro_estoque = p.quantidade_vendida / (p.estoque_atual > 0 ? p.estoque_atual : 1);
        return p;
      })
      .filter(p => p.receita_total > 0)
      .sort((a, b) => {
        if (ordenacao === 'margem_valor') return b.margem_valor - a.margem_valor;
        if (ordenacao === 'margem_percentual') return b.margem_percentual - a.margem_percentual;
        if (ordenacao === 'receita') return b.receita_total - a.receita_total;
        if (ordenacao === 'quantidade') return b.quantidade_vendida - a.quantidade_vendida;
        return 0;
      });
  }, [produtos, pedidos, periodo, ordenacao]);
}

export function useCurvaABC(dados) {
  return useMemo(() => {
    const sorted = [...dados].sort((a, b) => b.receita_total - a.receita_total);
    let acumulado = 0;
    const total = sorted.reduce((sum, p) => sum + p.receita_total, 0);

    return sorted.map((p, idx) => {
      acumulado += p.receita_total;
      const percentualAcumulado = (acumulado / total) * 100;
      let classe = 'C';
      if (percentualAcumulado <= 80) classe = 'A';
      else if (percentualAcumulado <= 95) classe = 'B';
      return {
        produto: p.descricao?.substring(0, 20),
        receita: p.receita_total,
        percentualAcumulado,
        classe,
        posicao: idx + 1,
      };
    }).slice(0, 30);
  }, [dados]);
}