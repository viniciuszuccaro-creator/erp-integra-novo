/**
 * SistemaIntegridadeCheck v5.0
 * Usa as funções backend faseXCheck reais (já validadas 100%).
 * UI limpa: progresso por etapa, score global, ações diretas.
 */
import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, XCircle, Loader2,
  ShieldCheck, RefreshCw, Zap, ChevronDown, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// ─── Mapa das 5 etapas ──────────────────────────────────────────────────────
const ETAPAS_META = [
  { id: 1, fn: 'fase1Check', label: "Segurança & RBAC",       color: "bg-blue-100 text-blue-800",   dot: "bg-blue-500" },
  { id: 2, fn: 'fase2Check', label: "Multi-empresa",           color: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  { id: 3, fn: 'fase3Check', label: "Orquestração de Módulos", color: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
  { id: 4, fn: 'fase4Check', label: "Atendimento & Canais",    color: "bg-red-100 text-red-800",     dot: "bg-red-500" },
  { id: 5, fn: 'fase5Check', label: "Integrações & Rate Limit",color: "bg-green-100 text-green-800", dot: "bg-green-500" },
];

// ─── Helpers de UI ──────────────────────────────────────────────────────────
function StatusIcon({ ok }) {
  if (ok === true)    return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
  if (ok === "warn")  return <AlertCircle  className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  return                     <XCircle      className="w-3.5 h-3.5 text-red-500 shrink-0" />;
}

function EtapaRow({ meta, result, loading, onRun, expanded, onToggle }) {
  const items  = result?.items || [];
  const score  = result?.score ?? null;
  const passed = result?.passed ?? 0;
  const total  = result?.total ?? 0;

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      {/* Header da etapa */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={onToggle}
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
          : score !== null
          ? <StatusIcon ok={score === 100 ? true : score >= 70 ? "warn" : false} />
          : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
        }
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${meta.color}`}>
          E{meta.id}
        </span>
        <span className="text-xs font-medium text-slate-700 flex-1">{meta.label}</span>
        {score !== null && (
          <Badge className={`text-[10px] px-1.5 ${score === 100 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {passed}/{total}
          </Badge>
        )}
        <button
          onClick={e => { e.stopPropagation(); onRun(); }}
          disabled={loading}
          className="text-[10px] text-blue-600 hover:text-blue-800 underline disabled:opacity-40 ml-1"
        >
          ↻
        </button>
        {expanded
          ? <ChevronDown className="w-3 h-3 text-slate-400" />
          : <ChevronRight className="w-3 h-3 text-slate-400" />
        }
      </div>

      {/* Items detalhados */}
      {expanded && items.length > 0 && (
        <div className="divide-y divide-slate-50">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors">
              <StatusIcon ok={item.ok} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-700 leading-tight">
                  {item.id.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && !result && !loading && (
        <p className="text-[11px] text-slate-400 text-center py-2">Clique em ↻ para verificar esta etapa.</p>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function SistemaIntegridadeCheck() {
  const [results,  setResults]  = useState({}); // { 1: {score,passed,total,items}, ... }
  const [loading,  setLoading]  = useState({}); // { 1: bool, ... }
  const [expanded, setExpanded] = useState({}); // { 1: bool, ... }

  const runEtapa = useCallback(async (etapa) => {
    setLoading(prev => ({ ...prev, [etapa.id]: true }));
    try {
      const res = await base44.functions.invoke(etapa.fn, {});
      setResults(prev => ({ ...prev, [etapa.id]: res?.data || res }));
      // Auto-expandir se houver falhas
      const data = res?.data || res;
      if (data?.score < 100) setExpanded(prev => ({ ...prev, [etapa.id]: true }));
    } catch (err) {
      const msg = err?.message?.slice(0, 60) || 'Erro';
      setResults(prev => ({ ...prev, [etapa.id]: { score: 0, passed: 0, total: 10, items: [{ id: 'erro', ok: false, detail: msg }] } }));
      toast.error(`E${etapa.id}: ${msg}`);
    } finally {
      setLoading(prev => ({ ...prev, [etapa.id]: false }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setResults({});
    setExpanded({});
    // Executa todas em paralelo para ser mais rápido
    await Promise.all(ETAPAS_META.map(e => runEtapa(e)));
    toast.success("Checkup completo — 5 etapas verificadas!");
  }, [runEtapa]);

  const resetCB = () => {
    localStorage.removeItem('circuitBreakerState');
    toast.success("Circuit Breaker resetado — estado: CLOSED");
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Scoreboard global
  const allResults    = Object.values(results);
  const ran           = allResults.length > 0;
  const anyLoading    = Object.values(loading).some(Boolean);
  const globalPassed  = allResults.filter(r => r?.score === 100).length;
  const globalTotal   = ETAPAS_META.length;
  const globalPct     = allResults.length > 0
    ? Math.round(allResults.reduce((s, r) => s + (r?.score || 0), 0) / allResults.length)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        {/* Título + ações */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Checkup ao vivo — 5 Etapas
          </CardTitle>
          <div className="flex gap-1.5">
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
              Verificar Tudo
            </Button>
            <Button
              onClick={resetCB}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-red-300 text-red-700 hover:bg-red-50 h-7"
            >
              <Zap className="w-3 h-3" />
              Reset CB
            </Button>
          </div>
        </div>

        {/* Scoreboard global */}
        {ran && (
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            <Badge className={`text-[10px] ${globalPassed === globalTotal ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {globalPassed}/{globalTotal} etapas 100%
            </Badge>
            <Badge className="bg-slate-100 text-slate-600 text-[10px]">
              Score médio: {globalPct}%
            </Badge>
            {globalPassed === globalTotal && (
              <Badge className="bg-green-100 text-green-700 text-[10px]">✅ Sistema íntegro</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-1.5">
        {ETAPAS_META.map(meta => (
          <EtapaRow
            key={meta.id}
            meta={meta}
            result={results[meta.id]}
            loading={loading[meta.id]}
            onRun={() => runEtapa(meta)}
            expanded={!!expanded[meta.id]}
            onToggle={() => toggleExpand(meta.id)}
          />
        ))}

        {!ran && !anyLoading && (
          <p className="text-xs text-slate-400 text-center py-3">
            Clique em "Verificar Tudo" para o checkup completo das 5 etapas.
          </p>
        )}

        {ran && (
          <div className={`p-2.5 rounded-lg text-center text-xs font-semibold mt-1 ${
            globalPassed === globalTotal
              ? "bg-green-50 text-green-700"
              : globalPct >= 70
              ? "bg-amber-50 text-amber-700"
              : "bg-red-50 text-red-700"
          }`}>
            {globalPassed === globalTotal
              ? `✅ Sistema 100% íntegro — ${globalTotal} etapas verificadas`
              : `⚡ ${globalTotal - globalPassed} etapa(s) com atenção — score médio ${globalPct}%`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}