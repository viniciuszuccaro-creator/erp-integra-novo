import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function DashboardFinanceiroResumo({
  contasReceber = [],
  contasPagar = [],
  notasFiscais = [],
  receitasPendentes = 0,
  despesasPendentes = 0,
  fluxoCaixa = 0,
}) {
  const contasReceberVencidas = contasReceber.filter(
    (c) => new Date(c.data_vencimento) < new Date() && c.status !== "Pago"
  ).length;

  const contasPagarVencidas = contasPagar.filter(
    (c) => new Date(c.data_vencimento) < new Date() && c.status !== "Pago"
  ).length;

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Alerts críticos */}
      {(contasReceberVencidas > 0 || contasPagarVencidas > 0) && (
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
      )}

      {/* Grid de resumos */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {(receitasPendentes || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-600 mt-2">{contasReceber.length} títulos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {(despesasPendentes || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-600 mt-2">{contasPagar.length} títulos</p>
          </CardContent>
        </Card>

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
      </div>

      {/* Últimas NF-es */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Últimas Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notasFiscais.slice(0, 8).map((nf) => (
              <div key={nf.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                <div>
                  <p className="font-medium">{nf.numero_nf || nf.id}</p>
                  <p className="text-xs text-slate-600">{new Date(nf.created_date).toLocaleDateString("pt-BR")}</p>
                </div>
                <Badge
                  className={`${
                    nf.status === "Autorizada"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {nf.status || "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}