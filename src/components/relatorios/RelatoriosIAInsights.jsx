import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RelatoriosIAInsights({ pedidos = [], contas = [], empresaAtual }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const resumo = {
    total_pedidos: pedidos.length,
    pedidos_faturados: pedidos.filter(p => p.status === 'Faturado').length,
    receita_total: pedidos.filter(p => p.status === 'Faturado').reduce((s, p) => s + (p.valor_total || 0), 0),
    contas_atrasadas: contas.filter(c => c.status === 'Atrasado').length,
    empresa: empresaAtual?.nome_fantasia || 'Empresa'
  };

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um analista de dados ERP. Com base nestes dados de relatório, forneça 4 insights executivos em português, incluindo tendências e recomendações: ${JSON.stringify(resumo)}`,
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
                  tendencia: { type: "string", enum: ["positiva", "negativa", "neutra"] },
                  recomendacao: { type: "string" }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", tendencia: "neutra", recomendacao: "" }]);
    }
    setLoading(false);
  };

  const tendIcon = { positiva: TrendingUp, negativa: TrendingDown, neutra: AlertTriangle };
  const tendColor = { positiva: "bg-emerald-50 border-emerald-200 text-emerald-800", negativa: "bg-red-50 border-red-200 text-red-800", neutra: "bg-slate-50 border-slate-200 text-slate-700" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Insights IA
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Gerando..." : "Gerar Análise"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{resumo.total_pedidos}</p>
            <p className="text-xs text-blue-600">Pedidos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">R$ {(resumo.receita_total / 1000).toFixed(0)}k</p>
            <p className="text-xs text-green-600">Receita</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{resumo.contas_atrasadas}</p>
            <p className="text-xs text-red-600">Atrasados</p>
          </div>
        </div>

        {insights ? (
          <div className="space-y-2">
            {insights.map((i, idx) => {
              const Icon = tendIcon[i.tendencia] || AlertTriangle;
              return (
                <div key={idx} className={`p-2 rounded-lg border ${tendColor[i.tendencia] || tendColor.neutra}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold">{i.titulo}</span>
                  </div>
                  <p className="text-xs ml-5">{i.descricao}</p>
                  {i.recomendacao && <p className="text-xs ml-5 mt-1 font-medium opacity-75">→ {i.recomendacao}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Gerar Análise" para insights executivos</p>
        )}
      </CardContent>
    </Card>
  );
}