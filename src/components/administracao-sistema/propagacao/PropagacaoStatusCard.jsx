import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Loader2, CheckCircle2, AlertCircle, Clock, RefreshCw } from "lucide-react";

/**
 * PropagacaoStatusCard — card individual de entidade na propagação.
 * Extrai lógica de renderização do PropagacaoIndex para manter arquivos pequenos.
 */
export default function PropagacaoStatusCard({ entity, st, globalLoading, onSync }) {
  const isErr = st?.status === "error";
  const isOk = st?.status === "ok";
  const isRunning = st?.status === "checking";
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`p-3 rounded-xl border bg-white space-y-2 transition-all shadow-sm hover:shadow ${
      isErr ? "border-red-200" : isOk ? "border-green-200" : "border-slate-200"
    }`}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold text-sm text-slate-900 truncate">
          {entity.icon} {entity.label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Badge className="text-[8px] px-1 py-0.5 bg-green-50 text-green-700 border-green-200" title="Propagação automática por evento ativa">
            ⚡ Auto
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-slate-500 border-slate-200">
            {entity.grupo}
          </Badge>
          {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
          {isErr && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
          {isOk && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
        </div>
      </div>

      <p className="text-xs text-slate-500 truncate">{st?.message || "Sincronização automática ativa (por evento)"}</p>

      {st?.lastSync && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {st.lastSync}
        </p>
      )}

      {isOk && st?.total > 0 && (
        <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
          {st.total} reg. sincronizado(s)
        </Badge>
      )}

      {/* Reprocessamento manual (recuperação) — a propagação primária é por evento automático */}
      <div className="flex gap-1 pt-1 flex-wrap">
        <p className="text-[9px] text-slate-400 w-full mb-0.5">Reprocessar manual (recuperação):</p>
        <Button
          size="sm" variant="outline"
          disabled={globalLoading || isRunning}
          onClick={() => onSync(entity.name, "down")}
          className="flex-1 text-xs h-7 gap-1 min-w-[36px]"
          title="Reprocessar: Grupo → Empresa"
        >
          <ArrowDown className="w-3 h-3" />
          <span className="hidden sm:inline">↓</span>
        </Button>
        <Button
          size="sm" variant="outline"
          disabled={globalLoading || isRunning}
          onClick={() => onSync(entity.name, "up")}
          className="flex-1 text-xs h-7 gap-1 min-w-[36px]"
          title="Reprocessar: Empresa → Grupo"
        >
          <ArrowUp className="w-3 h-3" />
          <span className="hidden sm:inline">↑</span>
        </Button>
        <Button
          size="sm" variant="ghost"
          disabled={globalLoading || isRunning}
          onClick={() => onSync(entity.name, "both")}
          className="flex-1 text-xs h-7 min-w-[36px]"
          title="Reprocessar bidirecional"
        >
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
        </Button>
      </div>

      {/* Status de erro expandido */}
      {isErr && (
        <div className="mt-1 text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 break-words">
          {st?.message}
        </div>
      )}
    </div>
  );
}