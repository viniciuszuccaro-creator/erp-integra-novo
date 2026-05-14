import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { melhoriaPlanPhases } from "@/components/sistema/plano-melhoria/melhoriaPlanData";
import { TrendingUp, Zap } from "lucide-react";

export default function PlanoMelhoriaVisaoGeral() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );

  return (
    <div className="w-full space-y-4">
      <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Progresso Geral</h3>
              <p className="text-sm text-slate-600 mt-1">
                Todas as fases do plano de melhoria V21.5
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-blue-600">{totalProgress}%</div>
              <Badge className="bg-blue-600 text-white mt-2">Sistema em Progresso</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {melhoriaPlanPhases.map((phase) => (
          <Card key={phase.id} className="w-full">
            <CardHeader className="border-b pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                {phase.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{phase.descricao}</span>
                  <Badge className="bg-slate-100 text-slate-700">{phase.progress}%</Badge>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {phase.tags &&
                    phase.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}