import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export default function DashboardFinanceiroResumo({
  fluxoCaixa = 0,
  contasReceber = 0,
  contasPagar = 0,
  periodo = "mes",
}) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const saldoPositivo = fluxoCaixa >= 0;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Fluxo de Caixa */}
      <Card className={saldoPositivo ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Fluxo de Caixa</span>
            <DollarSign className={`w-4 h-4 ${saldoPositivo ? "text-green-600" : "text-red-600"}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(fluxoCaixa)}
          </div>
          <p className={`text-xs ${saldoPositivo ? "text-green-600" : "text-red-600"}`}>
            {saldoPositivo ? "✅ Positivo" : "⚠️ Negativo"}
          </p>
        </CardContent>
      </Card>

      {/* Contas a Receber */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Contas Receber</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(contasReceber)}</div>
          <p className="text-xs text-blue-600">Pendente de recebimento</p>
        </CardContent>
      </Card>

      {/* Contas a Pagar */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Contas Pagar</span>
            <TrendingDown className="w-4 h-4 text-orange-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(contasPagar)}</div>
          <p className="text-xs text-orange-600">Pendente de pagamento</p>
        </CardContent>
      </Card>
    </div>
  );
}