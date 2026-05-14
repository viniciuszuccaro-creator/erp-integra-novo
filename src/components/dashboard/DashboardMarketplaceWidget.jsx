import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, TrendingUp, Package } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Button } from "@/components/ui/button";

const MARKETPLACE_CHANNELS = ['Mercado Livre', 'Shopee', 'Amazon', 'Magalu', 'B2W'];

export default function DashboardMarketplaceWidget() {
  const { filterInContext, empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  const { data: pedidos = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['marketplace-pedidos', empresaAtual?.id, grupoAtual?.id],
    enabled: hasCtx,
    staleTime: 300000,
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 100),
  });

  const porCanal = MARKETPLACE_CHANNELS.map(canal => ({
    canal,
    total: pedidos.filter(p => p.origem_pedido === 'Marketplace' && p.canal_preferencial === canal).length,
    valor: pedidos.filter(p => p.origem_pedido === 'Marketplace' && p.canal_preferencial === canal)
      .reduce((s, p) => s + (Number(p.valor_total) || 0), 0),
  })).filter(c => c.total > 0);

  const totalMarketplace = pedidos.filter(p => p.origem_pedido === 'Marketplace').length;
  const valorTotal = pedidos.filter(p => p.origem_pedido === 'Marketplace')
    .reduce((s, p) => s + (Number(p.valor_total) || 0), 0);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

  if (!hasCtx) return null;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            Marketplace Sync
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/60 rounded-lg animate-pulse" />)
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-xl border border-orange-100 p-2.5 text-center">
                <p className="text-lg font-black text-orange-600">{totalMarketplace}</p>
                <p className="text-[10px] text-slate-500">Pedidos</p>
              </div>
              <div className="bg-white/70 rounded-xl border border-orange-100 p-2.5 text-center">
                <p className="text-sm font-black text-emerald-600">{fmt(valorTotal)}</p>
                <p className="text-[10px] text-slate-500">Receita</p>
              </div>
            </div>
            {porCanal.length > 0 ? (
              <div className="space-y-1">
                {porCanal.slice(0, 4).map(c => (
                  <div key={c.canal} className="flex items-center justify-between bg-white/70 rounded-lg px-2.5 py-1.5 border border-orange-100">
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-slate-700">{c.canal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-700 text-[9px]">{c.total}</Badge>
                      <span className="text-[10px] text-emerald-700 font-semibold">{fmt(c.valor)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/50 rounded-lg px-2.5 py-2">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                Configure canais de marketplace para ver dados.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}