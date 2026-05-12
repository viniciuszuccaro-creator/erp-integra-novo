import React from "react";
import { CheckCircle2, Shield, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useModuleImprovementContext from "@/components/lib/useModuleImprovementContext";

export default function ModuleImprovementBar({ moduleName = "Sistema" }) {
  const { status, pillars, canView, empresaNome, grupoNome, contexto } = useModuleImprovementContext(moduleName);

  if (!canView) return null;

  const progress = status.progress || 0;
  const color =
    progress >= 90 ? "bg-emerald-500" :
    progress >= 70 ? "bg-blue-500" :
    progress >= 50 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Esquerda: nome + progresso */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
              Plano de Melhoria
            </Badge>
            <span className="text-sm font-semibold text-slate-900">{moduleName}</span>
          </div>
          {/* Barra de progresso */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 tabular-nums">{progress}%</span>
            <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{status.focus}</p>
        </div>

        {/* Direita: contexto + pilares + link */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
            <Shield className="h-3 w-3 text-blue-600" />
            {contexto === "grupo" ? (grupoNome || "Grupo") : (empresaNome || "Empresa")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
            <Zap className="h-3 w-3 text-amber-600" /> IA + governança
          </span>
          <span className="hidden items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 md:inline-flex">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {pillars.length} pilares ativos
          </span>
          <Link
            to={createPageUrl("PlanoMelhoria")}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Ver plano <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}