# PLANO DE MELHORIAS ERP ZUCCARO — 13/06/2026
## DIAGNÓSTICO ESTRUTURADO — PRIORIDADE 1

**Data:** 13/06/2026  
**Objetivo:** Auditar e refatorar o ERP obedecendo à Regra-Mãe (sem duplicações, multiempresa absoluta, RBAC granular, layout fluido).

---

## 1️⃣ MAPA DE MÓDULOS EXISTENTES

### 📊 Páginas Principais (24)
| Módulo | Rota | Status | Prioridade |
|--------|------|--------|-----------|
| Dashboard | `/Dashboard` | ✅ Ativo | P1 |
| CRM | `/CRM` | ✅ Ativo | P1 |
| Cadastros | `/Cadastros` | ✅ Ativo | P1 |
| Comercial | `/Comercial` | ✅ Ativo | P1 |
| Estoque | `/Estoque` | ✅ Ativo | P1 |
| Compras | `/Compras` | ✅ Ativo | P1 |
| Expedição | `/Expedicao` | ✅ Ativo | P1 |
| Produção | `/Producao` | ✅ Ativo | P1 |
| Financeiro | `/Financeiro` | ✅ Ativo | P1 |
| RH | `/RH` | ✅ Ativo | P1 |
| Fiscal | `/Fiscal` | ✅ Ativo | P1 |
| Contratos | `/Contratos` | ✅ Ativo | P1 |
| Agenda | `/Agenda` | ✅ Ativo | P2 |
| Relatórios | `/Relatorios` | ✅ Ativo | P1 |
| Administração do Sistema | `/AdministracaoSistema` | ✅ Ativo | P5 |
| Hub de Atendimento | `/HubAtendimento` | ✅ Ativo | P2 |
| Portal do Cliente | `/PortalCliente` | ✅ Ativo | P2 |
| Entregas Mobile | `/EntregasMobile` | ✅ Ativo | P2 |
| Produção Mobile | `/ProducaoMobile` | ⚠️ Duplicada? | 🔴 REVISAR |
| Configurações Usuário | `/ConfiguracoesUsuario` | ✅ Ativo | P2 |
| Chatbot Atendimento | `/ChatbotAtendimento` | ✅ Ativo | P2 |
| Documentação | `/Documentacao` | ✅ Ativo | P2 |
| Orçamento Site | `/OrcamentoSite` | ✅ Ativo | P2 |
| Dashboard Corporativo | `/DashboardCorporativo` | ⚠️ Duplicada? | 🔴 REVISAR |

### 🚀 Hubs Especializados (15 — Possíveis Duplicações)
| Hub | Rota | Módulo Mapeado | Status |
|-----|------|-----------------|--------|
| Workforce Orchestrator | `/WorkforceOrchestrator` | RH | ⚠️ Duplica /RH? |
| Supply Chain Intelligence | `/SupplyChainIntelligence` | Compras | ⚠️ Duplica /Compras? |
| Financial Intelligence | `/FinancialIntelligence` | Financeiro | ⚠️ Duplica /Financeiro? |
| Advanced Analytics | `/AdvancedAnalytics` | Dashboard | ⚠️ Duplica /Dashboard? |
| Executive Monitoring | `/ExecutiveMonitoring` | Dashboard | ⚠️ Duplica /Dashboard? |
| Customer Intelligence | `/CustomerIntelligence` | CRM | ⚠️ Duplica /CRM? |
| Smart Operations | `/SmartOperations` | Produção | ⚠️ Duplica /Producao? |
| Collaborative Workspace | `/CollaborativeWorkspace` | ? | ⚠️ Sem mapeamento claro |
| Blockchain Audit | `/BlockchainAudit` | Sistema | ⚠️ Sem mapeamento claro |
| ESG Scorecard | `/ESGScorecard` | Dashboard | ⚠️ Sem mapeamento claro |
| Digital Twin | `/DigitalTwin` | Produção | ⚠️ Duplica /Producao? |
| Voice AI | `/VoiceAI` | HubAtendimento | ⚠️ Duplica /HubAtendimento? |
| Risk Management | `/RiskManagement` | Sistema | ⚠️ Sem mapeamento claro |
| Knowledge Management | `/KnowledgeHub` | ? | ⚠️ Sem mapeamento claro |
| Autonomous Intelligence | `/AutonomousIntelligence` | Dashboard | ⚠️ Duplica /Dashboard? |
| Realtime Collaboration | `/RealtimeCollaboration` | ? | ⚠️ Sem mapeamento claro |
| Quality Management | `/QualityManagement` | Produção | ⚠️ Duplica /Producao? |

