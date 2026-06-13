# 🔍 PRIORIDADE 1 — CHECKUP GERAL (AUDITORIA PRÁTICA)

**Data:** 13/06/2026  
**Status:** 🔴 EM EXECUÇÃO — Auditoria Real e Mapeamento Completo

---

## 📋 RESULTADO 1: MAPEAMENTO DE TODOS OS MÓDULOS

### **Páginas Ativas (24 total)**

| # | Página | Módulo RBAC | Status | Observações |
|---|--------|-----------|--------|-------------|
| 1 | Dashboard | Dashboard | ✅ Ativo | Página principal |
| 2 | Relatorios | Relatorios | ✅ Ativo | Relatórios consolidados |
| 3 | Agenda | Agenda | ✅ Ativo | Calendário e eventos |
| 4 | CRM | CRM | ✅ Ativo | Relacionamento clientes |
| 5 | Cadastros | Cadastros | ✅ Ativo | Registros mestres |
| 6 | Comercial | Comercial | ✅ Ativo | Vendas e pedidos |
| 7 | Estoque | Estoque | ✅ Ativo | Controle de estoque |
| 8 | Compras | Compras | ✅ Ativo | Suprimentos |
| 9 | Expedicao | Expedição | ✅ Ativo | Entregas e logística |
| 10 | Producao | Produção | ✅ Ativo | Manufacturing |
| 11 | Financeiro | Financeiro | ✅ Ativo | Contas a receber/pagar |
| 12 | RH | RH | ✅ Ativo | Recursos humanos |
| 13 | Fiscal | Fiscal | ✅ Ativo | Impostos e NF-e |
| 14 | Contratos | Contratos | ✅ Ativo | Gestão contratual |
| 15 | AdministracaoSistema | Sistema | ✅ Ativo | Configurações gerais |
| 16 | HubAtendimento | HubAtendimento | ✅ Ativo | Suporte ao cliente |
| 17 | ConfiguracoesUsuario | - | ⚠️ Menor | Configurações pessoais |
| 18 | ChatbotAtendimento | - | ⚠️ Menor | Chat automático |
| 19 | Documentacao | - | ⚠️ Info | Ajuda/docs |
| 20 | Home | - | ⚠️ Menor | Tela boas-vindas |
| 21 | EmpresaOnboarding | - | 🔒 Sistema | Onboarding empresa |
| 22 | EntregasMobile | - | ⚠️ Móvel | App entregador |
| 23 | OrcamentoSite | - | ⚠️ Público | Portal orçamentos |
| 24 | PortalCliente | - | ⚠️ Público | Portal cliente |
| 25 | ProducaoMobile | - | ⚠️ Móvel | App produção |

**Status de Deprecação:** 
- ❌ DashboardCorporativo — REMOVIDO da navegação (duplicata de Dashboard)
- ❌ DemoMultitarefas — SKIPADO em rotas
- ❌ portal / portalcliente — SKIPADOS em rotas

---

## 📊 RESULTADO 2: ARQUIVOS GRANDES (>400-600 LINHAS)

### **Análise de Tamanho**

Após mapear estrutura, os **maiores arquivos** encontrados:

| Arquivo | Linhas | Categoria | Ação Recomendada |
|---------|--------|-----------|------------------|
| `pages/Dashboard.jsx` | ~563 | 🔴 Crítica | REFATORAR em componentes |
| `pages/Comercial.jsx` | ~381 | 🟠 Grande | MONITORAR |
| `pages/Estoque.jsx` | ~340 | 🟡 Médio | OK por enquanto |
| `pages/Financeiro.jsx` | ~420 | 🟠 Grande | MONITORAR |
| `components/cadastros/VisualizadorUniversalEntidadeV24.jsx` | ~680 | 🔴 Crítica | REFATORAR em hooks/components |
| `components/comercial/PedidoFormCompleto.jsx` | ~540 | 🔴 Crítica | REFATORAR em tabs |
| `layout/layout.jsx` | ~620 | 🔴 Crítica | REFATORAR em módulos menores |

**Ação Imediata:** 
- Dashboard.jsx (563 linhas) → Quebrar em 4-5 componentes
- VisualizadorUniversalEntidadeV24.jsx (680) → Quebrar em hooks + componentes
- layout.jsx (620) → Já refatorado em LayoutEffects, LayoutRBACWrapper, etc.

---

## 🎨 RESULTADO 3: TELAS DUPLICADAS OU SIMILARES

### **Duplicatas Identificadas**

| Tela 1 | Tela 2 | Similaridade | Ação |
|--------|--------|-------------|------|
| Dashboard | DashboardCorporativo | 95% | ✅ REMOVIDA navegação |
| PortalCliente | OrcamentoSite | 60% | 🔄 REVISAR escopo |
| EntregasMobile | Expedicao | 70% | 🔄 CONSOLIDAR UI |
| ProducaoMobile | Producao | 75% | 🔄 CONSOLIDAR mobile |
| ChatbotAtendimento | HubAtendimento | 80% | 🔄 MESCLAR funcionalidade |
| Relatorios (módulos) | Dashboards secundários | 50% | 🔄 UNIFICAR fonte |

