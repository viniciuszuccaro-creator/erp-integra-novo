import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Zap, Target } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  const confianca = data?.confianca ?? data?.score_confianca ?? null;

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-blue-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            IA — Insights Executivos
          </CardTitle>
          <div className="flex items-center gap-2">
            {confianca != null && (
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-violet-400" />
                <Progress value={confianca} className="w-16 h-1.5" />
                <span className="text-[10px] text-slate-400">{confianca}%</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-violet-500' : 'text-slate-400'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-7 bg-white/60 rounded animate-pulse" />)}
          </div>
        ) : sugestoes.length > 0 ? (
          <ol className="space-y-1.5">
            {sugestoes.slice(0, 5).map((s, i) => {
              const text = typeof s === 'string' ? s : (s?.texto || s?.descricao || s?.sugestao || JSON.stringify(s));
              const tipo = typeof s === 'object' ? (s?.tipo || 'insight') : 'insight';
              const prioridade = typeof s === 'object' ? (s?.prioridade || '') : '';
              const IconMap = { alerta: AlertTriangle, tendencia: TrendingUp, insight: Lightbulb, acao: Zap };
              const Icon = IconMap[tipo] || Lightbulb;
              const colorMap = { alerta: 'text-amber-500', tendencia: 'text-emerald-500', insight: 'text-violet-500', acao: 'text-blue-500' };
              const bgMap  = { alerta: 'border-l-2 border-amber-300', tendencia: 'border-l-2 border-emerald-300', insight: '', acao: 'border-l-2 border-blue-300' };
              return (
                <li key={i} className={`flex items-start gap-2 bg-white/70 rounded-lg px-3 py-2 ${bgMap[tipo] || ''}`}>
                  <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${colorMap[tipo] || 'text-violet-500'}`} />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-slate-700 leading-relaxed">{text}</span>
                    {prioridade && (
                      <Badge className={`ml-2 text-[9px] align-middle ${prioridade === 'alta' ? 'bg-red-100 text-red-700' : prioridade === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {prioridade}
                      </Badge>
                    )}
                  </div>
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