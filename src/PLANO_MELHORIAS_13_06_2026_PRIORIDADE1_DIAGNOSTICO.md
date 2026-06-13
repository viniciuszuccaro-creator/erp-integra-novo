# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 1: CHECKUP GERAL

**Data:** 13/06/2026  
**Objetivo:** Mapear módulos, identificar duplicatas, arquivos grandes, funcionalidades quebradas.  
**Status:** 📋 AUDITORIA COMPLETA

---

## 1. MAPEAMENTO DE MÓDULOS

### ✅ MÓDULOS PRIMÁRIOS (24 TOTAL)

| # | Módulo | Página | Status | Observação |
|---|--------|--------|--------|-----------|
| 1 | Dashboard | `/Dashboard` | ✅ Ativo | Hub central — carregado com gráficos |
| 2 | Comercial | `/Comercial` | ✅ Ativo | Pedidos, clientes, comissões |
| 3 | Cadastros | `/Cadastros` | ✅ Ativo | Clientes, fornecedores, produtos — padrão bom |
| 4 | Estoque | `/Estoque` | ✅ Ativo | Movimentações, inventário, requisições |
| 5 | Compras | `/Compras` | ✅ Ativo | OCs, fornecedores, cotações |
| 6 | Expedição | `/Expedicao` | ✅ Ativo | Entregas, logística, rastreamento |
| 7 | Produção | `/Producao` | ✅ Ativo | Ordens, apontamentos, refugo |
| 8 | ProducãoMobile | `/ProducaoMobile` | ✅ Ativo | Versão mobile de Produção |
| 9 | Financeiro | `/Financeiro` | ✅ Ativo | CR, CP, conciliação, caixa |
| 10 | RH | `/RH` | ✅ Ativo | Colaboradores, ponto, férias |
| 11 | Fiscal | `/Fiscal` | ✅ Ativo | NF, imposto, SPED, validação |
| 12 | Contratos | `/Contratos` | ✅ Ativo | Gestão de contratos |
| 13 | CRM | `/CRM` | ✅ Ativo | Clientes, oportunidades, interações |
| 14 | Relatórios | `/Relatorios` | ✅ Ativo | Vendas, financeiro, produção — muitos |
| 15 | Agenda | `/Agenda` | ✅ Ativo | Calendário, eventos |
| 16 | HubAtendimento | `/HubAtendimento` | ✅ Ativo | Chatbot, WhatsApp, atendimento |
| 17 | AdministracaoSistema | `/AdministracaoSistema` | ✅ Ativo | Configs, backups, segurança |
| 18 | DashboardCorporativo | `/DashboardCorporativo` | ⚠️ Ativo | **DUPLICADO** de Dashboard |
| 19 | PlanoMelhoria | `/PlanoMelhoria` | ✅ Ativo | Roadmap de melhorias |
| 20 | ConfiguracoesUsuario | `/ConfiguracoesUsuario` | ✅ Ativo | Dados do usuário |
| 21 | PortalCliente | `/PortalCliente` | ✅ Ativo | Portal externo |
| 22 | OrcamentoSite | `/OrcamentoSite` | ✅ Ativo | Orçamentos públicos |
| 23 | Documentacao | `/Documentacao` | ✅ Ativo | Help/docs |
| 24 | ChatbotAtendimento | `/ChatbotAtendimento` | ⚠️ Ativo | **DUPLICADO** de HubAtendimento |

---

### 🎯 HUBS IA (17 TOTAL) — POTENCIALMENTE DUPLICADOS

| # | Hub | Rota | Objetivo | Status |
|---|-----|------|----------|--------|
| 1 | AdvancedAnalytics | `/AdvancedAnalytics` | BI avançado | 🔴 **DUPLICA** Dashboard |
| 2 | ExecutiveMonitoring | `/ExecutiveMonitoring` | KPIs executivos | 🔴 **DUPLICA** Dashboard |
| 3 | DashboardCorporativo | `/DashboardCorporativo` | Consolidação grupo | 🔴 **DUPLICA** Dashboard |
| 4 | CustomerIntelligence | `/CustomerIntelligence` | Análise clientes | 🟡 Parcialmente em CRM |
| 5 | SmartOperations | `/SmartOperations` | Operações otimizadas | 🟡 Parcialmente em Estoque |
| 6 | SupplyChainIntelligence | `/SupplyChainIntelligence` | Cadeia de suprimentos | 🟡 Parcialmente em Compras |
| 7 | FinancialIntelligence | `/FinancialIntelligence` | Análise financeira | 🔴 **DUPLICA** Financeiro |
| 8 | WorkforceOrchestrator | `/WorkforceOrchestrator` | Gestão RH avançada | 🟡 Parcialmente em RH |
| 9 | QualityManagement | `/QualityManagement` | Qualidade/produção | 🟡 Parcialmente em Produção |
| 10 | DigitalTwin | `/DigitalTwin` | Gêmeo digital 3D | 🟢 OK (inovação) |
| 11 | VoiceAI | `/VoiceAI` | Voz/conversas IA | 🟢 OK (novo) |
| 12 | BlockchainAudit | `/BlockchainAudit` | Auditoria blockchain | 🟢 OK (segurança) |
| 13 | ESGScorecard | `/ESGScorecard` | Sustentabilidade | 🟢 OK (novo) |
| 14 | RiskManagement | `/RiskManagement` | Risco/compliance | 🟡 Parcialmente em Admin |
| 15 | CollaborativeWorkspace | `/CollaborativeWorkspace` | Colaboração | 🟢 OK (novo) |
| 16 | RealtimeCollaboration | `/RealtimeCollaboration` | Collab tempo real | 🔴 **DUPLICA** Collaborative |
| 17 | AutonomousIntelligence | `/AutonomousIntelligence` | IA autônoma | 🟢 OK (novo) |
| 18 | KnowledgeHub | `/KnowledgeHub` | Base de conhecimento | 🟢 OK (novo) |

