import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Plus } from "lucide-react";

export default function PlanoMelhoriaLiveBacklog() {
  const backlog = [
    { id: 1, titulo: "API RESTful Completa", prioridade: "Alta", estimativa: "40h" },
    { id: 2, titulo: "Dashboard Executivo IA", prioridade: "Alta", estimativa: "32h" },
    { id: 3, titulo: "Webhooks & Automações", prioridade: "Média", estimativa: "24h" },
    { id: 4, titulo: "Mobile App Nativa", prioridade: "Média", estimativa: "80h" },
    { id: 5, titulo: "Análise Preditiva Avançada", prioridade: "Baixa", estimativa: "56h" },
    { id: 6, titulo: "Compliance ISO 27001", prioridade: "Alta", estimativa: "48h" },
    { id: 7, titulo: "Blockchain para Auditoria", prioridade: "Baixa", estimativa: "64h" },
  ];

  const getPrioBadge = (p) => {
    const map = {
      Alta: "bg-red-100 text-red-700",
      Média: "bg-amber-100 text-amber-700",
      Baixa: "bg-green-100 text-green-700",
    };
    return map[p] || "";
  };

  const totalHoras = backlog.reduce((sum, item) => sum + parseInt(item.estimativa), 0);

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            Backlog Vivo
          </span>
          <Badge className="bg-slate-100 text-slate-700 text-xs">{backlog.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {backlog.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.titulo}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Badge className={`text-xs ${getPrioBadge(item.prioridade)}`}>
                  {item.prioridade}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.estimativa}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Total estimado:</span>
            <strong>{totalHoras}h</strong>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Plus className="w-3 h-3" />
            <span>Adicionar novo item ao backlog</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}