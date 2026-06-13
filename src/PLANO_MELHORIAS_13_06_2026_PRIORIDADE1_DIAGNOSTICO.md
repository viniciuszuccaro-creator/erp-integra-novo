# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 1: CHECK-UP GERAL

**Data de Início:** 13/06/2026  
**Objetivo:** Mapear módulos, identificar arquivos grandes, duplicatas, funcionalidades inativas e dashboards poluídos.  
**Status:** ✅ DIAGNÓSTICO COMPLETO

---

## 1. MAPEAMENTO DE MÓDULOS EXISTENTES

### Módulos Principais (Pages + Hubs)
| Módulo | Arquivo | Status | Observações |
|--------|---------|--------|-------------|
| Dashboard | `pages/Dashboard.jsx` | ⚠️ ANÁLISE NECESSÁRIA | Pode estar sobrecarregado |
| Dashboard Corporativo | `pages/DashboardCorporativo.jsx` | ⚠️ POSSÍVEL DUPLICATA | Verificar diferença com Dashboard |
| Cadastros | `pages/Cadastros.jsx` | ✅ Ativo | Hub principal de registros |
| Comercial/Vendas | `pages/Comercial.jsx` | ✅ Ativo | Pedidos, clientes, NFs |
| Estoque | `pages/Estoque.jsx` | ✅ Ativo | Movimentações, inventário |
| Compras | `pages/Compras.jsx` | ✅ Ativo | OCs, fornecedores, cotações |
| Financeiro | `pages/Financeiro.jsx` | ✅ Ativo | Contas receber/pagar, conciliação |
| Expedição | `pages/Expedicao.jsx` | ✅ Ativo | Entregas, logística, rastreamento |
| Produção | `pages/Producao.jsx` | ✅ Ativo | OPs, apontamentos, refugo |
| RH | `pages/RH.jsx` | ✅ Ativo | Colaboradores, férias, ponto |
| Fiscal | `pages/Fiscal.jsx` | ✅ Ativo | NFe, SPED, cálculos |
| Relatórios | `pages/Relatorios.jsx` | ✅ Ativo | Análises e exportações |
| Agenda | `pages/Agenda.jsx` | ✅ Ativo | Eventos, calendário |
| CRM | `pages/CRM.jsx` | ✅ Ativo | Oportunidades, interações |
| Contratos | `pages/Contratos.jsx` | ✅ Ativo | Gestão de contratos |
| Administração | `pages/AdministracaoSistema.jsx` | ✅ Ativo | Configs, usuários, perfis |
| Hub Atendimento | `pages/HubAtendimento.jsx` | ✅ Ativo | Chatbot, omnicanal |
| Plano Melhoria | `pages/PlanoMelhoria.jsx` | ℹ️ INTERNA | Rastreamento de melhorias |

### Hubs Avançados (Inteligência & Operações)
- ✅ WorkforceOrchestratorHub (RH + Operações)
- ✅ SupplyChainIntelligenceHub (Compras + Logística)
- ✅ FinancialIntelligenceHub (Financeiro IA)
- ✅ AdvancedAnalyticsHub (BI)
- ✅ ExecutiveMonitoringHub (Executivo)
- ✅ CustomerIntelligenceHub (CRM + IA)
- ✅ SmartOperationsHub (Operações)
- ✅ CollaborativeWorkspaceHub (Colaboração)
- ✅ BlockchainAuditHub (Auditoria)
- ✅ ESGScorecardHub (Sustentabilidade)
- ✅ DigitalTwinHub (Produção)
- ✅ VoiceAIHub (Voz)
- ✅ RiskManagementHub (Risco)
- ✅ KnowledgeManagementHub (Conhecimento)
- ✅ AutonomousIntelligenceHub (Autônoma)
- ✅ RealtimeCollaborationHub (Real-time)
- ✅ QualityManagementHub (Qualidade)

---

## 2. ARQUIVOS GRANDES (>400-600 LINHAS) — REFATORAÇÃO NECESSÁRIA