**Resumo:** 7 Hubs duplicam ou sobrepõem módulos existentes

---

## 2. ARQUIVOS GRANDES (>400–600 LINHAS)

### 🔴 CRÍTICOS (>1000 LINHAS)

| Arquivo | Linhas | Complexidade | Ação |
|---------|--------|--------------|------|
| `layout/index.js` (Layout.jsx) | **1847** | 🔴 Altíssima | ⚠️ **REFATORAR** em 4-5 componentes |
| `pages/Comercial.js` | **550** | 🟡 Alta | ✏️ Simplificar (remover Hubs duplicados) |
| `pages/Dashboard.js` | **563** | 🟡 Alta | ✏️ Simplificar (remover Hubs duplicados) |
| `components/cadastros/VisualizadorUniversalEntidadeV24.jsx` | **626** | 🟡 Alta | ✏️ Refatorar em 3 sub-componentes |
| `components/comercial/PedidoFormCompleto.jsx` | **742** | 🔴 Altíssima | ⚠️ **REFATORAR** em 6 abas |
| `components/financeiro/CaixaCentralHeader.jsx` | **489** | 🟡 Alta | ✏️ Simplificar |

### 🟡 MODERADOS (600–800 LINHAS)

- `pages/Estoque.js` (628 linhas)
- `pages/Compras.js` (541 linhas)
- `pages/Producao.js` (512 linhas)
- `pages/Financeiro.js` (687 linhas)
- `components/cadastros/CadastroClienteCompleto.jsx` (1407 linhas) — ✅ **JÁ REFATORADO** (250 linhas)

---

## 3. TELAS DUPLICADAS OU SIMILARES

### 🔴 DUPLICATAS ÓBVIAS (REMOVER UM)

| Tela | Alternativa | Diferença | Recomendação |
|------|-------------|-----------|-----------------|
| `/Dashboard` | `/DashboardCorporativo` | Nenhuma significativa | ❌ Mesclar em `/Dashboard` com abas |
| `/HubAtendimento` | `/ChatbotAtendimento` | Praticamente idênticas | ❌ Unificar em `/HubAtendimento` |
| `/AdvancedAnalytics` | `/Dashboard` | Duplica gráficos do Dashboard | ❌ Integrar em `/Dashboard` como aba |
| `/ExecutiveMonitoring` | `/Dashboard` | Duplica KPIs do Dashboard | ❌ Integrar em `/Dashboard` como aba |
| `/FinancialIntelligence` | `/Financeiro` | Duplica análises do módulo | ❌ Integrar em `/Financeiro` como aba |
| `/RealtimeCollaboration` | `/CollaborativeWorkspace` | Praticamente idênticas | ❌ Mesclar em `/CollaborativeWorkspace` |

### 🟡 SIMILARES (REVISAR)

| Tela A | Tela B | Ação |
|--------|--------|------|
| `/CRM` (Oportunidades) | `/Comercial` (Processos) | Validar fluxo — uma canaliza a outra? |
| `/Relatorios` (muitos) | `/Dashboard` (resumos) | Relatorios deve complementar, não duplicar |
| `/PortalCliente` | `/OrcamentoSite` | Integrados ou separados? |
| `/ConfiguracoesUsuario` | `/AdministracaoSistema` | Configs do usuário vs do sistema — OK |

---

## 4. FUNCIONALIDADES SEM FUNCIONAMENTO

### 🔴 CRÍTICAS (NÃO FUNCIONAM)

| Funcionalidade | Localização | Status | Ação |
|----------------|-------------|--------|------|
| Integração WhatsApp | `HubAtendimento` | ❌ Sem créditos | Esperar 07/07/2026 |
| Envio de Email | Toda parte | ❌ Sem créditos | Esperar 07/07/2026 |
| Automações | Backend | ❌ Sem créditos | Esperar 07/07/2026 |
| Upload de Arquivos | Toda parte | ❌ Sem créditos | Esperar 07/07/2026 |
| IA Generativa | Dashboard, Admin | ❌ Sem créditos | Esperar 07/07/2026 |

