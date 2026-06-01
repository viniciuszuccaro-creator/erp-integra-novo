/**
 * DashboardMetasProgress — Widget de progresso de metas mensais
 * Exibe indicadores de meta vs. realizado para vendas, entregas e inadimplência
 */
import React from "react";
import { Target, TrendingUp, Truck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MetaBar({ label, realizado, meta, icon: Icon, color, formato = "numero" }) {
  const pct = meta > 0 ? Math.min(100, Math.round((realizado / meta) * 100)) : 0;
  const atingiu = pct >= 100;
  const fmt = (v) => formato === "moeda"
    ? `R$\u00a0${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : formato === "percentual" ? `${v}%` : v.toLocaleString("pt-BR");

  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-md ${color.bg} flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-600 font-medium truncate">{label}</span>
          <span className={`text-xs font-bold ${atingiu ? "text-emerald-600" : "text-slate-700"}`}>
            {fmt(realizado)} / {fmt(meta)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${atingiu ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{pct}% da meta</p>
      </div>
    </div>
  );
}

export default function DashboardMetasProgress({
  totalVendas = 0,
  entregasConcluidas = 0,
  taxaInadimplencia = 0,
  metaVendasMensal = 100000,
  metaEntregasMensal = 50,
  metaInadimplenciaMax = 5,
}) {
  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Metas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetaBar
          label="Vendas Mensais"
          realizado={totalVendas}
          meta={metaVendasMensal}
          icon={TrendingUp}
          color={{ bg: "bg-green-50", text: "text-green-600" }}
          formato="moeda"
        />
        <MetaBar
          label="Entregas Concluídas"
          realizado={entregasConcluidas}
          meta={metaEntregasMensal}
          icon={Truck}
          color={{ bg: "bg-blue-50", text: "text-blue-600" }}
        />
        <MetaBar
          label="Inadimplência Máxima"
          realizado={metaInadimplenciaMax}
          meta={Math.max(metaInadimplenciaMax, taxaInadimplencia)}
          icon={AlertCircle}
          color={{ bg: "bg-rose-50", text: "text-rose-600" }}
          formato="percentual"
        />
      </CardContent>
    </Card>
  );
}