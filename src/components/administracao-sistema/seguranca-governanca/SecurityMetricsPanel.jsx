/**
 * SecurityMetricsPanel — Painel de métricas de segurança em tempo real.
 * Fase 1 completa: KPIs, alertas ativos, histórico e SoD checker.
 */
import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Lock, Eye, Users, Activity, TrendingUp, CheckCircle2, RefreshCw, Clock, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// ─── Sub-componentes pequenos ─────────────────────────────────────────────────

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
        <p className="text-xs text-slate-500">{detalhes}</p>
      </div>
    </div>
  );
}

function SodConflictRow({ perfil }) {
  const [open, setOpen] = useState(false);
  const conflitos = perfil.conflitos_sod_detectados || [];
  const maxSev = conflitos.reduce((m, c) => {
    const o = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
    return (o[c.severidade] || 0) > (o[m] || 0) ? c.severidade : m;
  }, "Baixa");
  const colors = { Alta: "bg-red-100 text-red-700", Crítica: "bg-red-200 text-red-900", Média: "bg-amber-100 text-amber-700", Baixa: "bg-slate-100 text-slate-600" };
  return (
    <div className="border rounded-lg mb-2 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${colors[maxSev]}`}>{maxSev}</Badge>
          <span className="font-medium text-slate-800">{perfil.nome_perfil || perfil.id}</span>
          <span className="text-xs text-slate-400">{conflitos.length} conflito(s)</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t bg-slate-50">
          {conflitos.map((c, i) => (
            <div key={i} className="flex items-start gap-2 pt-2">
              <Badge className={`text-xs shrink-0 ${colors[c.severidade]}`}>{c.severidade}</Badge>
              <div>
                <p className="text-xs font-mono text-slate-600">{c.regra}</p>
                <p className="text-xs text-slate-500">{c.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoricoRow({ log }) {
  const date = log.data_hora ? new Date(log.data_hora) : new Date(log.created_date);
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-700 truncate">{log.descricao || log.acao}</p>
        <p className="text-xs text-slate-400">{log.usuario} · {date.toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function SecurityMetricsPanel() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [loading, setLoading] = useState(false);
  const [sodLoading, setSodLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sodPerfis, setSodPerfis] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [lastRun, setLastRun] = useState(null);

  const scope = {
    ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
    ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const filter = { tipo_auditoria: "seguranca", ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}) };
      const logs = await base44.asServiceRole.entities.AuditLog.filter(filter, "-data_hora", 200);

      const now = Date.now();
      const w15 = now - 15 * 60 * 1000;
      const w24 = now - 24 * 60 * 60 * 1000;
      const recent = (logs || []).filter(l => new Date(l.data_hora || l.created_date).getTime() > w15);
      const last24 = (logs || []).filter(l => new Date(l.data_hora || l.created_date).getTime() > w24);

      const bloqueios15 = recent.filter(l => l.acao === "Bloqueio").length;
      const rlsBlocks = recent.filter(l => /RLS:/i.test(l.descricao || "")).length;
      const piiOps = last24.filter(l => /PII/i.test(l.descricao || "")).length;
      const offHour = last24.filter(l => {
        const h = new Date(l.data_hora || l.created_date).getHours();
        return (h < 6 || h >= 22) && ["Criação", "Edição", "Exclusão"].includes(l.acao || "");
      }).length;
      const adminOnlyBlocks = last24.filter(l => /requer perfil admin/i.test(l.descricao || "")).length;

      // SoD conflicts count
      const perfisSod = await base44.asServiceRole.entities.PerfilAcesso.filter(
        { ...scope, requer_aprovacao_especial: true }, "-updated_date", 100
      ).catch(() => []);
      const sodConflitos = (perfisSod || []).reduce((s, p) => s + (p.conflitos_sod_detectados?.length || 0), 0);

      setMetrics({ bloqueios15, rlsBlocks, piiOps, offHour, sodConflitos, adminOnlyBlocks, analisados: logs.length });

      // Alertas ativos
      const alertRes = await base44.functions.invoke("securityAlerts", { force: true, filtros: scope }).catch(() => ({ data: null }));
      if (alertRes?.data?.alerts > 0) {
        const alertLogs = await base44.asServiceRole.entities.AuditLog.filter(
          { tipo_auditoria: "seguranca", entidade: "SecurityAlerts", ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}) },
          "-data_hora", 1
        );
        setAlerts(alertLogs?.[0]?.dados_novos?.suspicious || []);
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

  const loadSod = async () => {
    setSodLoading(true);
    try {
      const perfis = await base44.asServiceRole.entities.PerfilAcesso.filter(scope, "-updated_date", 100).catch(() => []);
      const comConflito = (perfis || []).filter(p => (p.conflitos_sod_detectados || []).length > 0);
      setSodPerfis(comConflito);
    } catch {} finally { setSodLoading(false); }
  };

  const loadHistorico = async () => {
    try {
      const logs = await base44.asServiceRole.entities.AuditLog.filter(
        { tipo_auditoria: "seguranca", ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}) },
        "-data_hora", 50
      );
      setHistorico(logs || []);
    } catch {}
  };

  const forceSodScan = async () => {
    setSodLoading(true);
    try {
      await base44.functions.invoke("sodValidator", { force: true, ...scope });
      await loadSod();
    } catch {} finally { setSodLoading(false); }
  };

  useEffect(() => {
    loadMetrics();
    loadSod();
    loadHistorico();
  }, [empresaAtual?.id, grupoAtual?.id]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Segurança em Tempo Real</h3>
          {lastRun && <span className="text-xs text-slate-400">Atualizado: {lastRun}</span>}
        </div>
        <Button variant="outline" size="sm" onClick={loadMetrics} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Analisar
        </Button>
      </div>

      {/* KPI Grid — 7 cards (inclui Admin-only blocks) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        <MetricCard label="Bloqueios (15min)" value={metrics?.bloqueios15 ?? "–"} icon={Lock}
          color={metrics?.bloqueios15 > 10 ? "text-red-600" : "text-blue-600"}
          bg={metrics?.bloqueios15 > 10 ? "bg-red-50" : "bg-blue-50"} alert={metrics?.bloqueios15 > 10} />
        <MetricCard label="Acesso Cruzado RLS" value={metrics?.rlsBlocks ?? "–"} icon={Shield}
          color={metrics?.rlsBlocks > 0 ? "text-red-600" : "text-green-600"}
          bg={metrics?.rlsBlocks > 0 ? "bg-red-50" : "bg-green-50"} alert={metrics?.rlsBlocks > 0} />
        <MetricCard label="Admin-Only Bloq." value={metrics?.adminOnlyBlocks ?? "–"} icon={Lock}
          sub="Escrita em entidades protegidas"
          color={metrics?.adminOnlyBlocks > 0 ? "text-red-600" : "text-green-600"}
          bg={metrics?.adminOnlyBlocks > 0 ? "bg-red-50" : "bg-green-50"} alert={metrics?.adminOnlyBlocks > 0} />
        <MetricCard label="Ops. PII (24h)" value={metrics?.piiOps ?? "–"} icon={Eye}
          color={metrics?.piiOps > 20 ? "text-amber-600" : "text-violet-600"}
          bg={metrics?.piiOps > 20 ? "bg-amber-50" : "bg-violet-50"} alert={metrics?.piiOps > 20} />
        <MetricCard label="Fora do Horário (24h)" value={metrics?.offHour ?? "–"} icon={Activity}
          color={metrics?.offHour > 5 ? "text-amber-600" : "text-slate-600"}
          bg={metrics?.offHour > 5 ? "bg-amber-50" : "bg-slate-50"} alert={metrics?.offHour > 5} />
        <MetricCard label="Conflitos SoD" value={metrics?.sodConflitos ?? "–"} icon={Users}
          color={metrics?.sodConflitos > 0 ? "text-red-600" : "text-green-600"}
          bg={metrics?.sodConflitos > 0 ? "bg-red-50" : "bg-green-50"} alert={metrics?.sodConflitos > 0} />
        <MetricCard label="Logs Analisados" value={metrics?.analisados ?? "–"} icon={TrendingUp}
          color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Tabs: Alertas | SoD Checker | Histórico */}
      <Tabs defaultValue="alertas" className="flex-1 flex flex-col min-h-0">
        <TabsList className="h-8 w-fit">
          <TabsTrigger value="alertas" className="text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            Alertas {alerts.length > 0 && <Badge className="ml-1 bg-red-500 text-white text-xs px-1">{alerts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="sod" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            SoD {sodPerfis.length > 0 && <Badge className="ml-1 bg-amber-500 text-white text-xs px-1">{sodPerfis.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-xs gap-1">
            <Clock className="w-3 h-3" /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="flex-1 overflow-auto mt-3">
          <Card className="h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                {alerts.length > 0
                  ? <><AlertTriangle className="w-4 h-4 text-red-500" />{alerts.length} alerta(s) ativo(s)</>
                  : <><CheckCircle2 className="w-4 h-4 text-green-500" />Nenhum alerta ativo</>}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 overflow-y-auto max-h-64">
              {alerts.length === 0 && !loading && (
                <p className="text-sm text-slate-400 text-center py-4">Sistema seguro nos últimos 15 minutos.</p>
              )}
              {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sod" className="flex-1 overflow-auto mt-3">
          <Card className="h-full">
            <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm">
                {sodPerfis.length === 0 ? "Nenhum conflito SoD detectado" : `${sodPerfis.length} perfil(is) com conflito`}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={forceSodScan} disabled={sodLoading}>
                <Search className={`w-3.5 h-3.5 mr-1.5 ${sodLoading ? "animate-pulse" : ""}`} /> Forçar Scan
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 overflow-y-auto max-h-72">
              {sodPerfis.length === 0 && !sodLoading && (
                <p className="text-sm text-slate-400 text-center py-4">Todos os perfis estão em conformidade SoD.</p>
              )}
              {sodPerfis.map((p) => <SodConflictRow key={p.id} perfil={p} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="flex-1 overflow-auto mt-3">
          <Card className="h-full">
            <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Últimos 50 eventos de segurança</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadHistorico}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 overflow-y-auto max-h-72">
              {historico.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum evento encontrado.</p>}
              {historico.map((l, i) => <HistoricoRow key={i} log={l} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}