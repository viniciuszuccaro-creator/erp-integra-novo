import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function FinanceiroAlertaCritico({ contasReceberVencidas = 0, contasPagarVencidas = 0 }) {
  if (contasReceberVencidas === 0 && contasPagarVencidas === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-red-900">⚠️ Atenção Necessária</p>
            <p className="text-sm text-red-700 mt-1">
              {contasReceberVencidas > 0 && `${contasReceberVencidas} contas a receber vencidas`}
              {contasReceberVencidas > 0 && contasPagarVencidas > 0 && " | "}
              {contasPagarVencidas > 0 && `${contasPagarVencidas} contas a pagar vencidas`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}