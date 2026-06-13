# ETAPA 2 — Prioridade 2: Multiempresa Grupo ↔ Empresas
**Data:** 13/06/2026 | **Status:** ✅ Iniciada

## 📋 OBJETIVO
Garantir que TODAS as queries, queries e operações respeitam rigorosamente `groupId` + `empresaId`.

---

## 1️⃣ VALIDAÇÃO DE QUERIES OBRIGATÓRIAS

### ✅ Entidades com Filtro Obrigatório (`groupId` + `empresaId`)
- **Cliente** → `filterInContext` ✅ (CadastroClienteCompleto, CRMScoreDashboard)
- **Pedido** → Via `useVisualizadorQuery` + `filterInContext` ✅
- **ContaReceber** → Via `filterInContext` ✅
- **ContaPagar** → Via `filterInContext` ✅
- **Entrega** → Via `filterInContext` ✅
- **NotaFiscal** → Via `filterInContext` ✅
- **OrdemCompra** → Via `filterInContext` ✅

### ✅ Entidades com Filtro `groupId` (Compartilhadas entre Empresas)
- **Produto** → `filterInContext` com `groupId` obrigatório ✅
- **Fornecedor** → Via `filterInContext` ✅
- **Transportadora** → Via `filterInContext` ✅

---

## 2️⃣ REFORÇO DE VALIDAÇÃO MULTIEMPRESA

### Frontend: Validação Obrigatória em Salvar
**Padrão Mandatório:**
```javascript
// ETAPA 2 - Validação Obrigatória
const groupId = grupoAtual?.id || empresaAtual?.group_id || null;
const empresaId = empresaAtual?.id || null;

if (!groupId || (contexto !== 'grupo' && !empresaId)) {
  toast.error('Erro: Selecione grupo/empresa antes de salvar');
  return;
}

const payload = {
  ...formData,
  group_id: groupId,
  empresa_id: empresaId
};
```

**Componentes auditados:**
- ✅ CadastroClienteCompleto → Validação presente (linha 184-186)
- ✅ PedidoFormCompleto → Validação presente (ETAPA 1 update)

---

## 3️⃣ PROPAGAÇÃO BIDIRECIONAL

### Regra: Tudo feito no Grupo → Empresas (automático)
- **Implementação:** `propagateGroupConfigs` (backend)
- **Exemplo:** Tabela de Preço criada no Grupo → Replicada para empresas autorizadas

### Regra: Tudo feito em Empresa → Sobe para Grupo (consolidação)
- **Implementação:** Queries com `groupId` + `empresaId` naturalmente consolidam dados
- **Exemplo:** Pedido criado em CPA Ferro → Visível no Grupo CPA via filtro `group_id`

---

## 4️⃣ CASOS CRÍTICOS A VALIDAR (PRÓXIMAS ETAPAS)

| Caso | Entidade | Ação | Status |
|------|----------|------|--------|
| Baixa de título Grupo → Empresa 3Z | ContaPagar | update | ⏳ Validar |
| Venda Empresa CPA → Consolidação Grupo | Pedido | filter | ⏳ Validar |
| NF emitida apenas na empresa correta | NotaFiscal | create | ⏳ Validar |
| Entrega multisedes Grupo | Entrega | create | ⏳ Validar |

---

## 5️⃣ CHECKLIST ETAPA 2

- [x] Mapear filtros obrigatórios
- [x] Validar CadastroClienteCompleto
- [x] Validar CRMScoreDashboard
- [x] Reforçar PedidoFormCompleto
- [ ] Auditar ContaPagar queries
- [ ] Auditar Financeiro consolidação
- [ ] Validar NotaFiscal emission rules
- [ ] Testar propagação real (Grupo → Empresas)

---

## 6️⃣ PRÓXIMOS PASSOS
**ETAPA 3 — RBAC** iniciará com validação de permissões em TODAS as operações críticas.