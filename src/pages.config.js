/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdministracaoSistema from './pages/AdministracaoSistema';
import Agenda from './pages/Agenda';
import CRM from './pages/CRM';
import Cadastros from './pages/Cadastros';
// ChatbotAtendimento removida — funcionalidade consolidada em HubAtendimento (P5)
import Comercial from './pages/Comercial';
import Compras from './pages/Compras';
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario';
import Contratos from './pages/Contratos';
import Dashboard from './pages/Dashboard';

import Documentacao from './pages/Documentacao';
import EntregasMobile from './pages/EntregasMobile';
import Estoque from './pages/Estoque';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Fiscal from './pages/Fiscal';
import Home from './pages/Home';
import HubAtendimento from './pages/HubAtendimento';
import OrcamentoSite from './pages/OrcamentoSite';
import PortalCliente from './pages/PortalCliente';
import Producao from './pages/Producao';
import ProducaoMobile from './pages/ProducaoMobile';
import RH from './pages/RH';
import Relatorios from './pages/Relatorios';
import __Layout from './Layout.jsx';


// === Classificação de Páginas (Vol 3.2 — Auditoria) ===
// [INTERNA]       — Página administrativa, requer RBAC + EmpresaSelectorGuard
// [MOBILE]        — Página otimizada para app mobile, requer RBAC + EmpresaSelectorGuard
// [PORTAL]        — Página do Portal do Cliente, autenticação por token (portalToken)
// [PUBLICA]       — Página pública/site, sem autenticação obrigatória
export const PAGES = {
    // --- INTERNA (RBAC: Sistema) ---
    "AdministracaoSistema": AdministracaoSistema,
    // --- INTERNA (RBAC: Agenda) ---
    "Agenda": Agenda,
    // --- INTERNA (RBAC: CRM) ---
    "CRM": CRM,
    // --- INTERNA (RBAC: Cadastros) ---
    "Cadastros": Cadastros,
    // --- INTERNA (RBAC: Comercial) ---
    "Comercial": Comercial,
    // --- INTERNA (RBAC: Compras) ---
    "Compras": Compras,
    // --- INTERNA (RBAC: Sistema) ---
    "ConfiguracoesUsuario": ConfiguracoesUsuario,
    // --- INTERNA (RBAC: Contratos) ---
    "Contratos": Contratos,
    // --- INTERNA (RBAC: Dashboard) ---
    "Dashboard": Dashboard,
    // --- INTERNA (RBAC: Sistema) ---
    "Documentacao": Documentacao,
    // --- MOBILE (RBAC: Expedicao) — acessada via app mobile, sem sidebar ---
    "EntregasMobile": EntregasMobile,
    // --- INTERNA (RBAC: Estoque) ---
    "Estoque": Estoque,
    // --- INTERNA (RBAC: Expedicao) ---
    "Expedicao": Expedicao,
    // --- INTERNA (RBAC: Financeiro) ---
    "Financeiro": Financeiro,
    // --- INTERNA (RBAC: Fiscal) ---
    "Fiscal": Fiscal,
    // --- PUBLICA (landing/redirect) ---
    "Home": Home,
    // --- INTERNA (RBAC: HubAtendimento) ---
    "HubAtendimento": HubAtendimento,
    // --- PUBLICA (orçamento do site, sem login obrigatório) ---
    "OrcamentoSite": OrcamentoSite,
    // --- PORTAL (token-based auth, isolado do ERP interno) ---
    "PortalCliente": PortalCliente,
    // --- INTERNA (RBAC: Producao) ---
    "Producao": Producao,
    // --- MOBILE (RBAC: Producao) — acessada via app mobile, sem sidebar ---
    "ProducaoMobile": ProducaoMobile,
    // --- INTERNA (RBAC: RH) ---
    "RH": RH,
    // --- INTERNA (RBAC: Relatorios) ---
    "Relatorios": Relatorios,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};