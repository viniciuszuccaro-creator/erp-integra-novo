import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, Truck, TrendingUp, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ExpedicaoIAPanel({ entregas = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const transito = entregas.filter(e => ["Em Trânsito","Saiu para Entrega"].includes(e.status)).length;
    const frustradas = entregas.filter(e => e.status === "Entrega Frustrada").length;
    const entregues = entregas.filter(e => e.status === "Entregue").length;
    const aguardando = entregas.filter(e => e.status === "Aguardando Separação").length;
    const taxa = entregas.length > 0 ? Math.round((entregues / entregas.length) * 100) : 0;
    return { transito, frustradas, entregues, aguardando, taxa, total: entregas.length };
  }, [entregas]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados logísticos de expedição e forneça 3 insights práticos para melhorar a eficiência de entrega em português: ${JSON.stringify(stats)}`,
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
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Expedição
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Otimizar Rotas IA"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{stats.transito}</p>
            <p className="text-xs text-blue-600">Em trânsito</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">{stats.taxa}%</p>
            <p className="text-xs text-green-600">Taxa entrega</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.frustradas}</p>
            <p className="text-xs text-red-600">Frustradas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.aguardando}</p>
            <p className="text-xs text-orange-600">Aguardando</p>
          </div>
        </div>

        {stats.frustradas > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800">{stats.frustradas} entrega(s) frustrada(s) — requer ação imediata</p>
          </div>
        )}

        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${prColor[i.prioridade] || prColor.baixa}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
          </div>
        ))}

        {!insights && stats.frustradas === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Otimizar Rotas IA" para análise inteligente</p>
        )}
      </CardContent>
    </Card>
  );
}