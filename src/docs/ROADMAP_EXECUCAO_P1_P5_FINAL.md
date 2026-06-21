# ROADMAP DE EXECUÇÃO P1–P5 (SEQUÊNCIA PRÁTICA)
**Data Início:** 21/06/2026 | **Duração Total:** 34–43 dias | **Status:** EM EXECUÇÃO

---

## 📋 CHECKLIST GERAL (Marcar conforme avança)

- [ ] **P1 — Checkup Geral** (2–3 dias) → Mapear + Identificar
- [ ] **P4 — Layout & Fluidez** (2–3 dias) → Refatorar dashboards (paralelo com P1)
- [ ] **P5 — Administração & Consolidação** (2–3 dias) → 3 índices + remover duplicidades
- [ ] **P3 — RBAC & Segurança** (3–4 dias) → data-permission + guards
- [ ] **P2 — Multiempresa** (3–4 dias) → Estrutura (automações em 07/07)

---

## FASE 1: P1 + P4 PARALELO (2–3 dias cada)

### P1 — CHECKUP GERAL

#### Tarefa 1.1: Mapear Módulos (30 min)
```
✓ COMERCIAL
✓ FINANCEIRO
✓ ESTOQUE
✓ COMPRAS
✓ PRODUÇÃO
✓ RH
✓ FISCAL
✓ EXPEDIÇÃO
✓ CRM
✓ CONTRATOS
✓ AGENDA
✓ ADMINISTRAÇÃO DO SISTEMA
✓ HUB ATENDIMENTO
✓ CADASTROS GERAIS
✓ RELATORIOS
✓ DASHBOARD
Total: 16 módulos
```

#### Tarefa 1.2: Arquivos > 600 linhas (1 hora)
- [ ] Grep: `wc -l src/components/**/*.jsx | sort -rn | head -20`
- [ ] Listar e marcar para refatoração em P4

#### Tarefa 1.3: Telas Duplicadas (1 hora)
- [ ] Procurar componentes com nomes similares
- [ ] Marcar para consolidação em P5

#### Tarefa 1.4: Botões/Toggles Sem Funcionamento (30 min)
- [ ] Auditoria visual (clicar botões nos módulos principais)
- [ ] Documentar em issue

#### Tarefa 1.5: Dashboards com Excesso de Info (1 hora)
- [ ] DashboardPrincipal — quantos cards?
- [ ] DashboardFinanceiro — quantas abas/cards?
- [ ] Documentar para P4

**Tempo P1:** ~4 horas → **PRONTO HOJE**

---

### P4 — LAYOUT & FLUIDEZ (Paralelo)

#### Tarefa 4.1: Simplificar 6 Dashboards Críticos (2 dias)

| Dashboard | Cards Atual | Cards Novo | Status |
|-----------|------------|-----------|--------|
| Principal | 15+ | 8 | ⏳ FAZER |
| Financeiro | 20+ | 8 | ⏳ FAZER |
| Comercial | 18+ | 8 | ⏳ FAZER |
| Estoque | 12+ | 8 | ⏳ FAZER |
| Produção | 14+ | 8 | ⏳ FAZER |
| Expedição | 10+ | 8 | ⏳ FAZER |

**Ação:** Para cada dashboard:
1. Remover cards não-essenciais → componentes modais/abas
2. Manter 6–8 KPIs principais
3. Aplicar w-full + h-full
4. Testar responsividade

#### Tarefa 4.2: Refatorar 4 Componentes > 600 linhas (1 dia)
- [ ] DashboardFinanceiroResumo (~700 linhas)
- [ ] PedidoFormCompleto (~800 linhas)
- [ ] DashboardProducaoRealtime (~650 linhas)
- [ ] ContaReceberForm (~600 linhas)

**Ação:** Quebrar em componentes menores (80–150 linhas cada)

**Tempo P4:** ~3 dias → **PARALELO COM P1**

---

## FASE 2: P5 (2–3 dias)

### P5 — ADMINISTRAÇÃO & CONSOLIDAÇÃO

#### Tarefa 5.1: Criar 3 Índices de Administração (1 dia)

