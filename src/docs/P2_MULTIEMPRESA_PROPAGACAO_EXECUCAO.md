# P2 — MULTIEMPRESA & PROPAGAÇÃO BIDIRECIONAL (EM PLANEJAMENTO)
**Data:** 21/06/2026 | **Duração:** 5–7 dias | **Status:** PLANEJADO

---

## FASE 2.1: Auditoria de Multiempresa (1 dia)

**Objetivo:** Validar que TODAS as entidades têm `group_id` e `empresa_id`.

### Verificação (18 entidades críticas):

- [ ] **Pedido** — `group_id`, `empresa_id`, `vendedor_id` (FK)
- [ ] **ContaReceber** — `group_id`, `empresa_id`, `cliente_id` (FK)
- [ ] **ContaPagar** — `group_id`, `empresa_id`, `fornecedor_id` (FK)
- [ ] **Entrega** — `group_id`, `empresa_id`, `rota_id` (FK)
- [ ] **OrdemCompra** — `group_id`, `empresa_id`, `fornecedor_id` (FK)
- [ ] **OrdemProducao** — `group_id`, `empresa_id`, `responsavel_id` (FK)
- [ ] **MovimentacaoEstoque** — `group_id`, `empresa_id`, `responsavel_id` (FK)
- [ ] **NotaFiscal** — `group_id`, `empresa_id`, `pedido_id` (FK)
- [ ] **Oportunidade** — `group_id`, `empresa_id`, `cliente_id` (FK)
- [ ] **Comissao** — `group_id`, `empresa_id`, `vendedor_id` (FK)
- [ ] **Evento** — `group_id`, `empresa_id`, `responsavel_id` (FK)
- [ ] **Chamado** — `group_id`, `empresa_id`, `cliente_id` (FK)
- [ ] **Campanha** — `group_id`, `empresa_id`, `responsavel_id` (FK)
- [ ] **Ponto** — `group_id`, `empresa_id`, `colaborador_id` (FK)
- [ ] **Ferias** — `group_id`, `empresa_id`, `colaborador_id` (FK)
- [ ] **Interacao** — `group_id`, `empresa_id`, `responsavel_id` (FK)
- [ ] **TransferenciaFilial** — `group_id`, `empresa_origem_id`, `empresa_destino_id` (BK)
- [ ] **RateioFinanceiro** — `group_id`, `empresa_id` (parent+children)

**Resultado Esperado:** ✅ 100% das entidades com contexto multiempresa

---

## FASE 2.2: Propagação Grupo → Empresas (3 dias)

**Pattern:**
```javascript
// 1. Usuário cria no Grupo (ContaReceber de faturamento geral)
// ↓ Automação via onEntityWhatsappNotify / custom trigger
// 2. Função propagateGroupConfigs replica para Empresas
//    - Filtra: empresa_destino_id IN (empresas_do_grupo)
//    - Cria em cada empresa: { ...dados_do_grupo, empresa_id: empresa_destino.id }
// 3. Resultado: 1 Conta Receber Grupo → N Contas Receber Empresas (1 por empresa)
```

**10 Handlers to refactor:**

1. [ ] **ContaReceber grupo** → `onContaReceberGroup` (new)
   - Trigger: ContaReceber.create com empresa_id=null (grupo)
   - Action: Replica para cada empresa do grupo
   - Test: Criar Conta Receber no Grupo (empresa_id=null) → 3 empresas recebem

2. [ ] **ContaPagar grupo** → `onContaPagarGroup` (new)

3. [ ] **NotaFiscal** → `onNotaFiscalGroup` (refactor existente)
   - Grupo emite NF genérica → Empresas emitem NF específicas (CFOP, CST diferente)
   
4. [ ] **Oportunidade** → `onOportunidadeGroup` (refactor existente)

5. [ ] **Entrega** → `onEntregaGroup` (refactor existente)
   - Grupo cria Entrega → Empresas filiais recebem dados de rota/transportadora

6. [ ] **OrdemCompra** → `onOrdemCompraGroup` (new)
   - Grupo centraliza compras → Distribui entre empresas

7. [ ] **Evento** → `onEventoGroup` (refactor existente)
   - Grupo cria Evento de Reunião → Todos os colaboradores das empresas são notificados

8. [ ] **Campanha** → `onCampanhaGroup` (refactor existente)
   - Grupo cria Campanha → Cada empresa replica com seus clientes

9. [ ] **RateioFinanceiro** → `onRateioFinanceiroGroup` (refactor existente)
   - Custo centralizado no Grupo → Rateia Contas Pagar para cada empresa

10. [ ] **TransferenciaFilial** → `onTransferenciaFilialGroup` (refactor existente)
    - Transferência entre 2 empresas → Impacta estoque de ambas

---

## FASE 2.3: Propagação Empresa → Grupo (2–3 dias)

**Pattern:**
```javascript
// 1. Usuário edita no Empresa (marca Conta Receber como Paga)
// ↓ Automação onContaReceberUpdate
// 2. Função syncGroupStatus
//    - Se origem_group_id (veio do grupo), atualiza grupo com status novo
//    - Se origem_empresa_id (criada localmente), log apenas
// 3. Resultado: Conta Receber Empresa Paga → Grupo reflete status Pago
```

**5 Handlers to refactor:**

1. [ ] **ContaReceber.baixar** → Sync status → Grupo
2. [ ] **ContaPagar.baixar** → Sync status → Grupo  
3. [ ] **OrdemCompra.receber** → Sync status + estoque → Grupo
4. [ ] **Entrega.confirmar** → Sync status + data → Grupo
5. [ ] **OrdemProducao.aprovar** → Sync status → Grupo

---

## FASE 2.4: Conflitos & Reconciliação (1 dia)

**Cenários:**
- [ ] **Conflito:** Grupo cria OC, Empresa já criou localmente → Detectar duplicata
- [ ] **Stale Data:** Empresa baixa Conta Receber, Grupo tenta baixar ao mesmo tempo → Lock pessimista
- [ ] **Orphaned:** Empresa deletada, mas Contas Receber ainda ligadas → Cleanup via `cleanupOrphanedPerfilAcesso` pattern

**Automação:** `conflictPolicy` (existente) + teste E2E

---

## ✅ CHECKLIST P2

| Fase | Tarefas | Status | Prazo |
|------|---------|--------|-------|
| 2.1 | Auditoria 18 entidades | ⏳ 0% | 1 dia |
| 2.2 | 10 handlers Grupo→Empresas | ⏳ 0% | 3 dias |
| 2.3 | 5 handlers Empresa→Grupo | ⏳ 0% | 2 dias |
| 2.4 | Conflitos + E2E | ⏳ 0% | 1 dia |

**Total:** 5–7 dias

---

## Próxima Ação: Auditoria das 18 entidades (começar com Pedido, ContaReceber, NotaFiscal)