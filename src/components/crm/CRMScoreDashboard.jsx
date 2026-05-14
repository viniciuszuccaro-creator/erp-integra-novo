import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Button } from "@/components/ui/button";

export default function CRMScoreDashboard() {
  const { filterInContext, empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['crm-score-dash', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 300000,
    queryFn: () => filterInContext('Cliente', { status: 'Ativo' }, '-score_saude_cliente', 8),
  });

  const mediaScore = data.length ? Math.round(data.reduce((s, c) => s + (Number(c.score_saude_cliente) || 50), 0) / data.length) : 0;
  const emRisco = data.filter(c => c.risco_churn === 'Alto' || c.risco_churn === 'Crítico');
  const scoreColor = mediaScore >= 70 ? 'text-emerald-600' : mediaScore >= 50 ? 'text-amber-600' : 'text-red-600';

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            CRM — Score Clientes
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/60 rounded-lg animate-pulse" />)
        ) : (
          <>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/70 border border-indigo-100">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 mb-1">Score Médio ({data.length} ativos)</p>
                <Progress value={mediaScore} className="h-1.5" />
              </div>
              <span className={`text-xl font-black ${scoreColor}`}>{mediaScore}</span>
            </div>
            {emRisco.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Em risco ({emRisco.length})
                </p>
                {emRisco.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs text-slate-800 truncate max-w-[130px]">{c.nome || c.razao_social}</span>
                    <Badge className="bg-red-100 text-red-700 text-[9px]">{c.risco_churn}</Badge>
                  </div>
                ))}
              </div>
            )}
            {emRisco.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <TrendingUp className="w-3.5 h-3.5" /> Base de clientes saudável
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}