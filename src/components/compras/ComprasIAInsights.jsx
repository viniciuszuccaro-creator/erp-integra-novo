import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle, Package, TrendingDown, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ComprasIAInsights({ fornecedores = [], ordensCompra = [], solicitacoes = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const ativos = fornecedores.filter(f => f.status === 'Ativo').length;
    const bloqueados = fornecedores.filter(f => f.status_fornecedor === 'Bloqueado').length;
    const ocPendentes = ordensCompra.filter(o => ['Solicitada','Aprovada'].includes(o.status)).length;
    const solPendentes = solicitacoes.filter(s => s.status === 'Pendente').length;
    const valorTotal = ordensCompra.filter(o => o.status !== 'Cancelada').reduce((s, o) => s + (o.valor_total || 0), 0);
    const atrasadas = ordensCompra.filter(o => {
      if (!o.data_entrega_prevista || o.status === 'Recebida' || o.status === 'Cancelada') return false;
      return new Date(o.data_entrega_prevista) < new Date();
    }).length;
    return { ativos, bloqueados, ocPendentes, solPendentes, valorTotal, atrasadas };
  }, [fornecedores, ordensCompra, solicitacoes]);

  const analisar = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise estes dados de compras e suprimentos e forneça 3 insights acionáveis para otimizar a cadeia de fornecimento em português: ${JSON.stringify(stats)}`,
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
                  impacto: { type: "string", enum: ["alto", "medio", "baixo"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", impacto: "baixo" }]);
    }
    setLoading(false);
  };

  const cor = { alto: "bg-red-50 border-red-200 text-red-800", medio: "bg-amber-50 border-amber-200 text-amber-800", baixo: "bg-blue-50 border-blue-200 text-blue-800" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Compras
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisar} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Otimizar Suprimentos"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-cyan-50 border border-cyan-200">
            <p className="text-sm font-bold text-cyan-700">{stats.ativos}</p>
            <p className="text-xs text-cyan-600">Fornecedores ativos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-bold text-amber-700">{stats.ocPendentes}</p>
            <p className="text-xs text-amber-600">OCs pendentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.solPendentes}</p>
            <p className="text-xs text-orange-600">Sol. pendentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.atrasadas}</p>
            <p className="text-xs text-red-600">OCs atrasadas</p>
          </div>
        </div>
        {(stats.atrasadas > 0 || stats.bloqueados > 0) && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-800">
              {stats.atrasadas > 0 && `${stats.atrasadas} OC(s) atrasadas. `}
              {stats.bloqueados > 0 && `${stats.bloqueados} fornecedor(es) bloqueado(s).`}
            </p>
          </div>
        )}
        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${cor[i.impacto] || cor.baixo}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
          </div>
        ))}
        {!insights && stats.atrasadas === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Otimizar Suprimentos" para análise IA</p>
        )}
      </CardContent>
    </Card>
  );
}