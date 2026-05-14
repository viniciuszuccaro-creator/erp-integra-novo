import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, BarChart3 } from "lucide-react";

export default function PlanoMelhoriaIACockpit() {
  const iaMetrics = [
    { nome: "Previsão de Conclusão", valor: "15 Junho", confianca: 92 },
    { nome: "Risco de Atraso", valor: "8%", confianca: 78 },
    { nome: "Qualidade do Código", valor: "94%", confianca: 88 },
    { nome: "Performance Index", valor: "87/100", confianca: 85 },
  ];

  const recommendations = [
    "Aumentar alocação em Sincronização Grupo (bloqueador crítico)",
    "Revisar testes de integração antes de Mar 30",
    "Considerar paralelização de tarefas de Logística",
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          IA Cockpit — Insights & Previsões
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {iaMetrics.map((metric, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">{metric.nome}</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">{metric.valor}</p>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-6 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${metric.confianca}%` }}
                    />
                  </div>
                  <span className="text-slate-500">{metric.confianca}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recomendações */}
        <div className="border-t pt-3">
          <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Recomendações IA
          </h4>
          <ul className="space-y-1.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cards de Análise */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="bg-blue-50 p-2 rounded text-center">
            <p className="text-[10px] text-slate-600">Ciclos Completos</p>
            <p className="font-bold text-blue-700">20 de 25</p>
          </div>
          <div className="bg-green-50 p-2 rounded text-center">
            <p className="text-[10px] text-slate-600">Taxa Sucesso</p>
            <p className="font-bold text-green-700">96%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}