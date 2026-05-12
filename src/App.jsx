import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import PlanoMelhoria from './pages/PlanoMelhoria';
import CicloX from './pages/CicloX';
import Empresas from './pages/Empresas';
import EmpresaOnboarding from './pages/EmpresaOnboarding';
import EmpresaSelectorGuard from '@/components/sistema/EmpresaSelectorGuard';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/lib/ErrorBoundary';

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
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          }
        />
      ))}
      <Route path="/PlanoMelhoria" element={
        <EmpresaSelectorGuard>
          <LayoutWrapper currentPageName="PlanoMelhoria">
            <PlanoMelhoria />
          </LayoutWrapper>
        </EmpresaSelectorGuard>
      } />
      <Route path="/CicloX" element={
        <EmpresaSelectorGuard>
          <LayoutWrapper currentPageName="CicloX">
            <CicloX />
          </LayoutWrapper>
        </EmpresaSelectorGuard>
      } />
      <Route path="/Empresas" element={
        <EmpresaSelectorGuard>
          <LayoutWrapper currentPageName="Empresas">
            <Empresas />
          </LayoutWrapper>
        </EmpresaSelectorGuard>
      } />
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