# PRIORIDADE 1 — CHECKUP GERAL COMPLETO
**Data:** 2026-06-21 | **Status:** Em Auditoria

---

## 1. MAPA DE MÓDULOS EXISTENTES

### ✅ Módulos Principais (18 módulos ativos)
| Módulo | Arquivo | Linhas | Status | Observações |
|--------|---------|--------|--------|-------------|
| Dashboard | `pages/Dashboard.jsx` | ~800 | ⚠️ GRANDE | Excesso de cards e KPIs; precisa simplificação |
| Cadastros | `pages/Cadastros.jsx` | ~400 | ✅ OK | Hub de componentes; mantém modularidade |
| Comercial | `pages/Comercial.jsx` | ~700 | ⚠️ GRANDE | Múltiplas abas; muita lógica concentrada |
| CRM | `pages/CRM.jsx` | ~230 | ✅ OK | Bem modularizado, abre componentes em janelas |
| Estoque | `pages/Estoque.jsx` | ~650 | ⚠️ GRANDE | Inventário + movimentações; pode ser dividido |
| Expedição | `pages/Expedicao.jsx` | ~750 | ⚠️ GRANDE | Rastreamento + roteirização; lógica pesada |
| Produção | `pages/Producao.jsx` | ~600 | ⚠️ GRANDE | Ordens + apontamentos; bem concentrado |
| RH | `pages/RH.jsx` | ~500 | ✅ OK | Ponto + Férias; modularização adequada |
| Compras | `pages/Compras.jsx` | ~550 | ⚠️ GRANDE | OC + Cotações; pode ser mais modular |
| Financeiro | `pages/Financeiro.jsx` | ~800 | 🔴 CRÍTICO | Contas a Pagar/Receber + Caixa; REFATORAÇÃO URGENTE |
| Fiscal | `pages/Fiscal.jsx` | ~700 | ⚠️ GRANDE | NFe + SPED + DRE; lógica concentrada |
| Contratos | `pages/Contratos.jsx` | ~907 | ⚠️ GRANDE | Já refatorado (P1); diálogos extraídos |
| Relatorios | `pages/Relatorios.jsx` | ~508 | ✅ OK | Agendamento extraído para Dialog |
| Agenda | `pages/Agenda.jsx` | ~1204 | 🔴 CRÍTICO | Maior arquivo do ERP; REFATORAÇÃO URGENTE |
| AdministracaoSistema | `pages/AdministracaoSistema.jsx` | ~600 | ⚠️ GRANDE | Gerenciamento de configs e acessos |
| HubAtendimento | `pages/HubAtendimento.jsx` | ~300 | ✅ OK | Novo; estrutura clara |
| PortalCliente | `pages/PortalCliente.jsx` | ~450 | ✅ OK | Portal B2B; bem separado do backoffice |
| ConfiguracaoUsuario | `pages/ConfiguracaoUsuario.jsx` | ~200 | ✅ OK | Simples e direto |

---

## 2. ARQUIVOS GRANDES (>400-600 LINHAS) — REFATORAÇÃO NECESSÁRIA

### 🔴 CRÍTICOS (>1000 linhas)
- **`pages/Agenda.jsx`** — 1204 linhas
  - Contém: Calendário, Criação, Edição, Lembretes, Notificações
  - Recomendação: Extrair em **7 componentes**:
    - `AgendaCalendarioView.jsx` (Calendar + Navegação)
    - `AgendaEventoForm.jsx` (Criação/Edição)
    - `AgendaLembreteManager.jsx` (Sistema de lembretes)
    - `AgendaEventoModal.jsx` (Visualização)
    - `AgendaFiltros.jsx` (Filtros de usuário/data)
    - `AgendaNotificacoes.jsx` (Notificação via email/WhatsApp)
    - Hook: `useAgendaState.js` (Estado centralizado)

### ⚠️ GRANDES (700-999 linhas)
- **`pages/Dashboard.jsx`** — ~800 linhas
  - Problema: Dashboard monolítico com múltiplos módulos lado a lado
  - KPIs espalhados, sem organização visual clara
  - Recomendação: Dividir em **seções modularizadas**:
    - `DashboardEssentialKPIs.jsx` (Top 6 indicadores)
    - `DashboardOperacionalBI.jsx` (Operações)
    - `DashboardFinanceiroResumo.jsx` (Financeiro)
    - Remover: Cards redundantes, gráficos excedentes

- **`pages/Financeiro.jsx`** — ~800 linhas
  - Problema: Contas a Pagar/Receber/Caixa + Conciliação
  - Muitos tabs com lógica compartilhada
  - Recomendação: Estruturar em **3 camadas**:
    - TabContasPagar, TabContasReceber, TabCaixa (separados)
    - Hook: `useFinanceiroContext.js` (Estado compartilhado)
    - Componentes: Filtros, Tabelas, Dialogs

- **`pages/Comercial.jsx`** — ~700 linhas
  - Problema: Pedidos + Clientes + Comissões em uma tela
  - Recomendação: **Manter hub**, mas usar lazy loading em janelas

- **`pages/Estoque.jsx`** — ~650 linhas
  - Problema: Inventário + Movimentações + Requisições
  - Recomendação: Manter como hub, melhorar aba por aba

- **`pages/Expedição.jsx`** — ~750 linhas
  - Problema: Rastreamento + Rotas + Romaneios
  - Recomendação: Componentizar visualizadores de mapa/rota

- **`pages/Fiscal.jsx`** — ~700 linhas
  - Problema: NFe + SPED + Importação XML + Validação
  - Recomendação: Manter tabs, extrair validadores

- **`pages/Produção.jsx`** — ~600 linhas
  - Problema: Ordens + Apontamentos + DigitalTwin
  - Recomendação: Marginal para refatoração; OK se mantém modularidade

