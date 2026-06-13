// v2026-05-27
import React, { useEffect } from 'react'
import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import EmpresaOnboarding from './pages/EmpresaOnboarding';
import EmpresaSelectorGuard from '@/components/sistema/EmpresaSelectorGuard';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/lib/ErrorBoundary';
import RBACRoute from '@/components/lib/RBACRoute';
// P5: Todos os Hubs de IA removidos como rotas dedicadas — sem link de navegação, código morto
// Funcionalidades mantidas dentro dos módulos principais (Producao, RH, Compras, CRM, etc.)


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  const isLoading = isLoadingPublicSettings || isLoadingAuth;

  // Handle auth_required redirect (side-effect only, no DOM change)
  useEffect(() => {
    if (!isLoading && authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [isLoading, authError?.type]);

  const showUserNotRegistered = !isLoading && authError?.type === 'user_not_registered';

  // Mapa de páginas para módulos RBAC
  const pageModuleMap = {
    Dashboard: 'Dashboard',
    Relatorios: 'Relatorios',
    Agenda: 'Agenda',
    CRM: 'CRM',
    Cadastros: 'Cadastros',
    Comercial: 'Comercial',
    Estoque: 'Estoque',
    Compras: 'Compras',
    Expedicao: 'Expedicao',
    Producao: 'Producao',
    Financeiro: 'Financeiro',
    RH: 'RH',
    Fiscal: 'Fiscal',
    Contratos: 'Contratos',
    AdministracaoSistema: 'Sistema',
    HubAtendimento: 'HubAtendimento',
    // DashboardCorporativo: removido da navegação (P5 — duplicata do Dashboard)
  };

  // Render the main app — always keep Routes mounted to avoid Suspense fiber tree destruction.
  // Overlays sit on top; the Routes subtree is never unmounted/swapped.
  return (
    <div className="w-full h-full">
      <Routes>
        <Route path="/EmpresaOnboarding" element={<EmpresaOnboarding />} />
        <Route path="/" element={
          <EmpresaSelectorGuard>
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          </EmpresaSelectorGuard>
        } />
        {Object.entries(Pages).map(([path, Page]) => {
          // Skip deprecated pages
          if (['DemoMultitarefas', 'portal', 'portalcliente'].includes(path)) {
            return null;
          }
          
          const moduleName = pageModuleMap[path];
          const requiredAction = moduleName ? 'ver' : undefined;

          const PageContent = moduleName ? (
            <RBACRoute module={moduleName} action={requiredAction}>
              <Page />
            </RBACRoute>
          ) : (
            <Page />
          );

          return (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <EmpresaSelectorGuard>
                  <LayoutWrapper currentPageName={path}>
                    {PageContent}
                  </LayoutWrapper>
                </EmpresaSelectorGuard>
              }
            />
          );
        })}
        {/* P5: Hubs de IA removidos como rotas dedicadas (sem link de navegação = código morto) */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {/* Loading overlay — always mounted, toggled via display to prevent fiber tree shifts */}
      <div
        className="fixed inset-0 flex items-center justify-center bg-white/80 z-50"
        style={{ display: isLoading ? 'flex' : 'none' }}
      >
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
      {/* User not registered overlay — always mounted, toggled via display */}
      <div
        className="fixed inset-0 z-50 bg-white"
        style={{ display: showUserNotRegistered ? 'flex' : 'none' }}
      >
        <UserNotRegisteredError />
      </div>
    </div>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ErrorBoundary>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
        </ErrorBoundary>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App