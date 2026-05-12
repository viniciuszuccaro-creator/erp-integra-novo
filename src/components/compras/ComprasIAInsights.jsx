import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ComprasIAInsights({ fornecedores = [], ordensCompra = [], solicitacoes = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  // Análise local
  const pendentes = solicitacoes.filter(s => s.status === 'Pendente').length;
  const atrasadas = ordensCompra.filter(o => {
    if (!o.data_entrega_prevista || o.status === 'Recebida' || o.status === 'Cancelada') return false;
    return new Date(o.data_entrega_prevista) < new Date();
  }).length;
  const fornAtivos = fornecedores.filter(f => f.status === 'Ativo').length;
  const totalValorAberto = ordensCompra
    .filter(o => !['Recebida', 'Cancelada'].includes(o.status))
    .reduce((s, o) => s + (o.valor_total || 0), 0);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const resumo = {
        pendentes,
        atrasadas,
        fornecedores_ativos: fornAtivos,
        valor_em_aberto: totalValorAberto,
        top_fornecedores: fornecedores.slice(0, 5).map(f => ({ nome: f.nome, nota: f.nota_media }))
      };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados de compras/suprimentos e forneça 3 insights práticos em português: ${JSON.stringify(resumo)}`,
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
                  prioridade: { type: "string", enum: ["alta", "media", "baixa"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", acao: "", prioridade: "baixa" }]);
    }
    setLoading(false);
  };

  const prColor = { alta: "text-red-600 bg-red-50 border-red-200", media: "text-amber-700 bg-amber-50 border-amber-200", baixa: "text-slate-600 bg-slate-50 border-slate-200" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Suprimentos
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Gerar Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Alertas locais */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-600 font-semibold">{pendentes}</p>
            <p className="text-xs text-orange-700">Solicitações pendentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-600 font-semibold">{atrasadas}</p>
            <p className="text-xs text-red-700">OCs atrasadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold">R$ {(totalValorAberto / 1000).toFixed(0)}k</p>
            <p className="text-xs text-blue-700">Em aberto</p>
          </div>
        </div>

        {/* IA Insights */}
        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${prColor[i.prioridade] || prColor.baixa}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs ${i.prioridade === 'alta' ? 'bg-red-100 text-red-700' : i.prioridade === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{i.prioridade}</Badge>
              <span className="text-xs font-semibold">{i.titulo}</span>
            </div>
            <p className="text-xs">{i.descricao}</p>
            {i.acao && <p className="text-xs font-medium mt-1 opacity-80">→ {i.acao}</p>}
          </div>
        ))}
        {!insights && <p className="text-xs text-slate-400 text-center py-2">Clique em "Gerar Insights" para análise com IA</p>}
      </CardContent>
    </Card>
  );
}