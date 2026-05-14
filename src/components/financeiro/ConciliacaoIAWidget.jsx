import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Zap, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Button } from "@/components/ui/button";

export default function ConciliacaoIAWidget({ compact = false }) {
  const { filterInContext, empresaAtual, grupoAtual, estaNoGrupo, getFiltroContexto } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  const { data: extratos = [], isLoading: loadExtratos } = useQuery({
    queryKey: ['extratos-conciliacao-ia', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 300000,
    queryFn: () => filterInContext('ExtratoBancario', {}, '-data_movimento', 50),
  });

  const { data: contasReceber = [], isLoading: loadCR } = useQuery({
    queryKey: ['cr-conciliacao-ia', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 300000,
    queryFn: () => filterInContext('ContaReceber', { status: 'Pendente' }, '-data_vencimento', 30),
  });

  const { data: aiResult, isLoading: loadAI, refetch, isFetching } = useQuery({
    queryKey: ['conciliacao-ia-scan', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx && extratos.length > 0,
    staleTime: 600000,
    queryFn: async () => {
      const filtros = getFiltroContexto?.('empresa_id', true) || {};
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros,
        conciliacao: { enabled: true }
      });
      return res?.data;
    },
  });

  const isLoading = loadExtratos || loadCR || loadAI;
  const pendentes = (extratos || []).filter(e => !e.conciliado);
  const taxa = extratos.length > 0 ? Math.round(((extratos.length - pendentes.length) / extratos.length) * 100) : 0;
  const anomalias = aiResult?.anomalias || aiResult?.alertas || [];
  const totalVencidas = contasReceber.filter(c => new Date(c.data_vencimento) < new Date()).length;

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-teal-50 to-cyan-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-500" />
            Conciliação IA
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-8 rounded-lg bg-white/60 animate-pulse" />)
        ) : (
          <>
            {/* Taxa de conciliação */}
            <div className="p-2.5 rounded-xl bg-white/70 border border-teal-100 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Taxa conciliação</span>
                <span className="font-semibold text-teal-700">{taxa}%</span>
              </div>
              <Progress value={taxa} className="h-1.5" />
              <p className="text-[10px] text-slate-500">{pendentes.length} extratos pendentes de {extratos.length} total</p>
            </div>

            {/* Vencidas */}
            {totalVencidas > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                <TrendingDown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-800">{totalVencidas} contas vencidas em aberto</span>
              </div>
            )}

            {/* Anomalias IA */}
            {anomalias.length > 0 ? (
              <div className="space-y-1">
                {anomalias.slice(0, compact ? 2 : 3).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-700 leading-tight">{typeof a === 'string' ? a : a?.descricao || a?.texto || JSON.stringify(a)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sem anomalias detectadas
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}