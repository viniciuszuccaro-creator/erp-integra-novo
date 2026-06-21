# P1 — CHECKUP GERAL (EM EXECUÇÃO)
**Data:** 21/06/2026 | **Duração:** 2–3 dias | **Status:** INICIADO

---

## TAREFA 1.1: MAPEAR MÓDULOS ✅ DONE

**16 Módulos Identificados:**

1. ✅ **Comercial** — Pedidos, Clientes, Vendas, NF
2. ✅ **Financeiro** — Contas Pagar/Receber, Caixa, Conciliação
3. ✅ **Estoque** — Produtos, Movimentações, Inventário
4. ✅ **Compras** — OC, Fornecedores, Recebimento
5. ✅ **Produção** — Ordens, Apontamentos, Refugo
6. ✅ **RH** — Colaboradores, Férias, Ponto
7. ✅ **Fiscal** — NF-e, Importação XML, SPED
8. ✅ **Expedição** — Entregas, Romaneios, Logística
9. ✅ **CRM** — Oportunidades, Campanhas, Interações
10. ✅ **Contratos** — Gestão de contratos, assinatura digital
11. ✅ **Agenda** — Calendário, eventos, lembretes
12. ✅ **Administração do Sistema** — Configurações, Acessos, Monitoramento
13. ✅ **Hub Atendimento** — Chamados, Chatbot, Omnicanal
14. ✅ **Cadastros Gerais** — Produtos, Clientes, Fornecedores, etc
15. ✅ **Relatórios** — DRE, Vendas, Estoque, etc
16. ✅ **Dashboard** — KPIs corporativos

---

## TAREFA 1.2: ARQUIVOS > 600 LINHAS ⏳ EM PROGRESSO

### Identificados (10 arquivos críticos):

| Arquivo | Linhas | Localização | Prioridade | Ação P4 |
|---------|--------|------------|-----------|---------|
| DashboardFinanceiroResumo | ~700 | components/dashboard | 🔴 CRÍTICA | Quebrar em 4 componentes |
| PedidoFormCompleto | ~800 | components/comercial | 🔴 CRÍTICA | Quebrar em 6 componentes |
| DashboardProducaoRealtime | ~650 | components/producao | 🔴 CRÍTICA | Quebrar em 3 componentes |
| ContaReceberForm | ~600 | components/financeiro | 🟡 ALTA | Quebrar em 4 componentes |
| RelatorioFinanceiro | ~750 | components/relatorios | 🟡 ALTA | Quebrar em 5 componentes |
| PedidoFormV22_Completo | ~700 | components/cadastros | 🟡 ALTA | Quebrar em 4 componentes |
| CRM módulo principal | ~680 | components/crm | 🟡 ALTA | Quebrar em 3 componentes |
| Dashboard Principal | ~620 | pages/Dashboard | 🟡 ALTA | Simplificar + quebrar |
| GestaoUsuariosAvancada | ~590 | components/administracao | 🟡 ALTA | Consolidar em Índice 2 (P5) |
| RBACDashboard | ~610 | components/sistema | 🟡 ALTA | Consolidar em Índice 2 (P5) |

**Ação Próxima:** Validar com `wc -l` em tempo real

---

## TAREFA 1.3: TELAS DUPLICADAS ⏳ IDENTIFICANDO

### Suspeitas (Consolidar em P5):

| Tela A | Tela B | Propósito | Consolidação |
|--------|--------|----------|--------------|
| DashboardFinanceiroResumo | ContasPagarTab | Contas a pagar | Aba de Dashboard |
| KPIsCRM | FunilVisual | Funil vendas | Aba de Dashboard |
| ProdutosTab | VisualizadorProdutos | Listagem produtos | Usar único |
| InventarioForm | MovimentacoesTab | Movimentações | Consolidar |
| ConfigCenter | AdminTabs.Configuracoes | Configurações | Usar Índice 1 (P5) |
| GestaoUsuariosAvancada | UsuariosTab | Gestão usuários | Usar Índice 2 (P5) |
| RBACDashboard | PerfilCard | Perfis de acesso | Usar Índice 2 (P5) |
| CentralPerfisAcesso | PerfilFormModal | Gestão perfis | Usar único |
| MonitorPerformance | SistemaHealthPanel | Saúde sistema | Usar Índice 3 (P5) |
| GlobalAuditLog | AuditoriaLogsIndex | Logs | Usar Índice 3 (P5) |

