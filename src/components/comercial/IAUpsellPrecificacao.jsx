import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, Target, Brain } from 'lucide-react';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * IA de Upsell e Precificação Dinâmica
 * P2: Multi-tenant — usa filterInContext
 */
export default function IAUpsellPrecificacao({ clienteId, pedidoAtual }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [analisando, setAnalisando] = useState(false);
  const { filterInContext } = useContextoVisual();

  useEffect(() => {
    if (!clienteId) return;
    analisarCliente();
  }, [clienteId]);

  const analisarCliente = async () => {
    setAnalisando(true);
    try {
      // Buscar histórico de compras
      const historico = await filterInContext('HistoricoCliente', {
        cliente_id: clienteId,
        modulo_origem: 'Comercial'
      }, '-data_evento', 50);

      const pedidosAnteriores = await filterInContext('Pedido', {
        cliente_id: clienteId,
        status: 'Entregue'
      }, '-data_pedido', 20);

      // Análise de padrões
      const sugestoesGeradas = [];

      // SUGESTÃO 1: Reposição Automática
      const ultimoPedido = pedidosAnteriores[0];
      if (ultimoPedido && ultimoPedido.data_pedido) {
        const diasDesdeUltimoP = Math.floor(
          (new Date() - new Date(ultimoPedido.data_pedido)) / (1000 * 60 * 60 * 24)
        );
        
        if (diasDesdeUltimoP >= 25 && diasDesdeUltimoP <= 35) {
          sugestoesGeradas.push({
            tipo: 'reposicao',
            prioridade: 'alta',
            titulo: 'Ciclo de Reposição Detectado',
            descricao: `Cliente compra a cada ~30 dias. Última compra há ${diasDesdeUltimoP} dias.`,
            acao: 'Sugerir produtos do último pedido',
            icone: Target,
            cor: 'green',
            produtos: ultimoPedido.itens_revenda?.map(i => i.produto_id) || []
          });
        }
      }

      // SUGESTÃO 2: Ajuste de Preço Inteligente
      const margemMedia = pedidosAnteriores.reduce((sum, p) => sum + (p.margem_total_percentual || 0), 0) / (pedidosAnteriores.length || 1);
      
      if (margemMedia > 25 && pedidoAtual?.margem_total_percentual < 20) {
        sugestoesGeradas.push({
          tipo: 'precificacao',
          prioridade: 'media',
          titulo: 'Oportunidade de Aumentar Margem',
          descricao: `Margem atual: ${pedidoAtual.margem_total_percentual.toFixed(1)}%. Histórico permite ${margemMedia.toFixed(1)}%.`,
          acao: 'Aumentar 5% não afetará conversão',
          icone: TrendingUp,
          cor: 'blue'
        });
      }

      // SUGESTÃO 3: Upsell de Produtos Complementares
      const produtosComprados = pedidosAnteriores
        .flatMap(p => p.itens_revenda || [])
        .map(i => i.produto_id);
      
      if (produtosComprados.includes('bitola_10mm') && !pedidoAtual?.itens_revenda?.some(i => i.codigo_sku?.includes('arame'))) {
        sugestoesGeradas.push({
          tipo: 'upsell',
          prioridade: 'media',
          titulo: 'Produto Complementar',
          descricao: 'Cliente compra Bitola 10mm - sugerir Arame Recozido',
          acao: 'Adicionar Arame Recozido 18 (1kg)',
          icone: Sparkles,
          cor: 'purple',
          produto_id: 'arame_recozido_18'
        });
      }

      setSugestoes(sugestoesGeradas);
    } catch (error) {
      console.error('Erro ao analisar cliente:', error);
    } finally {
      setAnalisando(false);
    }
  };

  if (!clienteId) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="border-b bg-white/80">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          Assistente Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {analisando ? (
          <div className="text-center py-8 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm">Analisando histórico do cliente...</p>
          </div>
        ) : sugestoes.length > 0 ? (
          <div className="space-y-3">
            {sugestoes.map((sug, idx) => {
              const Icon = sug.icone;
              const corClasses = {
                green: 'bg-green-50 border-green-200 text-green-900',
                blue: 'bg-blue-50 border-blue-200 text-blue-900',
                purple: 'bg-purple-50 border-purple-200 text-purple-900',
                orange: 'bg-orange-50 border-orange-200 text-orange-900'
              };

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${corClasses[sug.cor]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 text-${sug.cor}-600`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{sug.titulo}</p>
                        <Badge variant="outline" className="text-xs">
                          {sug.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{sug.descricao}</p>
                      <Button
                        size="sm"
                        className="mt-3"
                        variant="outline"
                      >
                        {sug.acao}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma sugestão disponível no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}