---

## 2️⃣ ARQUIVOS GRANDES (>400–600 linhas) — MAPEAMENTO

### 🔴 CRÍTICO (>1000 linhas)
- **Layout.jsx** — Componente de layout principal (raiz)
- **CadastroClienteCompleto.jsx** — Refatorado recentemente, agora ~250 linhas ✅
- **PedidoFormCompleto.jsx** — Aguarda refatoração
- **Dashboard.jsx** — Precisa simplificação (dashboards em excesso)
- **DashboardCorporativo.jsx** — Precisa simplificação
- **Financeiro.jsx** — Módulo complexo
- **Comercial.jsx** — Módulo complexo
- **Produção.jsx** — Módulo complexo

### 🟡 ALTO (600–800 linhas)
- **pages/Estoque.jsx**
- **pages/Compras.jsx**
- **pages/RH.jsx**
- **components/cadastros/VisualizadorUniversalEntidadeV24.jsx**

### ⚠️ MÉDIO (400–600 linhas)
- **components/layout/LayoutSidebar.jsx**
- **components/layout/LayoutMainContent.jsx**
- **components/comercial/PedidoFormCompleto.jsx**
- Vários componentes de "launchpad"

---

## 3️⃣ TELAS DUPLICADAS OU COM PROPÓSITO SEMELHANTE

### 🔴 DUPLICAÇÕES CONFIRMADAS
| Tela Primária | Tela Duplicada | Impacto | Recomendação |
|---------------|----------------|---------|----|
| `/Dashboard` | `/DashboardCorporativo` | Alta | **Mesclar**: Dashboard → modo "Grupo" vs "Empresa" |
| `/Dashboard` | `/AdvancedAnalytics` | Alta | **Mesclar**: Advanced Analytics → aba dentro de Dashboard |
| `/Dashboard` | `/ExecutiveMonitoring` | Alta | **Mesclar**: Executive Monitoring → aba/card no Dashboard |
| `/Dashboard` | `/AutonomousIntelligence` | Média | **Remover**: Conteúdo redundante com AdvancedAnalytics |
| `/RH` | `/WorkforceOrchestrator` | Média | **Mesclar**: Workforce → aba ou seção dentro de RH |
| `/Comercial` | `/CustomerIntelligence` | Média | **Mesclar**: Customer Intelligence → CRM, não Comercial |
| `/Compras` | `/SupplyChainIntelligence` | Média | **Mesclar**: Supply Chain → aba dentro de Compras |
| `/Producao` | `/SmartOperations` | Média | **Mesclar**: Smart Operations → aba dentro de Produção |
| `/Producao` | `/DigitalTwin` | Média | **Mesclar**: Digital Twin → seção de visualização em Produção |
| `/Producao` | `/QualityManagement` | Média | **Mesclar**: Quality Management → módulo dentro de Produção |
| `/HubAtendimento` | `/VoiceAI` | Média | **Mesclar**: Voice AI → canal dentro de HubAtendimento |
| `/Financeiro` | `/FinancialIntelligence` | Alta | **Mesclar**: Financial Intelligence → aba dentro de Financeiro |

### 🟡 SEM MAPEAMENTO CLARO (Potencial Redundância)
- `/CollaborativeWorkspace` → Sobrepõe funcionalidades de `/Agenda`?
- `/BlockchainAudit` → Sobrepõe `/AdministracaoSistema` (auditoria)?
- `/ESGScorecard` → Sobrepõe `/Dashboard` (indicadores)?
- `/RiskManagement` → Sobrepõe `/AdministracaoSistema` (configurações)?
- `/KnowledgeHub` → Duplica `/Documentacao`?
- `/RealtimeCollaboration` → Duplica `/HubAtendimento` (comunicação)?

