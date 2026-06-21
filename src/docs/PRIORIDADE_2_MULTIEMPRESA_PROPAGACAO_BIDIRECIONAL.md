# PRIORIDADE 2 — MULTIEMPRESA: GRUPO ↔ EMPRESAS (PROPAGAÇÃO BIDIRECIONAL)
**Data:** 21/06/2026 | **Status:** Planejamento & Execução | **Responsável:** Base44 AI

---

## OBJETIVO
Garantir que **toda entidade** tenha contexto multiempresa (`groupId` + `empresaId`) e que **toda operação** em Grupo replique nas empresas e vice-versa, mantendo consistência fiscal e financeira.

---

## SEÇÃO 1 — VALIDAÇÃO DE ENTIDADES MULTIEMPRESA

### 1.1 Entidades Críticas COM groupId & empresaId ✅
| Entidade | groupId | empresaId | Status | Propagação |
|----------|---------|-----------|--------|-----------|
| ContaPagar | ✅ | ✅ | **CRÍTICA** | Sim (com detalhe_pagamento) |
| ContaReceber | ✅ | ✅ | **CRÍTICA** | Sim |
| Pedido | ✅ | ✅ | **CRÍTICA** | Sim (com itens) |
| NotaFiscal | ✅ | ✅ | **CRÍTICA** | Sim (empresa_faturamento_id) |
| Entrega | ✅ | ✅ | ✅ | Sim |
| Evento | ✅ | ✅ | ✅ | Sim |
| Oportunidade | ✅ | ✅ | ✅ | Sim |
| Interacao | ✅ | ✅ | ✅ | Sim |
| Campanha | ✅ | ✅ | ✅ | Sim |
| Comissao | ✅ | ✅ | ✅ | Sim |
| SolicitacaoCompra | ✅ | ✅ | ✅ | Sim |
| OrdemCompra | ✅ | ✅ | ✅ | Sim |
| TransferenciaFilial | ✅ | ✅ | ✅ | Sim (origem/destino) |
| Contrato | ✅ | ✅ | ✅ | Sim |
| OrcamentoCliente | ✅ | ✅ | ✅ | Sim |
| Chamado | ✅ | ✅ | ✅ | Sim |
| Ferias | ✅ | ✅ | ✅ | Sim |
| Ponto | ✅ | ✅ | ✅ | Sim |

### 1.2 Entidades COM RISCO (groupId presente, empresaId parcial/condicional) ⚠️
| Entidade | groupId | empresaId | Status | Problema | Ação |
|----------|---------|-----------|--------|----------|------|
| MovimentacaoEstoque | ✅ | Falta | ⚠️ CRÍTICA | Movimentação de estoque deve ter empresa de origem | **ADD empresaId** |
| OrdemProducao | ✅ | Falta | ⚠️ CRÍTICA | OP deve ser amarrada à empresa produtora | **ADD empresaId** |
| ApontamentoProducao | ✅ | Falta | ⚠️ CRÍTICA | Apontamento deve indicar qual empresa/fábrica | **ADD empresaId** |
| CaixaMovimento | ✅ | Falta | ⚠️ CRÍTICA | Caixa é por empresa, não por grupo | **ADD empresaId** |
| ConciliacaoBancaria | ✅ | Falta | ⚠️ CRÍTICA | Conciliação é por conta bancária (empresa) | **ADD empresaId** |
| LancamentoContabil | ✅ | Falta | ⚠️ CRÍTICA | Lançamento é por empresa contábil | **ADD empresaId** |
| Notificacao | ✅ | Falta | ⚠️ RISCO | Notificação deve saber para qual empresa enviar | **ADD empresaId** |
| SessaoUsuario | ✅ | Falta | ⚠️ RISCO | Sessão pode ter empresa padrão | **ADD empresaId (opcional)** |

