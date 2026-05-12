import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FiscalIAPanel({ notas = [], empresaAtual }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => ({
    autorizadas: notas.filter(n => n.status === "Autorizada").length,
    rejeitadas: notas.filter(n => n.status === "Rejeitada").length,
    rascunho: notas.filter(n => n.status === "Rascunho").length,
    valorTotal: notas.filter(n => n.status === "Autorizada").reduce((s, n) => s + (n.valor_total || 0), 0),
  }), [notas]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados fiscais e aponte 3 riscos ou oportunidades em português (max 2 linhas cada): ${JSON.stringify({ ...stats, empresa: empresaAtual?.nome_fantasia || 'Empresa', total_notas: notas.length })}`,
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
                  tipo: { type: "string", enum: ["risco", "oportunidade", "alerta"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", tipo: "alerta" }]);
    }
    setLoading(false);
  };

  const tipoIcon = { risco: AlertTriangle, oportunidade: TrendingUp, alerta: AlertTriangle };
  const tipoColor = { risco: "text-red-600 bg-red-50 border-red-200", oportunidade: "text-emerald-700 bg-emerald-50 border-emerald-200", alerta: "text-amber-700 bg-amber-50 border-amber-200" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Fiscal
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Analisar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">{stats.autorizadas}</p>
            <p className="text-xs text-green-600">Autorizadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.rejeitadas}</p>
            <p className="text-xs text-red-600">Rejeitadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-slate-700">{stats.rascunho}</p>
            <p className="text-xs text-slate-600">Rascunho</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">R$ {(stats.valorTotal / 1000).toFixed(0)}k</p>
            <p className="text-xs text-blue-600">Faturado</p>
          </div>
        </div>

        {stats.rejeitadas > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800">{stats.rejeitadas} nota(s) rejeitada(s) — verificar SEFAZ</p>
          </div>
        )}

        {insights && insights.map((i, idx) => {
          const Icon = tipoIcon[i.tipo] || CheckCircle2;
          return (
            <div key={idx} className={`p-2 rounded-lg border ${tipoColor[i.tipo] || tipoColor.alerta}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-semibold">{i.titulo}</span>
              </div>
              <p className="text-xs ml-5">{i.descricao}</p>
            </div>
          );
        })}

        {!insights && stats.rejeitadas === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Analisar" para insights fiscais com IA</p>
        )}
      </CardContent>
    </Card>
  );
}