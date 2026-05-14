import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function DashboardForecastWidget() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [forceRefresh, setForceRefresh] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bi-forecast', empresaAtual?.id, grupoAtual?.id, contexto, forceRefresh],
    enabled: !!(empresaAtual?.id || grupoAtual?.id),
    staleTime: 300000,
    queryFn: async () => {
      const res = await base44.functions.invoke('biForecastPreditivo', {
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        horizonte_dias: 30,
      });
      return res?.data;
    },
  });

  const forecast = data?.forecast || data?.previsoes || null;
  const alertas = data?.alertas || data?.alerts || [];
  const resumo = data?.resumo || data?.summary || null;

  const TrendIcon = ({ valor }) => {
    if (valor > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (valor < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  if (!empresaAtual?.id && contexto !== 'grupo') return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Previsão IA — Próximos 30 dias
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => { setForceRefresh(p => p + 1); refetch(); }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-500' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 bg-white/60 rounded animate-pulse" />
            ))}
          </div>
        ) : forecast ? (
          <div className="space-y-2">
            {Array.isArray(forecast) ? forecast.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-1.5">
                <div className="text-xs font-medium text-slate-700 truncate max-w-[55%]">{item.label || item.nome || item.metrica}</div>
                <div className="flex items-center gap-1.5">
                  {item.variacao !== undefined && <TrendIcon valor={item.variacao} />}
                  <span className="text-xs font-bold text-slate-900">
                    {item.valor_formatado || (typeof item.valor === 'number' ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) : item.valor)}
                  </span>
                  {item.variacao !== undefined && (
                    <Badge variant="outline" className={`text-xs px-1 py-0 ${item.variacao > 0 ? 'text-emerald-600 border-emerald-200' : item.variacao < 0 ? 'text-red-600 border-red-200' : 'text-slate-500'}`}>
                      {item.variacao > 0 ? '+' : ''}{item.variacao?.toFixed?.(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-white/70 rounded-lg px-3 py-2 text-xs text-slate-600">
                {typeof forecast === 'object' ? (
                  Object.entries(forecast).slice(0, 5).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5">
                      <span className="font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                      <span>{typeof v === 'number' ? v.toLocaleString('pt-BR') : String(v)}</span>
                    </div>
                  ))
                ) : String(forecast)}
              </div>
            )}
            {alertas.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">{alertas[0]?.mensagem || alertas[0]?.message || String(alertas[0])}</div>
              </div>
            )}
            {resumo && (
              <div className="text-xs text-slate-500 text-right mt-1">{typeof resumo === 'string' ? resumo : resumo?.descricao || ''}</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-4">
            Sem dados de previsão disponíveis para este período.
          </div>
        )}
      </CardContent>
    </Card>
  );
}