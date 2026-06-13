# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 2: MULTIEMPRESA (GRUPO ↔ EMPRESAS)

**Data:** 13/06/2026  
**Objetivo:** Garantir que TODAS as entidades usem `groupId` e `empresaId`, com propagação bidirecional automática e queries com contexto explícito.  
**Status:** 📋 AUDITORIA EM PROGRESSO

---

## 1. CHECKLIST DE CONFORMIDADE MULTIEMPRESA

### ✅ REQUISITOS OBRIGATÓRIOS

- [ ] **Toda entidade** possui campos `groupId` e `empresaId` (ou apenas `groupId` se nível grupo)
- [ ] **Todas as queries** filtram explicitamente por contexto (não retornam dados fora do escopo)
- [ ] **Propagação bidirecional** automática: Grupo → Empresas + Empresa → Grupo
- [ ] **Auditoria** registra `group_id` e `empresa_id` em TODA ação
- [ ] **Backend** valida `groupId`/`empresaId` antes de criar/atualizar/deletar
- [ ] **Frontend** usa `useContextoVisual()` para filtrar de forma consistente

---

## 2. ENTIDADES CRÍTICAS — AUDITORIA DE CAMPOS

### 🔴 GRUPO A: CLIENTES & CONTATOS (Críticas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| Cliente | ? | ? | 🔴 VERIFICAR | Auditar entity JSON |
| ContaB2B | ? | ? | 🔴 VERIFICAR | Verificar relação com Cliente |
| SegmentoCliente | ✅ Sim | ❌ Não | ⚠️ GRUPO ONLY | Validar compartilhamento |
| RegiaoAtendimento | ✅ Sim | ✅ Sim | ✅ OK | Multiempresa ativa |
| Representante | ✅ Sim | ✅ Sim | ✅ OK | Multiempresa ativa |

**Achado 1:** `SegmentoCliente` pode ser nível Grupo (compartilhado) — avaliar escopo.

---

### 🔴 GRUPO B: PEDIDOS & FATURAMENTO (Críticas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| Pedido | ✅ Sim | ✅ Sim | ✅ OK | Validar propagação |
| NotaFiscal | ✅ Sim | ✅ Sim | ✅ OK | Crítico: só empresa correto pode emitir |
| PedidoEtapa | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Entrega | ✅ Sim | ✅ Sim | ✅ OK | Validar logística cruzada |

**Achado 2:** NotaFiscal emitida no Grupo para empresa X deve registrar `cliente_empresa_id` correto.

---

### 🔴 GRUPO C: FINANCEIRO (Críticas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| ContaReceber | ✅ Sim | ✅ Sim | ✅ OK | Validar origem de pedido |
| ContaPagar | ✅ Sim | ✅ Sim | ✅ OK | Validar origem de OC |
| CaixaMovimento | ✅ Sim | ✅ Sim | ✅ OK | OK |
| ExtratoBancario | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Comissao | ✅ Sim | ✅ Sim | ⚠️ MISTO | Validar regra de empresa |
| CentroCusto | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |
| PlanoDeContas | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |

**Achado 3:** `PlanoDeContas` + `CentroCusto` provavelmente devem ser GRUPO-LEVEL (compartilhados), não empresa.

---

### 🔴 GRUPO D: ESTOQUE & COMPRAS (Críticas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| Produto | ✅ Sim | ❌ Não | ⚠️ GRUPO ONLY | Produto é compartilhado entre empresas |
| LocalEstoque | ✅ Sim | ✅ Sim | ✅ OK | Local físico por empresa |
| MovimentacaoEstoque | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Inventario | ✅ Sim | ✅ Sim | ✅ OK | OK |
| OrdemCompra | ✅ Sim | ✅ Sim | ✅ OK | OK |
| SolicitacaoCompra | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Fornecedor | ✅ Sim | ✅ Sim | ✅ OK | Validar compartilhamento |

**Achado 4:** `Produto` é GRUPO-LEVEL (catálogo compartilhado), não empresa-específico.

---

### 🔴 GRUPO E: PRODUÇÃO & QUALIDADE (Críticas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| OrdemProducao | ✅ Sim | ✅ Sim | ✅ OK | OK |
| ApontamentoProducao | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Veiculo | ✅ Sim | ✅ Sim | ✅ OK | Alocado por empresa |
| Motorista | ✅ Sim | ✅ Sim | ✅ OK | Alocado por empresa |
| RotaPadrao | ✅ Sim | ✅ Sim | ✅ OK | OK |

**Achado 5:** Verificar se Veiculo/Motorista podem ser compartilhados entre empresas.

---

### 🟡 GRUPO F: RH & COLABORADORES (Moderadas)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| Colaborador | ✅ Sim | ✅ Sim | ✅ OK | OK |
| Departamento | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |
| Cargo | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |
| Turno | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |

**Achado 6:** `Departamento`, `Cargo`, `Turno` podem ser GRUPO-LEVEL (compartilhados).

---

### 🟡 GRUPO G: CONFIGURAÇÕES & ADMIN (Altas Prioridade)

