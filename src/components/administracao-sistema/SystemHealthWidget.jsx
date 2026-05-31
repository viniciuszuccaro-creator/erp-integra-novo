/**
 * SystemHealthWidget — Widget compacto de saúde do sistema.
 * Mostra automações, erros recentes e status de propagação.
 * Usado na aba de Administração do Sistema.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, AlertCircle, Activity, Zap, ArrowDownUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Metric({ icon: MetricIcon, label, value, color = "text-slate-700", bg = "bg-slate-50" }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${bg}`}>
      <MetricIcon className={`w-4 h-4 ${color} shrink-0`} />
      <div>
        <div className={`text-lg font-bold leading-tight ${color}`}>{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function SystemHealthWidget() {
  const { data: metrics = null, isLoading } = useQuery({
    queryKey: ["system-health-widget"],
    queryFn: async () => {
      const since24h = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog.filter({}, "-data_hora", 200).catch(() => []);
      const recent = (logs || []).filter(l => new Date(l?.data_hora || l?.created_date || 0).getTime() >= since24h);
      const erros = recent.filter(l => /erro|error|failed/i.test(l?.descricao || "")).length;
      const operacoes = recent.length;
      const propagacoes = recent.filter(l => /propag/i.test(l?.descricao || "")).length;
      const seguranca = recent.filter(l => l?.tipo_auditoria === "seguranca").length;
      return { erros, operacoes, propagacoes, seguranca };
    },
    staleTime: 300000,
    refetchInterval: 600000,
  });

  if (isLoading) {
    return <div className="h-20 rounded-xl bg-slate-100 animate-pulse w-full" />;
  }

  const saudavel = (metrics?.erros ?? 0) === 0;

  return (
    <Card className={`border ${saudavel ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-sm text-slate-700">Saúde do Sistema (24h)</span>
          </div>
          <Badge className={saudavel ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {saudavel ? <><CheckCircle2 className="w-3 h-3 mr-1" />Saudável</> : <><AlertCircle className="w-3 h-3 mr-1" />Atenção</>}
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metric icon={Zap} label="Operações" value={metrics?.operacoes ?? 0} color="text-blue-600" bg="bg-blue-50" />
          <Metric icon={ArrowDownUp} label="Propagações" value={metrics?.propagacoes ?? 0} color="text-purple-600" bg="bg-purple-50" />
          <Metric icon={AlertCircle} label="Erros" value={metrics?.erros ?? 0} color={metrics?.erros > 0 ? "text-red-600" : "text-green-600"} bg={metrics?.erros > 0 ? "bg-red-50" : "bg-green-50"} />
          <Metric icon={Clock} label="Seg. Alertas" value={metrics?.seguranca ?? 0} color={metrics?.seguranca > 0 ? "text-amber-600" : "text-slate-500"} bg={metrics?.seguranca > 0 ? "bg-amber-50" : "bg-slate-50"} />
        </div>
      </CardContent>
    </Card>
  );
}