/**
 * SistemaIntegridadeCheck v4.0 — Componente de UI
 * Lógica de checks extraída para integridade/etapasConfig.js
 * Mantém: filtros, runAll/runSingle, reset CB, scoreboard.
 */
import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, XCircle, Loader2,
  ShieldCheck, RefreshCw, Zap
} from "lucide-react";
import { toast } from "sonner";
import { ETAPAS } from "./integridade/etapasConfig";

// ─── Helpers de UI ──────────────────────────────────────────────────────────

function StatusIcon({ ok }) {
  if (ok === true) return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (ok === "warn") return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SistemaIntegridadeCheck() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterEtapa, setFilterEtapa] = useState(null);

  const ctx = { grupoAtual, empresaAtual };

  const runEtapa = useCallback(async (etapa) => {
    const api = base44.asServiceRole || base44;
    for (const check of etapa.checks) {
      try {
        const res = await check.run(api, ctx);
        setResults(prev => ({ ...prev, [check.id]: res }));
      } catch (e) {
        setResults(prev => ({ ...prev, [check.id]: { ok: false, msg: String(e?.message || e).slice(0, 80) } }));
      }
    }
  }, [grupoAtual?.id, empresaAtual?.id]);

  const runAll = useCallback(async () => {
    setLoading(true);
    setResults({});
    for (const etapa of ETAPAS) {
      await runEtapa(etapa);
    }
    setLoading(false);
    toast.success("Checkup completo — 5 etapas verificadas!");
  }, [runEtapa]);

  const runSingle = useCallback(async (etapaId) => {
    setLoading(true);
    const etapa = ETAPAS.find(e => e.id === etapaId);
    if (etapa) await runEtapa(etapa);
    setLoading(false);
    toast.success(`E${etapaId}: ${etapa?.label} verificada!`);
  }, [runEtapa]);

  const resetCB = () => {
    localStorage.removeItem('circuitBreakerState');
    setResults(prev => ({ ...prev, circuit_state: { ok: true, msg: "Circuit Breaker resetado — estado: CLOSED" } }));
    toast.success("Circuit Breaker resetado!");
  };

  const allChecks = ETAPAS.flatMap(e => e.checks);
  const ran       = Object.keys(results).length > 0;
  const okCount   = Object.values(results).filter(r => r.ok === true).length;
  const warnCount = Object.values(results).filter(r => r.ok === "warn").length;
  const errCount  = Object.values(results).filter(r => r.ok === false).length;
  const total     = allChecks.length;
  const pct       = total > 0 ? Math.round((okCount / total) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        {/* Título + ações */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Checkup ao vivo — 5 Etapas
          </CardTitle>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              onClick={runAll}
              disabled={loading}
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 h-7"
            >
              {loading
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

        {/* Filtros por etapa */}
        <div className="flex gap-1 flex-wrap mt-2">
          <button
            onClick={() => setFilterEtapa(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
              !filterEtapa
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            Todas
          </button>
          {ETAPAS.map(e => (
            <button
              key={e.id}
              onClick={() => setFilterEtapa(prev => prev === e.id ? null : e.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                filterEtapa === e.id
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              E{e.id}: {e.label}
            </button>
          ))}
        </div>

        {/* Scoreboard */}
        {ran && (
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            <Badge className="bg-green-100 text-green-700 text-[10px]">{okCount} OK</Badge>
            {warnCount > 0 && <Badge className="bg-amber-100 text-amber-700 text-[10px]">{warnCount} Atenção</Badge>}
            {errCount  > 0 && <Badge className="bg-red-100 text-red-700 text-[10px]">{errCount} Erro</Badge>}
            <Badge className="bg-slate-100 text-slate-600 text-[10px]">{pct}% OK</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {ETAPAS.filter(e => !filterEtapa || e.id === filterEtapa).map(etapa => (
          <div key={etapa.id}>
            {/* Header da etapa */}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${etapa.color}`}>
                E{etapa.id}: {etapa.label} — {etapa.desc}
              </span>
              <button
                onClick={() => runSingle(etapa.id)}
                disabled={loading}
                className="text-[10px] text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              >
                Testar E{etapa.id}
              </button>
            </div>

            {/* Checks da etapa */}
            <div className="space-y-1">
              {etapa.checks.map(check => {
                const res = results[check.id];
                const isRunning = loading && !res;
                return (
                  <div
                    key={check.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white transition-colors"
                  >
                    {isRunning
                      ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0 mt-0.5" />
                      : res
                      ? <StatusIcon ok={res.ok} />
                      : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">{check.label}</p>
                      {res && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{res.msg}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Estado inicial */}
        {!ran && !loading && (
          <p className="text-xs text-slate-400 text-center py-3">
            Clique em "Verificar Tudo" para o checkup completo das 5 etapas.
          </p>
        )}

        {/* Resultado final */}
        {ran && (
          <div className={`p-3 rounded-lg text-center text-xs font-semibold ${
            errCount  > 0 ? "bg-red-50 text-red-700" :
            warnCount > 0 ? "bg-amber-50 text-amber-700" :
            "bg-green-50 text-green-700"
          }`}>
            {errCount  > 0
              ? `⚠️ ${errCount} erro(s) crítico(s) — ação necessária`
              : warnCount > 0
              ? `💡 ${warnCount} aviso(s) — revise as configurações indicadas`
              : `✅ Sistema 100% íntegro — todas as 5 etapas OK (${pct}%)`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}