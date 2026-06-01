/**
 * Fase1StatusCard — Checklist visual e auditável da Fase 1: Segurança & RBAC
 * Usa função fase1Check (backend) para verificação real com evidências do AuditLog.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, Loader2, RefreshCw, Shield,
  ChevronDown, ChevronUp, AlertTriangle, Info, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

// Labels amigáveis por id
const ITEM_META = {
  entity_guard_rls:          { label: "EntityGuard — RLS Multiempresa",               group: "Backend" },
  entity_guard_admin_only:   { label: "EntityGuard — Admin-only (PerfilAcesso/User)",  group: "Backend" },
  sod_10_rules:              { label: "SoD Validator — 10 Regras Ativas",              group: "Backend" },
  pii_encryptor_3_entities:  { label: "PII Encryptor — AES-GCM (3 Entidades)",         group: "Backend" },
  pii_auto_trigger:          { label: "Auto-encrypt PII via LayoutRBACWrapper",         group: "Frontend" },
  security_alerts_11_checks: { label: "Security Alerts — 11 Heurísticas",              group: "Backend" },
  security_metrics_panel:    { label: "SecurityMetricsPanel — KPIs + SoD + Histórico", group: "Frontend" },
  audit_perfilacesso:        { label: "Auditoria PerfilAcesso CRUD (automação)",        group: "Automação" },
  sod_automation_active:     { label: "SoD Validator — Automação Ativa",               group: "Automação" },
  security_alerts_30min:     { label: "Security Alerts Scanner (30 min)",              group: "Automação" },
};

const GROUP_ORDER = ["Backend", "Frontend", "Automação"];
const GROUP_COLORS = {
  Backend:   "bg-blue-100 text-blue-700",
  Frontend:  "bg-purple-100 text-purple-700",
  Automação: "bg-amber-100 text-amber-700",
};

function StatusRow({ item, detail }) {
  const [open, setOpen] = useState(false);
  const meta = ITEM_META[item.id] || { label: item.id, group: "Backend" };
  return (
    <div className="border-b last:border-0">
      <button
        className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="shrink-0">
          {detail === undefined && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          {item.ok === true  && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {item.ok === false && <XCircle className="w-4 h-4 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium truncate ${item.ok ? "text-slate-800" : "text-red-700"}`}>
            {meta.label}
          </span>
          <Badge className={`text-xs shrink-0 ${GROUP_COLORS[meta.group]}`}>{meta.group}</Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className={`text-xs ${item.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.ok ? "✓ OK" : "✗ Falha"}
          </Badge>
          {item.detail && (open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />)}
        </div>
      </button>
      {open && item.detail && (
        <div className="px-8 pb-2.5">
          <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span>{item.detail}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCircle({ score }) {
  const color = score >= 100 ? "#22c55e" : score >= 80 ? "#f59e0b" : "#ef4444";
  const r = 26, c = 32, circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={64} height={64} className="-rotate-90">
        <circle cx={c} cy={c} r={r} stroke="#e2e8f0" strokeWidth={6} fill="none" />
        <circle cx={c} cy={c} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function Fase1StatusCard() {
  const [items, setItems]     = useState([]);
  const [score, setScore]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [error, setError]     = useState(null);

  const runChecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("fase1Check", {});
      const data = res?.data;
      if (!data || typeof data.score !== "number") {
        throw new Error("Resposta inválida do servidor");
      }
      setItems(data.items || []);
      setScore(data.score);
      setLastRun(new Date().toLocaleTimeString("pt-BR"));
    } catch (e) {
      setError(e?.message || "Erro ao executar verificação");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { runChecks(); }, []);

  // Agrupa por grupo
  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    items: items.filter(i => (ITEM_META[i.id]?.group || "Backend") === g),
  })).filter(g => g.items.length > 0);

  const passed = items.filter(i => i.ok).length;
  const total  = items.length;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">
                Fase 1 — Segurança & RBAC
              </CardTitle>
              {lastRun && <p className="text-xs text-slate-400">Verificado às {lastRun}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {score !== null && <ScoreCircle score={score} />}
            {score !== null && (
              <div className="text-right">
                <p className={`text-xs font-semibold ${score === 100 ? "text-green-600" : score >= 80 ? "text-amber-600" : "text-red-600"}`}>
                  {score === 100 ? "✓ Completo" : score >= 80 ? "Quase lá" : "Atenção"}
                </p>
                <p className="text-xs text-slate-400">{passed}/{total} itens</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={runChecks} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Barra de progresso */}
        {score !== null && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${score === 100 ? "bg-green-500" : score >= 80 ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto px-4 pb-4">
        {/* Estado de loading inicial */}
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando módulos de segurança…</span>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Banner 100% */}
        {score === 100 && !loading && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
            <Zap className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">Fase 1 concluída com 100%!</p>
              <p className="text-xs text-green-600">Todos os controles de segurança estão ativos e auditáveis.</p>
            </div>
          </div>
        )}

        {/* Itens agrupados */}
        {grouped.map(({ group, items: gItems }) => (
          <div key={group} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GROUP_COLORS[group]}`}>{group}</span>
              <span className="text-xs text-slate-400">{gItems.filter(i=>i.ok).length}/{gItems.length}</span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {gItems.map(item => (
                <StatusRow key={item.id} item={item} detail={item.detail} />
              ))}
            </div>
          </div>
        ))}

        {/* Estado vazio */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-6 text-slate-400 text-sm">
            Clique em atualizar para executar a verificação.
          </div>
        )}
      </CardContent>
    </Card>
  );
}