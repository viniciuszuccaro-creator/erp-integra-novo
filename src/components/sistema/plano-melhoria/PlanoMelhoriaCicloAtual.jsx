import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ciclo23Items } from "@/components/sistema/plano-melhoria/melhoriaPlanData";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PlanoMelhoriaCicloAtual() {
  const concluidos = ciclo23Items.filter((i) => i.status === "concluido").length;
  const emAndamento = ciclo23Items.filter((i) => i.status === "em_andamento" || i.status === "em_execucao").length;
  const planejado = ciclo23Items.filter((i) => i.status === "planejado" || i.status === "bloqueado_creditos").length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "concluido":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "em_andamento":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      concluido: "bg-green-100 text-green-700",
      em_andamento: "bg-blue-100 text-blue-700",
      planejado: "bg-slate-100 text-slate-700",
    };
    return map[status] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>Itens do Ciclo 23 — Junho/Julho 2026</span>
          <span className="text-xs font-normal text-slate-500">
            {concluidos} de {ciclo23Items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-4 text-xs">
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {concluidos} Concluído
          </Badge>
          <Badge className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            {emAndamento} Em Andamento
          </Badge>
          <Badge className="bg-slate-100 text-slate-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            {planejado} Planejado
          </Badge>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ciclo23Items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
            >
              {getStatusIcon(item.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.titulo}</p>
                <p className="text-xs text-slate-500">{item.modulo}</p>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${getStatusBadge(item.status)}`}>
                {item.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}