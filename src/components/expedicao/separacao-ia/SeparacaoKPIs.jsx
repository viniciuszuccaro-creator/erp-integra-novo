import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, AlertTriangle } from "lucide-react";

export default function SeparacaoKPIs({ desempenho, divergenciasCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Velocidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold">{desempenho.itensPorHora}</span>
            <span className="text-sm text-slate-600">itens/h</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Acurácia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold">{desempenho.acuracia}%</span>
            <Badge variant={desempenho.acuracia === 100 ? "default" : "secondary"}>
              {desempenho.acuracia === 100 ? "Perfeito!" : "Bom"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Divergências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-5 h-5 ${divergenciasCount === 0 ? "text-green-600" : "text-red-600"}`}
            />
            <span className="text-2xl font-bold">{divergenciasCount}</span>
            <span className="text-sm text-slate-600">detectadas</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}