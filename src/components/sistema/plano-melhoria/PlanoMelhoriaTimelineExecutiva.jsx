import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, Zap } from "lucide-react";

export default function PlanoMelhoriaTimelineExecutiva() {
  const timeline = [
    {
      data: "30 Mai 2026",
      evento: "Sincronização Grupo ↔ Empresa",
      tipo: "milestone",
      prioridade: "Crítica",
    },
    {
      data: "15 Jun 2026",
      evento: "Finalizar Ciclo 20 — Todos os Módulos",
      tipo: "release",
      prioridade: "Alta",
    },
    {
      data: "20 Jun 2026",
      evento: "Iniciar Ciclo 21 — IA Avançada",
      tipo: "milestone",
      prioridade: "Alta",
    },
    {
      data: "01 Jul 2026",
      evento: "Certificação ISO 27001",
      tipo: "compliance",
      prioridade: "Alta",
    },
    {
      data: "15 Jul 2026",
      evento: "Lançamento Mobile App",
      tipo: "release",
      prioridade: "Média",
    },
  ];

  const getIconByType = (type) => {
    const map = {
      milestone: <Flag className="w-3.5 h-3.5 text-purple-600" />,
      release: <Zap className="w-3.5 h-3.5 text-green-600" />,
      compliance: <Calendar className="w-3.5 h-3.5 text-blue-600" />,
    };
    return map[type];
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          Timeline Executiva
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 relative">
          {/* Linha vertical */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />

          {timeline.map((item, idx) => (
            <div key={idx} className="relative pl-10">
              {/* Ponto na timeline */}
              <div className="absolute left-0 top-1 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                {getIconByType(item.tipo)}
              </div>

              {/* Conteúdo */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{item.data}</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{item.evento}</p>
                  </div>
                  <Badge
                    className={`text-[10px] flex-shrink-0 ${
                      item.prioridade === "Crítica"
                        ? "bg-red-100 text-red-700"
                        : item.prioridade === "Alta"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.prioridade}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-slate-600 bg-blue-50 p-2 rounded">
          📅 <strong>Próximo:</strong> Revisar status em 25/Mai — ajustes finais antes do milestone crítico
        </div>
      </CardContent>
    </Card>
  );
}