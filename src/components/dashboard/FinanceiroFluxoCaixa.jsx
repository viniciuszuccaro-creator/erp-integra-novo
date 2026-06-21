import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceiroFluxoCaixa({ fluxoCaixa = 0 }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Fluxo Caixa (Projeção)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${fluxoCaixa >= 0 ? "text-blue-600" : "text-red-600"}`}>
          R$ {(fluxoCaixa || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-slate-600 mt-2">
          {fluxoCaixa >= 0 ? "✅ Positivo" : "❌ Negativo"}
        </p>
      </CardContent>
    </Card>
  );
}