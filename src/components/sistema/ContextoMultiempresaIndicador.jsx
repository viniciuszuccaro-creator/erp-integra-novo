/**
 * ContextoMultiempresaIndicador
 * Exibe o contexto atual (Grupo vs Empresa) + botão rápido para alternar
 * Usa: useContextoVisual + localStorage
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, Factory } from "lucide-react";

export default function ContextoMultiempresaIndicador() {
  const { contexto, empresaAtual, grupoAtual, alternarContexto } = useContextoVisual();

  return (
    <button
      onClick={alternarContexto}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors"
      title="Clique para alternar entre Grupo e Empresa"
    >
      {contexto === 'grupo' ? (
        <>
          <Factory className="w-3 h-3" />
          <span>🏢 Grupo</span>
        </>
      ) : (
        <>
          <Building2 className="w-3 h-3" />
          <span>🏪 {empresaAtual?.nome_fantasia?.slice(0, 15) || 'Empresa'}</span>
        </>
      )}
    </button>
  );
}