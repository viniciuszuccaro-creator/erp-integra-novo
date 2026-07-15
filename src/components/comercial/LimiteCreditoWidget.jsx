import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function LimiteCreditoWidget({ 
  cliente, 
  valorPedidoAtual = 0,
  onLimiteAtualizado 
}) {
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [limiteAtual, setLimiteAtual] = useState(cliente?.condicao_comercial?.limite_credito || 0);
  const [limiteUtilizado, setLimiteUtilizado] = useState(cliente?.condicao_comercial?.limite_credito_utilizado || 0);

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceberCliente', cliente?.id, contextoKey],
    queryFn: () => cliente?.id ? filterInContext('ContaReceber', { cliente_id: cliente.id }) : Promise.resolve([]),
    enabled: !!cliente?.id
  });

  useEffect(() => {
    calcularLimiteUtilizado();
  }, [contasReceber, cliente]);

  const calcularLimiteUtilizado = () => {
    // Soma de contas pendentes
    const totalPendente = contasReceber
      .filter(c => c.status === 'Pendente' || c.status === 'Atrasado')
      .reduce((sum, c) => sum + (c.valor || 0), 0);
    
    setLimiteUtilizado(totalPendente);

    // Atualizar limite dinâmico baseado no score
    if (cliente?.score_pagamento) {
      ajustarLimiteDinamico(cliente.score_pagamento);
    }
  };

  const ajustarLimiteDinamico = (score) => {
    const limiteBase = cliente?.condicao_comercial?.limite_credito || 0;
    
    // Score alto = aumenta limite
    if (score >= 90) {
      const novoLimite = limiteBase * 1.2; // +20%
      if (novoLimite > limiteAtual) {
        setLimiteAtual(novoLimite);
        if (onLimiteAtualizado) {
          onLimiteAtualizado(novoLimite, 'Aumento automático por bom histórico');
        }
      }
    }
    // Score médio-baixo = reduz limite
    else if (score < 70) {
      const novoLimite = limiteBase * 0.8; // -20%
      if (novoLimite < limiteAtual) {
        setLimiteAtual(novoLimite);
        if (onLimiteAtualizado) {
          onLimiteAtualizado(novoLimite, 'Redução automática por atrasos');
        }
      }
    }
  };

  const limiteDisponivel = limiteAtual - limiteUtilizado;
  const percentualUtilizado = limiteAtual > 0 ? (limiteUtilizado / limiteAtual) * 100 : 0;
  const percentualComPedido = limiteAtual > 0 ? ((limiteUtilizado + valorPedidoAtual) / limiteAtual) * 100 : 0;
  
  const temLimiteSuficiente = (limiteUtilizado + valorPedidoAtual) <= limiteAtual;
  const scorePagamento = cliente?.score_pagamento || 100;

  const corProgress = percentualUtilizado < 50 ? 'bg-green-500' : 
                     percentualUtilizado < 80 ? 'bg-yellow-500' : 
                     'bg-red-500';

  const corScore = scorePagamento >= 80 ? 'text-green-600' :
                  scorePagamento >= 60 ? 'text-yellow-600' :
                  'text-red-600';

  return (
    <Card className={`border-2 ${
      temLimiteSuficiente ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className={`w-5 h-5 ${temLimiteSuficiente ? 'text-green-600' : 'text-red-600'}`} />
            Limite de Crédito
          </span>
          <Badge className={`${
            scorePagamento >= 80 ? 'bg-green-500' :
            scorePagamento >= 60 ? 'bg-yellow-500' :
            'bg-red-500'
          } text-white`}>
            Score: {scorePagamento}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-slate-600 mb-1">Limite Total</p>
            <p className="text-lg font-bold text-blue-600">
              R$ {limiteAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {cliente?.condicao_comercial?.limite_credito !== limiteAtual && (
              <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                Ajustado
              </Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Utilizado</p>
            <p className="text-lg font-bold text-orange-600">
              R$ {limiteUtilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Disponível</p>
            <p className={`text-lg font-bold ${limiteDisponivel > 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-600">Utilização</span>
            <span className="text-xs font-semibold">{percentualUtilizado.toFixed(1)}%</span>
          </div>
          <Progress value={percentualUtilizado} className={`h-2 ${corProgress}`} />
        </div>

        {/* Simulação com Pedido Atual */}
        {valorPedidoAtual > 0 && (
          <div className={`p-3 rounded-lg ${
            temLimiteSuficiente ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {temLimiteSuficiente ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                temLimiteSuficiente ? 'text-green-800' : 'text-red-800'
              }`}>
                {temLimiteSuficiente ? 'Limite Aprovado ✓' : 'Limite Insuficiente ✗'}
              </span>
            </div>
            <p className="text-xs mb-2">
              Pedido atual: <strong>R$ {valorPedidoAtual.toFixed(2)}</strong>
            </p>
            <Progress value={percentualComPedido} className={`h-2 ${
              temLimiteSuficiente ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <p className="text-xs mt-1">
              Utilização após pedido: <strong>{percentualComPedido.toFixed(1)}%</strong>
            </p>

            {!temLimiteSuficiente && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-700 mb-2">
                  <strong>Falta:</strong> R$ {((limiteUtilizado + valorPedidoAtual) - limiteAtual).toFixed(2)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  disabled
                  data-action="Financeiro.Cliente.solicitar_limite"
                >
                  Solicitar Aumento de Limite
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Indicadores de Score */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Histórico</p>
            <div className="flex items-center justify-center gap-1">
              {scorePagamento >= 80 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-bold ${corScore}`}>
                {scorePagamento >= 80 ? 'Excelente' :
                 scorePagamento >= 60 ? 'Bom' : 'Ruim'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Atraso Médio</p>
            <p className="font-bold text-slate-700">
              {cliente?.dias_atraso_medio || 0} dias
            </p>
          </div>
        </div>

        {/* Alertas */}
        {scorePagamento < 70 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <p className="text-xs text-amber-800">
                ⚠️ Score baixo detectado. Limite foi reduzido automaticamente em 20%.
              </p>
            </CardContent>
          </Card>
        )}

        {scorePagamento >= 90 && limiteAtual > (cliente?.condicao_comercial?.limite_credito || 0) && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <p className="text-xs text-green-800">
                ✅ Score excelente! Limite aumentado automaticamente em 20%.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}