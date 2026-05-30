import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardStabilityNotice({ hasContextoAtivo, activeTab }) {
  if (!hasContextoAtivo) {
    return (
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Contexto necessário</p>
          <p>Selecione uma empresa ou visão de grupo para carregar os indicadores do Dashboard com segurança.</p>
        </div>
      </div>
    );
  }

  if (activeTab !== "resumo") {
    return (
      <div className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Dashboard estabilizado</p>
          <p>A visualização foi normalizada para evitar tela em branco.</p>
        </div>
      </div>
    );
  }

  return <></>;
}