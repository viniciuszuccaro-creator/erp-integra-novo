import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";

export default function PlanoMelhoriaRiskPanel() {
  const risks = [
    {
      id: 1,
      risco: "Dependência de Sincronização Grupo",
      impacto: "Crítico",
      probabilidade: "Média",
      mitigacao: "Testes automatizados 24/7",
      status: "Monitorado",
    },
    {
      id: 2,
      risco: "Débito técnico em Logística",
      impacto: "Alto",
      probabilidade: "Alta",
      mitigacao: "Refatoração paralela — Sprint Limpeza",
      status: "Em Ação",
    },
    {
      id: 3,
      risco: "Recursos limitados (Q3)",
      impacto: "Médio",
      probabilidade: "Média",
      mitigacao: "Priorização dinâmica + Contratação",
      status: "Planejado",
    },
    {
      id: 4,
      risco: "Degradação Performance (Ciclo 20+)",
      impacto: "Médio",
      probabilidade: "Baixa",
      mitigacao: "Profiling contínuo + Cache Layer",
      status: "Preventivo",
    },
  ];

  const getImpactColor = (impact) => {
    const map = {
      Crítico: "bg-red-100 text-red-700",
      Alto: "bg-orange-100 text-orange-700",
      Médio: "bg-amber-100 text-amber-700",
      Baixo: "bg-green-100 text-green-700",
    };
    return map[impact] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-orange-50 to-red-50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          Matriz de Riscos & Mitigações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {risks.map((risk) => (
            <div key={risk.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{risk.risco}</p>
                </div>
                <Badge className={`text-[10px] flex-shrink-0 ${getImpactColor(risk.impacto)}`}>
                  {risk.impacto}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-500 mb-0.5">Probabilidade</p>
                  <Badge variant="outline" className="text-[10px]">
                    {risk.probabilidade}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Status</p>
                  <Badge variant="outline" className="text-[10px] bg-slate-100">
                    {risk.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Score</p>
                  <p className="font-bold text-slate-700">
                    {risk.impacto === "Crítico" ? "9/10" : risk.impacto === "Alto" ? "7/10" : "4/10"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded text-xs border border-slate-200">
                <p className="text-slate-600">
                  <Shield className="w-3 h-3 inline mr-1" />
                  <strong>Mitigação:</strong> {risk.mitigacao}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong>Saúde Geral do Projeto:</strong> 82% — Controlado (2 riscos críticos)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}