| Entidade | groupId | empresaId | Status | Ação |
|----------|---------|-----------|--------|------|
| PerfilAcesso | ✅ Sim | ❌ Não | ✅ GRUPO ONLY | OK — Perfis são grupo-level |
| FormaPagamento | ✅ Sim | ✅ Sim | ⚠️ MISTO | Pode ser grupo-level |
| TabelaPreco | ✅ Sim | ✅ Sim | ⚠️ MISTO | Validar escopo de aplicação |
| CondicaoComercial | ✅ Sim | ❌ Não | ⚠️ GRUPO ONLY | OK |
| Banco | ✅ Sim | ✅ Sim | ⚠️ MISTO | Conta bancária por empresa |
| UnidadeMedida | ✅ Sim | ❌ Não | ✅ GRUPO ONLY | OK |
| Marca | ✅ Sim | ❌ Não | ✅ GRUPO ONLY | OK |
| GrupoProduto | ✅ Sim | ❌ Não | ✅ GRUPO ONLY | OK |
| SetorAtividade | ✅ Sim | ❌ Não | ✅ GRUPO ONLY | OK |

**Achado 7:** `Banco` + `ContaBancariaEmpresa` — auditar se cada empresa tem suas contas.

---

## 3. PADRÃO DE ESCOPO POR ENTIDADE

### REGRA 1: GRUPO-LEVEL (Compartilhado)
Entidades que são **compartilhadas** entre todas as empresas do grupo:

```
✅ PerfilAcesso
✅ Produto
✅ GrupoProduto
✅ Marca
✅ UnidadeMedida
✅ SetorAtividade
✅ SegmentoCliente (?)
✅ CondicaoComercial
✅ PlanoDeContas (?)
✅ CentroCusto (?)
✅ Departamento (?)
✅ Cargo (?)
✅ Turno (?)
```

**Query Pattern:**
```javascript
// Buscar registros de nível grupo
await filterInContext('Produto', { group_id: grupoAtual.id }, 'nome', 200);
// NÃO incluir empresa_id em grupo-level
```

---

### REGRA 2: EMPRESA-LEVEL (Multiempresa)
Entidades específicas de cada empresa:

```
✅ Cliente
✅ Fornecedor
✅ Pedido
✅ NotaFiscal
✅ ContaReceber
✅ ContaPagar
✅ OrdemCompra
✅ Veiculo (?)
✅ Motorista (?)
✅ LocalEstoque
✅ MovimentacaoEstoque
✅ Entrega
```

**Query Pattern:**
```javascript
// Buscar registros de empresa
await filterInContext('Pedido', { 
  group_id: grupoAtual.id, 
  empresa_id: empresaAtual.id 
}, 'data', 100);
```

---

### REGRA 3: PROPAGAÇÃO BIDIRECIONAL
Quando uma ação ocorre, replicar para o contexto oposto:

- **Grupo → Empresa:** Baixa de título no Grupo reflete em empresa específica
- **Empresa → Grupo:** Venda feita na empresa aparece na consolidação do Grupo

**Backend Handler (já deve estar em `propagateGroupData` ou `syncGroupCompany`):**
```javascript
// Exemplo: Quando uma NotaFiscal é criada em empresa X
// 1. Registrar em NotaFiscal com empresa_id = X
// 2. Registrar movimento consolidado em nível Grupo
// 3. Atualizar ContaReceber de grupo (se aplicável)
```

---

## 4. QUERIES COM CONTEXTO EXPLÍCITO — CRÍTICAS

### 🔴 PROBLEMA CRÍTICO IDENTIFICADO

Muitas queries no código provavelmente **não filtram por grupo/empresa**, retornando dados de fora do escopo:

```javascript
// ❌ ERRADO — Sem contexto
const clientes = await base44.entities.Cliente.list();

// ✅ CORRETO — Com contexto explícito
const clientes = await filterInContext('Cliente', { 
  group_id: grupoAtual.id, 
  empresa_id: empresaAtual.id 
}, 'nome', 100);
```

### AUDIT DE QUERIES POR MÓDULO

| Módulo | Status | Ação |
|--------|--------|------|
| Dashboard | 🔴 CRÍTICO | Adicionar filtros em todas as queries |
| Comercial | 🔴 CRÍTICO | Validar filtros de Pedido/NF |
| Financeiro | 🔴 CRÍTICO | Validar filtros de CR/CP |
| Cadastros | 🟡 PARCIAL | Alguns formulários OK, verificar listagens |
| Estoque | 🟡 PARCIAL | Movimentações OK, verificar Produto |
| Compras | 🟡 PARCIAL | OCs OK, verificar Fornecedor |

---

## 5. PROPAGAÇÃO BIDIRECIONAL — FLUXOS CRÍTICOS

### Fluxo 1: Venda no Grupo → Reflete em Empresa
```
1. Pedido criado com empresa_id = "3Z" (no Grupo)
2. Sistema cria automaticamente:
   - Entrada em Pedido (empresa_id = "3Z")
   - Atualiza ContaReceber (empresa_id = "3Z")
   - Consolida faturamento no nível Grupo
3. Dashboard Grupo mostra venda com origem "3Z"
```

**Responsável:** Backend function `onPedidoCreated` (ou similar)

