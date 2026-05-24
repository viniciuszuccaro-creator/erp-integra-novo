/**
 * DashboardEstoquePrevisoesWidget — Widget de previsões de estoque (14 dias) via IA.
 * Extrai seção do Dashboard principal para componente focado e reutilizável.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function DashboardEstoquePrevisoesWidget({ previsoesIA = {}, loadingPrevIA = false }) {
  const navigate = useNavigate();
  const preds = (previsoesIA?.previsoes || [])
    .filter(p => p.risco_ruptura && p.risco_ruptura !== "baixo")
    .sort((a, b) => (a.dias_cobertura ?? 999) - (b.dias_cobertura ?? 999))
    .slice(0, 6);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Previsões de Estoque — 14 dias
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate(createPageUrl("Estoque"))}>
          Ver Estoque <ExternalLink className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {loadingPrevIA ? (
          <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
        ) : !preds.length ? (
          <p className="text-sm text-slate-500">Nenhum risco relevante no horizonte de 14 dias.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {preds.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">{p.descricao}</div>
                  <div className="text-xs text-slate-400">
                    {p.dias_cobertura != null ? `${p.dias_cobertura} dias` : "—"}
                    {p.demanda_dia_estimada != null && ` • Dem. ${p.demanda_dia_estimada}/dia`}
                  </div>
                </div>
                <Badge className={`shrink-0 text-[10px] ${
                  p.risco_ruptura === "alto" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {String(p.risco_ruptura || "").toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}