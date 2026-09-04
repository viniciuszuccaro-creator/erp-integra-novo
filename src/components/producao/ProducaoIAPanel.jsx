import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProducaoIAPanel({ ordensProducao = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const emProd = ordensProducao.filter(op => ["Em Corte","Em Dobra","Em Montagem"].includes(op.status)).length;
    const atrasadas = ordensProducao.filter(op => {
      if (!op.data_previsao_conclusao) return false;
      return new Date(op.data_previsao_conclusao) < new Date() && op.status !== "Concluída" && op.status !== "Cancelada";
    }).length;
    const finalizadas = ordensProducao.filter(op => op.status === "Concluída").length;
    const canceladas = ordensProducao.filter(op => op.status === "Cancelada").length;
    const eficiencia = ordensProducao.length > 0 ? Math.round((finalizadas / ordensProducao.length) * 100) : 0;
    return { emProd, atrasadas, finalizadas, canceladas, eficiencia, total: ordensProducao.length };
  }, [ordensProducao]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados de produção fabril e forneça 3 insights práticos e acionáveis em português: ${JSON.stringify(stats)}`,
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
                  acao_sugerida: { type: "string" },
                  prioridade: { type: "string", enum: ["critica", "alta", "media"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", acao_sugerida: "", prioridade: "media" }]);
    }
    setLoading(false);
  };

  const prColor = {
    critica: "bg-red-50 border-red-200 text-red-800",
    alta: "bg-orange-50 border-orange-200 text-orange-800",
    media: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Produção
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Diagnosticar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{stats.emProd}</p>
            <p className="text-xs text-blue-600">Em produção</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.atrasadas}</p>
            <p className="text-xs text-red-600">Atrasadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">{stats.finalizadas}</p>
            <p className="text-xs text-green-600">Finalizadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm font-bold text-purple-700">{stats.eficiencia}%</p>
            <p className="text-xs text-purple-600">Eficiência</p>
          </div>
        </div>

        {stats.atrasadas > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800">{stats.atrasadas} OP(s) com prazo vencido — revisar prioridades</p>
          </div>
        )}

        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${prColor[i.prioridade] || prColor.media}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
            {i.acao_sugerida && <p className="text-xs font-medium mt-1 opacity-75">→ {i.acao_sugerida}</p>}
          </div>
        ))}

        {!insights && stats.atrasadas === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Diagnosticar" para análise IA da produção</p>
        )}
      </CardContent>
    </Card>
  );
}