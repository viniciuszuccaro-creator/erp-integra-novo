import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, TrendingUp, Brain } from 'lucide-react';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Motor de Recomendação de Produtos
 * P2: Multi-tenant — usa filterInContext
 */
export default function MotorRecomendacao({ 
  clienteId, 
  itensAtuais = [],
  onAdicionarProduto 
}) {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [totalPedidosAnteriores, setTotalPedidosAnteriores] = useState(0);
  const { filterInContext } = useContextoVisual();

  useEffect(() => {
    if (clienteId) {
      buscarRecomendacoes();
    }
  }, [clienteId, itensAtuais]);

  const buscarRecomendacoes = async () => {
    setCarregando(true);

    try {
      // 1. Buscar histórico do cliente
      const historico = await filterInContext('HistoricoCliente', {
        cliente_id: clienteId,
        modulo_origem: 'Comercial'
      }, '-data_evento', 50);

      // 2. Buscar pedidos anteriores
      const pedidosAnteriores = await filterInContext('Pedido', {
        cliente_id: clienteId,
        status: ['Aprovado', 'Faturado', 'Entregue']
      }, '-data_pedido', 10);

      setTotalPedidosAnteriores(pedidosAnteriores.length);

      // 3. Extrair produtos mais comprados
      const produtosMaisComprados = {};
      pedidosAnteriores.forEach(p => {
        (p.itens_revenda || []).forEach(item => {
          if (!produtosMaisComprados[item.produto_id]) {
            produtosMaisComprados[item.produto_id] = {
              produto_id: item.produto_id,
              descricao: item.descricao,
              codigo_sku: item.codigo_sku,
              quantidade_total: 0,
              frequencia: 0,
              ultimo_preco: item.preco_unitario
            };
          }
          produtosMaisComprados[item.produto_id].quantidade_total += item.quantidade;
          produtosMaisComprados[item.produto_id].frequencia += 1;
          produtosMaisComprados[item.produto_id].ultimo_preco = item.preco_unitario;
        });
      });

      // 4. Filtrar produtos que NÃO estão no pedido atual
      const produtosJaNoCarrinho = itensAtuais.map(i => i.produto_id);
      const produtosRecomendados = Object.values(produtosMaisComprados)
        .filter(p => !produtosJaNoCarrinho.includes(p.produto_id))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 5);

      // 5. Usar IA para refinar recomendações
      if (produtosRecomendados.length > 0) {
        const analiseIA = await base44.integrations.Core.InvokeLLM({
          prompt: `
Cliente comprou anteriormente:
${produtosRecomendados.map(p => `- ${p.descricao} (${p.frequencia}x)`).join('\n')}

Pedido atual tem ${itensAtuais.length} itens.

Sugira qual produto recomendar PRIMEIRO e por quê.
Retorne JSON:
{
  "produto_recomendado": "descrição do produto",
  "razao": "motivo da recomendação",
  "urgencia": "baixa | media | alta"
}
          `,
          response_json_schema: {
            type: 'object',
            properties: {
              produto_recomendado: { type: 'string' },
              razao: { type: 'string' },
              urgencia: { type: 'string' }
            }
          }
        });

        // Adicionar razão da IA
        produtosRecomendados[0].razao_ia = analiseIA.razao;
        produtosRecomendados[0].urgencia = analiseIA.urgencia;
      }

      setRecomendacoes(produtosRecomendados);

    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <p className="text-sm text-purple-900">Analisando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recomendacoes.length === 0) return null;

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-white/80 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Recomendações Inteligentes
          <Badge className="ml-auto bg-purple-600 text-white">
            {recomendacoes.length} sugestões
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {recomendacoes.map((rec, idx) => (
          <div
            key={idx}
            className={`p-3 bg-white border-2 rounded-lg ${
              idx === 0 && rec.urgencia === 'alta'
                ? 'border-orange-300 bg-orange-50'
                : 'border-purple-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">{rec.descricao}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Comprou {rec.frequencia}x
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    R$ {rec.ultimo_preco?.toLocaleString('pt-BR')}
                  </Badge>
                </div>
                {rec.razao_ia && (
                  <p className="text-xs text-purple-700 mt-2">
                    💡 {rec.razao_ia}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAdicionarProduto && onAdicionarProduto(rec)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <p className="text-xs text-center text-purple-600">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Baseado em {totalPedidosAnteriores} pedidos anteriores
          </p>
        </div>
      </CardContent>
    </Card>
  );
}