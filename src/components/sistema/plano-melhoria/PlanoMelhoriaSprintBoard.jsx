import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ciclo22Items } from "@/components/sistema/plano-melhoria/melhoriaPlanData";
import { Kanban } from "lucide-react";

export default function PlanoMelhoriaSprintBoard() {
  const groupedByStatus = {
    planejado: ciclo22Items.filter((i) => i.status === "planejado"),
    em_andamento: ciclo22Items.filter((i) => i.status === "em_andamento" || i.status === "em_execucao"),
    concluido: ciclo22Items.filter((i) => i.status === "concluido"),
  };

  const columnConfig = [
    { key: "planejado", title: "📋 Planejado", color: "bg-slate-50 border-slate-200" },
    { key: "em_andamento", title: "⚙️ Em Andamento", color: "bg-blue-50 border-blue-200" },
    { key: "concluido", title: "✅ Concluído", color: "bg-green-50 border-green-200" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Kanban className="w-4 h-4 text-purple-600" />
          Kanban — Ciclo 22
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {columnConfig.map((col) => (
            <div
              key={col.key}
              className={`rounded-xl border-2 ${col.color} p-3 min-h-64`}
            >
              <h3 className="font-semibold text-xs text-slate-700 mb-3 flex items-center justify-between">
                {col.title}
                <Badge className="bg-slate-200 text-slate-700 text-[10px]">
                  {groupedByStatus[col.key].length}
                </Badge>
              </h3>
              <div className="space-y-2">
                {groupedByStatus[col.key].map((item) => (
                  <div key={item.id} className="bg-white p-2 rounded-lg border border-slate-200 text-xs hover:shadow-md transition">
                    <p className="font-medium text-slate-800 truncate">{item.titulo}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{item.modulo}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}