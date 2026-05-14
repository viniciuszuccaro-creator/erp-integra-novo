import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default function PlanoMelhoriaGapsAnalise() {
  const gaps = [
    { id: 1, area: "Autenticação", severidade: "Alta", impacto: "Segurança crítica", status: "Em Execução" },
    { id: 2, area: "Multiempresa", severidade: "Alta", impacto: "Isolamento de dados", status: "Planejado" },
    { id: 3, area: "Performance", severidade: "Média", impacto: "UX/Latência", status: "Análise" },
    { id: 4, area: "Relatórios", severidade: "Média", impacto: "Business Intelligence", status: "Planejado" },
    { id: 5, area: "Integrações", severidade: "Baixa", impacto: "Conectividade", status: "Backlog" },
  ];

  const getSeveridadeCor = (sev) => {
    const map = {
      Alta: "bg-red-100 text-red-700",
      Média: "bg-amber-100 text-amber-700",
      Baixa: "bg-green-100 text-green-700",
    };
    return map[sev] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Análise de Gaps
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gaps.map((gap) => (
            <div key={gap.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{gap.area}</p>
                <p className="text-xs text-slate-500">{gap.impacto}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                <Badge className={`text-xs ${getSeveridadeCor(gap.severidade)}`}>
                  {gap.severidade}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {gap.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-slate-600 flex items-center gap-2">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>3 gaps críticos identificados — Execução Q2 2026</span>
        </div>
      </CardContent>
    </Card>
  );
}