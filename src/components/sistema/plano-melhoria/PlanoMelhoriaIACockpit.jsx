import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Zap } from "lucide-react";

export default function PlanoMelhoriaIACockpit() {
  const insights = [
    { categoria: "Previsão Ciclo 21", valor: "92% confiança", acao: "Deploy previsto em 02 Jun" },
    { categoria: "Anomalias Detectadas", valor: "3 críticas", acao: "2 resolvidas, 1 pendente" },
    { categoria: "Otimização IA", valor: "Performance +15%", acao: "Cache Layer implementado" },
  ];

  const recommendations = [
    "Priorizar Sincronização Grupo (impacto: 5 módulos)",
    "Paralelizar testes — economiza 3 dias",
    "Implementar circuit breaker em Logística",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {insights.map((insight, i) => (
        <Card key={i} className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-purple-700">{insight.categoria}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-xl font-black text-purple-600 mb-2">{insight.valor}</p>
            <p className="text-xs text-slate-600">{insight.acao}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="md:col-span-3 border-purple-300">
        <CardHeader className="pb-3 border-b border-purple-200">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Recomendações IA — Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2">
                <span className="font-bold text-purple-600">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-700 font-semibold">
              <Zap className="w-3 h-3 inline mr-1" />
              Economia esperada: 5 dias de desenvolvimento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}