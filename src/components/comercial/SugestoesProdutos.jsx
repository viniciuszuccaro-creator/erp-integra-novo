import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Plus, Zap } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function SugestoesProdutos({ clienteId, itensAtuais = [], onAdicionarProduto }) {
  const [sugestoes, setSugestoes] = useState([]);
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidosCliente', clienteId, contextoKey],
    queryFn: async () => {
      if (!clienteId) return [];
      return base44.entities.Pedido.filter({ cliente_id: clienteId });
    },
    enabled: !!clienteId && !!contexto
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', contextoKey],
    queryFn: () => filterInContext('Produto', {}, 'descricao', 999),
    enabled: !!contexto,
  });

  useEffect(() => {
    if (!clienteId || pedidos.length === 0 || produtos.length === 0) {
      setSugestoes([]);
      return;
    }

    try {
      // Produtos já comprados pelo cliente
      const produtosComprados = {};
      
      pedidos.forEach(pedido => {
        const itensRevenda = Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : [];
        
        itensRevenda.forEach(item => {
          if (!item || typeof item !== 'object') return;
          
          const produtoId = item.produto_id;
          if (!produtoId) return;
          
          if (!produtosComprados[produtoId]) {
            produtosComprados[produtoId] = {
              produto_id: produtoId,
              descricao: item.descricao,
              quantidade_total: 0,
              frequencia: 0
            };
          }
          
          produtosComprados[produtoId].quantidade_total += item.quantidade || 0;
          produtosComprados[produtoId].frequencia += 1;
        });
      });

      // Produtos que o cliente já comprou mas não estão no pedido atual
      const idsAtuais = itensAtuais.map(i => i.produto_id).filter(Boolean);
      
      const sugestoesCalculadas = Object.values(produtosComprados)
        .filter(pc => !idsAtuais.includes(pc.produto_id))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 3)
        .map(pc => {
          const produtoCompleto = produtos.find(p => p.id === pc.produto_id);
          return {
            ...pc,
            ...produtoCompleto
          };
        })
        .filter(s => s.id && s.status === 'Ativo');

      setSugestoes(sugestoesCalculadas);
    } catch (error) {
      console.error('Erro ao calcular sugestões:', error);
      setSugestoes([]);
    }
  }, [clienteId, pedidos, produtos, itensAtuais]);

  if (!clienteId || sugestoes.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Sugestões Inteligentes
          <Badge className="bg-purple-600 ml-auto">Com Base no Histórico</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {sugestoes.map((produto, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-purple-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{produto.descricao}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Comprado {produto.frequencia}x
                    </Badge>
                    <span className="text-xs text-slate-600">
                      R$ {(produto.preco_venda || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (onAdicionarProduto && typeof onAdicionarProduto === 'function') {
                    onAdicionarProduto(produto);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
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