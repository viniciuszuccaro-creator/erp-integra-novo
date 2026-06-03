/**
 * SistemaIntegridadeCheck v6.0
 * 5 etapas — 100% verificadas via backend faseXCheck.
 * Execução sequencial com feedback progressivo.
 * Alinhado com as 5 tarefas reais do usuário.
 */
import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, XCircle, Loader2,
  ShieldCheck, RefreshCw, Zap, ChevronDown, ChevronRight,
  GitMerge, ToggleLeft, Lock, Activity, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// ─── Definição das 5 Etapas ─────────────────────────────────────────────────
const ETAPAS_META = [
  {
    id: 1,
    fn: 'fase1Check',
    label: "E1 · Propagação & Segurança",
    desc: "Sincronização histórica + RLS multiempresa + RBAC",
    icon: GitMerge,
    color: "text-blue-600",
    badgeColor: "bg-blue-100 text-blue-800",
    actionKey: 'propagacao',
  },
  {
    id: 2,
    fn: 'fase2Check',
    label: "E2 · Toggles Dual-context",
    desc: "ConfiguracaoSistema em Grupo + Empresa",
    icon: ToggleLeft,
    color: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-800",
    actionKey: 'configs',
  },
  {
    id: 3,
    fn: 'fase3Check',
    label: "E3 · RBAC por Módulo",
    desc: "Controle de acesso granular + orquestração",
    icon: Lock,
    color: "text-purple-600",
    badgeColor: "bg-purple-100 text-purple-800",
    actionKey: 'rbac',
  },
  {
    id: 4,
    fn: 'fase4Check',
    label: "E4 · Rate Limit & Canais",
    desc: "Circuit breaker 429 + Atendimento omnicanal",
    icon: Activity,
    color: "text-red-600",
    badgeColor: "bg-red-100 text-red-800",
    actionKey: 'e4_reset',
  },
  {
    id: 5,
    fn: 'fase5Check',
    label: "E5 · Herança Grupo→Empresa",
    desc: "Políticas de herança + Integrações externas",
    icon: BookOpen,
    color: "text-green-600",
    badgeColor: "bg-green-100 text-green-800",
    actionKey: 'e5_check',
  },
];

