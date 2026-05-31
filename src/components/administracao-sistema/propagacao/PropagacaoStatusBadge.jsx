/**
 * PropagacaoStatusBadge — Badge compacto exibindo status da propagação.
 * Usado em cards de entidade, cabeçalhos de módulo e listagens.
 */
import React from "react";
import { ArrowDownUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  ok:       { label: "Sincronizado",  icon: CheckCircle2, cls: "bg-green-100 text-green-700 border-green-200" },
  error:    { label: "Erro Sync",     icon: AlertCircle,  cls: "bg-red-100 text-red-700 border-red-200" },
  checking: { label: "Sincronizando", icon: ArrowDownUp,  cls: "bg-blue-100 text-blue-700 border-blue-200" },
  idle:     { label: "Pendente",      icon: Clock,        cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function PropagacaoStatusBadge({ status = "idle", lastSync = null, compact = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span title={cfg.label + (lastSync ? ` • ${lastSync}` : "")} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${cfg.cls}`}>
        <Icon className="w-2.5 h-2.5" />
      </span>
    );
  }

  return (
    <Badge className={`inline-flex items-center gap-1 text-xs ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
      {lastSync && <span className="text-[9px] opacity-70">· {lastSync}</span>}
    </Badge>
  );
}