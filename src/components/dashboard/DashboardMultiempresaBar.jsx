/**
 * DashboardMultiempresaBar — Barra de contexto multiempresa no topo do dashboard.
 * Permite trocar rapidamente entre empresas do grupo sem sair da tela.
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Layers, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function DashboardMultiempresaBar() {
  const { empresaAtual, grupoAtual, estaNoGrupo, selecionarEmpresa, alternarContexto } = useContextoVisual();
  const gId = grupoAtual?.id;

  const { data: empresas = [] } = useRLSQuery(
    'Empresa', {}, "-razao_social", 20,
    { staleTime: 300_000, enabled: !!gId }
  );

  // Não mostra se não há grupo ou empresas múltiplas — return empty fragment to keep stable fiber
  if (!gId || empresas.length <= 1) return <></>;


  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {/* Botão Grupo */}
      <button
        onClick={() => typeof alternarContexto === "function" && !estaNoGrupo && alternarContexto()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0 ${
          estaNoGrupo
            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
            : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
        }`}
      >
        <Layers className="w-3 h-3" />
        {grupoAtual?.nome_do_grupo || "Grupo"}
        {estaNoGrupo && <Badge className="ml-1 bg-white/20 text-white text-[9px] px-1 py-0">Ativo</Badge>}
      </button>

      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

      {/* Empresas */}
      {empresas.map((emp) => {
        const isActive = !estaNoGrupo && emp.id === empresaAtual?.id;
        return (
          <button
            key={emp.id}
            onClick={() => {
              if (selecionarEmpresa) selecionarEmpresa(emp.id);
              if (estaNoGrupo && typeof alternarContexto === "function") alternarContexto();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0 ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title={emp.razao_social || emp.nome_fantasia}
          >
            <Building2 className="w-3 h-3" />
            <span className="max-w-[120px] truncate">{emp.nome_fantasia || emp.razao_social}</span>
            {isActive && <Badge className="ml-1 bg-white/20 text-white text-[9px] px-1 py-0">Ativo</Badge>}
          </button>
        );
      })}

      <Link
        to={createPageUrl("AdministracaoSistema?tab=propagacao")}
        className="ml-auto shrink-0 flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-colors"
      >
        Sync →
      </Link>
    </div>
  );
}