import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { AlertTriangle } from "lucide-react";

/**
 * Banner exibido quando nenhuma empresa/grupo está selecionado
 * Simples, não-invasivo, informativo
 */
export default function SemEmpresaBanner({ modulo = "este módulo" }) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  const contextoAtivo = !!(empresaAtual?.id || grupoAtual?.id);

  if (contextoAtivo) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Selecione uma <strong>empresa</strong> ou <strong>grupo</strong> para visualizar os dados de {modulo}.
      </span>
    </div>
  );
}