### 1.3 Entidades SEM groupId/empresaId (Maestro ou Compartilhadas) ℹ️
| Entidade | Tipo | Escopo | Justificativa |
|----------|------|--------|---------------|
| Produto | Maestro | Grupo | Catálogo central; múltiplas empresas usam; SIM pode ter empresas_ids (quem usa) |
| Cliente | Compartilhada | Grupo/Empresa | Via `empresas_compartilhadas_ids` ou `empresa_id` primária |
| Fornecedor | Compartilhada | Grupo/Empresa | Via `empresa_dona_id` + `empresas_compartilhadas_ids` |
| Transportadora | Compartilhada | Grupo/Empresa | Via `empresa_dona_id` + `empresas_compartilhadas_ids` |
| Colaborador | Maestro | Grupo | Via `empresa_alocada_id` (alocação dinâmica) |
| PlanoDeContas | Maestro | Grupo | Plano contábil único por grupo; usado por todas empresas |
| CentroCusto | Maestro | Grupo | Centros são compartilhados |
| TabelaPreco | Maestro | Grupo/Empresa | Via `empresa_id` se específica, ou NULL se grupo |
| Banco | Maestro | Grupo | Catálogo de bancos; usado por todas empresas |
| UnidadeMedida | Maestro | Grupo | Unidades padrão; compartilhadas |
| PerfilAcesso | Maestro | Grupo | Perfis são por grupo; aplicados a usuários |
| GrupoEmpresarial | Master | Master | Root; não tem groupId/empresaId |

---

## SEÇÃO 2 — MAPEAMENTO DE FLUXOS CRÍTICOS (PROPAGAÇÃO)

### 2.1 Fluxo Financeiro: Baixa ContaPagar no Grupo → Empresa

**Cenário:** Usuário baixa ContaPagar no Grupo CPA (group_id=grupo_001) para empresa 3Z (empresa_id=3z).

**Expectativa:**
```
Grupo (CPA):
  ContaPagar {
    id: "cp_1001",
    group_id: "grupo_001",
    empresa_id: "3z",
    status: "Pago",
    data_pagamento: "2026-06-21",
    valor_pago: 1000,
    detalhes_pagamento: { ... }
  }

Empresa 3Z:
  ContaPagar {
    id: "cp_1001_replica",
    group_id: "grupo_001",
    empresa_id: "3z",
    status: "Pago",
    data_pagamento: "2026-06-21",
    valor_pago: 1000,
    detalhes_pagamento: { ... },
    documento_grupo_id: "cp_1001"  ← backlink
  }
```

**Implementação Atual:**
- ✅ Frontend: ContasPagarTab chama `updateInContext()` com empresaId
- ✅ Backend: `ContaPagar.update()` stampa group_id + empresa_id
- ⚠️ **FALTA:** Trigger de propagação (`onContaPagarUpdated`) quando status = "Pago"
- ⚠️ **FALTA:** Validação que `documento_grupo_id` não cria loop infinito

**Ação:**
1. [ ] Criar automation: `entity-triggered` on ContaPagar.update → `propagatePagamento()`
2. [ ] Função `propagatePagamento()` em functions/
3. [ ] Testar: Baixar no Grupo → validar replica na empresa

---

### 2.2 Fluxo Comercial: Venda em Empresa → Aparece no Grupo

**Cenário:** Pedido criado em CPA Ferro e Aço (empresa_id=ferro) deve aparecer em visualização consolidada do Grupo.

**Expectativa:**
```
Empresa (Ferro e Aço):
  Pedido {
    id: "ped_2001",
    group_id: "grupo_001",
    empresa_id: "ferro",
    cliente_id: "cli_100",
    valor_total: 5000,
    status: "Aprovado"
  }

Grupo (Visualização):
  Query: filterInContext('Pedido', {group_id: 'grupo_001'})
    → Retorna: ped_2001 (visto via grupo_id)
```

**Implementação Atual:**
- ✅ Frontend: `filterInContext()` usa `getFiltroContexto()` que inclui grupo_id
- ✅ Backend: `entityListSorted()` filtra por `$or: [{ group_id }, { empresa_id: {$in: [...]}}]`
- ✅ Pedido já tem group_id + empresa_id

**Validação Necessária:**
- [ ] Testar: Criar Pedido em empresa → aparece em visualização do Grupo
- [ ] Testar: Editar Pedido em empresa → atualiza na visão do Grupo
- [ ] Testar: Deletar Pedido em empresa → reflete no Grupo (soft-delete com auditoria)

---

### 2.3 Fluxo Fiscal: Faturamento no Grupo → NF emitida pela Empresa Correta

**Cenário:** Pedido no Grupo é convertido para NF; deve gerar NF apenas na empresa responsável.

