# PLANO DE MELHORIA ZUCCARO ERP — P1–P5
**Status:** EM EXECUÇÃO | **Data:** 21/06/2026 | **Duração:** 4 semanas

---

## 🎯 OBJETIVO GERAL
Refatorar, securizar, consolidar e otimizar ERP Zuccaro (16 módulos, 130+ telas) respeitando **Regra-Mãe**: multiempresa absoluta, RBAC granular, layouts responsivos, auditoria completa.

---

## 📊 SEQUÊNCIA CRÍTICA (SEM PARALELIZAÇÃO ALÉM DO INDICADO)

### SEMANA 1: P1 + P4 (Avaliação + Refatoração Estrutural)

#### P1 — CHECKUP GERAL (Dias 1–2, ~4–6 horas)
**Responsabilidade:** Mapear estado atual, identificar problemas, criar inventário.

- ✅ **1.1 Mapear 16 módulos** (30 min)
- ✅ **1.2 Listar 10+ arquivos > 600 linhas** (1 hora)
- ✅ **1.3 Encontrar 10+ telas duplicadas** (1 hora)
- ⏳ **1.4 Testar botões em 7 módulos** (2 horas) — **FAZER AGORA**
- ✅ **1.5 Mapear 6 dashboards bloated** (1 hora)

**Ação Imediata:** Testar botões "Aprovar", "Cancelar", "Excluir" em Comercial, Financeiro, Estoque.

---

#### P4 — LAYOUT & FLUIDEZ (Dias 2–4, ~2–3 dias)
**Responsabilidade:** Refatorar componentes grandes, simplificar dashboards, enforçar w-full + h-full.

**FASE 4.1: Refatorar 4 Componentes Críticos (2 dias)**

| Arquivo | Linhas Atual | Ação | Status |
|---------|------------|------|--------|
| DashboardFinanceiroResumo | 117 | ✅ Quebrado em 4 componentes | DONE |
| PedidoFormCompleto | ~800 | Quebrar em 6 componentes | ⏳ TODO |
| DashboardProducaoRealtime | ~650 | Quebrar em 3 componentes | ⏳ TODO |
| ContaReceberForm | ~600 | Quebrar em 4 componentes | ⏳ TODO |

**Pattern:** Cada novo componente 80–150 linhas max.

**FASE 4.2: Simplificar 6 Dashboards (1–2 dias)**

| Dashboard | Cards Novo | KPIs Essenciais |
|-----------|----------|-----------------|
| Principal | 8 | Receita, Custos, Resultado, Pedidos, Estoque, RH, Fluxo, Saúde |
| Financeiro | 8 | Fluxo, Receitas, Despesas, Taxa Conc., Ticket, Formas, Meta, Overdue |
| Comercial | 8 | Funil, Taxa Conv., Pedidos, Clientes, Ticket, Top Vendedores, Follow-ups, Churn |
| Estoque | 8 | Valor Total, Itens Críticos, Movimentações, Rotatividade, Transferências, Inventário, Compras, Vendas |
| Produção | 8 | OP Ativas, Taxa Conclusão, Refugo, Apontamentos, Capacidade, Tempo Ciclo, Qualidade, Custo |
| Expedição | 8 | Entregas, Taxa Sucesso, Tempo Médio, Rotas, Ocorrências, GPS, Rastreamento, Custos |

**Ação:** Remover cards não-essenciais → criar abas "Detalhes" com mais info.

---

### SEMANA 2: P5 (Consolidação & Limpeza)

#### P5 — ADMINISTRAÇÃO & CONSOLIDAÇÃO (Dias 5–7, ~2–3 dias)
**Responsabilidade:** Consolidar 3 índices, remover duplicidades, limpar código morte.

**FASE 5.1: Criar 3 Índices de Administração (1 dia)**

```
/AdministracaoSistema (refatorado)
├── ÍNDICE 1: Configurações Gerais
│   ├── Empresa (CRUD + Filiais)
│   ├── Configurações Fiscais (NF-e, SPED)
│   ├── Integração (APIs, Gateways, Webhooks)
│   └── Parâmetros (Unidades, Moedas, Índices)
│
├── ÍNDICE 2: Gestão de Acessos
│   ├── Usuários (CRUD + histórico login)
│   ├── Perfis de Acesso (5 + personalizado)
│   ├── Permissões (50+ Modulo.Entidade.Acao)
│   ├── Conflitos SoD (detecção + recomendação)
│   └── Auditoria de Acessos (logs + relatório)
│
└── ÍNDICE 3: Monitoramento & Saúde
    ├── Saúde do Sistema (CPU, RAM, DB, API)
    ├── Auditoria (AuditLog completo)
    ├── Backup & Recuperação (snapshots)
    ├── Sincronização (status Grupo ↔ Empresa)
    └── Estatísticas (KPIs sistema)
```