### ✅ ACEITÁVEIS (400-599 linhas)
- Contratos (907 → 907 após refatoração de diálogos)
- Compras (550), RH (500), Relatorios (508)
- AdministracaoSistema (600)

---

## 3. TELAS DUPLICADAS OU COM PROPÓSITO SIMILAR

### Duplicações Identificadas:
| Telas | Problema | Recomendação |
|-------|----------|--------------|
| **Dashboard** + **DashboardCorporativo** | Ambas fazem o mesmo | ❌ DashboardCorporativo removido de rotas (P5) |
| **Portal** + **PortalCliente** | Portal genérico vs Portal Cliente | ✅ Portal = teste/sandbox; PortalCliente = produção |
| **ChatbotAtendimento** + **HubAtendimento** | Chatbot antigo vs novo hub | ❌ ChatbotAtendimento removido (P5) |
| **ProducaoMobile** + **Producao** | Mobile duplica lógica | ❌ Removido (P5); mobile via responsive design |
| **EntregasMobile** + **Expedicao** | Mesmo problema | ❌ Removido (P5) |

### Status:
- ✅ Duplicações já removidas de roteamento (App.jsx)
- ⚠️ Arquivos ainda existem em `pages/` — recomenda-se **delete** após validação

---

## 4. BOTÕES, TOGGLES E ABAS SEM FUNCIONAMENTO

### Dashboard
- ⚠️ Botão "Personalizar Widgets" → Sem implementação
- ⚠️ Toggle "Modo Escuro" → Não salva preferência
- ⚠️ Aba "Forecasting" → Dados vazios, sem lógica

### Financeiro
- ⚠️ Botão "Conciliação Automática" → Dispara mutação vazia
- ⚠️ Toggle "Mostrar Inadimplência" → Filtra UI mas sem efeito backend
- ⚠️ Aba "Formas de Pagamento" → Carrega mas sem CRUD completo

### Comercial
- ⚠️ Botão "Duplicar Pedido" → Sem implementação
- ⚠️ "Copiar Último Pedido" → Funciona parcialmente
- ⚠️ Filtro "Origem do Pedido" → Sem efeito em queries (contexto não aplicado)

### Estoque
- ⚠️ Botão "Ajuste de Estoque" → Modal abre mas sem salvar
- ⚠️ Toggle "Estoque Crítico" → Sem filtro backend

### CRM
- ⚠️ Botão "Converter para Pedido" → Sem workflow completo

---

## 5. DASHBOARDS COM EXCESSO DE INFORMAÇÃO

### Dashboard Principal (~40 cards/indicadores)
**Problema:** Poluição visual, difícil scanear informação importante
**Indicadores Importantes:**
- Vendas do mês (TOP)
- Inadimplência (CRÍTICO)
- Estoque crítico (CRÍTICO)
- Ordens de produção pendentes (IMPORTANTE)
- Entregas em atraso (IMPORTANTE)
- Caixa do dia (IMPORTANTE)

**Indicadores Secundários/Removíveis:**
- Gráficos de comparativo anual
- Widgets de IA insights (usar modal on-demand)
- Cards de canais de origem (usar tab separada)
- Heatmaps de performance por região

**Ação Recomendada:** Redesenhar Dashboard em 2 camadas:
- **Camada 1 — Essencial:** Top 6 KPIs + Quick Actions
- **Camada 2 — Detalhado:** Abas por módulo (Comercial, Financeiro, Estoque, Produção)

---

## 6. COMPONENTES E HOOKS COM PROBLEMAS CONHECIDOS

### Componentes Redundantes:
- `VisualizadorUniversalEntidade` + `VisualizadorUniversalEntidadeV24` → Consolidar em V24
- `DataTable` + `CadastrosTableUniversal` → Usar um padrão

### Hooks Ineficientes:
- `useEntityCounts` → Faz múltiplas queries; usar `useCountEntitiesOptimized`
- `useRLSQuery` vs queries manuais → Padronizar uso

---

## 7. RESUMO DE AÇÕES RECOMENDADAS — FASE 1

| Ação | Arquivo | Impacto | Esforço |
|------|---------|--------|--------|
| **REFATORAR** | `pages/Agenda.jsx` (1204 → 7 componentes) | Alto | Alto |
| **REFATORAR** | `pages/Dashboard.jsx` (~800 → seções modularizadas) | Médio | Médio |
| **REFATORAR** | `pages/Financeiro.jsx` (~800 → 3 tabs + hooks) | Alto | Médio |
| **DELETAR** | `pages/DashboardCorporativo.jsx` | Baixo | Baixo |
| **DELETAR** | `pages/ChatbotAtendimento.jsx` | Baixo | Baixo |
| **DELETAR** | `pages/ProducaoMobile.jsx` | Baixo | Baixo |
| **DELETAR** | `pages/EntregasMobile.jsx` | Baixo | Baixo |
| **IMPLEMENTAR** | Funcionalidade em botões/toggles sem ação | Médio | Médio |
| **SIMPLIFICAR** | Dashboard de ~40 para ~15 indicadores | Médio | Médio |
| **CONSOLIDAR** | `VisualizadorUniversalEntidade` variants | Médio | Médio |

---

## 8. PRÓXIMAS AÇÕES

✅ **P1 Checkup:** COMPLETO
⏳ **P2 Multiempresa:** Verificar queries com `contextoValido`
⏳ **P3 RBAC:** Aplicar em telas críticas
⏳ **P4 Layout:** Simplificar dashboards
⏳ **P5 Admin:** Consolidar Cadastros + Sistema

**Status:** Aguardando aprovação para iniciar refatorações (P1 → P2 → P3 → P4 → P5)