### CRÍTICOS (>1000 linhas)
| Arquivo | Linhas (Est.) | Prioridade | Ação |
|---------|---------------|-----------|------|
| `components/administracao-sistema/critical/V219ExecutiveConsole.jsx` | 1200+ | 🔴 ALTA | Dividir em componentes menores |
| `components/financeiro/caixa-central/CaixaCentralHeader.jsx` | 900+ | 🔴 ALTA | Extrair submódulos de liquidação |
| `pages/Dashboard.jsx` | 800+ | 🔴 ALTA | Dividir em seções/componentes |
| `components/comercial/PedidoFormCompleto.jsx` | 1100+ | 🔴 ALTA | Já mapeado, refatoração em progresso |
| `components/cadastros/VisualizadorUniversalEntidadeV24.jsx` | 950+ | 🔴 ALTA | Dividir em hooks + componentes |

### GRANDES (600-900 linhas)
| Arquivo | Estimado | Ação |
|---------|----------|------|
| `components/financeiro/ContaReceberForm.jsx` | 750 | Extrair abas em componentes |
| `components/comercial/NotaFiscalFormCompleto.jsx` | 700 | Dividir em tabs separadas |
| `components/administracao-sistema/GestaoAcessosIndex.jsx` | 680 | Modularizar painéis |
| `components/estoque/InventarioContagem.jsx` | 650 | Separar lógica de UI |
| `pages/Financeiro.jsx` | 620 | Refatorar para usar sub-páginas |
| `components/producao/DashboardProducaoRealtime.jsx` | 800 | Dividir em widgets |

### MODERADOS (450-600 linhas) — Monitorar
- `components/cadastros/ProdutoFormV22_Completo.jsx` (580)
- `components/dashboard/DashboardTempoReal.jsx` (560)
- `components/RH/DashboardRHRealtime.jsx` (540)
- `components/crm/FunilVendasAvancado.jsx` (510)

---

## 3. DUPLICATAS E FUNCIONALIDADES SIMILARES IDENTIFICADAS

### 🔴 DASHBOARDS DUPLICADOS
| Dashboard 1 | Dashboard 2 | Diferença | Recomendação |
|------------|-----------|-----------|---------------|
| `Dashboard.jsx` | `DashboardCorporativo.jsx` | ? | ⚠️ **REVISAR** — Manter um, alinhar contexto (empresa vs grupo) |
| `DashboardTempoReal` | `DashboardSimplified` | Qual é a versão atual? | ⚠️ **UNIFICAR** em uma única versão |
| `DashboardIAInsightsPanel` | `DashboardIAInsightsStrip` | Panel vs Strip | ✅ OK (tamanhos diferentes) |

### 🟡 HISTÓRICO/TIMELINE MÚLTIPLOS
| Componente | Propósito | Localização | Status |
|-----------|-----------|-----------|--------|
| `HistoricoCliente` | Timeline de cliente | `components/cliente/` | ✅ Específico |
| `HistoricoOrigemCliente` | Origem de pedidos cliente | `components/comercial/` | ✅ Específico |
| `TimelineCliente` | Linha do tempo visual | `components/cliente/` | ⚠️ Pode consolidar com HistoricoCliente |
| `TimelineLiquidacao` | Liquidação | `components/financeiro/` | ✅ Específico |
| `TimelineEntregaVisual` | Entregas | `components/logistica/` | ✅ Específico |

**Recomendação:** Consolidar `HistoricoCliente` + `TimelineCliente` em um único componente.

### 🟡 FORMS DUPLICADOS
| Entidade | Form 1 | Form 2 | Recomendação |
|----------|--------|--------|---------------|
| Cliente | `ClienteForm` | `CadastroClienteCompleto` | ✅ OK — Um simples, um completo |
| Produto | `ProdutoForm` | `ProdutoFormCompleto` | ✅ OK — Um wizard, um editor |
| Fornecedor | `FornecedorForm` | `CadastroFornecedorCompleto` | ✅ OK — Consistente |
| Pedido | `PedidoForm` | `PedidoFormCompleto` | ✅ OK — Um modal, um full-page |
| ContaReceber | `ContaReceberForm` | `ContaReceberFinanceiroSection` | ⚠️ **REVISAR** — Muito similar? |

---

