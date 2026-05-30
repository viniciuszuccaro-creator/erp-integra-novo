import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * ContextoBanner v2.0
 * Exibe banner limpo sobre o contexto ativo (grupo/empresa)
 * Não-invasivo — apenas informa, não bloqueia
 */
export default function ContextoBanner({ modulo = "este módulo" }) {
  const { empresaAtual, grupoAtual, contexto, empresasDoGrupo } = useContextoVisual();

  // Contexto ativo: grupo selecionado OU empresa selecionada
  const temContexto = !!(empresaAtual?.id || grupoAtual?.id);

  if (!temContexto) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Selecione uma <strong>empresa</strong> ou <strong>grupo</strong> para carregar os dados de {modulo}.
        </span>
      </div>
    );
  }

  if (contexto === "grupo" && grupoAtual?.id) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm">
        <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          <strong>Grupo: {grupoAtual.nome_do_grupo}</strong>
          {empresasDoGrupo.length > 0 && (
            <span className="font-normal text-blue-700"> · {empresasDoGrupo.length} empresa(s)</span>
          )}
        </span>
      </div>
    );
  }

  if (empresaAtual?.id) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
        <span>
          <strong>{empresaAtual.nome_fantasia || empresaAtual.razao_social}</strong>
          {empresaAtual.cnpj && (
            <span className="font-normal text-green-700"> · CNPJ {empresaAtual.cnpj}</span>
          )}
        </span>
      </div>
    );
  }

  return null;
}