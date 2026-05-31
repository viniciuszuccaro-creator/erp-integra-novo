/**
 * MultiempresaContextBadge — Badge que exibe o contexto multiempresa ativo.
 * Usado em formulários e listas para indicar em qual empresa/grupo a operação será feita.
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, Layers, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MultiempresaContextBadge({ className = "", compact = false }) {
  const { empresaAtual, grupoAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  if (!empresaAtual?.id && !estaNoGrupo && !grupoAtual?.id) {
    return (
      <Badge className={`gap-1 bg-amber-100 text-amber-700 border-amber-200 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        {!compact && "Sem contexto selecionado"}
        {compact && "Sem contexto"}
      </Badge>
    );
  }

  if (estaNoGrupo) {
    return (
      <Badge className={`gap-1 bg-purple-100 text-purple-700 border-purple-200 ${className}`}>
        <Layers className="w-3 h-3" />
        {compact
          ? grupoAtual?.nome_do_grupo || "Grupo"
          : `${grupoAtual?.nome_do_grupo || "Grupo"} (${empresasDoGrupo.length} emp.)`
        }
      </Badge>
    );
  }

  return (
    <Badge className={`gap-1 bg-blue-100 text-blue-700 border-blue-200 ${className}`}>
      <Building2 className="w-3 h-3" />
      {empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa"}
    </Badge>
  );
}