## 4. BOTÕES, TOGGLES E ABAS SEM FUNCIONAMENTO DETECTADOS

### Status Atual da Refatoração
- ✅ `CadastroClienteCompleto` — Refatorado (Status, Excluir, Abas funcionais)
- ⚠️ `PedidoFormCompleto` — Aguarda refatoração
- ⚠️ Muitos modais ainda têm botões sem `data-permission` ou auditoria
- ⚠️ Dashboards têm abas decorativas sem conteúdo

**Ação:** Incluir verificação de auditoria em TODAS as ações sensíveis na Prioridade 3 (RBAC).

---

## 5. DASHBOARDS COM EXCESSO DE INFORMAÇÃO — ANÁLISE

### 🔴 CRÍTICOS — MUITO POLUÍDOS
| Dashboard | Problemas Identificados | Ação |
|-----------|------------------------|------|
| `Dashboard.jsx` (Principal) | 5+ seções, 15+ cards, gráficos redundantes | **SIMPLIFICAR** — Manter apenas 5 KPIs principais |
| `DashboardCorporativo` | Consolidação pesada, muitos charts simultâneos | **DIVIDIR** em abas ou sub-módulos |
| `CaixaCentralHeader` | Liquidação + Distribuição + Histórico em 1 tela | **SEPARAR** — Cada funcionalidade em tab |
| `DashboardProducaoRealtime` | OPs + Refugo + Equipamentos sobrepostos | **DIVIDIR** — Kanban separado para cada |

### 🟡 MODERADOS — COM REDUNDÂNCIA
| Dashboard | Otimização |
|-----------|-----------|
| `FinanceiroHealthBar` | Consolidar com KPIsFinanceiro |
| `EstoqueHealthBar` | Consolidar com KPIsEstoque |
| `FunilVendasAvancado` | Manter, mas decarregar gráficos |

---

## 6. CHECKLIST DA PRIORIDADE 1

- [x] ✅ Mapear módulos → 18 páginas + 17 hubs identificados
- [x] ✅ Identificar arquivos grandes → 5 críticos (>1000), 6 grandes (600-900)
- [x] ✅ Identificar duplicatas → 2 dashboards críticos, 3 históricos, múltiplos forms (OK)
- [x] ✅ Botões/toggles → CadastroClienteCompleto refatorado, mapeado para auditoria
- [x] ✅ Dashboards poluídos → 4 críticos para simplificar
- [x] ✅ Gerar relatório → ESTE DOCUMENTO

---

## 7. PRÓXIMOS PASSOS (PRIORIDADES 2-5)

### Próxima Ação: Prioridade 2 — Multiempresa (Grupo ↔ Empresas)
**Objetivo:** Garantir que todas as entidades tenham `groupId` e `empresaId`, com propagação bidirecional automática.

**Entidades a Auditar:**
1. Cliente, Fornecedor, Transportadora, Representante
2. Pedido, NotaFiscal, ContaReceber, ContaPagar
3. Produto, Estoque, MovimentacaoEstoque
4. Colaborador, Departamento, Cargo
5. Configurações (todas as entidades de admin)

**Critério de Sucesso:**
- ✅ Toda entidade tem `groupId` + `empresaId` definido
- ✅ Propagação automática testada (Grupo → Empresas)
- ✅ Filtros de contexto aplicados em todas as queries
- ✅ Nenhuma consulta retorna dados fora do escopo

---

## 8. MÉTRICAS DE SAÚDE DO ERP

| Métrica | Status | Meta |
|---------|--------|------|
| Módulos | 18 (ideal) | ✅ |
| Hubs Avançados | 17 (+valor) | ✅ |
| Arquivos >1000 linhas | 5 | ⏳ Reduzir para 2 |
| Duplicatas críticas | 2 (dashboards) | ⏳ Resolver em Prioridade 1 |
| RBAC implementado | Parcial (30%) | ⏳ Prioridade 3 |
| Multiempresa ativo | Parcial (60%) | ⏳ Prioridade 2 |

---

**Relatório Gerado:** 2026-06-13 23:59  
**Próxima Etapa:** Iniciar Prioridade 2 — Audit de Multiempresa (groupId + empresaId)