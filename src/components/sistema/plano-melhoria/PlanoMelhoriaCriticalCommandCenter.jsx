import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, TrendingDown } from "lucide-react";

export default function PlanoMelhoriaCriticalCommandCenter() {
  const blockers = [
    { id: 1, titulo: "Sincronização Grupo — Bug Crítico", status: "Bloqueador", area: "Backend", assignee: "Dev Lead", prazo: "28 Mai" },
    { id: 2, titulo: "Performance Logística > 2s", status: "Alto", area: "Logística", assignee: "Arch", prazo: "31 Mai" },
  ];

  const risks = [
    { id: 1, risco: "Débito Técnico Acumulado", score: "8.5/10", acao: "Refatoração Sprint Limpeza" },
    { id: 2, risco: "Recursos Q3 Limitados", score: "7/10", acao: "Priorização Dinâmica" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-3 border-b border-red-200">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            Bloqueadores Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {blockers.map((b) => (
              <div key={b.id} className="border border-red-200 rounded p-2 bg-white hover:bg-red-50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{b.titulo}</p>
                  <Badge className="bg-red-600 text-white text-[10px]">{b.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs text-slate-600">
                  <span>{b.area}</span>
                  <span>@{b.assignee}</span>
                  <span className="text-right">{b.prazo}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-3 border-b border-orange-200">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            Riscos Prioritários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {risks.map((r) => (
              <div key={r.id} className="border border-orange-200 rounded p-2 bg-white hover:bg-orange-50">
                <p className="text-sm font-semibold text-slate-900 mb-1">{r.risco}</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-700 text-[10px]">Score: {r.score}</Badge>
                  <span className="text-xs text-slate-600">{r.acao}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}