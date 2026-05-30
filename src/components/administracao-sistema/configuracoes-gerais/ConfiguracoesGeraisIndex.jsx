import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ParametrosGeraisPanel from "@/components/administracao-sistema/configuracoes-gerais/ParametrosGeraisPanel";
import SistemaHealthDashboard from "@/components/sistema/SistemaHealthDashboard";

/**
 * ConfiguracoesGeraisIndex — Consolidado.
 * Abas redundantes (Herança/Versionamento/Conflitos) removidas.
 * Cada funcionalidade em seu único lugar: ConfigGlobal cuida de tudo.
 */
export default function ConfiguracoesGeraisIndex() {
  const { empresaAtual, grupoAtual } = useContextoVisual();

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <SistemaHealthDashboard />

      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* ─ Parâmetros Persistentes ─ */}
        <div className="flex-1 min-w-0">
          <ProtectedSection
            module="Sistema"
            section={["Configurações", "Gerais"]}
            action="visualizar"
            fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Configurações Gerais.</div>}
          >
            <ParametrosGeraisPanel />
          </ProtectedSection>
        </div>

        {/* ─ Config Global (legado / avançado) ─ */}
        <div className="flex-1 min-w-0">
          <Card className="w-full">
            <CardContent className="p-4 space-y-3">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection
                module="Sistema"
                section={["Configurações", "Gerais"]}
                action="visualizar"
                fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Configurações Gerais.</div>}
              >
                <ConfigGlobal empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}