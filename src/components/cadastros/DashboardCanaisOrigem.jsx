import React from "react";
import useDashboardCanais from "@/components/cadastros/canais-origem/useDashboardCanais";
import CanaisKPIs from "@/components/cadastros/canais-origem/CanaisKPIs";
import CanaisPerformanceTable from "@/components/cadastros/canais-origem/CanaisPerformanceTable";
import CanaisCharts from "@/components/cadastros/canais-origem/CanaisCharts";

export default function DashboardCanaisOrigem({ empresaId, windowMode = false }) {
  const h = useDashboardCanais(empresaId);
  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-hidden" : "space-y-6";

  if (h.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={windowMode ? "flex-1 overflow-auto p-6" : ""}>
        <CanaisKPIs canaisAtivos={h.canaisAtivos} totalGeralPedidos={h.totalGeralPedidos} totalGeralValor={h.totalGeralValor} />
        <CanaisPerformanceTable metricas={h.metricas} totalGeralPedidos={h.totalGeralPedidos} CORES={h.CORES} />
        <CanaisCharts dadosBarras={h.dadosBarras} dadosPizza={h.dadosPizza} metricas={h.metricas} CORES={h.CORES} insights={h.insights} />
      </div>
    </div>
  );
}