**Expectativa:**
```
Pedido {
  group_id: "grupo_001",
  empresa_id: "ferro",  ← Empresa responsável
  ...
}

NotaFiscal gerada:
  {
    id: "nf_500",
    group_id: "grupo_001",
    empresa_id: "ferro",  ← MESMA empresa
    empresa_faturamento_id: "ferro",
    pedido_id: "ped_2001",
    status: "Autorizada"
  }

NÃO gera NF para outras empresas do grupo.
```

**Implementação Atual:**
- ✅ Frontend: `GerarNFeModal` pega `empresaAtual.id`
- ✅ Backend: `nfeActions()` stampa empresa_id corretamente
- ⚠️ **VALIDAÇÃO INCOMPLETA:** Se Pedido tem empresa_id=ferro mas usuário tenta gerar NF com empresa_id=outra, não bloqueia

**Ação:**
1. [ ] Backend: Validar que `empresa_id(Pedido) == empresa_id(NotaFiscal)`
2. [ ] Frontend: Toast de erro se mismatch detectado
3. [ ] Auditoria: Log se alguém tentou forçar NF para empresa errada

---

### 2.4 Fluxo de Consultas: Nenhuma Query sem Contexto

**Problema:** Queries genéricas type `base44.entities.ContaPagar.list()` (sem filtro) podem retornar dados de outras empresas/grupos.

**Solução:** Todos os .list() devem usar `filterInContext()` que passa `getFiltroContexto()`.

**Validação:**
- [ ] Audit: Encontrar ALL `.list()` calls sem filtro
- [ ] Refactor: Substituir por `filterInContext()` ou adicionar query guard
- [ ] Test: Verificar que usuário da empresa A não vê dados da empresa B

---

## SEÇÃO 3 — AÇÕES DE EXECUÇÃO IMEDIATA

### 3.1 Adicionar groupId + empresaId em Entidades Faltantes ⚠️

**Entidades Críticas a Corrigir:**

#### MovimentacaoEstoque
```json
{
  "group_id": { "type": "string", "description": "ID do grupo empresarial" },
  "empresa_id": { "type": "string", "description": "ID da empresa origem da movimentação" },
  ...
}
```
**Por quê:** Estoque é por empresa; não faz sentido mover estoque "do grupo".

#### OrdemProducao
```json
{
  "group_id": { "type": "string" },
  "empresa_id": { "type": "string", "description": "Empresa responsável pela produção" },
  ...
}
```
**Por quê:** Produção é localizada (fábrica específica = empresa).

#### ApontamentoProducao
```json
{
  "group_id": { "type": "string" },
  "empresa_id": { "type": "string", "description": "Fábrica/empresa onde apontamento ocorreu" },
  ...
}
```

#### CaixaMovimento
```json
{
  "group_id": { "type": "string" },
  "empresa_id": { "type": "string", "description": "Empresa proprietária do caixa" },
  ...
}
```

#### ConciliacaoBancaria
```json
{
  "group_id": { "type": "string" },
  "empresa_id": { "type": "string", "description": "Empresa vinculada à conta bancária" },
  ...
}
```

#### LancamentoContabil
```json
{
  "group_id": { "type": "string" },
  "empresa_id": { "type": "string", "description": "Empresa contábil que originou lançamento" },
  ...
}
```

---

### 3.2 Criar Automações de Propagação

#### Automation 1: ContaPagar → Baixa propaga para empresa
```javascript
// type: "entity"
// entity_name: "ContaPagar"
// event_types: ["update"]
// trigger: changed_fields contém "status" E data.status === "Pago"
// function: propagatePagamento()
```

#### Automation 2: Pedido → Alteração propaga para Grupo
```javascript
// type: "entity"
// entity_name: "Pedido"
// event_types: ["update"]
// function: propagatePedidoChanges()
```

#### Automation 3: OrdemProducao → Criação dispara workflow
```javascript
// type: "entity"
// entity_name: "OrdemProducao"
// event_types: ["create"]
// function: onOrdemProducaoCreated()
```

---

### 3.3 Validar Queries SEM Contexto

**Buscar todos os .list() / .filter() sem guarda:**
```javascript
// ❌ ERRADO:
base44.entities.ContaPagar.list()

// ✅ CORRETO:
await filterInContext('ContaPagar', getFiltroContexto('empresa_id'))
```

