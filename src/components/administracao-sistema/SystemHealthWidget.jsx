/**
 * SystemHealthWidget v2.0 — Widget compacto de saúde do sistema (24h)
 * Mostra: operações, propagações, erros, alertas de segurança
 * Usado na aba Administração do Sistema
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, AlertCircle, Activity, Zap, ArrowDownUp, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Metric({ icon: Icon, label, value, color = "text-slate-700", bg = "bg-slate-50" }) {
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg ${bg}`}>
      <Icon className={`w-4 h-4 ${color} shrink-0`} />
      <div>
        <div className={`text-xl font-bold leading-tight ${color}`}>{value}</div>
        <div className="text-[11px] text-slate-500 leading-none mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function SystemHealthWidget() {
  const { data: metrics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["system-health-widget"],
    queryFn: async () => {
      const since24h = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog.filter({}, "-data_hora", 300).catch(() => []);
      const recent = (logs || []).filter(l =>
        new Date(l?.data_hora || l?.created_date || 0).getTime() >= since24h
      );
      const erros = recent.filter(l => /erro|error|failed|bloqueio/i.test(l?.descricao || "")).length;
      const operacoes = recent.length;
      const propagacoes = recent.filter(l => /propag|sincroniz/i.test(l?.descricao || "")).length;
      const seguranca = recent.filter(l => l?.tipo_auditoria === "seguranca").length;
      const criacoes = recent.filter(l => l?.acao === "Criação").length;
      const edicoes = recent.filter(l => l?.acao === "Edição").length;
      return { erros, operacoes, propagacoes, seguranca, criacoes, edicoes };
    },
    staleTime: 300000,
    refetchInterval: 600000,
  });

  const saudavel = (metrics?.erros ?? 0) === 0;

  return (
    <Card className={`border transition-colors ${saudavel ? "border-green-200 bg-green-50/20" : "border-amber-200 bg-amber-50/20"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-sm text-slate-700">Saúde do Sistema — últimas 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={saudavel
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
            }>
              {saudavel
                ? <><CheckCircle2 className="w-3 h-3 mr-1" />Saudável</>
                : <><AlertCircle className="w-3 h-3 mr-1" />Atenção</>
              }
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-3 h-3 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <Metric icon={Zap} label="Operações" value={metrics?.operacoes ?? 0} color="text-blue-600" bg="bg-blue-50" />
            <Metric icon={ArrowDownUp} label="Propagações" value={metrics?.propagacoes ?? 0} color="text-purple-600" bg="bg-purple-50" />
            <Metric icon={CheckCircle2} label="Criações" value={metrics?.criacoes ?? 0} color="text-green-600" bg="bg-green-50" />
            <Metric icon={Activity} label="Edições" value={metrics?.edicoes ?? 0} color="text-indigo-600" bg="bg-indigo-50" />
            <Metric icon={AlertCircle} label="Erros" value={metrics?.erros ?? 0}
              color={metrics?.erros > 0 ? "text-red-600" : "text-green-600"}
              bg={metrics?.erros > 0 ? "bg-red-50" : "bg-green-50"}
            />
            <Metric icon={Clock} label="Seg. Alertas" value={metrics?.seguranca ?? 0}
              color={metrics?.seguranca > 0 ? "text-amber-600" : "text-slate-400"}
              bg={metrics?.seguranca > 0 ? "bg-amber-50" : "bg-slate-50"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}