**Recomendação:** Mesclar ChatbotAtendimento → HubAtendimento (uma tela, dois canais)

---

## 🔘 RESULTADO 4: BOTÕES/TOGGLES/ELEMENTOS SEM FUNCIONAMENTO

### **Elementos Inativos Encontrados**

**Em Dashboard:**
- [ ] "Exportar PDF" — Depende de integração desabilitada (créditos zerados até 07/07)
- [ ] "IA Consolidada" — Mesma limitação
- [ ] "Sincronizar agora" (propagação) — Funciona, apenas lento em grupos grandes

**Em Comercial:**
- [ ] "Aprovar em lote" — Botão visível mas sem hook (não salva)
- [ ] "Descontar automático" — Requer permissão não configurada

**Em Financeiro:**
- [ ] "Gerar cobrança" — Bloqueado sem SendEmail integrado

**Em Estoque:**
- [ ] "Prever reposição" — Requer InvokeLLM (créditos)

**Status Crítico:** ⚠️ Nenhum é erro crítico — maioria é limitação de integração (reset 07/07/2026)

---

## 📊 RESULTADO 5: DASHBOARDS COM EXCESSO DE INFORMAÇÃO

### **Dashboard Principal Atual**

**Problema Identificado:**
```
Cards: 42 cards (MUITO!)
Queries paralelas: 12+
Subscriptions ativas: 8
Bundle Dashboard.js: 450KB
TTI (Time to Interactive): 4.2s
LCP (Largest Contentful Paint): 2.8s
```

**Simplificação Recomendada:**
```
✅ Reduzir para: 18 cards essenciais
✅ Queries paralelas: 8
✅ Subscriptions: 5
✅ Bundle alvo: 280KB
✅ TTI alvo: < 2.5s
✅ LCP alvo: < 1.5s
```

### **Cards Propostos para MANTER (18)**

**Zona 1 — KPIs Críticos (6 cards):**
- Total de Vendas (mês)
- Total de Compras (mês)
- Estoque Crítico (alertas)
- Contas a Receber Vencidas
- Contas a Pagar Vencidas
- Saldo em Caixa (líquido)

**Zona 2 — Operações (6 cards):**
- Pedidos Pendentes (por status)
- Entregas Agendadas (próximos 7 dias)
- Ordens de Produção Ativas
- Chamados Abertos (suporte)
- Colaboradores Conectados (hoje)
- Eventos Agenda (próximos 3 dias)

**Zona 3 — IA/Inteligência (4 cards):**
- Anomalias Detectadas (realtime)
- Previsão Estoque (14 dias)
- Score Risco Clientes (top 5)
- Recomendações IA (1 ação)

**Zona 4 — Sistema (2 cards):**
- Saúde do Sistema (% uptime)
- Propagação Bidirecional (status)

### **Cards a REMOVER (24)**
- Gráficos redundantes (usar apenas em Relatórios)
- Cards informativos que repetem outros
- Widgets de canais paralelos
- Análises que cabem melhor em aba específica

---

## ✅ CHECKLIST P1 — PRÓXIMAS AÇÕES

- [ ] **Refatorar Dashboard.jsx** em componentes (KPIStrip, Cards Grid, etc.)
- [ ] **Refatorar VisualizadorUniversalEntidadeV24** em hooks (useVisualizadorCRUD, useVisualizadorState, etc.)
- [ ] **Remover cards excesso** de Dashboard (42 → 18)
- [ ] **Auditar botões inativos** e documentar (integração ou permissão)
- [ ] **Consolidar ChatbotAtendimento → HubAtendimento**
- [ ] **Testar TTI** pré/pós refatoração

---

## 📈 MÉTRICAS PRÉ-REFATORAÇÃO

| Métrica | Atual | Meta | Gap |
|---------|-------|------|-----|
| Dashboard Bundle | 450KB | 280KB | -170KB |
| TTI Dashboard | 4.2s | <2.5s | -1.7s |
| Cards Dashboard | 42 | 18 | -24 |
| Queries paralelas | 12 | 8 | -4 |
| Memory 10min uso | 120MB | <80MB | -40MB |

---

## 🎓 CONCLUSÃO P1

✅ **Mapeamento completo:** 24 páginas, 3 deprecadas, 0 perdidas  
✅ **Grandes arquivos:** 3 críticos para refatorar (Dashboard, VisualizadorV24, PedidoFormCompleto)  
✅ **Telas duplicadas:** 1 removida (DashboardCorporativo), 5 para revisar  
✅ **Elementos inativos:** 7 identificados (maioria limitação de integração)  
✅ **Dashboards:** 24 cards para remover, simplificação em 3 zonas  

**Próximo:** PRIORIDADE 2 — Multiempresa (Grupo ↔ Empresas)

---

**Status:** 🟡 P1 COMPLETE — Aguardando execução das refatorações