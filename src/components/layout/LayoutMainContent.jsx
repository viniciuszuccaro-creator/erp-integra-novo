import React from 'react';
import ErrorBoundary from '@/components/lib/ErrorBoundary';
import BootstrapGuard from '@/components/lib/BootstrapGuard';
import EmpresaOnboardingGuard from '@/components/sistema/EmpresaOnboardingGuard';
import ProtectedSection from '@/components/security/ProtectedSection';
import GuardRails from '@/components/lib/GuardRails';
import WindowRenderer from '@/components/lib/WindowRenderer';
import MinimizedWindowsBar from '@/components/lib/MinimizedWindowsBar';

export default function LayoutMainContent({ children, moduleName, currentPageName, integrationsOk, hasPermission }) {
  return (
    <main className="flex-1 flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-auto min-h-0">
        <ErrorBoundary>
          <BootstrapGuard>
            <EmpresaOnboardingGuard>
              <ProtectedSection module={moduleName || 'Sistema'} action="ver" fallback={<div className="p-10 text-center text-slate-600">Acesso negado a este módulo.</div>}>
                <GuardRails currentPageName={currentPageName}>
                  <div className="w-full h-full min-h-0">
                    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">{children}</div>
                  </div>
                </GuardRails>
              </ProtectedSection>
            </EmpresaOnboardingGuard>
          </BootstrapGuard>
        </ErrorBoundary>
      </div>

      <WindowRenderer />
      <MinimizedWindowsBar />
    </main>
  );
}