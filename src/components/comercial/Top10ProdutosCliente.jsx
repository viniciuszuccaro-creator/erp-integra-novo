import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Plus, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast"; // Assuming toast is imported from here
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function Top10ProdutosCliente({ clienteId, onSelecionarProduto }) {
  const [usandoIA, setUsandoIA] = useState(false);
  const [sugestoesIA, setSugestoesIA] = useState([]);
  const { toast } = useToast();
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [], isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['pedidosCliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      try {
        return await base44.entities.Pedido.filter({ cliente_id: clienteId });
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return [];
      }
    },
    enabled: !!clienteId
  });

  const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery({
    queryKey: ['produtosDisponiveis', contextoKey],
    queryFn: async () => {
      try {
        return await filterInContext('Produto', {}, 'descricao', 999);
      } catch (error) {
        console.error('Erro ao buscar produtos disponíveis:', error);
        return [];
      }
    },
    enabled: !!contexto,
    enabled: !!clienteId // Only fetch products if a client ID is provided
  });


  // Consolidar produtos (from existing code)
  const produtosConsolidados = {};

  pedidos.forEach(pedido => {
    const itensRevenda = Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : [];

    itensRevenda.forEach(item => {
      if (!item || typeof item !== 'object') return;

      const key = item.produto_id || item.codigo_sku || item.descricao;
      if (!key) return;

      if (!produtosConsolidados[key]) {
        produtosConsolidados[key] = {
          produto_id: item.produto_id,
          codigo: item.codigo_sku || '',
          descricao: item.descricao || 'Produto',
          quantidade_total: 0,
          valor_total: 0,
          frequencia: 0,
          ultimo_preco: 0,
          ultima_compra: null,
          unidade: item.unidade || 'UN'
        };
      }

      produtosConsolidados[key].quantidade_total += item.quantidade || 0;
      produtosConsolidados[key].valor_total += item.valor_item || 0;
      produtosConsolidados[key].frequencia += 1;
      produtosConsolidados[key].ultimo_preco = item.preco_unitario || 0;

      if (!produtosConsolidados[key].ultima_compra || (pedido.data_pedido && new Date(pedido.data_pedido) > new Date(produtosConsolidados[key].ultima_compra))) {
        produtosConsolidados[key].ultima_compra = pedido.data_pedido;
      }
    });
  });

  const top10Produtos = Object.values(produtosConsolidados)
    .sort((a, b) => b.valor_total - a.valor_total)
    .slice(0, 10);

  // Buscar sugestões com IA
  const buscarSugestoesIA = async () => {
    if (!clienteId || !produtos.length || !pedidos.length) {
      toast({
        title: "⚠️ Aviso",
        description: "Não há dados suficientes (cliente, produtos ou pedidos) para gerar sugestões de IA.",
        variant: "destructive"
      });
      return;
    }

    setUsandoIA(true);
    setSugestoesIA([]); // Clear previous suggestions

    try {
      // Preparar contexto do cliente
      const historicoPedidos = pedidos.map(p => ({
        data: p.data_pedido,
        valor: p.valor_total,
        itens: p.itens_revenda?.map(i => ({
          produto: i.descricao,
          quantidade: i.quantidade,
          valor: i.valor_item
        }))
      }));

      // Trimming prompt to avoid leading/trailing whitespace issues with LLMs
      const prompt = `
Analise o histórico de compras deste cliente e sugira os 10 melhores produtos para oferecer agora.
Considere padrões de compra, produtos complementares e frequência.
Use apenas os 'PRODUTOS DISPONÍVEIS' fornecidos.

HISTÓRICO DE PEDIDOS:
${JSON.stringify(historicoPedidos, null, 2)}

PRODUTOS DISPONÍVEIS:
${produtos.slice(0, 50).map(p => `${p.codigo} - ${p.descricao} - R$ ${p.preco_venda}`).join('\n')}

Retorne um JSON contendo um array de objetos, onde cada objeto representa uma sugestão de produto e possui as seguintes propriedades:
- produto_codigo: string (Código SKU do produto sugerido, deve existir em 'PRODUTOS DISPONÍVEIS')
- motivo_sugestao: string (Uma breve explicação do porquê o produto é recomendado para este cliente)
- score_confianca: number (Um valor de 0 a 100 indicando a confiança na sugestão)
- produtos_complementares: string[] (Um array de códigos SKU de outros produtos que complementam a sugestão, se houver)
      `.trim();

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sugestoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  produto_codigo: { type: "string" },
                  motivo_sugestao: { type: "string" },
                  score_confianca: { type: "number" },
                  produtos_complementares: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["produto_codigo", "motivo_sugestao", "score_confianca"]
              }
            }
          },
          required: ["sugestoes"]
        }
      });

      const sugestoesComProdutos = resultado.sugestoes
        .map(sug => {
          const prod = produtos.find(p => p.codigo === sug.produto_codigo);
          return prod ? { ...sug, produto: prod } : null;
        })
        .filter(s => s !== null)
        .slice(0, 10);

      setSugestoesIA(sugestoesComProdutos);

      toast({
        title: "✅ IA analisou o histórico!",
        description: `${sugestoesComProdutos.length} produtos sugeridos com base no comportamento do cliente`
      });
    } catch (error) {
      console.error('Erro ao buscar sugestões de IA:', error);
      toast({
        title: "❌ Erro na IA",
        description: `Não foi possível gerar sugestões com IA. Detalhes: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setUsandoIA(false);
    }
  };

  // Usar sugestões IA se disponível, senão usa top10 normal
  const sugestoesExibir = sugestoesIA.length > 0
    ? sugestoesIA
    : top10Produtos.map(t => {
      // Ensure we find the full product object for the fallback
      const fullProduct = produtos.find(p => p.id === t.produto_id) || {
        id: t.produto_id,
        codigo: t.codigo,
        descricao: t.descricao,
        preco_venda: t.ultimo_preco,
        unidade_medida: t.unidade,
      };
      return {
        produto: fullProduct,
        motivo_sugestao: `Comprado ${t.quantidade_total} ${t.unidade} anteriormente`,
        score_confianca: Math.min(100, t.frequencia * 20 + (t.valor_total / 100)), // Simple heuristic for a score
      };
    });

  // Display a loading state if data is still being fetched and no suggestions are available
  if (isLoadingPedidos || isLoadingProdutos) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        <p className="ml-4 text-amber-700">Carregando histórico e produtos...</p>
      </div>
    );
  }

  // No client ID or no historical data and no IA suggestions
  if (!clienteId || (pedidos.length === 0 && sugestoesIA.length === 0 && top10Produtos.length === 0)) {
    return (
      <div className="text-center py-8 text-slate-500 border rounded-lg bg-white p-6 shadow-sm">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Cliente sem histórico de compras</p>
        <Button
          size="sm"
          variant="outline"
          onClick={buscarSugestoesIA}
          disabled={usandoIA || !clienteId || isLoadingProdutos}
          className="mt-3 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {usandoIA ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
              Analisando...
            </>
          ) : (
            <>
              🤖 Buscar Sugestões com IA
            </>
          )}
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      {/* BOTÃO IA */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-blue-700 font-medium">
          {sugestoesIA.length > 0 ? '🤖 Sugestões da IA' : '📊 Baseado em Histórico'}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={buscarSugestoesIA}
          disabled={usandoIA || !clienteId || isLoadingProdutos || isLoadingPedidos}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {usandoIA ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
              Analisando...
            </>
          ) : (
            <>
              🤖 Analisar com IA
            </>
          )}
        </Button>
      </div>

      {/* LISTA DE SUGESTÕES */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar visibility */}
        {sugestoesExibir.slice(0, 10).map((sug, idx) => (
          <button
            key={sug.produto?.id || `sug-${idx}`} // Use a more robust key
            onClick={() => onSelecionarProduto && typeof onSelecionarProduto === 'function' && sug.produto ? onSelecionarProduto(sug.produto) : null}
            className="w-full p-3 text-left hover:bg-blue-100 transition-colors border rounded-lg bg-white"
            disabled={!sug.produto} // Disable if product data is missing
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{sug.produto?.descricao || 'Produto Desconhecido'}</p>
                <p className="text-xs text-slate-600 mt-1">
                  💡 {sug.motivo_sugestao || 'Sugestão genérica'}
                </p>
                {sug.score_confianca !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, sug.score_confianca))}%` }} // Ensure score is between 0-100
                      />
                    </div>
                    <span className="text-xs text-slate-500">{Math.round(sug.score_confianca)}%</span>
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-green-600">
                  R$ {sug.produto?.preco_venda?.toFixed(2) || '0.00'}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  {sug.produto?.codigo || 'N/A'}
                </Badge>
              </div>
            </div>
          </button>
        ))}
        {sugestoesExibir.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma sugestão encontrada para este cliente.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={buscarSugestoesIA}
              disabled={usandoIA || !clienteId || isLoadingProdutos || isLoadingPedidos}
              className="mt-3 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              {usandoIA ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
                  Analisando...
                </>
              ) : (
                <>
                  🤖 Tentar buscar com IA
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}