/**
 * DashboardMultiempresaBanner — Banner contextual do Dashboard
 * Exibe status do grupo, propagação e acesso rápido à Administração
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, ArrowDownUp, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardMultiempresaBanner() {
  const { grupoAtual, empresaAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  const { data: propStatus } = useQuery({
    queryKey: ["dash-prop-status", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return null;
      const configs = await base44.entities.ConfiguracaoSistema
        .filter({ group_id: grupoAtual.id, chave: "propagacao_grupo_empresas_ativa" }, null, 1)
        .catch(() => []);
      return { propagacaoAtiva: configs?.[0]?.ativa === true };
    },
    enabled: !!grupoAtual?.id,
    staleTime: 300000,
  });

  // Se não há grupo nem empresa, não exibe nada
  if (!grupoAtual?.id && !empresaAtual?.id) return null;

  const isGrupo = estaNoGrupo && !!grupoAtual?.id;
  const nEmpresas = empresasDoGrupo?.length || 0;

  return (
    <div className={`w-full rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
      isGrupo
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg ${isGrupo ? "bg-blue-600" : "bg-slate-600"}`}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {isGrupo
              ? `Grupo: ${grupoAtual.nome_do_grupo}`
              : `Empresa: ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "—"}`}
          </p>
          <p className="text-xs text-slate-500">
            {isGrupo
              ? `${nEmpresas} empresa(s) vinculada(s)`
              : grupoAtual?.id ? `Grupo: ${grupoAtual.nome_do_grupo}` : "Contexto individual"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Status de propagação */}
        {grupoAtual?.id && (
          <div className="flex items-center gap-1.5">
            {propStatus?.propagacaoAtiva === true
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
            <span className="text-xs text-slate-600">
              {propStatus?.propagacaoAtiva === true ? "Propagação ativa" : "Propagação pausada"}
            </span>
          </div>
        )}

        {/* Badge contexto */}
        <Badge
          variant="outline"
          className={isGrupo
            ? "border-blue-300 text-blue-700 bg-blue-50"
            : "border-slate-300 text-slate-600"}
        >
          {isGrupo ? "Visão Grupo" : "Visão Empresa"}
        </Badge>

        {/* Link para Admin */}
        <Link
          to={createPageUrl("AdministracaoSistema?tab=propagacao")}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowDownUp className="w-3 h-3" />
          Propagação
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}