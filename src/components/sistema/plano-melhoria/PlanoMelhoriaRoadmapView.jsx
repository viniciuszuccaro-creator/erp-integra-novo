import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function PlanoMelhoriaRoadmapView() {
  const roadmap = [
    { ciclo: 21, periodo: "Mar-Abr 2026", tema: "Acesso & Governança", progresso: 75, status: "Em Execução" },
    { ciclo: 22, periodo: "Abr-Mai 2026", tema: "Financeiro Avançado", progresso: 45, status: "Planejado" },
    { ciclo: 23, periodo: "Mai-Jun 2026", tema: "Logística & IA", progresso: 20, status: "Planejado" },
    { ciclo: 24, periodo: "Jun-Jul 2026", tema: "Marketplace & E-commerce", progresso: 0, status: "Backlog" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          Roadmap Futuro
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {roadmap.map((item) => (
            <div key={item.ciclo} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Ciclo {item.ciclo} — {item.tema}</h4>
                  <p className="text-xs text-slate-500">{item.periodo}</p>
                </div>
                <Badge
                  className={`text-xs ${
                    item.status === "Em Execução"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Planejado"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${item.progresso}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 font-medium w-8">{item.progresso}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-slate-600">
          <p>📅 Próximo grande lançamento: <strong>Ciclo 21 — Fim de Mar/2026</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}