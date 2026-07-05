import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Package, Plus, TrendingUp } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function HistoricoComprasCliente({ clienteId, onAdicionarProduto }) {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidosCliente', clienteId, contextoKey],
    queryFn: async () => {
      if (!clienteId) return [];
      try {
        return await filterInContext('Pedido', { cliente_id: clienteId }, '-data_pedido', 200);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return [];
      }
    },
    enabled: !!clienteId && !!contextoKey
  });

  if (!clienteId || pedidos.length === 0) {
    return null;
  }

  // Consolidar produtos mais comprados
  const produtosConsolidados = {};
  
  pedidos.forEach(pedido => {
    const itensRevenda = Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : [];
    
    itensRevenda.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      const key = item.produto_id || item.descricao;
      if (!key) return;
      
      if (!produtosConsolidados[key]) {
        produtosConsolidados[key] = {
          produto_id: item.produto_id,
          descricao: item.descricao || 'Produto',
          codigo_sku: item.codigo_sku || '',
          quantidade_total: 0,
          valor_total: 0,
          frequencia: 0,
          ultimo_preco: 0
        };
      }
      
      produtosConsolidados[key].quantidade_total += item.quantidade || 0;
      produtosConsolidados[key].valor_total += item.valor_item || 0;
      produtosConsolidados[key].frequencia += 1;
      produtosConsolidados[key].ultimo_preco = item.preco_unitario || 0;
    });
  });

  const topProdutos = Object.values(produtosConsolidados)
    .sort((a, b) => b.valor_total - a.valor_total)
    .slice(0, 5);

  if (topProdutos.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Histórico de Compras
          <Badge className="bg-blue-600 ml-auto">{pedidos.length} pedidos anteriores</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {topProdutos.map((produto, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{produto.descricao}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {produto.quantidade_total} unidades
                    </Badge>
                    <span className="text-xs text-slate-600">
                      Último preço: R$ {produto.ultimo_preco.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onAdicionarProduto && typeof onAdicionarProduto === 'function') {
                    onAdicionarProduto({
                      id: produto.produto_id,
                      codigo: produto.codigo_sku,
                      descricao: produto.descricao,
                      preco_venda: produto.ultimo_preco,
                      custo_aquisicao: produto.ultimo_preco * 0.6,
                      unidade_medida: 'UN',
                      estoque_atual: 100
                    });
                  }
                }}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}