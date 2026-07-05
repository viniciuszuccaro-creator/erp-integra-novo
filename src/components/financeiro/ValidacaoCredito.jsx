import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, DollarSign, TrendingUp } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Componente de validação de crédito em tempo real
 * P2: Multi-tenant — usa filterInContext
 */
export default function ValidacaoCredito({ clienteId, valorPedido, pedidoId }) {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente-credito', clienteId, contextoKey],
    queryFn: async () => {
      if (!clienteId) return null;
      const clientes = await filterInContext('Cliente', { id: clienteId });
      return clientes[0] || null;
    },
    enabled: !!clienteId && !!contextoKey,
  });

  const { data: pedidosPendentes = [] } = useQuery({
    queryKey: ['pedidos-pendentes-cliente', clienteId, contextoKey],
    queryFn: async () => {
      if (!clienteId) return [];
      const pedidos = await filterInContext('Pedido', { 
        cliente_id: clienteId,
        status: { $in: ["Aprovado", "Em Produção", "Faturado"] }
      });
      return pedidos.filter(p => p.id !== pedidoId);
    },
    enabled: !!clienteId && !!contextoKey,
  });

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="animate-pulse">Verificando crédito...</div>
        </CardContent>
      </Card>
    );
  }

  if (!cliente) {
    return null;
  }

  const limiteTotal = cliente.condicao_comercial?.limite_credito || 0;
  const limiteUtilizado = cliente.condicao_comercial?.limite_credito_utilizado || 0;
  const valorPendenteOutrosPedidos = pedidosPendentes.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const limiteComprometidoTotal = limiteUtilizado + valorPendenteOutrosPedidos;
  const limiteDisponivel = limiteTotal - limiteComprometidoTotal;
  const limiteAposAprovacao = limiteDisponivel - valorPedido;

  const percentualUtilizado = limiteTotal > 0 ? ((limiteComprometidoTotal + valorPedido) / limiteTotal) * 100 : 0;

  // Status
  let status = "aprovado";
  let statusTexto = "Crédito Aprovado";
  let statusIcon = CheckCircle;
  let statusCor = "green";

  if (limiteTotal === 0) {
    status = "sem_limite";
    statusTexto = "Sem Limite Configurado";
    statusIcon = AlertTriangle;
    statusCor = "amber";
  } else if (limiteAposAprovacao < 0) {
    status = "reprovado";
    statusTexto = "Crédito Insuficiente";
    statusIcon = XCircle;
    statusCor = "red";
  } else if (percentualUtilizado > 90) {
    status = "alerta";
    statusTexto = "Atenção: Limite Quase Esgotado";
    statusIcon = AlertTriangle;
    statusCor = "orange";
  }

  const StatusIcon = statusIcon;

  return (
    <Card className={`border-2 ${
      statusCor === "green" ? "border-green-300 bg-green-50" :
      statusCor === "red" ? "border-red-300 bg-red-50" :
      statusCor === "orange" ? "border-orange-300 bg-orange-50" :
      "border-amber-300 bg-amber-50"
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 text-${statusCor}-600`} />
          Análise de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={`${
            statusCor === "green" ? "bg-green-600" :
            statusCor === "red" ? "bg-red-600" :
            statusCor === "orange" ? "bg-orange-600" :
            "bg-amber-600"
          }`}>
            {statusTexto}
          </Badge>
        </div>

        {/* Informações de Crédito */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-700">Limite Total:</span>
            <span className="font-bold">R$ {limiteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-700">Já Utilizado:</span>
            <span className="font-semibold text-blue-600">
              R$ {limiteUtilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {valorPendenteOutrosPedidos > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-700">Pedidos Pendentes ({pedidosPendentes.length}):</span>
              <span className="font-semibold text-orange-600">
                R$ {valorPendenteOutrosPedidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t">
            <span className="text-slate-700">Disponível Atual:</span>
            <span className="font-bold text-green-600">
              R$ {limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-700">Valor deste Pedido:</span>
            <span className="font-bold text-blue-900">
              R$ {valorPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t font-bold">
            <span>Disponível Após Aprovação:</span>
            <span className={limiteAposAprovacao >= 0 ? "text-green-600" : "text-red-600"}>
              R$ {limiteAposAprovacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        {limiteTotal > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Utilização do Limite</span>
              <span className="font-semibold">{percentualUtilizado.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(percentualUtilizado, 100)} 
              className={`h-3 ${
                percentualUtilizado > 100 ? "[&>div]:bg-red-600" :
                percentualUtilizado > 90 ? "[&>div]:bg-orange-600" :
                "[&>div]:bg-green-600"
              }`}
            />
          </div>
        )}

        {/* Alertas */}
        {status === "reprovado" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Pedido bloqueado!</strong> O valor excede o limite de crédito disponível.
              Necessário aprovação especial ou pagamento antecipado.
            </AlertDescription>
          </Alert>
        )}

        {status === "alerta" && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-xs text-orange-900">
              <strong>Atenção:</strong> Este pedido utilizará {percentualUtilizado.toFixed(0)}% do limite total.
            </AlertDescription>
          </Alert>
        )}

        {status === "sem_limite" && (
          <Alert className="border-amber-300 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-900">
              Cliente sem limite de crédito configurado. Configure em Cadastros → Clientes.
            </AlertDescription>
          </Alert>
        )}

        {/* Score do Cliente */}
        {cliente.score_pagamento && (
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">Score de Pagamento:</span>
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  cliente.score_pagamento >= 80 ? "bg-green-100 text-green-700" :
                  cliente.score_pagamento >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {cliente.score_pagamento}
                </div>
                <TrendingUp className={`w-5 h-5 ${
                  cliente.score_pagamento >= 80 ? "text-green-600" :
                  cliente.score_pagamento >= 60 ? "text-yellow-600" :
                  "text-red-600"
                }`} />
              </div>
            </div>
            {cliente.dias_atraso_medio > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Atraso médio: {cliente.dias_atraso_medio} dias
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}