**Ação:**
1. [ ] Grep: `base44.entities\.\w+\.list\(\)` em todos os components
2. [ ] Verificar se têm query guard antes
3. [ ] Refactor ou adicionar guard + teste

---

## SEÇÃO 4 — PLANO DE IMPLEMENTAÇÃO FASEADO

### Fase 1: Entidades (1-2 dias)
- [ ] Adicionar groupId/empresaId às 6 entidades faltantes
- [ ] Migrar dados via `backfillGroupEmpresa()` (já existe)
- [ ] Testar: Queries retornam dados corretos por empresa

### Fase 2: Propagação (2-3 dias)
- [ ] Criar 3–5 automações críticas (ContaPagar, Pedido, OrdemProducao)
- [ ] Testar: Baixa no Grupo → propaga para empresa
- [ ] Testar: Venda em empresa → aparece no Grupo
- [ ] Testar: NF gerada para empresa correta

### Fase 3: Validação de Queries (1-2 dias)
- [ ] Audit: Listar todas queries sem contexto
- [ ] Refactor: Adicionar guardrails (`getFiltroContexto()`)
- [ ] Test: Usuário A não vê dados de Usuário B (diferentes empresas)

### Fase 4: Testes E2E (1 dia)
- [ ] Cenário: Baixa ContaPagar no Grupo → aparece em empresa
- [ ] Cenário: Venda em empresa → aparece no Grupo + gera NF corretamente
- [ ] Cenário: Consulta filtra por empresa automaticamente
- [ ] Cenário: Auditoria registra todas operações multiempresa

---

## SEÇÃO 5 — VALIDAÇÃO TÉCNICA (CHECKLIST)

### P2 Multiempresa Completa?
- [ ] Todas entidades têm groupId (maestro) + empresaId (operacional)?
- [ ] Propagação bidirecional funciona (Grupo ↔ Empresa)?
- [ ] Queries sempre têm contexto (getFiltroContexto)?
- [ ] Baixa no Grupo propaga para empresa responsável?
- [ ] Venda em empresa aparece no Grupo?
- [ ] NF gerada apenas pela empresa correta?
- [ ] Auditoria registra group_id + empresa_id?
- [ ] Usuário de empresa A não vê dados de empresa B?

### Exemplos de Testes
```bash
# Teste 1: Criar ContaPagar no Grupo
curl POST /ContaPagar {group_id: "grupo_001", empresa_id: "3z", status: "Pendente"}
→ Retorna com groupId + empresaId OK ✅

# Teste 2: Baixar ContaPagar no Grupo
curl PATCH /ContaPagar/cp_1001 {status: "Pago"}
→ Dispara propagação para empresa_id=3z ✅
→ Empresa 3Z vê ContaPagar com status=Pago ✅

# Teste 3: Venda em empresa
curl POST /Pedido {group_id: "grupo_001", empresa_id: "ferro", ...}
→ Grupo vê via filterInContext() ✅
→ Outro usuário de empresa diferente NÃO vê ✅

# Teste 4: Consulta sem contexto
curl GET /ContaPagar (sem filter)
→ Backend bloqueia? GUARDRAIL DEVE FORÇAR contexto ✅
```

---

## SEÇÃO 6 — DEPENDÊNCIAS

- ✅ `useContextoVisual` — já integrado (getFiltroContexto)
- ✅ `filterInContext()` — já implementado
- ✅ `backfillGroupEmpresa()` — função de migração pronta
- ✅ `propagateGroupConfigs()` — template de automação pronto
- ⏳ **FALTA:** Automações específicas (ContaPagar, Pedido, OP)
- ⏳ **FALTA:** Guardrails de query (bloquear .list() sem filtro)

---

## SEÇÃO 7 — PRÓXIMAS AÇÕES

### Esta Sessão (P2)
1. ✅ Validação: Todas entidades mapeadas
2. ⏳ Ação: Adicionar groupId/empresaId a 6 entidades
3. ⏳ Ação: Criar 3 automações críticas
4. ⏳ Ação: Testar propagação bidirecional

### Próxima Sessão (P3)
- Aplicar RBAC em 50+ ações sensíveis
- Frontend: data-permission em botões
- Backend: entityGuard bloqueando acesso não autorizado

---

**Documento gerado automaticamente em 2026-06-21** | Execução: Base44 AI | Status: Pronto para Fase 1