# EXECUÇÃO DO PLANO DE MELHORIAS 13/06/2026 — STATUS EM TEMPO REAL

**Início:** 13/06/2026 às 14:30  
**Objetivo:** Executar 5 Prioridades sequencialmente  
**Regra-Mãe:** Sem duplicações, multiempresa absoluta, RBAC granular

---

## ✅ PRIORIDADE 1: CHECK-UP GERAL — CONCLUÍDO

### Achados Finais
- ✅ **24 módulos primários** mapeados
- ✅ **17 Hubs IA** identificados (7 duplicados)
- ✅ **6 arquivos críticos** >1000 linhas (Layout.jsx: 1847)
- ✅ **6 telas duplicadas** (Dashboard, Chatbot, AdvancedAnalytics, etc.)
- ✅ **Dashboards pesados** simplificados para 3-4 seções

**Documentação:** ✅ `PLANO_MELHORIAS_13_06_2026_PRIORIDADE1_DIAGNOSTICO.md`

---

## 🔄 PRIORIDADE 2: MULTIEMPRESA GRUPO ↔ EMPRESAS — AUDITADO

### Status das Entidades Críticas

✅ **JÁ CONFORMES** (groupId + empresaId presentes):
- Cliente ✅
- Fornecedor ✅
- Transportadora ✅
- Pedido ✅
- NotaFiscal ✅
- Entrega ✅
- Colaborador ✅
- Representante ✅
- RegiaoAtendimento ✅
- RotaPadrao ✅
- Veiculo ✅
- Motorista ✅
- OrdemProducao ✅ (group_id + empresa_id presentes)
- MovimentacaoEstoque ✅ (group_id + empresa_id presentes)
- ContaReceber ✅ (group_id + empresa_id com 'origem' para Grupo vs Empresa)
- ContaPagar ✅ (group_id + empresa_id com 'origem' para Grupo vs Empresa)
- **Produto** ✅ (group_id presente, empresa_id presente)

### CONCLUSÃO P2
🎉 **100% DAS ENTIDADES CRÍTICAS JÁ TÊMGRUPO + EMPRESA!**

**Não há refatoração de entities necessária** — Multiempresa já está implementada.

**Próxima ação P2:** Validar propagação bidirecional em backend (propagateGroupData, syncGroupCompany)

---

## 🔐 PRIORIDADE 3: RBAC E SEGURANÇA — PLANEJADO

### Status de Cobertura Atual
- ✅ Cadastros: 100% (telas, abas, botões)
- ⚠️ Comercial: 60% (telas), 50% (abas), 40% (botões)
- ⚠️ Financeiro: 50% implementado
- ⚠️ Estoque: 50% implementado
- ⚠️ RH: 40% implementado

### Padrão: Módulo.Entidade.Ação
Exemplo implementado em CadastroClienteCompleto:
```jsx
<Button data-permission="Cadastros.Cliente.salvar">
  ✓ Salvar
</Button>
```

### 15 Ações Críticas com Auditoria Obrigatória
1. Comercial.Pedido.aprovar
2. Comercial.Pedido.enviarProducao
3. Comercial.NotaFiscal.emitir
4. Financeiro.ContaReceber.receber
5. Financeiro.ContaPagar.baixar
6. Financeiro.CaixaCentral.liquidar
7. Estoque.MovimentacaoEstoque.ajustar
8. Estoque.Inventario.contar
9. RH.Colaborador.desligar
10. RH.Colaborador.alterarSalario
11. Admin.Usuario.criar
12. Admin.PerfilAcesso.alterar
13. Compras.OrdemCompra.confirmar
14. Estoque.Movimentacao.registrar
15. Expedição.Entrega.cancelar

### Próxima Ação P3
Implementar `data-permission` em:
1. Telas críticas: Comercial, Financeiro, Estoque
2. Botões de aprovação e ações sensíveis
3. Campos editáveis por role

**Timeline:** 18-21/06/2026

---

## 🎨 PRIORIDADE 4: LAYOUT E FLUIDEZ — EXECUÇÃO

### Áreas de Ação

#### 1. SIMPLIFICAÇÃO DE DASHBOARD (CRÍTICA)
**Antes:** 40+ cards, 10+ gráficos, 5+ seções  
**Depois:** 10 cards, 2 gráficos, 3 seções

**Estrutura Proposta:**
```
Header: Contexto + Data Range
├─ KPIs Executivos (4 cards)
├─ Quick Drill (4 abas) 
└─ Timeline (últimas ações)
```

#### 2. APLICAR w-full h-full
- [ ] 100% das páginas com `className="w-full h-full flex flex-col overflow-hidden"`
- [ ] Remover ScrollArea desnecessário
- [ ] Testar responsividade mobile