---

### Fluxo 2: Baixa de Título Grupo → Empresa
```
1. ContaPagar baixada no Grupo (sem empresa_id específico)
2. Sistema identifica empresa_id relacionada
3. Atualiza:
   - ContaPagar com empresa_id correto
   - Integra com CaixaMovimento (empresa)
   - Consolida no Grupo
```

**Responsável:** Backend function (criar se não existir)

---

### Fluxo 3: Emissão Fiscal Grupo → Empresa Correta
```
1. NotaFiscal criada no Grupo
2. Sistema valida:
   - Cliente tem empresa_id válida?
   - Empresa tem certificado digital?
   - Regime fiscal correto?
3. NFe emitida APENAS pela empresa que detém a fiscal
4. Consolida no Grupo para auditoria
```

**Responsável:** Backend function `nfeActions` (validar implementação)

---

## 6. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Auditoria de Entidades (Esta semana)
- [ ] Confirmar `groupId` + `empresaId` em TODAS as entidades
- [ ] Mapear escopo correto (Grupo vs Empresa) para cada uma
- [ ] Documentar exceções (ex: Produto é Grupo-only)
- [ ] Gerar relatório de não-conformidades

### Fase 2: Backend Validation (Semana próxima)
- [ ] Adicionar validação de `groupId`/`empresaId` em backend functions
- [ ] Implementar `entityGuard` com checks de contexto
- [ ] Revisar `propagateGroupData` — está funcionando?
- [ ] Testar propagação bidirecional em 3 casos críticos

### Fase 3: Frontend Queries (Semana próxima)
- [ ] Atualizar TODAS as queries para usar `filterInContext`
- [ ] Verificar `useContextoVisual` em páginas críticas
- [ ] Adicionar validação: se contexto inválido, não buscar dados
- [ ] Testar com múltiplas empresas

### Fase 4: Testes Integrados (13-17/06)
- [ ] Teste: Venda na CPA Ferro e Aço → aparece no Grupo CPA?
- [ ] Teste: Baixa no Grupo para empresa 3Z → reflete em 3Z?
- [ ] Teste: Emissão fiscal → emitida pela empresa correta?
- [ ] Auditoria: Todos os AuditLogs têm `group_id` e `empresa_id`?

---

## 7. ENTIDADES A REVISAR IMEDIATAMENTE

### CRÍTICAS (Esta semana)
1. **Cliente** — Validar `groupId` + `empresaId`
2. **Pedido** — Validar propagação → NotaFiscal → ContaReceber
3. **NotaFiscal** — Validar emissão por empresa correta
4. **ContaReceber** — Validar origem e consolidação de grupo
5. **ContaPagar** — Validar origem de OC

### ALTAS (Próxima semana)
6. **Produto** — Confirmar que é Grupo-only
7. **PlanoDeContas** — Confirmar escopo (Grupo vs Empresa)
8. **Banco/ContaBancaria** — Validar por empresa
9. **TabelaPreco** — Validar escopo de aplicação

---

## 8. EXEMPLO DE IMPLEMENTAÇÃO: Cliente

### Antes (Não-Conforme)
```jsx
// ❌ Busca TODOS os clientes, sem filtro de grupo/empresa
const clientes = await base44.entities.Cliente.list();
```

### Depois (Conforme)
```jsx
// ✅ Busca clientes do contexto atual
const { grupoAtual, empresaAtual, filterInContext } = useContextoVisual();

const clientes = await filterInContext('Cliente', {
  // Contexto automático adicionado por filterInContext
}, 'nome', 100);

// AuditLog com contexto
await base44.entities.AuditLog.create({
  usuario: user.full_name,
  usuario_id: user.id,
  group_id: grupoAtual.id,        // ✅ OBRIGATÓRIO
  empresa_id: empresaAtual.id,    // ✅ OBRIGATÓRIO
  acao: 'Criação',
  modulo: 'Cadastros',
  entidade: 'Cliente',
  dados_novos: novoCliente,
  data_hora: new Date().toISOString()
});
```

---

## 9. PRÓXIMOS PASSOS

### ✅ Já Implementado
- `useContextoVisual()` hook (frontend)
- `filterInContext()` helper (frontend)
- `propagateGroupData` backend function (presumidamente)
- `AuditLog` entity (com `group_id`/`empresa_id`)

### 📋 A Fazer (Prioridade 2)
1. **Auditoria** de todas as entidades (sim/não `groupId`+`empresaId`)
2. **Validação backend** — adicionar `entityGuard` com checks de contexto
3. **Queries consolidadas** — revisar todas as pages/components
4. **Testes** — validar propagação bidirecional em 5 casos críticos

### 🔄 Depois (Prioridades 3-5)
- Prioridade 3: RBAC + Segurança
- Prioridade 4: Layout & Simplificação
- Prioridade 5: Administração & Consolidação

---

**Status Geral:** 📋 **AUDITORIA PENDENTE**

Próxima ação: Validar entity JSONs de Cliente, Pedido, NotaFiscal, ContaReceber, ContaPagar — confirmar se `groupId` + `empresaId` estão presentes.

---