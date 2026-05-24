/**
 * PropagacaoStatusCard — Card de status de uma entidade propagada.
 * Mostra contagem de registros sincronizados e última sincronização.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, ArrowDownUp } from "lucide-react";

export default function PropagacaoStatusCard({ entidade, criados = 0, atualizados = 0, pulados = 0, total = 0, erro = null, direction }) {
  const ok = !erro && (criados + atualizados) >= 0;
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${erro ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
      <div className="flex items-center gap-2 min-w-0">
        {erro
          ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          : <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        }
        <span className="text-sm font-medium text-slate-800 truncate">{entidade}</span>
        {direction && (
          <Badge className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700 flex items-center gap-0.5">
            <ArrowDownUp className="w-2.5 h-2.5" />{direction}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
        {criados > 0 && <span className="text-green-600 font-medium">+{criados}</span>}
        {atualizados > 0 && <span className="text-blue-600 font-medium">~{atualizados}</span>}
        {pulados > 0 && <span className="text-slate-400">{pulados} skip</span>}
        <span>/{total} total</span>
        {erro && <span className="text-red-600 text-[10px] truncate max-w-[100px]">{String(erro).slice(0, 40)}</span>}
      </div>
    </div>
  );
}