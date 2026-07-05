import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, XCircle, Loader2,
  ChevronDown, ChevronRight,
  GitMerge, ToggleLeft, Lock, Activity, BookOpen,
} from "lucide-react";
import { ETAPAS_META } from "./integridadeMeta";

const ICON_MAP = { GitMerge, ToggleLeft, Lock, Activity, BookOpen };

export function StatusIcon({ ok, size = "sm" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  if (ok === true) return <CheckCircle2 className={`${cls} text-green-500 shrink-0`} />;
  if (ok === "warn") return <AlertCircle className={`${cls} text-amber-500 shrink-0`} />;
  return <XCircle className={`${cls} text-red-500 shrink-0`} />;
}

export function ProgressBar({ value, color = "bg-blue-500" }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function IntegridadeEtapaRow({ metaId, result, loading, onRun, expanded, onToggle }) {
  const meta = ETAPAS_META.find(m => m.id === metaId);
  const IconComp = ICON_MAP[meta.icon];
  const items = result?.items || [];
  const score = result?.score ?? null;
  const passed = result?.passed ?? 0;
  const total = result?.total ?? 0;
  const status = score === null ? null : score === 100 ? true : score >= 70 ? "warn" : false;
  const barColor = score === 100 ? "bg-green-500" : score >= 70 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
        onClick={onToggle}
      >
        {IconComp && <IconComp className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800">{meta.label}</span>
            {score !== null && (
              <Badge className={`text-[10px] px-1.5 py-0 ${
                score === 100 ? 'bg-green-100 text-green-700' :
                score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
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
            ? <ChevronDown className="w-3 h-3 text-slate-400" />
            : <ChevronRight className="w-3 h-3 text-slate-400" />}
        </div>
      </div>
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