**FASE 5.2: Consolidar Duplicidades (1 dia)**

| Item Duplicado | Origem A | Origem B | Ação |
|---|---|---|---|
| FormaPagamento | Administração | Cadastros | Mover para Cadastros |
| CentroCusto | Financeiro | Cadastros | Mover para Cadastros |
| PlanoDeContas | Financeiro | Cadastros | Mover para Cadastros |
| PerfilAcesso | 2 telas | consolidar | Usar único (Índice 2) |
| Usuario | GestaoUsuarios | AdminTabs | Usar único (Índice 2) |
| ... | ... | ... | |

**FASE 5.3: Remover Páginas Morte (30 min)**

- [ ] `pages/Home.jsx` → redirecionar "/" para "/Dashboard"
- [ ] `pages/Documentacao.jsx` → remover
- [ ] Update App.jsx routes
- [ ] Validar nenhum link quebrado

---

### SEMANA 3: P3 (RBAC & Segurança)

#### P3 — RBAC & SEGURANÇA (Dias 8–11, ~3–4 dias)
**Responsabilidade:** Implementar controle granular de acesso (frontend + backend) + auditoria.

**FASE 3.1: Adicionar data-permission em Botões (2 dias)**

**Prioridade 1 (20 botões, 4 módulos):**

```jsx
// Pattern
<Button
  data-permission="Comercial.Pedido.aprovar"
  disabled={!hasPermission('Comercial.Pedido.aprovar')}
  onClick={handleAprovar}
>
  Aprovar Pedido
</Button>
```

**Módulos:**
- Comercial: Criar Pedido, Editar, Aprovar, Cancelar, Gerar NF (5 botões)
- Financeiro: Baixar, Cancelar, Rejeitar ContaPagar/Receber (5 botões)
- Estoque: Ajustar, Transferir, Finalizar Inventário, Movimentar (5 botões)
- Compras: Aprovar OC, Receber, Avaliar Fornecedor (5 botões)

**FASE 3.2: Implementar entityGuard Backend (2 dias)**

```javascript
// Pattern
const guardResult = await base44.functions.invoke('entityGuard', {
  module: 'Financeiro',
  section: 'ContaPagar',
  action: 'baixar',
  entity_id: id,
  empresa_id,
  group_id
});
if (!guardResult.data.allowed) {
  return Response.json({ error: guardResult.data.reason }, { status: 403 });
}
```

**10 Handlers Críticos:**
1. Comercial.Pedido.aprovar
2. Comercial.Pedido.cancelar
3. Financeiro.ContaPagar.baixar
4. Financeiro.ContaReceber.receber
5. Estoque.Inventario.finalizar
6. Compras.OrdemCompra.receber
7. Producao.OrdemProducao.aprovar
8. Expedicion.Entrega.confirmar
9. Fiscal.NotaFiscal.emitir
10. RH.Ferias.aprovar

**FASE 3.3: Adicionar AuditLog em Ações Sensíveis (1 dia)**

```javascript
// Pattern (criar antes + depois)
await base44.entities.AuditLog.create({
  usuario: user.email,
  usuario_id: user.id,
  modulo: 'Financeiro',
  entidade: 'ContaPagar',
  acao: 'Baixa',
  empresa_id,
  group_id,
  dados_anteriores: { status: 'Pendente', valor: 1000 },
  dados_novos: { status: 'Pago', valor: 1000, data_pagamento: today },
  data_hora: new Date().toISOString(),
  ip_address: req.ip,
  navegador: req.headers['user-agent']
});
```

---

### SEMANA 4: P2 (Multiempresa Estrutura)

#### P2 — MULTIEMPRESA ESTRUTURA (Dias 12–14, ~2–3 dias)
**Responsabilidade:** Adicionar groupId + empresaId, validar queries multi-tenant.

⚠️ **BLOQUEIO:** Automações de propagação bidirecional esperadas **após 07/07** (credits reset).

**FASE 2.1: Adicionar groupId + empresaId a 6 Entidades (1 dia)**

```json
{
  "name": "MovimentacaoEstoque",
  "type": "object",
  "properties": {
    "group_id": { "type": "string", "description": "ID do grupo empresarial" },
    "empresa_id": { "type": "string", "description": "ID da empresa" },
    ...
  }
}
```

**Entidades (usar backfillGroupEmpresa para migração):**
1. MovimentacaoEstoque
2. OrdemProducao
3. ApontamentoProducao
4. CaixaMovimento
5. ConciliacaoBancaria
6. LancamentoContabil

**FASE 2.2: Validar Queries com filterInContext (1 dia)**