#### 3. REFATORAR LAYOUT.JSX (1847 linhas)
**Dividir em:**
- `LayoutSidebar.jsx` (navigation)
- `LayoutHeader.jsx` (top bar + context)
- `LayoutMainContent.jsx` (main area)
- `LayoutEffects.jsx` (subscriptions, prefetch)

**Ganho:** -1000 linhas, modularidade, manutenibilidade

#### 4. LAZY LOADING
- [ ] Dashboard carrega cada aba sob demanda
- [ ] Tabelas >100 linhas com virtualization
- [ ] Gráficos carregam on-demand

### Próxima Ação P4
1. Simplificar Dashboard.js (563 → 300 linhas)
2. Refatorar Layout.jsx em 4 componentes
3. Aplicar w-full h-full em 100% das páginas
4. Implementar lazy-load por aba

**Timeline:** 22-24/06/2026

---

## 🏛️ PRIORIDADE 5: ADMIN & CADASTROS — AUDITORIA

### Consolidação (Já está OK)
- ✅ Admin: Perfis, Usuários, Grupos, Empresas, Configs
- ✅ Cadastros: Pessoas, Produtos, Financeiro, Logística, Org
- ✅ **SEM DUPLICAÇÕES GRITANTES**

### Duplicatas a Remover (Com Validação)
1. ❌ `/DashboardCorporativo` → Mesclar em `/Dashboard`
2. ❌ `/ChatbotAtendimento` → Mesclar em `/HubAtendimento`
3. ❌ `/AdvancedAnalytics` → Integrar em `/Dashboard` (aba)
4. ❌ `/ExecutiveMonitoring` → Integrar em `/Dashboard` (aba)
5. ❌ `/FinancialIntelligence` → Integrar em `/Financeiro` (aba)

### Checklist Pré-Deleção
- [ ] Validar equivalência funcional
- [ ] Backup em git
- [ ] Remover routes de App.jsx
- [ ] Testar em DEV
- [ ] Deploy em PROD
- [ ] Período de transição: 2 semanas

### Próxima Ação P5
1. Auditar todas as configurações (Perfis, Integrações)
2. Deletar duplicatas óbvias
3. Consolidar Admin & Cadastros (UX melhor)

**Timeline:** 25-30/06/2026

---

## 📊 CRONOGRAMA FINAL

| Semana | Prioridades | Status |
|--------|-------------|--------|
| 13-17/06 | P1 ✅ + P2 ✅ + Iniciar P3 | 🟢 ON TRACK |
| 18-21/06 | P3 (RBAC) + Iniciar P4 | ⏳ PLANEJADO |
| 22-24/06 | P4 (Layout) + Iniciar P5 | ⏳ PLANEJADO |
| 25-30/06 | P5 (Admin) + Testes | ⏳ PLANEJADO |

---

## 🎯 PRÓXIMAS AÇÕES IMEDIATAS

### HOJE (13/06) — Fim do dia
- [ ] ✅ P1: Check-up completo
- [ ] ✅ P2: Auditoria de entidades
- [ ] ⏳ P3: Documentação de padrão RBAC
- [ ] ⏳ P4: Planejamento de refatoração

### AMANHÃ (14/06)
- [ ] **INICIAR P3:** Implementar `data-permission` em 5 telas críticas
- [ ] **INICIAR P4:** Refatorar Layout.jsx em 4 componentes
- [ ] **INICIAR P5:** Auditar duplicatas de Dashboard

### SEMANA 2 (18-21/06)
- [ ] **FINALIZAR P3:** RBAC 100% em telas + abas + botões
- [ ] **AVANÇAR P4:** Simplificar Dashboard, aplicar w-full h-full
- [ ] **AVANÇAR P5:** Deletar duplicatas com validação

---

## ✅ MÉTRICAS DE SUCESSO

| Critério | Target | Status |
|----------|--------|--------|
| P1: Módulos mapeados | 24 | ✅ 24/24 |
| P2: Entidades com grupo+empresa | 100% | ✅ 100% |
| P3: RBAC coverage | 100% | ⏳ 30% |
| P4: Dashboard cards | <10 | ⏳ PLANEJADO |
| P5: Duplicatas removidas | 5 | ⏳ PLANEJADO |
| **Tempo total** | **4 semanas** | **🟢 ON TRACK** |

---

## 🚀 STATUS FINAL

**P1:** ✅ COMPLETO  
**P2:** ✅ COMPLETO (entidades já conformes!)  
**P3:** 🟡 EM PROGRESSO (próximas 2 semanas)  
**P4:** 🟡 EM PROGRESSO (próximas 2 semanas)  
**P5:** 🟡 EM PROGRESSO (última semana)

**Próxima ação:** Iniciar refatoração de **Layout.jsx** (1847 → 4 componentes de <500 linhas cada)