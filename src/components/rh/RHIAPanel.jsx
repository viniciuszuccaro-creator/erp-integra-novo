import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Users, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RHIAPanel({ colaboradores = [], pontos = [], ferias = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const ativos = colaboradores.filter(c => c.status === 'Ativo').length;
    const afastados = colaboradores.filter(c => c.status === 'Afastado').length;
    const feriasPend = ferias.filter(f => f.status === 'Solicitada').length;
    const pontosHoje = pontos.filter(p => {
      const d = new Date(p.data);
      return d.toDateString() === new Date().toDateString();
    }).length;
    return { ativos, afastados, feriasPend, pontosHoje };
  }, [colaboradores, pontos, ferias]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados de RH e dê 3 insights práticos em português: ${JSON.stringify(stats)}`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  prioridade: { type: "string", enum: ["alta", "media", "baixa"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", prioridade: "baixa" }]);
    }
    setLoading(false);
  };

  const prColor = {
    alta: "bg-red-50 border-red-200 text-red-800",
    media: "bg-amber-50 border-amber-200 text-amber-800",
    baixa: "bg-slate-50 border-slate-200 text-slate-700"
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Recursos Humanos
          </CardTitle>
          <Button data-permission="RH.RHIA.gerar" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Gerar Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm font-bold text-purple-700">{stats.ativos}</p>
            <p className="text-xs text-purple-600">Ativos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.afastados}</p>
            <p className="text-xs text-orange-600">Afastados</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{stats.feriasPend}</p>
            <p className="text-xs text-blue-600">Férias pend.</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">{stats.pontosHoje}</p>
            <p className="text-xs text-green-600">Pontos hoje</p>
          </div>
        </div>

        {stats.feriasPend > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">{stats.feriasPend} solicitação(ões) de férias aguardando aprovação</p>
          </div>
        )}

        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${prColor[i.prioridade] || prColor.baixa}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
          </div>
        ))}

        {!insights && stats.feriasPend === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Gerar Insights" para análise IA do RH</p>
        )}
      </CardContent>
    </Card>
  );
}