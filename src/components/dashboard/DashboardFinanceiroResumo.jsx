import React from "react";
import FinanceiroAlertaCritico from "./FinanceiroAlertaCritico";
import FinanceiroKPICard from "./FinanceiroKPICard";
import FinanceiroFluxoCaixa from "./FinanceiroFluxoCaixa";
import FinanceiroNotasFiscaisLista from "./FinanceiroNotasFiscaisLista";

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
      <FinanceiroAlertaCritico
        contasReceberVencidas={contasReceberVencidas}
        contasPagarVencidas={contasPagarVencidas}
      />

      <div className="grid grid-cols-3 gap-4">
        <FinanceiroKPICard title="Receitas Pendentes" value={receitasPendentes} count={contasReceber.length} color="text-green-600" />
        <FinanceiroKPICard title="Despesas Pendentes" value={despesasPendentes} count={contasPagar.length} color="text-red-600" />
        <FinanceiroFluxoCaixa fluxoCaixa={fluxoCaixa} />
      </div>

      <FinanceiroNotasFiscaisLista notasFiscais={notasFiscais} />
    </div>
  );
}