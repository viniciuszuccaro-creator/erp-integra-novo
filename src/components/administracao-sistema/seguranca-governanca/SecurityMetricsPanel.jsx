/**
 * SecurityMetricsPanel — Painel de métricas de segurança em tempo real.
 * Mostra KPIs de RBAC, bloqueios, SoD, RLS e PII por empresa/grupo.
 * Integrado ao módulo de Administração do Sistema existente.
 */
import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Lock, Eye, Users, Activity, TrendingUp, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function MetricCard({ label, value, sub, icon: Icon, color = "text-blue-600", bg = "bg-blue-50", alert = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${alert ? "border-red-200 bg-red-50" : "border-slate-100 bg-white"}`}>
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function AlertRow({ tipo, severidade, detalhes }) {
  const colors = { Alta: "bg-red-100 text-red-700", Crítica: "bg-red-200 text-red-800", Média: "bg-amber-100 text-amber-700", Baixa: "bg-green-100 text-green-700" };
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <Badge className={`text-xs shrink-0 ${colors[severidade] || colors["Baixa"]}`}>{severidade}</Badge>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{tipo}</p>
        <p className="text-xs text-slate-500 truncate">{detalhes}</p>
      </div>
    </div>
  );
}

export default function SecurityMetricsPanel() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [lastRun, setLastRun] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const scope = {};
      if (empresaAtual?.id) scope.empresa_id = empresaAtual.id;
      if (grupoAtual?.id) scope.group_id = grupoAtual.id;

      // Busca logs de segurança recentes
      const filter = { tipo_auditoria: "seguranca", ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}) };
      const logs = await base44.asServiceRole.entities.AuditLog.filter(filter, "-data_hora", 200);

      const now = Date.now();
      const window15 = now - 15 * 60 * 1000;
      const window24h = now - 24 * 60 * 60 * 1000;

      const recent = (logs || []).filter(l => new Date(l.data_hora || l.created_date).getTime() > window15);
      const last24 = (logs || []).filter(l => new Date(l.data_hora || l.created_date).getTime() > window24h);

      const bloqueios15 = recent.filter(l => l.acao === "Bloqueio").length;
      const rlsBlocks = recent.filter(l => /RLS:/i.test(l.descricao || "")).length;
      const piiOps = last24.filter(l => /PII/i.test(l.descricao || "")).length;
      const offHour = last24.filter(l => {
        const h = new Date(l.data_hora || l.created_date).getHours();
        return (h < 6 || h >= 22) && ["Criação","Edição","Exclusão"].includes(l.acao || "");
      }).length;

      // SoD conflicts
      const sodRes = await base44.functions.invoke("sodValidator", { force: false, ...scope }).catch(() => ({ data: null }));
      const sodConflitos = sodRes?.data?.conflitos || 0;

      setMetrics({ bloqueios15, rlsBlocks, piiOps, offHour, sodConflitos, analisados: logs.length });

      // Alertas via securityAlerts
      const alertRes = await base44.functions.invoke("securityAlerts", { force: true, filtros: scope }).catch(() => ({ data: null }));
      if (alertRes?.data?.alerts > 0) {
        // Refaz busca dos alertas do log
        const alertLogs = await base44.asServiceRole.entities.AuditLog.filter(
          { tipo_auditoria: "seguranca", entidade: "SecurityAlerts", ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}) },
          "-data_hora", 1
        );
        const alertData = alertLogs?.[0]?.dados_novos?.suspicious || [];
        setAlerts(alertData);
      } else {
        setAlerts([]);
      }

      setLastRun(new Date().toLocaleTimeString("pt-BR"));
    } catch (e) {
      console.error("SecurityMetricsPanel:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [empresaAtual?.id, grupoAtual?.id]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Segurança em Tempo Real</h3>
          {lastRun && <span className="text-xs text-slate-400">Atualizado: {lastRun}</span>}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Analisar
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <MetricCard label="Bloqueios (15min)" value={metrics?.bloqueios15 ?? "-"} icon={Lock}
          color={metrics?.bloqueios15 > 10 ? "text-red-600" : "text-blue-600"}
          bg={metrics?.bloqueios15 > 10 ? "bg-red-50" : "bg-blue-50"}
          alert={metrics?.bloqueios15 > 10} />
        <MetricCard label="Acesso Cruzado RLS" value={metrics?.rlsBlocks ?? "-"} icon={Shield}
          color={metrics?.rlsBlocks > 0 ? "text-red-600" : "text-green-600"}
          bg={metrics?.rlsBlocks > 0 ? "bg-red-50" : "bg-green-50"}
          alert={metrics?.rlsBlocks > 0} />
        <MetricCard label="Ops. PII (24h)" value={metrics?.piiOps ?? "-"} icon={Eye}
          color={metrics?.piiOps > 20 ? "text-amber-600" : "text-violet-600"}
          bg={metrics?.piiOps > 20 ? "bg-amber-50" : "bg-violet-50"}
          alert={metrics?.piiOps > 20} />
        <MetricCard label="Atividade Fora Horário" value={metrics?.offHour ?? "-"} icon={Activity}
          color={metrics?.offHour > 5 ? "text-amber-600" : "text-slate-600"}
          bg={metrics?.offHour > 5 ? "bg-amber-50" : "bg-slate-50"}
          alert={metrics?.offHour > 5} />
        <MetricCard label="Conflitos SoD" value={metrics?.sodConflitos ?? "-"} icon={Users}
          color={metrics?.sodConflitos > 0 ? "text-red-600" : "text-green-600"}
          bg={metrics?.sodConflitos > 0 ? "bg-red-50" : "bg-green-50"}
          alert={metrics?.sodConflitos > 0} />
        <MetricCard label="Logs Analisados" value={metrics?.analisados ?? "-"} icon={TrendingUp}
          color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Alertas ativos */}
      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            {alerts.length > 0
              ? <><AlertTriangle className="w-4 h-4 text-red-500" /> {alerts.length} alerta(s) ativo(s)</>
              : <><CheckCircle2 className="w-4 h-4 text-green-500" /> Nenhum alerta ativo</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 overflow-y-auto">
          {alerts.length === 0 && !loading && (
            <p className="text-sm text-slate-400 text-center py-4">Sistema seguro nos últimos 15 minutos.</p>
          )}
          {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
        </CardContent>
      </Card>
    </div>
  );
}