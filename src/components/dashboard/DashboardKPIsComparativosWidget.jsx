import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ShoppingCart, DollarSign, Package } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v || 0);

// eslint-disable-next-line no-unused-vars
function KPIComparativo({ label, atual, anterior, icon: Icon, color }) {
  const diff = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
  const up = diff > 0;
  const down = diff < 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-slate-100">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-slate-800">{fmt(atual)}</p>
      </div>
      <div className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : down ? 'text-red-500' : 'text-slate-400'}`}>
        {up ? <TrendingUp className="w-3.5 h-3.5" /> : down ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
        {Math.abs(diff).toFixed(1)}%
      </div>
    </div>
  );
}

export default function DashboardKPIsComparativosWidget() {
  const { empresaAtual, grupoAtual, getFiltroContexto, estaNoGrupo } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo);

  const { data, isLoading } = useQuery({
    queryKey: ['kpis-comparativos', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 300000,
    queryFn: async () => {
      const filtros = getFiltroContexto?.('empresa_id', true) || {};
      const res = await base44.functions.invoke('groupConsolidation', { filtros });
      return res?.data;
    },
  });

  const atual = data?.mes_atual || {};
  const anterior = data?.mes_anterior || {};

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-blue-50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          KPIs — Mês Atual vs Anterior
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-white/60 rounded-xl animate-pulse" />)
        ) : (
          <>
            <KPIComparativo label="Vendas (Pedidos)" atual={atual.total_vendas || 0} anterior={anterior.total_vendas || 0} icon={ShoppingCart} color="bg-blue-500" />
            <KPIComparativo label="Receita (C. Receber)" atual={atual.total_receitas || 0} anterior={anterior.total_receitas || 0} icon={DollarSign} color="bg-emerald-500" />
            <KPIComparativo label="Pedidos (Qtd)" atual={atual.total_pedidos || 0} anterior={anterior.total_pedidos || 0} icon={Package} color="bg-violet-500" />
          </>
        )}
      </CardContent>
    </Card>
  );
}