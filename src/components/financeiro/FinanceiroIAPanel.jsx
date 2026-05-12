import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FinanceiroIAPanel({ contasReceber = [], contasPagar = [], saldo = 0 }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const hoje = new Date();
    const vencidas = contasReceber.filter(c => c.status === 'Atrasado').length;
    const pagarVencidas = contasPagar.filter(c => c.status === 'Atrasado').length;
    const valorReceberPendente = contasReceber.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
    const valorPagarPendente = contasPagar.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
    return { vencidas, pagarVencidas, valorReceberPendente, valorPagarPendente, saldo };
  }, [contasReceber, contasPagar, saldo]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a saúde financeira desta empresa com base nos dados abaixo e forneça 3 insights executivos com recomendações práticas em português: ${JSON.stringify(stats)}`,
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
                  recomendacao: { type: "string" },
                  tendencia: { type: "string", enum: ["positiva", "negativa", "atencao"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", recomendacao: "", tendencia: "atencao" }]);
    }
    setLoading(false);
  };

  const tendColor = {
    positiva: "bg-emerald-50 border-emerald-200 text-emerald-800",
    negativa: "bg-red-50 border-red-200 text-red-800",
    atencao: "bg-amber-50 border-amber-200 text-amber-800"
  };
  const TendIcon = { positiva: TrendingUp, negativa: TrendingDown, atencao: AlertTriangle };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Financeiro
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Saúde Financeira IA"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs font-bold text-green-700">R$ {(stats.valorReceberPendente / 1000).toFixed(0)}k</p>
            <p className="text-xs text-green-600">A Receber</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs font-bold text-red-700">R$ {(stats.valorPagarPendente / 1000).toFixed(0)}k</p>
            <p className="text-xs text-red-600">A Pagar</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.vencidas}</p>
            <p className="text-xs text-orange-600">CR Vencidas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-sm font-bold text-rose-700">{stats.pagarVencidas}</p>
            <p className="text-xs text-rose-600">CP Vencidas</p>
          </div>
        </div>

        {(stats.vencidas > 0 || stats.pagarVencidas > 0) && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800">
              {stats.vencidas > 0 && `${stats.vencidas} título(s) a receber vencidos. `}
              {stats.pagarVencidas > 0 && `${stats.pagarVencidas} conta(s) a pagar vencidas.`}
            </p>
          </div>
        )}

        {insights && insights.map((i, idx) => {
          const Icon = TendIcon[i.tendencia] || AlertTriangle;
          return (
            <div key={idx} className={`p-2 rounded-lg border ${tendColor[i.tendencia] || tendColor.atencao}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-semibold">{i.titulo}</span>
              </div>
              <p className="text-xs ml-5">{i.descricao}</p>
              {i.recomendacao && <p className="text-xs ml-5 font-medium mt-1 opacity-80">→ {i.recomendacao}</p>}
            </div>
          );
        })}

        {!insights && stats.vencidas === 0 && stats.pagarVencidas === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Saúde Financeira IA" para análise completa</p>
        )}
      </CardContent>
    </Card>
  );
}