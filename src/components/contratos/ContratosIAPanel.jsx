import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ContratosIAPanel({ contratos = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const hoje = new Date();

  // Análise local sem IA
  const analise = React.useMemo(() => {
    const vigentes = contratos.filter(c => c.status === 'Vigente');
    const vencendo30 = vigentes.filter(c => {
      if (!c.data_fim) return false;
      const dias = Math.floor((new Date(c.data_fim) - hoje) / 86400000);
      return dias > 0 && dias <= 30;
    });
    const semRenovacao = vigentes.filter(c => !c.renovacao_automatica);
    const semCobranca = vigentes.filter(c => !c.gerar_cobranca_automatica);
    const valorRisco = vencendo30.reduce((s, c) => s + (c.valor_mensal || 0), 0);
    return { vencendo30, semRenovacao, semCobranca, valorRisco };
  }, [contratos]);

  const analisarComIA = async () => {
    setLoading(true);
    try {
      const resumo = contratos.slice(0, 20).map(c => ({
        numero: c.numero_contrato,
        status: c.status,
        valor: c.valor_mensal,
        vencimento: c.data_fim,
        renovacao_auto: c.renovacao_automatica,
      }));
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes contratos e dê 3 insights executivos em português (max 2 linhas cada): ${JSON.stringify(resumo)}`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, descricao: { type: "string" }, prioridade: { type: "string", enum: ["alta", "media", "baixa"] } } } }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Análise indisponível", descricao: "Tente novamente mais tarde.", prioridade: "baixa" }]);
    }
    setLoading(false);
  };

  const prioridadeColor = { alta: "bg-red-100 text-red-700", media: "bg-amber-100 text-amber-700", baixa: "bg-slate-100 text-slate-600" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Contratos
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisarComIA} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Analisar com IA"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Alertas locais */}
        {analise.vencendo30.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
            <Clock className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-orange-800">{analise.vencendo30.length} contrato(s) vencem em 30 dias</p>
              <p className="text-xs text-orange-700">Risco: R$ {analise.valorRisco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
            </div>
          </div>
        )}
        {analise.semRenovacao.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-800">{analise.semRenovacao.length} vigente(s) sem renovação automática configurada</p>
          </div>
        )}
        {analise.semCobranca.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">{analise.semCobranca.length} contrato(s) sem cobrança automática</p>
          </div>
        )}

        {/* Insights IA */}
        {insights && insights.map((i, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs ${prioridadeColor[i.prioridade] || prioridadeColor.baixa}`}>{i.prioridade}</Badge>
              <span className="text-xs font-semibold text-purple-900">{i.titulo}</span>
            </div>
            <p className="text-xs text-purple-800">{i.descricao}</p>
          </div>
        ))}

        {!insights && analise.vencendo30.length === 0 && analise.semRenovacao.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">Clique em "Analisar com IA" para gerar insights</p>
        )}
      </CardContent>
    </Card>
  );
}