import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, RefreshCw, TrendingDown, CheckCircle2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const RISCO_CLS = {
  critico: 'bg-red-100 text-red-700 border-red-200',
  alto:    'bg-orange-100 text-orange-700 border-orange-200',
  medio:   'bg-amber-100 text-amber-700 border-amber-200',
  baixo:   'bg-slate-100 text-slate-600 border-slate-200',
};

export default function IAChurnWidget({ compact = false }) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [forceRefresh, setForceRefresh] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['churn-widget', empresaAtual?.id, grupoAtual?.id, forceRefresh],
    enabled: !!(empresaAtual?.id || grupoAtual?.id),
    staleTime: 600000,
    queryFn: async () => {
      const res = await base44.functions.invoke('iaChurnAnalyzer', {
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        limit: 5,
      });
      return res?.data;
    },
  });

  const clientes = data?.clientes_risco || data?.clients_at_risk || data?.items || [];
  const total = data?.total_risco || data?.total_at_risk || clientes.length;

  if (!empresaAtual?.id && contexto !== 'grupo') return null;

  return (
    <Card className={`border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50 ${compact ? '' : 'w-full'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-orange-500" />
            Risco de Churn IA
            {total > 0 && <Badge className="text-[10px] bg-orange-500 text-white">{total}</Badge>}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => { setForceRefresh(p => p + 1); refetch(); }}
            disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-7 bg-white/60 rounded animate-pulse" />)}
          </div>
        ) : clientes.length > 0 ? (
          <div className="space-y-1.5">
            {clientes.slice(0, 4).map((c, idx) => {
              const nome = c.nome || c.cliente_nome || c.name || `Cliente ${idx + 1}`;
              const risco = (c.nivel_risco || c.risco || c.risk_level || '').toLowerCase();
              const dias = c.dias_sem_comprar || c.days_since_purchase;
              return (
                <div key={idx} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingDown className="w-3 h-3 text-orange-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{nome}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {dias && <span className="text-[10px] text-slate-400">{dias}d</span>}
                    {risco && <Badge className={`text-[9px] border ${RISCO_CLS[risco] || RISCO_CLS.baixo}`}>{risco}</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-600 py-3">
            <CheckCircle2 className="w-4 h-4" />
            Nenhum cliente em risco de churn detectado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}