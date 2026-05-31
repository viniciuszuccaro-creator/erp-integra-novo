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
import { RBAC_MODULES } from '@/lib/rbacModuleMap';
import WorkforceOrchestratorHub from '@/components/workforce-orchestrator/WorkforceOrchestratorHub';
import SupplyChainIntelligenceHub from '@/components/supply-chain-intelligence/SupplyChainIntelligenceHub';
import FinancialIntelligenceHub from '@/components/financial-intelligence/FinancialIntelligenceHub';
import AdvancedAnalyticsHub from '@/components/business-intelligence/AdvancedAnalyticsHub';
import ExecutiveMonitoringHub from '@/components/executive-monitoring/ExecutiveMonitoringHub';
import CustomerIntelligenceHub from '@/components/customer-intelligence/CustomerIntelligenceHub';
import SmartOperationsHub from '@/components/smart-operations/SmartOperationsHub';
import CollaborativeWorkspaceHub from '@/components/collaborative-workspace/CollaborativeWorkspaceHub';
import BlockchainAuditHub from '@/components/blockchain-audit/BlockchainAuditHub';
import ESGScorecardHub from '@/components/esg/ESGScorecardHub';
import DigitalTwinHub from '@/components/digital-twin/DigitalTwinHub';
import VoiceAIHub from '@/components/voice-ai/VoiceAIHub';
import RiskManagementHub from '@/components/risk-compliance/RiskManagementHub';
import KnowledgeManagementHub from '@/components/knowledge-hub/KnowledgeManagementHub';
import AutonomousIntelligenceHub from '@/components/autonomous-intelligence/AutonomousIntelligenceHub';

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
    DashboardCorporativo: 'Dashboard',
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
        <Route path="/WorkforceOrchestrator" element={
          <RBACRoute module="RH" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="WorkforceOrchestrator">
                <WorkforceOrchestratorHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/SupplyChainIntelligence" element={
          <RBACRoute module="Compras" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="SupplyChainIntelligence">
                <SupplyChainIntelligenceHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/FinancialIntelligence" element={
          <RBACRoute module="Financeiro" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="FinancialIntelligence">
                <FinancialIntelligenceHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/AdvancedAnalytics" element={
          <RBACRoute module="Dashboard" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="AdvancedAnalytics">
                <AdvancedAnalyticsHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/ExecutiveMonitoring" element={
          <RBACRoute module="Dashboard" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="ExecutiveMonitoring">
                <ExecutiveMonitoringHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/BlockchainAudit" element={
          <RBACRoute module="Sistema" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="BlockchainAudit">
                <BlockchainAuditHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/ESGScorecard" element={
          <RBACRoute module="Dashboard" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="ESGScorecard">
                <ESGScorecardHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/DigitalTwin" element={
          <RBACRoute module="Producao" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="DigitalTwin">
                <DigitalTwinHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/VoiceAI" element={
          <RBACRoute module="HubAtendimento" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="VoiceAI">
                <VoiceAIHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/KnowledgeHub" element={
          <EmpresaSelectorGuard>
            <LayoutWrapper currentPageName="KnowledgeHub">
              <KnowledgeManagementHub />
            </LayoutWrapper>
          </EmpresaSelectorGuard>
        } />
        <Route path="/AutonomousIntelligence" element={
          <RBACRoute module="Dashboard" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="AutonomousIntelligence">
                <AutonomousIntelligenceHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/RiskManagement" element={
          <RBACRoute module="Sistema" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="RiskManagement">
                <RiskManagementHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/CollaborativeWorkspace" element={
          <RBACRoute module="Administrativo" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="CollaborativeWorkspace">
                <CollaborativeWorkspaceHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/SmartOperations" element={
          <RBACRoute module="Producao" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="SmartOperations">
                <SmartOperationsHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
        <Route path="/CustomerIntelligence" element={
          <RBACRoute module="CRM" action="ver">
            <EmpresaSelectorGuard>
              <LayoutWrapper currentPageName="CustomerIntelligence">
                <CustomerIntelligenceHub />
              </LayoutWrapper>
            </EmpresaSelectorGuard>
          </RBACRoute>
        } />
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