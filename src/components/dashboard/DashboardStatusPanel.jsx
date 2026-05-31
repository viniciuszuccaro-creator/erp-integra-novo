/**
 * DashboardStatusPanel — Painel de status compacto para o Dashboard.
 * Mostra: contexto ativo, saúde do sistema, alertas de propagação.
 * Substitui múltiplos banners redundantes.
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, Layers, CheckCircle2, AlertCircle, ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardStatusPanel() {
  const { empresaAtual, grupoAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  if (!empresaAtual?.id && !estaNoGrupo && !grupoAtual?.id) {
    return (
      <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Nenhuma empresa ou grupo selecionado. <Link to={createPageUrl("Cadastros")} className="underline font-semibold">Selecionar</Link></span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm">
      {/* Contexto */}
      <div className="flex items-center gap-2">
        {estaNoGrupo ? (
          <><Layers className="w-4 h-4 text-purple-600" /><span className="font-semibold text-slate-800">{grupoAtual?.nome_do_grupo || "Grupo"}</span><Badge className="bg-purple-100 text-purple-700 text-[10px]">Grupo ({empresasDoGrupo.length} emp.)</Badge></>
        ) : (
          <><Building2 className="w-4 h-4 text-blue-600" /><span className="font-semibold text-slate-800">{empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa"}</span><Badge className="bg-blue-100 text-blue-700 text-[10px]">Empresa</Badge></>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200 hidden sm:block" />

      {/* Propagação */}
      <div className="flex items-center gap-1.5">
        <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500">Propagação automática</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        <span className="text-xs text-green-600 font-medium">Ativa</span>
      </div>

      <Link
        to={createPageUrl("AdministracaoSistema?tab=propagacao")}
        className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1"
      >
        Gerenciar →
      </Link>
    </div>
  );
}