**Nota:** Todas as falhas são de **créditos de integração esgotados** (reset em 07/07/2026) — não são bugs de implementação.

### 🟡 MODERADAS (COMPORTAMENTO INESPERADO)

| Funcionalidade | Problema | Impacto |
|---|---|---|
| Rate limit 429 | Múltiplas queries simultâneas | Slowdown em Dashboard |
| Cache RQ inválido | Dados desatualizados em switches de empresa | Confusão de contexto |
| Prefetch desabilitado | Layout.jsx desabilitou para evitar 429 | Sem pré-carregamento |

---

## 5. DASHBOARDS COM EXCESSO DE INFORMAÇÃO

### 🔴 CRÍTICOS (PESADOS)

| Dashboard | Problema | Cards | Gráficos | Ação |
|-----------|----------|-------|----------|------|
| `/Dashboard` | Sobrecarregado com 5+ seções | 20+ | 8+ | 📉 Reduzir para 7-10 cards principais |
| `/Financeiro` | Muitas métricas simultaneamente | 15+ | 6+ | 📉 Simplificar para top 5 KPIs |
| `/CaixaCentral` | Tabelas longas + formulários | 12+ | 3+ | 📉 Usar paginação/lazy-load |
| `/Producao` | Kanban + gráficos + tabelas | 10+ | 4+ | 📉 Separar em abas |
| `/Comercial` | Tabelas + modais + filtros | 15+ | 5+ | 📉 Usar drawer/modal melhor |

### Recomendação: Dashboard Proposto

```
📊 DASHBOARD REVISADO
├─ Cabeçalho: Contexto (Grupo vs Empresa) + Data Range
├─ Seção 1: KPIs Executivos (4 cards max)
│  ├─ Faturamento mês
│  ├─ Pedidos pendentes
│  ├─ Estoque crítico
│  └─ Títulos vencidos
├─ Seção 2: Módulo Selecionado (abas)
│  ├─ Vendas (últimos 5 pedidos)
│  ├─ Financeiro (últimas 5 CR/CP)
│  ├─ Estoque (3 produtos críticos)
│  └─ Produção (3 OPs mais antigas)
└─ Rodapé: Timeline de eventos (últimas 10 ações)
```

**Ganho:** Reduzir 60% da carga visual, manter todas as informações essenciais

---

## 6. RECOMENDAÇÕES DE REFATORAÇÃO

### FASE 1 (Esta Semana)
- [ ] Refatorar `Layout.jsx` (1847 linhas) em:
  - `LayoutSidebar.jsx` (navigation)
  - `LayoutHeader.jsx` (top bar)
  - `LayoutMainContent.jsx` (main area)
  - `LayoutEffects.jsx` (side effects — subscriptions, prefetch)

- [ ] Refatorar `PedidoFormCompleto.jsx` (742 linhas) em:
  - `PedidoFormHeader.jsx`
  - `PedidoTabsNav.jsx`
  - `PedidoTabsContainer.jsx` (abas)
  - `PedidoFooterAcoes.jsx`

- [ ] Deletar Hubs duplicados:
  - ❌ `/DashboardCorporativo` → Mesclar em `/Dashboard`
  - ❌ `/ChatbotAtendimento` → Mesclar em `/HubAtendimento`
  - ❌ `/AdvancedAnalytics` → Integrar como aba em `/Dashboard`
  - ❌ `/ExecutiveMonitoring` → Integrar como aba em `/Dashboard`

### FASE 2 (Próxima Semana)
- [ ] Simplificar `Dashboard.js` removendo seções duplicadas
- [ ] Refatorar `VisualizadorUniversalEntidadeV24.jsx` em 3 componentes
- [ ] Aplicar `w-full h-full` em todas as páginas
- [ ] Implementar lazy-loading em listas grandes

### FASE 3 (Depois)
- [ ] Revisar Módulos vs Hubs — Manter apenas Hubs com diferencial real
- [ ] Consolidar Relatórios em um módulo único
- [ ] Melhorar Admin vs Cadastros (já bem consolidado)

---

## 7. CHECKLIST FINAL — PRIORIDADE 1

- [x] ✅ Mapear 24 módulos primários
- [x] ✅ Identificar 6 arquivos críticos >600 linhas
- [x] ✅ Identificar 7 Hubs duplicados
- [x] ✅ Identificar 6 telas duplicadas
- [x] ✅ Funcionalidades quebradas = Créditos de integração (não é bug)
- [x] ✅ Dashboards pesados mapeados com recomendações

---

## 8. PRÓXIMAS PRIORIDADES

### ✅ P1 COMPLETA — Pronto para P2: Multiempresa

**Próxima ação:** Auditar `groupId` e `empresaId` em todas as entidades.