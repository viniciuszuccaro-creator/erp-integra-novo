import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoadmapFuturo from "@/components/sistema/RoadmapFuturo";
import { melhoriasFuturas } from "./documentacaoData";

export default function DocsRoadmapBacklog() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Backlog de Melhorias Planejadas</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {melhoriasFuturas.map((item) => (
              <div key={item.id} className="p-4 bg-white border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm text-slate-900">{item.titulo}</p>
                  <div className="flex gap-1 shrink-0">
                    <Badge className="bg-slate-700 text-white">{item.versao}</Badge>
                    <Badge variant="secondary">{item.trimestre}</Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.detalhes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <RoadmapFuturo />
    </div>
  );
}