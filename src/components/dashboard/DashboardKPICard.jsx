/**
 * DashboardKPICard — Card KPI responsivo e clicável para o Dashboard.
 * Suporta ícone, valor, título, subtítulo, alerta e drill-down.
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardKPICard({ title, value, subtitle, icon: Icon, color, bgColor, textColor, alert, drillDown, trend }) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm ${alert ? "ring-2 ring-red-200" : ""}`}
      onClick={drillDown}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor || "bg-slate-100"} flex items-center justify-center shrink-0`}>
            {Icon && <Icon className={`w-5 h-5 ${color || "text-slate-600"}`} />}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs text-slate-500 truncate">{title}</p>
            <p className={`text-xl font-bold truncate ${textColor || color || "text-slate-900"}`}>{value}</p>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-xs ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}% vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}