Estrutura:
```
Administração do Sistema
├── ÍNDICE 1: Configurações Gerais
│   ├── Empresa (CRUD)
│   ├── Configurações Fiscais
│   ├── Integração (APIs, gateways)
│   └── Parâmetros (moedas, unidades, etc)
│
├── ÍNDICE 2: Gestão de Acessos
│   ├── Usuários (CRUD + histórico)
│   ├── Perfis (5 tipos + personalizado)
│   ├── Permissões (Modulo.Entidade.Acao)
│   └── Auditoria de Acessos
│
└── ÍNDICE 3: Monitoramento & Saúde
    ├── Saúde do Sistema
    ├── Logs & Auditoria
    ├── Backup & Recuperação
    ├── Sincronização Grupo ↔ Empresa
    └── Estatísticas
```

**Ação:** Consolidar conteúdo de páginas órfãs (ConfigCenter, GestaoUsuarios, etc) em 3 índices

#### Tarefa 5.2: Consolidar Duplicidades (1 dia)

- [ ] FormaPagamento → mover para Cadastros
- [ ] CentroCusto → mover para Cadastros
- [ ] PlanoDeContas → mover para Cadastros
- [ ] PerfilAcesso → usar único (Índice 2)
- [ ] Usuario → usar único (Índice 2)

**Ação:** Para cada:
1. Backup dados
2. Migração (se merge necessário)
3. Update referências em APIs
4. Testar — nenhum breaking
5. Soft-delete local antigo

#### Tarefa 5.3: Remover Páginas Morte (30 min)

- [ ] Home (pages/Home.jsx) → redirecionar "/" para "/Dashboard"
- [ ] Documentacao (pages/Documentacao.jsx) → remover
- [ ] Update App.jsx routes

**Tempo P5:** ~2–3 dias → **APÓS P1+P4**

---

## FASE 3: P3 (3–4 dias)

### P3 — RBAC & SEGURANÇA

#### Tarefa 3.1: Adicionar data-permission em Botões (2 dias)

**Prioridade 1 (4 módulos):**
- [ ] Comercial: 5 botões (criar, editar, aprovar, cancelar, excluir Pedido)
- [ ] Financeiro: 5 botões (baixar, cancelar, rejeitar ContaPagar/Receber)
- [ ] Estoque: 4 botões (ajustar, transferir, finalizar inventário)
- [ ] Compras: 3 botões (aprovar, receber OC, avaliar fornecedor)

**Pattern:**
```jsx
<Button
  data-permission="Comercial.Pedido.aprovar"
  disabled={!hasPermission('Comercial.Pedido.aprovar')}
  onClick={handleAprovar}
>
  Aprovar
</Button>
```

#### Tarefa 3.2: Adicionar entityGuard em Handlers (2 dias)

**Ações críticas (10 handlers):**
- [ ] Comercial.Pedido.aprovar
- [ ] Financeiro.ContaPagar.baixar
- [ ] Estoque.Inventario.finalizar
- [ ] Compras.OrdemCompra.receber
- [ ] Producao.OrdemProducao.aprovar
- [ ] ... etc

**Pattern:**
```javascript
const guardResult = await base44.functions.invoke('entityGuard', {
  module: 'Financeiro',
  section: 'ContaPagar',
  action: 'baixar',
  empresa_id, group_id
});
if (!guardResult.data.allowed) return Response.json({ error: 'Negado' }, { status: 403 });
```

#### Tarefa 3.3: Adicionar AuditLog em Ações Sensíveis (1 dia)

**Pattern:**
```javascript
await base44.entities.AuditLog.create({
  usuario: user.email,
  modulo: 'Financeiro',
  entidade: 'ContaPagar',
  acao: 'Baixa',
  empresa_id, group_id,
  dados_anteriores: { status: 'Pendente' },
  dados_novos: { status: 'Pago' },
  data_hora: new Date().toISOString(),
});
```

**Tempo P3:** ~3–4 dias → **APÓS P5**

---

## FASE 4: P2 (3–4 dias, automações bloqueadas)

### P2 — MULTIEMPRESA ESTRUTURA (sem automações até 07/07)

#### Tarefa 2.1: Adicionar groupId + empresaId a 6 Entidades (1 dia)

- [ ] MovimentacaoEstoque
- [ ] OrdemProducao
- [ ] ApontamentoProducao
- [ ] CaixaMovimento
- [ ] ConciliacaoBancaria
- [ ] LancamentoContabil

