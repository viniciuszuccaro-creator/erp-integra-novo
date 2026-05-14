import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const NIVEL_COLOR = {
  critico:  'border-red-300 bg-red-50 text-red-700',
  alto:     'border-orange-300 bg-orange-50 text-orange-700',
  medio:    'border-amber-200 bg-amber-50 text-amber-700',
  baixo:    'border-slate-200 bg-slate-50 text-slate-600',
};

export default function DashboardAnomaliaWidget() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [forceRefresh, setForceRefresh] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['anomalia-fin', empresaAtual?.id, grupoAtual?.id, forceRefresh],
    enabled: !!(empresaAtual?.id || grupoAtual?.id),
    staleTime: 600000,
    queryFn: async () => {
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros: {
          empresa_id: empresaAtual?.id || null,
          group_id: grupoAtual?.id || null,
        },
      });
      return res?.data;
    },
  });

  const anomalias = data?.anomalias || data?.anomaly_list || data?.items || [];
  const resumo = data?.resumo || data?.summary || null;

  if (!empresaAtual?.id && contexto !== 'grupo') return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Anomalias Financeiras IA
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => { setForceRefresh(p => p + 1); refetch(); }}
            disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-7 bg-white/60 rounded animate-pulse" />)}
          </div>
        ) : anomalias.length > 0 ? (
          <div className="space-y-1.5">
            {anomalias.slice(0, 4).map((a, idx) => {
              const nivel = (a.nivel || a.nivel_risco || a.severity || '').toLowerCase();
              return (
                <div key={idx} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${NIVEL_COLOR[nivel] || NIVEL_COLOR.baixo}`}>
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{a.descricao || a.mensagem || a.message || String(a)}</span>
                  {nivel && <Badge className="text-[9px] bg-white/70 text-current border-current">{nivel}</Badge>}
                </div>
              );
            })}
            {resumo && <p className="text-xs text-slate-500 text-right mt-1">{typeof resumo === 'string' ? resumo : ''}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-600 py-3">
            <CheckCircle2 className="w-4 h-4" />
            Nenhuma anomalia detectada neste período.
          </div>
        )}
      </CardContent>
    </Card>
  );
}