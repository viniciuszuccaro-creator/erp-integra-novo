/**
 * DashboardTopProdutos — Ranking dos produtos mais vendidos com mini-barra visual.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function DashboardTopProdutos({ topProdutos = [], onNavigate }) {
  if (!topProdutos || topProdutos.length === 0) return null;
  const max = Math.max(...topProdutos.map(p => p.total || 0), 1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Top Produtos Vendidos
          </CardTitle>
          {onNavigate && (
            <button onClick={onNavigate} className="text-xs text-blue-600 hover:underline">Ver estoque</button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {topProdutos.slice(0, 7).map((p, i) => {
          const pct = Math.round(((p.total || 0) / max) * 100);
          const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500"];
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-slate-700 truncate">{p.produto || p.nome || '—'}</span>
                  <span className="text-xs text-slate-500 ml-2 shrink-0">
                    {typeof p.total === 'number' ? p.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : p.total}
                    {p.unidade ? ` ${p.unidade}` : ''}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              {p.receita != null && (
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {`R$ ${Number(p.receita).toLocaleString('pt-BR',{maximumFractionDigits:0})}`}
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}