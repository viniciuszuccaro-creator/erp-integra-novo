import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownUp, CheckCircle2, Building2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * WidgetPropagacaoStatus — mini-widget do Dashboard
 * Mostra status rápido da propagação grupo↔empresas
 */
export default function WidgetPropagacaoStatus() {
  const { grupoAtual, empresasDoGrupo, contexto, empresaAtual } = useContextoVisual();

  if (!grupoAtual?.id && !empresaAtual?.id) return null;

  const nEmpresasVinculadas = empresasDoGrupo?.length || 0;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ArrowDownUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900">Propagação Bidirecional</p>
              <p className="text-xs text-blue-700 mt-0.5">
                {contexto === "grupo"
                  ? `Grupo ativo · ${nEmpresasVinculadas} empresa(s)`
                  : `Empresa ativa · ${grupoAtual?.nome_do_grupo || "sem grupo"}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Ativa</span>
            </div>
            <Link
              to={createPageUrl("AdministracaoSistema") + "?tab=propagacao"}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Gerenciar
            </Link>
          </div>
        </div>

        {nEmpresasVinculadas > 0 && contexto === "grupo" && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              {empresasDoGrupo.slice(0, 3).map((emp) => (
                <span
                  key={emp.id}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full text-xs text-blue-700 border border-blue-200"
                >
                  <Building2 className="w-2.5 h-2.5" />
                  {emp.nome_fantasia || emp.razao_social}
                </span>
              ))}
              {nEmpresasVinculadas > 3 && (
                <span className="text-xs text-blue-600">+{nEmpresasVinculadas - 3}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}