// ─── Ícone de status ─────────────────────────────────────────────────────────
function StatusIcon({ ok, size = "sm" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  if (ok === true)   return <CheckCircle2 className={`${cls} text-green-500 shrink-0`} />;
  if (ok === "warn") return <AlertCircle  className={`${cls} text-amber-500 shrink-0`} />;
  return                    <XCircle      className={`${cls} text-red-500 shrink-0`} />;
}

// ─── Barra de progresso ──────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-blue-500" }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// ─── Row de cada etapa ───────────────────────────────────────────────────────
function EtapaRow({ meta, result, loading, onRun, expanded, onToggle }) {
  const Icon    = meta.icon;
  const items   = result?.items || [];
  const score   = result?.score ?? null;
  const passed  = result?.passed ?? 0;
  const total   = result?.total ?? 0;
  const status  = score === null ? null : score === 100 ? true : score >= 70 ? "warn" : false;
  const barColor = score === 100 ? "bg-green-500" : score >= 70 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      {/* Header clicável */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
        onClick={onToggle}
      >
        <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800">{meta.label}</span>
            {score !== null && (
              <Badge className={`text-[10px] px-1.5 py-0 ${
                score === 100 ? 'bg-green-100 text-green-700' :
                score >= 70   ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
              }`}>
                {passed}/{total}
              </Badge>
            )}
            {loading && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
          </div>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{meta.desc}</p>
          {score !== null && (
            <div className="mt-1">
              <ProgressBar value={score} color={barColor} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {score !== null && <StatusIcon ok={status} />}
          <button
            onClick={e => { e.stopPropagation(); onRun(); }}
            disabled={loading}
            title="Verificar esta etapa"
            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold disabled:opacity-40 px-1"
          >
            ↻
          </button>
          {expanded
            ? <ChevronDown  className="w-3 h-3 text-slate-400" />
            : <ChevronRight className="w-3 h-3 text-slate-400" />
          }
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="bg-white">
          {items.length > 0 ? items.map(item => (
            <div key={item.id} className="flex items-start gap-2 px-3 py-1.5 border-t border-slate-50 hover:bg-slate-50 transition-colors">
              <StatusIcon ok={item.ok} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-700 leading-tight">
                  {item.id.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          )) : (
            <p className="text-[11px] text-slate-400 text-center py-3 italic">
              {loading ? "Verificando…" : "Clique em ↻ para verificar esta etapa."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function SistemaIntegridadeCheck() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [results,  setResults]  = useState({});
  const [loading,  setLoading]  = useState({});
  const [expanded, setExpanded] = useState({});
  const [runningAll, setRunningAll] = useState(false);

  const runEtapa = useCallback(async (etapa) => {
    setLoading(prev => ({ ...prev, [etapa.id]: true }));
    try {
      const res  = await base44.functions.invoke(etapa.fn, {});
      const data = res?.data ?? res;
      setResults(prev => ({ ...prev, [etapa.id]: data }));
      if ((data?.score ?? 100) < 100) {
        setExpanded(prev => ({ ...prev, [etapa.id]: true }));
      }
      return data;
    } catch (err) {
      const msg = String(err?.message || err).slice(0, 100);
      const errData = { score: 0, passed: 0, total: 10, items: [{ id: 'erro', ok: false, detail: msg }] };
      setResults(prev => ({ ...prev, [etapa.id]: errData }));
      toast.error(`${etapa.label}: ${msg}`);
      return errData;
    } finally {
      setLoading(prev => ({ ...prev, [etapa.id]: false }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setResults({});
    setExpanded({});
    setRunningAll(true);
    let allPassed = 0;
    for (const etapa of ETAPAS_META) {
      const data = await runEtapa(etapa);
      if (data?.score === 100) allPassed++;
    }
    setRunningAll(false);
    if (allPassed === ETAPAS_META.length) {
      toast.success("✅ Sistema 100% íntegro — todas as 5 etapas verificadas!");
    } else {
      toast.warning(`⚡ ${ETAPAS_META.length - allPassed} etapa(s) com atenção.`);
    }
  }, [runEtapa]);

  const resetCB = useCallback(() => {
    try {
      localStorage.removeItem('circuitBreakerState');
      localStorage.removeItem('cb_entity_counts');
      toast.success("Circuit Breaker resetado → CLOSED");
    } catch (_) {
      toast.error("Erro ao resetar Circuit Breaker");
    }
  }, []);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Score global ────────────────────────────────────────────────────────
  const allResults   = Object.values(results);
  const ran          = allResults.length > 0;
  const anyLoading   = runningAll || Object.values(loading).some(Boolean);
  const globalPassed = allResults.filter(r => r?.score === 100).length;
  const globalTotal  = ETAPAS_META.length;
  const globalPct    = allResults.length > 0
    ? Math.round(allResults.reduce((s, r) => s + (r?.score || 0), 0) / allResults.length)
    : 0;

  const globalColor = globalPassed === globalTotal ? "bg-green-500"
    : globalPct >= 70 ? "bg-amber-400" : "bg-red-400";

  // ── Contexto para exibição ──────────────────────────────────────────────
  const ctxLabel = grupoAtual
    ? `Grupo: ${grupoAtual.nome_do_grupo}`
    : empresaAtual
    ? `Empresa: ${empresaAtual.nome_fantasia || empresaAtual.razao_social}`
    : "Sem contexto";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Checkup — 5 Etapas Críticas
            </CardTitle>
            <p className="text-[10px] text-slate-500 mt-0.5">{ctxLabel}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              onClick={runAll}
              disabled={anyLoading}
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 h-7"
            >
              {anyLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              {anyLoading ? "Verificando…" : "Verificar Tudo"}
            </Button>
            <Button
              onClick={resetCB}
              size="sm"
              variant="outline"
              title="Resetar Circuit Breaker de rate limit (429)"
              className="gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
            >
              <Zap className="w-3 h-3" />
              CB
            </Button>
          </div>
        </div>

        {/* Scoreboard global */}
        {ran && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-[10px] px-2 ${
                globalPassed === globalTotal
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {globalPassed}/{globalTotal} etapas ✓
              </Badge>
              <Badge className="bg-slate-100 text-slate-600 text-[10px] px-2">
                Score: {globalPct}%
              </Badge>
              {globalPassed === globalTotal && (
                <Badge className="bg-green-100 text-green-700 text-[10px] px-2">
                  ✅ 100% íntegro
                </Badge>
              )}
            </div>
            <ProgressBar value={globalPct} color={globalColor} />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-1.5">
        {ETAPAS_META.map(meta => (
          <EtapaRow
            key={meta.id}
            meta={meta}
            result={results[meta.id]}
            loading={!!loading[meta.id]}
            onRun={() => runEtapa(meta)}
            expanded={!!expanded[meta.id]}
            onToggle={() => toggleExpand(meta.id)}
          />
        ))}

        {!ran && !anyLoading && (
          <div className="text-center py-4 space-y-1">
            <ShieldCheck className="w-8 h-8 text-slate-200 mx-auto" />
            <p className="text-xs text-slate-400">
              Clique em "Verificar Tudo" para o checkup completo.
            </p>
            <p className="text-[10px] text-slate-300">
              Execução sequencial ~6s total · 50 controles verificados
            </p>
          </div>
        )}

        {ran && !anyLoading && (
          <div className={`p-2.5 rounded-lg text-center text-xs font-semibold mt-1 ${
            globalPassed === globalTotal
              ? "bg-green-50 border border-green-200 text-green-700"
              : globalPct >= 70
              ? "bg-amber-50 border border-amber-200 text-amber-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {globalPassed === globalTotal
              ? `✅ Sistema 100% íntegro — ${globalTotal} etapas · 50 controles OK`
              : `⚡ ${globalTotal - globalPassed} etapa(s) com atenção · score médio ${globalPct}%`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}