import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, CreditCard } from 'lucide-react';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * IA de Atendimento Preditivo no Portal
 * P2: Multi-tenant — usa filterInContext
 */
export default function IAAtendimentoPreditivo({ clienteId, comportamento }) {
  const [sugestoes, setSugestoes] = useState([]);
  const { filterInContext } = useContextoVisual();

  useEffect(() => {
    if (!clienteId || !comportamento) return;
    analisarComportamento();
  }, [clienteId, comportamento]);

  const analisarComportamento = async () => {
    const sugestoesGeradas = [];

    // SUGESTÃO 1: Cliente baixando muitos boletos
    if (comportamento.downloads_boletos >= 3) {
      sugestoesGeradas.push({
        tipo: 'financeiro',
        titulo: 'Negociação de Dívidas',
        descricao: 'Você baixou vários boletos. Deseja consolidar em uma única cobrança?',
        acao: 'Falar com Financeiro',
        icone: CreditCard,
        cor: 'orange',
        link: '/portal?secao=financeiro'
      });
    }

    // SUGESTÃO 2: Visitando produtos sem cotar
    if (comportamento.visualizacoes_produtos >= 5 && !comportamento.orcamento_recente) {
      const historico = await filterInContext('HistoricoCliente', {
        cliente_id: clienteId,
        modulo_origem: 'Comercial'
      }, '-data_evento', 10);

      const produtosMaisVistos = comportamento.produtos_vistos || [];
      
      sugestoesGeradas.push({
        tipo: 'comercial',
        titulo: 'Cotar Produtos Anteriores',
        descricao: 'Notamos seu interesse. Deseja receber um orçamento personalizado?',
        acao: 'Solicitar Orçamento',
        icone: Sparkles,
        cor: 'blue',
        produtos: produtosMaisVistos
      });
    }

    // SUGESTÃO 3: Pedidos em aberto há muito tempo
    const pedidos = await base44.entities.Pedido.filter({
      cliente_id: clienteId,
      status: 'Rascunho'
    });

    if (pedidos.length > 0) {
      const diasAberto = Math.floor(
        (new Date() - new Date(pedidos[0].created_date)) / (1000 * 60 * 60 * 24)
      );

      if (diasAberto >= 5) {
        sugestoesGeradas.push({
          tipo: 'recuperacao',
          titulo: 'Pedido Não Finalizado',
          descricao: `Há ${diasAberto} dias você iniciou um pedido. Deseja retomar?`,
          acao: 'Ver Pedido',
          icone: TrendingUp,
          cor: 'purple',
          pedido_id: pedidos[0].id
        });
      }
    }

    setSugestoes(sugestoesGeradas);
  };

  if (sugestoes.length === 0) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="border-b bg-white/80">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Sugestões Personalizadas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {sugestoes.map((sug, idx) => {
          const Icon = sug.icone;
          const corClasses = {
            orange: 'bg-orange-50 border-orange-200',
            blue: 'bg-blue-50 border-blue-200',
            purple: 'bg-purple-50 border-purple-200',
            green: 'bg-green-50 border-green-200'
          };

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${corClasses[sug.cor]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 text-${sug.cor}-600`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{sug.titulo}</p>
                  <p className="text-sm mt-1 text-slate-700">{sug.descricao}</p>
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
      </CardContent>
    </Card>
  );
}