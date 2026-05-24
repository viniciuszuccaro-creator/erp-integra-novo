/**
 * DashboardCommandCenter — Command Center limpo e compacto.
 * Substituição focada para o bloco pesado do DashboardResumoTab.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Activity, Shield, MessageCircle, Zap } from "lucide-react";

export default function DashboardCommandCenter({ ccMetrics = {}, botMetrics = {} }) {
  const items = [
    {
      label: "Erros (24h)",
      value: ccMetrics?.errors ?? 0,
      Icon: AlertCircle,
      color: (ccMetrics?.errors ?? 0) > 0 ? "text-rose-600 bg-rose-50" : "text-green-600 bg-green-50",
      badge: (ccMetrics?.errors ?? 0) > 0 ? "danger" : "ok",
    },
    {
      label: "Jobs Exec.",
      value: ccMetrics?.funcs ?? 0,
      Icon: Zap,
      color: "text-blue-600 bg-blue-50",
      badge: null,
    },
    {
      label: "Seg. Alertas",
      value: ccMetrics?.secAlerts ?? 0,
      Icon: Shield,
      color: (ccMetrics?.secAlerts ?? 0) > 0 ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50",
      badge: null,
    },
    {
      label: "Chatbot SLA",
      value: botMetrics?.sla_total
        ? `${Math.round((botMetrics.sla_ok / botMetrics.sla_total) * 100)}%`
        : "—",
      Icon: MessageCircle,
      color: "text-indigo-600 bg-indigo-50",
      badge: null,
    },
    {
      label: "Atend. (24h)",
      value: botMetrics?.chats ?? 0,
      Icon: Activity,
      color: "text-cyan-600 bg-cyan-50",
      badge: null,
    },
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Command Center — Últimas 24h
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {items.map(({ label, value, Icon: MetricIcon, color, badge }) => (
            <div key={label} className={`flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 ${color.split(" ")[1] || "bg-slate-50"}`}>
              <MetricIcon className={`w-4 h-4 shrink-0 ${color.split(" ")[0]}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight truncate">{label}</p>
                <p className="text-base font-bold text-slate-800 leading-tight">{value}</p>
              </div>
              {badge === "danger" && (
                <Badge className="ml-auto text-[9px] bg-red-100 text-red-700 px-1 py-0 h-4 shrink-0">!</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}