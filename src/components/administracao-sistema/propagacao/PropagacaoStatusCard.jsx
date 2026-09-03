import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

/**
 * PropagacaoStatusCard — card individual de entidade na propagação.
 * v6: Propagação 100% automática por eventos (create/update → syncBidirectional).
 * Botões manuais removidos — card apenas de monitoramento.
 */
export default function PropagacaoStatusCard({ entity, st }) {
  const isErr = st?.status === "error";

  return (
    <div className={`p-3 rounded-xl border bg-white space-y-2 shadow-sm hover:shadow transition-all ${
      isErr ? "border-red-200" : "border-slate-200"
    }`}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold text-sm text-slate-900 truncate">
          {entity.icon} {entity.label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Badge className="text-[8px] px-1 py-0.5 bg-green-50 text-green-700 border-green-200" title="Propagação automática por evento ativa (create/update → syncBidirectional)">
            ⚡ Auto
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-slate-500 border-slate-200">
            {entity.grupo}
          </Badge>
          {isErr && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      </div>

      <p className="text-xs text-slate-500 truncate">{st?.message || "Sincronização automática ativa (por evento)"}</p>

      {st?.lastSync && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {st.lastSync}
        </p>
      )}

      {/* Status de erro expandido */}
      {isErr && (
        <div className="mt-1 text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 break-words">
          {st?.message}
        </div>
      )}
    </div>
  );
}