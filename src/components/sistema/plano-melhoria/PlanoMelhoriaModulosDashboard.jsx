import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle2 } from "lucide-react";

export default function PlanoMelhoriaModulosDashboard() {
  const modulos = [
    { nome: "Comercial", progress: 95, status: "Finalização", cor: "bg-blue-500" },
    { nome: "Financeiro", progress: 88, status: "Beta", cor: "bg-green-500" },
    { nome: "Estoque", progress: 92, status: "Testes", cor: "bg-blue-500" },
    { nome: "Logística", progress: 78, status: "Execução", cor: "bg-orange-500" },
    { nome: "RH", progress: 85, status: "Testes", cor: "bg-blue-500" },
    { nome: "Fiscal", progress: 70, status: "Desenvolvimento", cor: "bg-red-500" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-600" />
          Progresso por Módulo — V21.5
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {modulos.map((mod, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-slate-900">{mod.nome}</p>
                <Badge className={`text-[10px] ${mod.cor} text-white`}>{mod.status}</Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${mod.cor} transition-all`}
                  style={{ width: `${mod.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-600">{mod.progress}% completo</span>
                {mod.progress === 95 && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-slate-600">Média Geral</p>
            <p className="text-lg font-bold text-slate-900">85%</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Críticos</p>
            <p className="text-lg font-bold text-red-600">2</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Prontos</p>
            <p className="text-lg font-bold text-green-600">1</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}