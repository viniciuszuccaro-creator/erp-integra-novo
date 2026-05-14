import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function PlanoMelhoriaModulosDashboard() {
  const modulos = [
    { nome: "Comercial", progresso: 95, status: "finalizado", items: "47/47" },
    { nome: "Financeiro", progresso: 88, status: "andamento", items: "42/47" },
    { nome: "Estoque", progresso: 92, status: "andamento", items: "44/47" },
    { nome: "Compras", progresso: 85, status: "andamento", items: "40/47" },
    { nome: "RH", progresso: 78, status: "andamento", items: "37/47" },
    { nome: "Fiscal", progresso: 72, status: "andamento", items: "34/47" },
    { nome: "Logística", progresso: 65, status: "planejado", items: "31/47" },
    { nome: "CRM", progresso: 88, status: "andamento", items: "42/47" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "finalizado":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
      case "andamento":
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const mediaProgresso = Math.round(modulos.reduce((sum, m) => sum + m.progresso, 0) / modulos.length);

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-slate-600" />
            Status por Módulo
          </span>
          <Badge className="bg-slate-100 text-slate-700 text-xs">Média: {mediaProgresso}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modulos.map((modulo) => (
            <div key={modulo.nome} className="space-y-1.5 p-3 rounded-lg hover:bg-slate-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(modulo.status)}
                  <p className="font-semibold text-sm">{modulo.nome}</p>
                </div>
                <span className="text-xs text-slate-600 font-medium">{modulo.items}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressColor(modulo.progresso)}`}
                    style={{ width: `${modulo.progresso}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right">{modulo.progresso}%</span>
              </div>

              <Badge
                className={`text-[10px] ${
                  modulo.status === "finalizado"
                    ? "bg-green-100 text-green-700"
                    : modulo.status === "andamento"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {modulo.status === "finalizado"
                  ? "Finalizado"
                  : modulo.status === "andamento"
                  ? "Em Andamento"
                  : "Planejado"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-slate-600">
          <p>📊 {modulos.filter((m) => m.status === "finalizado").length} módulos finalizados</p>
          <p>{modulos.filter((m) => m.status === "andamento").length} em desenvolvimento</p>
        </div>
      </CardContent>
    </Card>
  );
}