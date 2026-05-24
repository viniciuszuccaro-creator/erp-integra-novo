import React from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, Users } from "lucide-react";

export default function ModuleLayout({ title, subtitle, actions, children, className = "", showContextBadge = true }) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const isGroup = contexto === 'grupo';
  const contextLabel = isGroup
    ? (grupoAtual?.nome_do_grupo || 'Grupo')
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || '');

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <ModuleHeader>
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {showContextBadge && contextLabel && (
              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                isGroup
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {isGroup
                  ? <Users className="w-3 h-3" />
                  : <Building2 className="w-3 h-3" />
                }
                {contextLabel}
              </span>
            )}
            {actions}
          </div>
        </div>
      </ModuleHeader>
      {children}
    </div>
  );
}