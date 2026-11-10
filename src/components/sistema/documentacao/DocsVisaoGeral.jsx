import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { melhoriasCriticas, statusResumo } from "./documentacaoData";

const kpiCores = [
  "bg-blue-50 border-blue-200 text-blue-600",
  "bg-purple-50 border-purple-200 text-purple-600",
  "bg-green-50 border-green-200 text-green-600",
  "bg-orange-50 border-orange-200 text-orange-600",
];

export default function DocsVisaoGeral() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle>ERP Zuccaro V22.1 — Sistema Completo e Estável</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusResumo.map((item, i) => (
              <div key={item.label} className={`p-4 border rounded-lg text-center ${kpiCores[i % kpiCores.length]}`}>
                <p className="text-3xl font-bold">{item.valor}</p>
                <p className="text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>

          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <AlertDescription>
              Documentação estabilizada para evitar o loop de arquivos inválidos no build.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Melhorias Críticas Implementadas</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {melhoriasCriticas.map((item) => (
              <div key={item.id} className="p-4 bg-white border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm text-slate-900">{item.titulo}</p>
                  <Badge className="bg-green-600 text-white shrink-0">{item.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.detalhes}</p>
                <p className="text-[11px] text-slate-400 mt-2">Prioridade: {item.prioridade} · {item.tempo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}