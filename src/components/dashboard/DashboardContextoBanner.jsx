/**
 * DashboardContextoBanner — Banner limpo mostrando o contexto ativo (Grupo vs. Empresa)
 * com botão de alternância rápida. Compatível com qualquer versão do useContextoVisual.
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Layers, ArrowLeftRight } from "lucide-react";

export default function DashboardContextoBanner() {
  const ctx = useContextoVisual();
  const empresaAtual = ctx?.empresaAtual;
  const grupoAtual = ctx?.grupoAtual;
  const estaNoGrupo = ctx?.estaNoGrupo;
  const alternarContexto = ctx?.alternarContexto;

  const isGrupo = !!estaNoGrupo || (!empresaAtual?.id && !!grupoAtual?.id);
  const nomeContexto = isGrupo
    ? (grupoAtual?.nome_do_grupo || "Grupo")
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa");

  // Não mostrar se não há contexto definido — return empty fragment to keep stable fiber
  if (!empresaAtual?.id && !grupoAtual?.id) return <></>;


  return (
    <div className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm ${
      isGrupo
        ? "bg-purple-50 border-purple-200 text-purple-800"
        : "bg-blue-50 border-blue-200 text-blue-800"
    }`}>
      <div className="flex items-center gap-2 flex-wrap">
        {isGrupo
          ? <Layers className="w-4 h-4 text-purple-600 shrink-0" />
          : <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
        }
        <span className="font-medium text-xs">
          {isGrupo ? "Visão Grupo:" : "Empresa:"}
        </span>
        <Badge variant="outline" className={`text-xs font-semibold ${
          isGrupo ? "border-purple-300 text-purple-700" : "border-blue-300 text-blue-700"
        }`}>
          {nomeContexto}
        </Badge>
        {isGrupo && (
          <span className="text-xs opacity-60 hidden sm:inline">— Dados consolidados de todas as empresas</span>
        )}
      </div>
      {typeof alternarContexto === "function" && grupoAtual?.id && empresaAtual?.id && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1.5 opacity-70 hover:opacity-100 shrink-0"
          onClick={alternarContexto}
        >
          <ArrowLeftRight className="w-3 h-3" />
          Alternar
        </Button>
      )}
    </div>
  );
}