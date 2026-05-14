import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function DashboardVendasPrevisaoWidget() {
  const { empresaAtual, grupoAtual, getFiltroContexto, estaNoGrupo } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['vendas-previsao-widget', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 600000,
    queryFn: async () => {
      const filtros = getFiltroContexto?.('empresa_id', true) || {};
      const res = await base44.functions.invoke('biForecastPreditivo', {
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        filtros,
        horizon_days: 30,
        include_chart_data: true,
      });
      return res?.data;
    },
  });

  const chartData = data?.chart_data || data?.previsoes_diarias || data?.forecast_series || [];
  const tendencia = data?.tendencia || data?.trend || null;
  const crescimento = data?.crescimento_estimado || data?.growth_pct || null;
  const totalPrevisto = data?.total_previsto || data?.total_forecast || null;

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Previsão de Vendas — 30 dias
          </CardTitle>
          <div className="flex items-center gap-2">
            {crescimento != null && (
              <Badge className={`text-[10px] ${Number(crescimento) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {Number(crescimento) >= 0 ? '+' : ''}{Number(crescimento).toFixed(1)}%
              </Badge>
            )}
            {tendencia && (
              <Badge variant="outline" className="text-[10px]">{tendencia}</Badge>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="h-32 bg-white/60 rounded animate-pulse" />
        ) : chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={36}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Previsão']}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} fill="url(#gradVendas)" />
              </AreaChart>
            </ResponsiveContainer>
            {totalPrevisto != null && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">Total previsto 30d</span>
                <span className="text-sm font-bold text-blue-700">
                  R$ {Number(totalPrevisto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-slate-400">
            <BarChart2 className="w-8 h-8 mb-1 opacity-30" />
            <span className="text-xs">Clique em atualizar para gerar previsão.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}