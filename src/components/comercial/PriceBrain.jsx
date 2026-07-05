import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingDown, TrendingUp, Zap, Sparkles, Lightbulb, Brain } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function PriceBrain({ pedido, onSugestaoAplicada }) {
  const [analisando, setAnalisando] = useState(false);
  const [sugestao, setSugestao] = useState(null);
  const { grupoAtual, empresaAtual } = useContextoVisual();

  useEffect(() => {
    if (pedido?.cliente_id && (pedido.itens_revenda?.length > 0 || pedido.itens_producao?.length > 0)) {
      analisarPrecos();
    }
  }, [pedido?.cliente_id]);

  const analisarPrecos = async () => {
    setAnalisando(true);

    try {
      const filtroPedido = {
        cliente_id: pedido.cliente_id,
        status: ['Aprovado', 'Faturado', 'Entregue']
      };
      if (pedido.group_id || grupoAtual?.id) filtroPedido.group_id = pedido.group_id || grupoAtual.id;
      if (pedido.empresa_id || empresaAtual?.id) filtroPedido.empresa_id = pedido.empresa_id || empresaAtual.id;
      const pedidosCliente = await base44.entities.Pedido.filter(filtroPedido, '-data_pedido', 10);

      const ticketMedioCliente = pedidosCliente.length > 0
        ? pedidosCliente.reduce((sum, p) => sum + (p.valor_total || 0), 0) / pedidosCliente.length
        : 0;

      const ultimaCompra = pedidosCliente[0];

      const analise = await base44.integrations.Core.InvokeLLM({
        prompt: `
Você é o PriceBrain - IA especialista em precificação dinâmica para ERPs industriais.

DADOS DO PEDIDO ATUAL:
- Cliente: ${pedido.cliente_nome}
- Valor Atual: R$ ${pedido.valor_total?.toLocaleString('pt-BR')}
- Itens: ${(pedido.itens_revenda?.length || 0) + (pedido.itens_producao?.length || 0)}
- Forma Pagamento: ${pedido.forma_pagamento || 'Não definida'}

HISTÓRICO DO CLIENTE:
- Total de Pedidos: ${pedidosCliente.length}
- Ticket Médio: R$ ${ticketMedioCliente.toLocaleString('pt-BR')}
- Última Compra: ${ultimaCompra ? `R$ ${ultimaCompra.valor_total?.toLocaleString('pt-BR')} em ${new Date(ultimaCompra.data_pedido).toLocaleDateString('pt-BR')}` : 'Nenhuma'}

ANÁLISE:
1. Compare o valor atual com o ticket médio
2. Analise se é cliente recorrente ou novo
3. Considere estratégias:
   - Desconto para fechamento rápido
   - Upsell (aumentar ticket)
   - Cross-sell (produtos complementares)
   - Fidelização (desconto para próxima compra)

RETORNE em JSON:
{
  "estrategia": "desconto_rapido | upsell | fidelizacao | manter_preco",
  "razao": "explicação breve",
  "desconto_sugerido_percentual": number (0-15),
  "valor_com_desconto": number,
  "produtos_upsell": ["produto1", "produto2"] (se aplicável),
  "condicao_especial": "string" (ex: "válido por 48h"),
  "confianca": number (0-100)
}
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            estrategia: { type: 'string' },
            razao: { type: 'string' },
            desconto_sugerido_percentual: { type: 'number' },
            valor_com_desconto: { type: 'number' },
            produtos_upsell: { type: 'array', items: { type: 'string' } },
            condicao_especial: { type: 'string' },
            confianca: { type: 'number' }
          }
        }
      });

      setSugestao(analise);

      await base44.entities.AuditoriaIA.create({
        empresa_id: pedido.empresa_id,
        group_id: pedido.group_id || null,
        modulo: 'Comercial',
        funcionalidade: 'PriceBrain',
        usuario_id: 'sistema',
        usuario_nome: 'PriceBrain',
        data_hora: new Date().toISOString(),
        input_dados: {
          cliente_id: pedido.cliente_id,
          valor_pedido: pedido.valor_total,
          historico: { pedidos: pedidosCliente.length, ticket_medio: ticketMedioCliente }
        },
        output_resultado: analise,
        confianca_percentual: analise.confianca,
        status: 'Sucesso'
      });

    } catch (error) {
      console.error('Erro ao analisar preços:', error);
    } finally {
      setAnalisando(false);
    }
  };

  const aplicarSugestao = () => {
    if (!sugestao) return;

    const novoValor = sugestao.valor_com_desconto;
    const descontoPercentual = sugestao.desconto_sugerido_percentual;

    onSugestaoAplicada({
      ...pedido,
      valor_total: novoValor,
      desconto_geral_pedido_percentual: descontoPercentual,
      desconto_geral_pedido_valor: pedido.valor_total - novoValor,
      observacoes_internas: `${pedido.observacoes_internas || ''}\n\nPriceBrain: ${sugestao.razao} (${sugestao.condicao_especial})`
    });

    setSugestao(null);
  };

  if (analisando) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-sm text-purple-900">
              <Brain className="w-4 h-4 inline mr-1" />
              PriceBrain analisando histórico e sugerindo melhor preço...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sugestao) return null;

  const estrategiaConfig = {
    desconto_rapido: { 
      cor: 'green', 
      icone: TrendingDown, 
      titulo: 'Desconto para Fechamento Rápido' 
    },
    upsell: { 
      cor: 'blue', 
      icone: TrendingUp, 
      titulo: 'Oportunidade de Upsell' 
    },
    fidelizacao: { 
      cor: 'purple', 
      icone: Sparkles, 
      titulo: 'Desconto Fidelização' 
    },
    manter_preco: { 
      cor: 'slate', 
      icone: Zap, 
      titulo: 'Manter Preço Atual' 
    }
  };

  const config = estrategiaConfig[sugestao.estrategia] || estrategiaConfig.manter_preco;
  const Icon = config.icone;

  return (
    <Card className="border-2 border-purple-300 bg-purple-50">
      <CardHeader className="bg-white/80 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          PriceBrain - Sugestão Inteligente
          <Badge className="ml-auto">
            {sugestao.confianca}% confiança
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Alert className="border-purple-300 bg-white">
          <Icon className="w-5 h-5 text-purple-600" />
          <AlertDescription>
            <p className="font-semibold mb-1">{config.titulo}</p>
            <p className="text-sm">{sugestao.razao}</p>
          </AlertDescription>
        </Alert>

        {sugestao.desconto_sugerido_percentual > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs text-slate-600">Valor Atual</p>
              <p className="text-xl font-bold text-slate-700">
                R$ {pedido.valor_total?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg border border-green-300">
              <p className="text-xs text-slate-600">Com Desconto ({sugestao.desconto_sugerido_percentual}%)</p>
              <p className="text-xl font-bold text-green-600">
                R$ {sugestao.valor_com_desconto?.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {sugestao.condicao_especial && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-xs text-amber-700 font-semibold">Condição Especial:</p>
            <p className="text-sm text-amber-900">{sugestao.condicao_especial}</p>
          </div>
        )}

        {sugestao.produtos_upsell?.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-700 font-semibold mb-2">Produtos Complementares:</p>
            <ul className="text-sm text-blue-900 space-y-1">
              {sugestao.produtos_upsell.map((prod, idx) => (
                <li key={idx}>• {prod}</li>
              ))}
            </ul>
          </div>
        )}

        {sugestao.estrategia !== 'manter_preco' && (
          <Button
            data-permission="Comercial.Pedido.aplicarPreco"
            onClick={aplicarSugestao}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Aplicar Sugestão
          </Button>
        )}
      </CardContent>
    </Card>
  );
}