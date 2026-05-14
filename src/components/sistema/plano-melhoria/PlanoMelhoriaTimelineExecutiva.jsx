import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, CheckCircle2 } from "lucide-react";

export default function PlanoMelhoriaTimelineExecutiva() {
  const timeline = [
    {
      data: "28 Mai",
      evento: "Sincronização Grupo — Resolução",
      tipo: "Bloqueador",
      status: "critical",
    },
    {
      data: "31 Mai",
      evento: "Performance Logística — Deploy",
      tipo: "Milestone",
      status: "progress",
    },
    {
      data: "02 Jun",
      evento: "Ciclo 21 — Release Candidato",
      tipo: "Release",
      status: "progress",
    },
    {
      data: "05 Jun",
      evento: "UAT — Validação Completa",
      tipo: "Validação",
      status: "pending",
    },
    {
      data: "09 Jun",
      evento: "Produção — Go-Live V21.5",
      tipo: "Deploy",
      status: "pending",
    },
  ];

  const getColor = (status) => {
    const map = {
      critical: "bg-red-100 text-red-700",
      progress: "bg-blue-100 text-blue-700",
      pending: "bg-slate-100 text-slate-700",
      done: "bg-green-100 text-green-700",
    };
    return map[status] || "";
  };

  const getIcon = (status) => {
    if (status === "done") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "critical") return <Flag className="w-5 h-5 text-red-600" />;
    return <Calendar className="w-5 h-5 text-slate-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          Timeline Executiva — Próximas 3 Semanas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative space-y-4">
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                {getIcon(item.status)}
                {i < timeline.length - 1 && <div className="w-0.5 h-12 bg-slate-300 my-2" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-slate-900">{item.data}</p>
                  <Badge className={`text-[10px] ${getColor(item.status)}`}>{item.tipo}</Badge>
                </div>
                <p className="text-sm text-slate-700">{item.evento}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t bg-blue-50 p-3 rounded">
          <p className="text-xs text-blue-900">
            <strong>Nota Executiva:</strong> Release V21.5 agendada para 09 Jun com validação UAT em produção homolog em 05 Jun.
            Sincronização Grupo é o gargalo crítico.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}