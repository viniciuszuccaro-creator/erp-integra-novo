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
import { RBAC_MODULES } from '@/lib/rbacModuleMap';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

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
    DashboardCorporativo: 'Dashboard',
  };

  // Render the main app
  return (
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
        const moduleName = pageModuleMap[path];
        const requiredAction = moduleName ? 'ver' : undefined;

        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              moduleName ? (
                <RBACRoute module={moduleName} action={requiredAction}>
                  <EmpresaSelectorGuard>
                    <LayoutWrapper currentPageName={path}>
                      <Page />
                    </LayoutWrapper>
                  </EmpresaSelectorGuard>
                </RBACRoute>
              ) : (
                <EmpresaSelectorGuard>
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                </EmpresaSelectorGuard>
              )
            }
          />
        );
      })}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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