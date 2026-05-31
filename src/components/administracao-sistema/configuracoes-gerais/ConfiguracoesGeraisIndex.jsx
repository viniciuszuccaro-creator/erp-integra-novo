/**
 * ConfiguracoesGeraisIndex v4.0
 * Layout limpo em 2 colunas:
 * - Esquerda: ParametrosGeraisPanel (toggles persistentes)
 * - Direita: ConfigGlobal (fiscal, notificações, segurança)
 * Sem SistemaHealthDashboard pesado (movido para AdminKPIBar).
 */
import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ParametrosGeraisPanel from "@/components/administracao-sistema/configuracoes-gerais/ParametrosGeraisPanel";
import PropagacaoAutomacaoPanel from "@/components/administracao-sistema/propagacao/PropagacaoAutomacaoPanel";
import PropagacaoResumoStatus from "@/components/administracao-sistema/propagacao/PropagacaoResumoStatus";
import { Settings2 } from "lucide-react";

const ConfigGlobal = lazy(() => import("@/components/sistema/ConfigGlobal"));

function PanelSkeleton() {
  return <div className="h-48 rounded-xl bg-slate-100 animate-pulse w-full" />;
}

export default function ConfiguracoesGeraisIndex() {
  const { empresaAtual, grupoAtual } = useContextoVisual();

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Contexto atual */}
      <ContextoConfigBanner />

      {/* Resumo de propagação */}
      <PropagacaoResumoStatus />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">

        {/* ── Coluna Principal: Parâmetros ── */}
        <div className="xl:col-span-2 space-y-4">
          <ProtectedSection
            module="Sistema"
            section={["Configurações", "Gerais"]}
            action="visualizar"
            fallback={<div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg border">Sem permissão para Configurações Gerais.</div>}
          >
            <ParametrosGeraisPanel />
          </ProtectedSection>
        </div>

        {/* ── Coluna Lateral: Config Avançado + Propagação ── */}
        <div className="space-y-4">
          {/* Propagação rápida */}
          <PropagacaoAutomacaoPanel grupoAtual={grupoAtual} />

          {/* Config Global Fiscal/Notif/Segurança */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-600" />
                Parâmetros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ProtectedSection
                module="Sistema"
                section={["Configurações", "Gerais"]}
                action="visualizar"
                fallback={<div className="p-3 text-sm text-slate-500">Sem permissão.</div>}
              >
                <Suspense fallback={<PanelSkeleton />}>
                  <ConfigGlobal empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
                </Suspense>
              </ProtectedSection>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}