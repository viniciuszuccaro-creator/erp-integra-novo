import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, FileText, TrendingUp, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ContratosIAPanel({ contratos = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const hoje = new Date();
    const vigentes = contratos.filter(c => c.status === 'Vigente').length;
    const vencidos = contratos.filter(c => c.status === 'Vencido').length;
    const proxVencer = contratos.filter(c => {
      if (c.status !== 'Vigente' || !c.data_fim) return false;
      const dias = Math.floor((new Date(c.data_fim) - hoje) / 86400000);
      return dias <= 60 && dias > 0;
    }).length;
    const valorMensal = contratos.filter(c => c.status === 'Vigente').reduce((s, c) => s + (c.valor_mensal || 0), 0);
    const semRenovacao = contratos.filter(c => c.status === 'Vigente' && !c.renovacao_automatica).length;
    return { vigentes, vencidos, proxVencer, valorMensal, semRenovacao, total: contratos.length };
  }, [contratos]);

  const analisar = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta carteira de contratos e forneça 3 insights estratégicos com ações recomendadas em português: ${JSON.stringify(stats)}`,
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
                  acao: { type: "string" },
                  risco: { type: "string", enum: ["alto", "medio", "baixo"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", acao: "", risco: "baixo" }]);
    }
    setLoading(false);
  };

  const cor = { alto: "bg-red-50 border-red-200 text-red-800", medio: "bg-amber-50 border-amber-200 text-amber-800", baixo: "bg-blue-50 border-blue-200 text-blue-800" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Contratos
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisar} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Analisar Carteira"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-bold text-green-700">{stats.vigentes}</p>
            <p className="text-xs text-green-600">Vigentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700">R$ {(stats.valorMensal / 1000).toFixed(0)}k</p>
            <p className="text-xs text-emerald-600">Receita/mês</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.proxVencer}</p>
            <p className="text-xs text-orange-600">Venc. em 60d</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.vencidos}</p>
            <p className="text-xs text-red-600">Vencidos</p>
          </div>
        </div>
        {(stats.proxVencer > 0 || stats.semRenovacao > 0) && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              {stats.proxVencer > 0 && `${stats.proxVencer} contrato(s) vencem em 60 dias. `}
              {stats.semRenovacao > 0 && `${stats.semRenovacao} sem renovação automática.`}
            </p>
          </div>
        )}
        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${cor[i.risco] || cor.baixo}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
            {i.acao && <p className="text-xs font-medium mt-1 opacity-80">→ {i.acao}</p>}
          </div>
        ))}
        {!insights && stats.proxVencer === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Analisar Carteira" para insights estratégicos</p>
        )}
      </CardContent>
    </Card>
  );
}