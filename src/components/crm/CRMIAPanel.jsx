import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Target, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CRMIAPanel({ oportunidades = [], clientes = [], interacoes = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const abertas = oportunidades.filter(o => !["Fechado Ganho","Fechado Perdido"].includes(o.estagio)).length;
    const ganhas = oportunidades.filter(o => o.estagio === "Fechado Ganho").length;
    const perdidas = oportunidades.filter(o => o.estagio === "Fechado Perdido").length;
    const pipeline = oportunidades.filter(o => !["Fechado Ganho","Fechado Perdido"].includes(o.estagio)).reduce((s, o) => s + (o.valor || 0), 0);
    const taxa = (abertas + ganhas + perdidas) > 0 ? Math.round((ganhas / (ganhas + perdidas || 1)) * 100) : 0;
    const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
    return { abertas, ganhas, perdidas, pipeline, taxa, clientesAtivos, totalInteracoes: interacoes.length };
  }, [oportunidades, clientes, interacoes]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em CRM e vendas. Analise estes dados de pipeline e CRM e forneça 4 insights estratégicos em português para aumentar conversões: ${JSON.stringify(stats)}`,
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
                  tipo: { type: "string", enum: ["oportunidade", "alerta", "dica"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", acao: "", tipo: "dica" }]);
    }
    setLoading(false);
  };

  const tipoColor = {
    oportunidade: "bg-emerald-50 border-emerald-200 text-emerald-800",
    alerta: "bg-red-50 border-red-200 text-red-800",
    dica: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA CRM & Pipeline
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Analisar Pipeline"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{stats.abertas}</p>
            <p className="text-xs text-blue-600">Em aberto</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs font-bold text-green-700">R$ {(stats.pipeline / 1000).toFixed(0)}k</p>
            <p className="text-xs text-green-600">Pipeline</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm font-bold text-purple-700">{stats.taxa}%</p>
            <p className="text-xs text-purple-600">Conversão</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-slate-700">{stats.clientesAtivos}</p>
            <p className="text-xs text-slate-600">Clientes ativos</p>
          </div>
        </div>

        {stats.perdidas > stats.ganhas && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-800">Taxa de perda alta: {stats.perdidas} oportunidades perdidas vs {stats.ganhas} ganhas</p>
          </div>
        )}

        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${tipoColor[i.tipo] || tipoColor.dica}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className="text-xs">{i.tipo}</Badge>
              <span className="text-xs font-semibold">{i.titulo}</span>
            </div>
            <p className="text-xs">{i.descricao}</p>
            {i.acao && <p className="text-xs font-medium mt-1 opacity-80">→ {i.acao}</p>}
          </div>
        ))}

        {!insights && stats.perdidas <= stats.ganhas && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Analisar Pipeline" para insights estratégicos</p>
        )}
      </CardContent>
    </Card>
  );
}