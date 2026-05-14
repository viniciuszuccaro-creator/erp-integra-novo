import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, Clock } from "lucide-react";

export default function PlanoMelhoriaCriticalCommandCenter() {
  const criticalItems = [
    {
      id: 1,
      titulo: "RBAC Multinível Completo",
      pilar: "Acesso",
      bloqueador: false,
      eia: 85,
      risco: "Baixo",
    },
    {
      id: 2,
      titulo: "Sincronização Grupo ↔ Empresa",
      pilar: "Multiempresa",
      bloqueador: true,
      eia: 60,
      risco: "Alto",
    },
    {
      id: 3,
      titulo: "Motor Financeiro V22",
      pilar: "Financeiro",
      bloqueador: false,
      eia: 70,
      risco: "Médio",
    },
    {
      id: 4,
      titulo: "Integração Logística Completa",
      pilar: "Logística",
      bloqueador: true,
      eia: 55,
      risco: "Alto",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-red-50 to-amber-50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          Centro de Comando — Prioridades Críticas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {criticalItems.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{item.titulo}</p>
                    {item.bloqueador && (
                      <Badge className="bg-red-600 text-white text-[10px]">BLOQUEADOR</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Pilar: {item.pilar}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500 mb-1">IA Score</p>
                  <p className="font-bold text-blue-600">{item.eia}%</p>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500 mb-1">Risco</p>
                  <Badge
                    className={`text-[10px] ${
                      item.risco === "Alto"
                        ? "bg-red-100 text-red-700"
                        : item.risco === "Médio"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.risco}
                  </Badge>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="font-medium">Crítico</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Próximo milestones crítico:</p>
            <p>30 de Maio — Finalizar Sincronização Grupo ↔ Empresa</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}