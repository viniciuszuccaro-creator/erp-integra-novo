/**
 * ConfiguracoesGeraisIndex v4.0
 * Layout limpo em 2 colunas:
 * - Esquerda: ParametrosGeraisPanel (toggles persistentes)
 * - Direita: ConfigGlobal (fiscal, notificações, segurança)
 * Sem SistemaHealthDashboard pesado (movido para AdminKPIBar).
 */
import React from "react";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import ParametrosGeraisPanel from "@/components/administracao-sistema/configuracoes-gerais/ParametrosGeraisPanel";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowDownUp } from "lucide-react";

export default function ConfiguracoesGeraisIndex() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Contexto atual */}
      <ContextoConfigBanner />

      {/* Link rápido para aba de Propagação */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <ArrowDownUp className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-slate-700">Gerencie a sincronização Grupo ↔ Empresas na aba</span>
        <Link
          to={createPageUrl("AdministracaoSistema?tab=propagacao")}
          className="font-semibold text-blue-700 hover:text-blue-900 underline"
        >
          Propagação Grupo↔Emp →
        </Link>
      </div>

      {/* Parâmetros principais — full width */}
      <ProtectedSection
        module="Sistema"
        section={["Configurações", "Gerais"]}
        action="visualizar"
        fallback={<div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg border">Sem permissão para Configurações Gerais.</div>}
      >
        <ParametrosGeraisPanel />
      </ProtectedSection>
    </div>
  );
}