---

## TAREFA 1.4: BOTÕES/TOGGLES SEM FUNCIONAMENTO ⏳ AUDITORIA

### Modules a Testar (1 por 1):

- [ ] **Comercial** — Clicar "Aprovar Pedido", "Cancelar", "Gerar NF"
- [ ] **Financeiro** — Clicar "Baixar", "Receber", "Conciliar"
- [ ] **Estoque** — Clicar "Ajustar", "Transferir", "Finalizar Inventário"
- [ ] **Compras** — Clicar "Aprovar OC", "Receber"
- [ ] **Produção** — Clicar "Aprovar OP", "Finalizar"
- [ ] **Expedição** — Clicar "Confirmar Entrega"
- [ ] **RH** — Clicar "Solicitar Férias", "Aprovar"

**Status:** Começar hoje

---

## TAREFA 1.5: DASHBOARDS COM EXCESSO ✅ MAPEADO

### 6 Dashboards Críticos (Simplificar em P4):

| Dashboard | Cards Atual | Problema | Ação P4 |
|-----------|------------|----------|---------|
| **Principal** | 15+ | Excesso de info | Reduzir para 8 KPIs |
| **Financeiro** | 20+ (3 abas) | Duplicação de conteúdo | Consolidar 1 aba + abas detail |
| **Comercial** | 18+ | Funil repetido | Consolidar funil + vendas |
| **Estoque** | 12+ | Múltiplas views mesmo dado | Consolidar em 8 KPIs |
| **Produção** | 14+ | Redundância Kanban/tabela | Consolidar em 8 KPIs |
| **Expedição** | 10+ | Info repetida | Consolidar em 8 KPIs |

**KPIs Essenciais por Dashboard:**

```
FINANCEIRO:
  1. Fluxo Caixa (hoje + 7 dias)
  2. Receitas Mês (acumulado + meta)
  3. Contas Receber Pendentes
  4. Contas Pagar Pendentes
  5. Taxa Conciliação
  6. Ticket Médio
  7. Formas Pagamento (top 3)
  8. Meta vs Realizado

COMERCIAL:
  1. Oportunidades Andamento
  2. Taxa Conversão (Funil)
  3. Pedidos Abertos
  4. Novos Clientes
  5. Ticket Médio
  6. Follow-ups Próximos
  7. Top 5 Vendedores
  8. Churn Rate

[+ 4 dashboards com estrutura similar]
```

---

## 📊 RESUMO P1 LIVE

| Tarefa | Status | Resultado |
|--------|--------|-----------|
| 1.1 — Mapear Módulos | ✅ DONE | 16 módulos identificados |
| 1.2 — Arquivos > 600 linhas | ⏳ 70% | 10 arquivos críticos mapeados |
| 1.3 — Telas Duplicadas | ⏳ 60% | 10 duplicidades identificadas |
| 1.4 — Botões sem Funcionamento | ⏳ 0% | Começar agora |
| 1.5 — Dashboards com Excesso | ✅ MAPEADO | 6 dashboards, 8 KPIs cada |

**Tempo Até Agora:** ~4 horas | **Tempo Restante:** ~2–4 horas

---

## 🎯 PRÓXIMO PASSO

**Hoje (P1 + P4 paralelo):**
1. [ ] Finalizar Tarefa 1.4 (testar botões) — 30 min
2. [ ] Iniciar P4 — Simplificar Dashboard Principal — 2–3 horas
3. [ ] Refatorar DashboardFinanceiroResumo — 2–3 horas

**Amanhã (P4 + P5):**
1. [ ] Continuar P4 — refatorar componentes > 600 linhas
2. [ ] Iniciar P5 — criar 3 índices Administração

**Data Conclusão P1:** ✅ **HOJE (21/06)**
**Data Conclusão P4:** **23/06 (2–3 dias)**
**Data Conclusão P5:** **24/06 (2–3 dias)**

---

**Atualizar este documento conforme avança — marcar tarefas como ✅ DONE**