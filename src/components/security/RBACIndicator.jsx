/**
 * RBACIndicator — Indicador visual compacto de permissão.
 * Mostra um ícone verde/vermelho indicando se o usuário tem acesso.
 * Útil para tabelas e listas onde o acesso é granular.
 */
import React from "react";
import usePermissions from "@/components/lib/usePermissions";
import { CheckCircle2, XCircle, Lock } from "lucide-react";

export default function RBACIndicator({ module, section, action = "visualizar", showLabel = false, className = "" }) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return <div className={`w-4 h-4 rounded-full bg-slate-200 animate-pulse ${className}`} />;
  }

  const allowed = isAdmin() || hasPermission(module, section, action);

  if (!showLabel) {
    return allowed
      ? <CheckCircle2 className={`w-4 h-4 text-green-500 ${className}`} />
      : <XCircle className={`w-4 h-4 text-red-400 ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      {allowed
        ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Permitido</span></>
        : <><Lock className="w-3.5 h-3.5 text-red-400" /><span className="text-red-500">Bloqueado</span></>
      }
    </div>
  );
}