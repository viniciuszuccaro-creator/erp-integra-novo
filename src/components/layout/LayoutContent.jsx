import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import BootstrapGuard from "@/components/lib/BootstrapGuard";
import EmpresaOnboardingGuard from "@/components/sistema/EmpresaOnboardingGuard";
import ProtectedSection from "@/components/security/ProtectedSection";
import GuardRails from "@/components/lib/GuardRails";
import LayoutHeader from "./LayoutHeader";
import LayoutSidebar from "./LayoutSidebar";
import { Toaster } from "@/components/ui/toaster";

/**
 * Componente refatorado que encapsula todo o layout
 * Mantém estado de abas, toggles e contexto multiempresa
 */
export default function LayoutContent({
  children,
  currentPageName,
  navigationItems,
  groupedItems,
  modoEscuro,
  setModoEscuro,
  pesquisaOpen,
  setPesquisaOpen,
  isOffline,
  setIsOffline,
  integracoesOk,
  setIntegracoesOk,
}) {
  const { user } = useUser();
  const { empresaAtual, contexto, hasPermission } = useContextoVisual();
  const location = useLocation();

  const modulePageMap = {
    Dashboard: "Dashboard",
    Relatorios: "Relatorios",
    Agenda: "Agenda",
    CRM: "CRM",
    Cadastros: "Cadastros",
    Comercial: "Comercial",
    Estoque: "Estoque",
    Compras: "Compras",
    Expedicao: "Expedicao",
    Producao: "Producao",
    Financeiro: "Financeiro",
    RH: "RH",
    Fiscal: "Fiscal",
    Contratos: "Contratos",
    AdministracaoSistema: "Sistema",
    HubAtendimento: "HubAtendimento",
  };

  const moduleName = modulePageMap[currentPageName] || "Sistema";
  const isMobilePage = currentPageName === "ProducaoMobile";

  return (
    <>
      {/* Mobile page: always mounted, visibility toggled via display */}
      <div
        className="w-full h-full min-h-screen"
        style={{ display: isMobilePage ? undefined : "none" }}
      >
        {children}
      </div>

      {/* Desktop layout */}
      <div
        className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50"
        style={{ display: isMobilePage ? "none" : undefined }}
      >
        <LayoutSidebar
          navigationItems={navigationItems}
          user={user}
          groupedItems={groupedItems}
          modoEscuro={modoEscuro}
          setModoEscuro={setModoEscuro}
        />

        <main className="flex-1 flex flex-col">
          <LayoutHeader
            setPesquisaOpen={setPesquisaOpen}
            isOffline={isOffline}
            empresaAtual={empresaAtual}
            contexto={contexto}
            integracoesOk={integracoesOk}
            hasPermission={hasPermission}
          />

          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              <BootstrapGuard>
                <EmpresaOnboardingGuard>
                  <ProtectedSection
                    module={moduleName}
                    action="ver"
                    fallback={
                      <div className="p-10 text-center text-slate-600">
                        Acesso negado a este módulo.
                      </div>
                    }
                  >
                    <GuardRails currentPageName={currentPageName}>
                      <div className="w-full h-full">
                        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 space-y-4">
                          {children}
                        </div>
                      </div>
                    </GuardRails>
                  </ProtectedSection>
                </EmpresaOnboardingGuard>
              </BootstrapGuard>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <Toaster />
    </>
  );
}