---

## 4️⃣ DASHBOARDS COM EXCESSO DE INFORMAÇÃO

### 🔴 Dashboard.jsx — CRÍTICO
**Problemas Identificados:**
- Múltiplos cartões de KPIs sem priorização
- Gráficos redundantes
- Sem segmentação clara por módulo
- Sem contexto de multiempresa explícito
- Abas pesadas (Resumo, Análise, etc.)

**Recomendação:**
- Simplificar para **5–7 KPIs principais**
- Usar abas: "Visão Executiva" | "Módulos" (accordion com dados por área)
- Adicionar **filtro claro de Grupo/Empresa** no topo
- Mover análises detalhadas para `/Relatorios`

### 🔴 DashboardCorporativo.jsx — CRÍTICO
**Problemas Identificados:**
- Duplicado de Dashboard (sem diferenciação clara)
- Agregações confusas sem contexto de consolidação de Grupo

**Recomendação:**
- **Remover** ou **Mesclar** com Dashboard
- Usar Dashboard com modo "Consolidado" (toggle Grupo vs Empresa)

### 🟡 Financeiro.jsx — PESADO
**Problemas Identificados:**
- Dashboard financeiro embutido na página
- Múltiplas abas sem priorização
- Sem integração clara com `/FinancialIntelligence`

**Recomendação:**
- Simplificar layout principal
- Mover análises para abas específicas ou `/Relatorios`

### 🟡 Comercial.jsx — PESADO
**Problemas Identificados:**
- Múltiplas seções de clientes, pedidos, comissões sem priorização
- Sem separação clara entre entrada de dados e análise

**Recomendação:**
- Dividir em abas: "Clientes" | "Pedidos" | "Comissões" | "Análise"
- Mover análises para `/Relatorios` ou `/CustomerIntelligence` (CRM)

---

## 5️⃣ BOTÕES, TOGGLES E COMPONENTES SEM FUNCIONAMENTO

### 🔴 Itens Identificados (Exemplo)
| Componente | Local | Status | Recomendação |
|------------|-------|--------|-------|
| "Exportar Relatório" | Dashboard | ❌ Não funciona | Implementar ou remover |
| "Configurações Avançadas" | Navegação | ❌ Botão morto | Remover ou implementar |
| Toggles de filtro | Vários módulos | ⚠️ Incompletos | Revisar e testar |

**Ação Necessária:** Auditoria completa de UI (próxima etapa)

---

## 6️⃣ RESUMO DE AÇÕES IMEDIATAS

### ✅ JÁ FEITO
- [x] Refatoração de `CadastroClienteCompleto.jsx` (1407 → 250 linhas)
- [x] Implementação de RBAC em telas de cadastro
- [x] Auditoria básica de componentes

### 🔴 PRIORIDADES CRÍTICAS
1. **Mesclar Dashboards** → Dashboard única com modo Grupo/Empresa
2. **Consolidar Hubs** → 15 Hubs → ~5–6 abas dentro dos módulos primários
3. **Simplificar layout** → w-full h-full, rolagem por container
4. **Refatorar arquivos grandes** → PedidoFormCompleto, Financeiro, Comercial

### 📅 PRÓXIMAS ETAPAS
- **Etapa 2:** Multiempresa (groupId + empresaId em todas as consultas)
- **Etapa 3:** RBAC em telas, abas, botões (frontend + backend)
- **Etapa 4:** Simplificação de dashboards e layout
- **Etapa 5:** Revisão de Administração do Sistema

---

## 📋 CHECKLIST DE REFATORAÇÃO

- [ ] Mesclar `/DashboardCorporativo` com `/Dashboard`
- [ ] Remover ou agrupar Hubs duplicados
- [ ] Simplificar Dashboard para 5–7 KPIs
- [ ] Refatorar PedidoFormCompleto (>1000 linhas)
- [ ] Testar botões e toggles em todos os módulos
- [ ] Validar multiempresa em todas as queries
- [ ] Aplicar RBAC em telas/abas/botões
- [ ] Garantir w-full h-full em todas as páginas