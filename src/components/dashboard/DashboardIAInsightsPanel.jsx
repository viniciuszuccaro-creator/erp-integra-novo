import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Button } from "@/components/ui/button";

export default function DashboardIAInsightsPanel() {
  const { empresaAtual, grupoAtual, getFiltroContexto, estaNoGrupo } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ia-insights-dashboard', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 600000,
    queryFn: async () => {
      const filtros = getFiltroContexto?.('empresa_id', true) || {};
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        modulo: 'Dashboard',
        contexto: 'painel executivo com KPIs de vendas, financeiro, estoque e entregas',
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        filtros,
      });
      return res?.data;
    },
  });

  const sugestoes = data?.sugestoes || data?.insights || data?.acoes || [];

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-blue-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            IA — Insights Executivos
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-violet-500' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-7 bg-white/60 rounded animate-pulse" />
            ))}
          </div>
        ) : sugestoes.length > 0 ? (
          <ol className="space-y-2">
            {sugestoes.slice(0, 5).map((s, i) => {
              const text = typeof s === 'string' ? s : (s?.texto || s?.descricao || s?.sugestao || JSON.stringify(s));
              const tipo = typeof s === 'object' ? (s?.tipo || 'insight') : 'insight';
              const IconMap = { alerta: AlertTriangle, tendencia: TrendingUp, insight: Lightbulb };
              const Icon = IconMap[tipo] || Lightbulb;
              const colorMap = { alerta: 'text-amber-500', tendencia: 'text-emerald-500', insight: 'text-violet-500' };
              return (
                <li key={i} className="flex items-start gap-2 bg-white/70 rounded-lg px-3 py-2">
                  <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${colorMap[tipo] || 'text-violet-500'}`} />
                  <span className="text-xs text-slate-700 leading-relaxed">{text}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">Clique em atualizar para gerar insights.</p>
        )}
      </CardContent>
    </Card>
  );
}