**Ação:** Adicionar campos em entities/*.json + migrar dados via backfillGroupEmpresa()

#### Tarefa 2.2: Validar Queries com Contexto (1 dia)

- [ ] Grep: `base44.entities.\w+\.list\(\)` sem filtro
- [ ] Adicionar `filterInContext()` ou query guard
- [ ] Testar: usuário A não vê dados de usuário B

#### Tarefa 2.3: Documenta Propagação Bidirecional (1 dia)

- [ ] Mapear fluxos (Baixa Grupo → Empresa, Venda Empresa → Grupo)
- [ ] Esperar credits resetarem em 07/07
- [ ] Criar automações de propagação

**Tempo P2:** ~2–3 dias (estrutura); propagação automática em 07/07

---

## 📊 TIMELINE VISUAL

```
Semana 1:
[P1: Checkup 4h] [P4: Dashboards 2–3 dias] [P5: Índices 2–3 dias]
[P4 + P1 paralelo] [P5 depois]
├─ Dia 1: P1 completo + P4 iniciado
├─ Dia 2–3: P4 refatoração + P5 consolidação
└─ Dia 4: P4 + P5 concluído

Semana 2:
[P3: RBAC 3–4 dias] [P2 estrutura: 2–3 dias]
[P3 depois de P5]
├─ Dia 1–2: P3 data-permission
├─ Dia 3–4: P3 backend guards + auditoria
└─ Dia 5: P2 estrutura multiempresa

Semana 3:
[Testes E2E] [Ajustes finais] [Esperar 07/07 para automações P2]
├─ Validação: nenhum breaking
├─ Performance: Lighthouse > 80
└─ Documentação: atualizada
```

**Duração Real:** 2 semanas + 2 semanas buffer = ~4 semanas

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### P1
- [ ] 16 módulos mapeados
- [ ] Todos arquivos > 600 linhas identificados
- [ ] Telas duplicadas documentadas
- [ ] Botões sem funcionamento listados
- [ ] Dashboards com excesso mapeados

### P4
- [ ] 6 dashboards com 8 KPIs cada
- [ ] 4 componentes refatorados (< 200 linhas cada)
- [ ] Todas páginas com w-full + h-full
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Lighthouse score > 80

### P5
- [ ] 3 índices funcionais (Configurações, Acessos, Monitoramento)
- [ ] Duplicidades consolidadas (FormaPagamento, CentroCusto, etc)
- [ ] Home + Documentacao removidas
- [ ] Nenhum link quebrado
- [ ] Relatórios ainda funcionam

### P3
- [ ] 50+ ações com data-permission
- [ ] 10+ handlers com entityGuard
- [ ] AuditLog registra antes/depois, user, timestamp
- [ ] Usuário sem permissão não consegue executar ação
- [ ] E2E: teste 3 fluxos críticos

### P2
- [ ] 6 entidades com groupId + empresaId
- [ ] Todas queries usam filterInContext()
- [ ] Testes: usuário A não vê dados de B
- [ ] Automações de propagação prontas (acionadas em 07/07)

---

## 🚨 BLOQUEIOS & DEPENDÊNCIAS

| Item | Bloqueia | Desbloqueado |
|------|----------|-------------|
| Automações P2 | entity-triggered webhooks | 07/07/2026 |
| Propagação P2 | triggers automáticos | 07/07/2026 |
| SendEmail (em P3?) | invocações em automações | 07/07/2026 |
| P3 → P2 | nenhum guard se sem RBAC | P3 antes de P2 ✓ |
| P4 → outros | layout w-full obrigatório | P4 antes/paralelo ✓ |
| P5 → P3 | permissões em novo Índice 2 | P5 antes de P3 ✓ |

---

## 📝 ANOTAÇÕES IMPORTANTES

1. **Regra-Mãe:** Não criar novo, melhorar existente sempre
2. **Multiempresa:** groupId + empresaId em TODAS novas entidades/updates
3. **Layout:** w-full + h-full em TODAS telas (não negociável)
4. **RBAC:** data-permission frontend + entityGuard backend (duplo)
5. **Auditoria:** antes/depois + user + timestamp + group_id + empresa_id
6. **Credits:** Automações P2 esperadas para depois de 07/07

---

**Documento gerado:** 21/06/2026 | **Atualizado:** Conforme executa | **Responsável:** Base44 AI