```javascript
// Antes (ERRADO)
const movimentos = await base44.entities.MovimentacaoEstoque.list();

// Depois (CORRETO)
const movimentos = await filterInContext('MovimentacaoEstoque', { status: 'pendente' });
```

**Grep + Replace:** Buscar `base44.entities.\w+\.list\(\)` sem contexto → adicionar filtro.

**FASE 2.3: Documentar Propagação Bidirecional (1 dia)**

Mapear fluxos e criar automações (acionadas em 07/07):
- Baixa Contrapagar Grupo → replicar para Empresa
- Venda Empresa → replicar para Grupo
- Transferência Filial → atualizar ambas

---

## 📋 CHECKLIST EXECUTIVO (Marcar conforme avança)

### P1 — CHECKUP ✅ 90% (1 dia)
- [x] 1.1 Mapear 16 módulos
- [x] 1.2 Listar 10 arquivos > 600 linhas
- [x] 1.3 Encontrar 10 telas duplicadas
- [ ] 1.4 Testar botões 7 módulos (2 horas) ← **HOJE**
- [x] 1.5 Mapear 6 dashboards

### P4 — LAYOUT ⏳ 5% (3 dias)
- [x] 4.1.1 Refatorar DashboardFinanceiroResumo (4 componentes)
- [ ] 4.1.2 Refatorar PedidoFormCompleto (6 componentes) ← **PRÓXIMO**
- [ ] 4.1.3 Refatorar DashboardProducaoRealtime (3 componentes)
- [ ] 4.1.4 Refatorar ContaReceberForm (4 componentes)
- [ ] 4.2.1 Simplificar 6 Dashboards (8 KPIs cada)

### P5 — ADMINISTRAÇÃO ⏳ 0% (3 dias)
- [ ] 5.1 Criar 3 índices (Configurações, Acessos, Monitoramento)
- [ ] 5.2 Consolidar FormaPagamento, CentroCusto, PlanoDeContas
- [ ] 5.3 Remover Home, Documentacao
- [ ] 5.4 Validar sem breaking

### P3 — RBAC ⏳ 0% (4 dias)
- [ ] 3.1 Adicionar data-permission em 20+ botões
- [ ] 3.2 Implementar entityGuard em 10 handlers
- [ ] 3.3 Adicionar AuditLog em ações sensíveis
- [ ] 3.4 E2E: testar 3 fluxos (Pedido, Financeiro, Estoque)

### P2 — MULTIEMPRESA ⏳ 0% (3 dias, propagação em 07/07)
- [ ] 2.1 Adicionar groupId + empresaId a 6 entidades
- [ ] 2.2 Validar queries com filterInContext
- [ ] 2.3 Documentar propagação bidirecional
- [ ] 2.4 E2E: usuário A ≠ vê dados usuário B

---

## 🚨 RISCOS & MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---|---|---|
| Breaking em refatoração P4 | 🟡 Média | 🔴 Alto | Backup antes de cada refator; testar imediatamente |
| Queries sem contexto em P2 | 🟡 Média | 🔴 Alto | Grep + find-replace automatizado; E2E |
| Automações bloqueadas até 07/07 | 🟢 Confirmado | 🟡 Médio | Documentar; aguardar credits; acioná-las 08/07 |
| Dados órfãos em consolidação P5 | 🟡 Média | 🟡 Médio | Backup completo; verificar referências antes |

---

## 💰 ESTIMATIVA DE TEMPO

| Fase | Dias | Horas | Status |
|------|------|-------|--------|
| P1 | 2 | 6 | ✅ 90% |
| P4 | 3 | 24 | ⏳ Iniciado |
| P5 | 3 | 24 | ⏳ Próximo |
| P3 | 4 | 30 | ⏳ Deps: P5 |
| P2 | 3 | 20 | ⏳ Deps: P3 |
| **TOTAL** | **14–16** | **104–120** | **~3–4 semanas** |

---

## ✅ CRITÉRIOS DE SUCESSO FINAL

- [ ] 0 breaking changes (telas existentes funcionam)
- [ ] Todos 16 módulos com w-full + h-full
- [ ] 50+ ações com data-permission + entityGuard
- [ ] 6+ dashboards simplificados (8 KPIs cada)
- [ ] 3 índices Administração funcionando
- [ ] Nenhuma tela duplicada
- [ ] AuditLog registrando 100% ações sensíveis
- [ ] E2E validação: multiempresa + RBAC + responsividade
- [ ] Lighthouse score > 80 em todos dashboards
- [ ] Documentação P1–P5 atualizada

---

**Próxima Ação:** Testar botões P1.4 → Refatorar PedidoFormCompleto P4.1.2