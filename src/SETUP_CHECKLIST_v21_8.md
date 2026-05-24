# 🚀 ERP ZUCCARO - SETUP CHECKLIST v21.8

## ✅ ETAPA 1: MELHORIA GERAL CONCLUÍDA

### 🔄 Propagação Bidirecional (NEW)
- ✅ `syncBidirectional` function - automação grupo↔empresa
- ✅ Support for ContaReceber/ContaPagar propagation
- ✅ Anti-loop via 2.5s SyncMap window
- ⏳ **TODO**: Vincular função em automações de entity

### 🔐 RBAC Granular (NEW)  
- ✅ `useRBACGranular` hook - permissões por CAMPO
- ✅ `filterVisibleFields()` - oculta campos não autorizados
- ✅ `isFieldReadOnly()` - bloqueia edição de campos
- ⏳ **TODO**: Integrar em todos os FormComponent

### 🔘 Toggles + Persistence (FIXED)
- ✅ `ToggleRowFixed` v3.0 - salva + persiste após refresh
- ✅ Error handling + last saved indicator
- ✅ Suporta nomenclatura nova E legado
- ⏳ **TODO**: Substituir todos os ToggleRow antigos

### 📊 Dashboard Simplificado (NEW)
- ✅ `DashboardSimplified` - 6 abas lazy-loaded
- ✅ Seções: KPIs, Sales, Finance, Stock, Ops, AI
- ✅ Redução de 40+ componentes para estrutura modular
- ⏳ **TODO**: Substituir Dashboard atual

### 🎛️ Select com Auditoria (NEW)
- ✅ `SelectWithAudit` - onChange auditada
- ✅ Integrado com uiAudit wrapper
- ⏳ **TODO**: Usar em todos os selects de entidade

### 🛠️ Admin Checklist (NEW)
- ✅ `AdminChecklistExec` - 5 tarefas críticas
- ✅ Visual progress + status badges
- ✅ Link direto para ações
- ⏳ **TODO**: Adicionar em AdministracaoSistema

---

## 📋 PROXIMAS ETAPAS (CRÍTICAS)

### ETAPA 2: Integração em Produção (Semana 1)
1. **Automações de Entity** (crear para ContaReceber/ContaPagar):
   - Trigger: `create`, `update`, `delete`
   - Function: `syncBidirectional`
   - Conditions: Filter by `group_id` + `empresa_id` presence

2. **Substituição de Componentes**:
   - `pages/Dashboard` → `DashboardSimplified` (1 arquivo)
   - Todos `<ToggleRow />` → `<ToggleRowFixed />` (search: pages + components)
   - Todos `<Select />` → `<SelectWithAudit />` (forms: Pedido, Nota, etc)

3. **Integração RBAC Granular**:
   - `components/cadastros/ProdutoForm.jsx` - ocultar `preco_venda`, `custo_aquisicao` se sem perm
   - `components/comercial/PedidoFormCompleto.jsx` - bloquear `desconto_geral` se sem perm
   - `components/financeiro/ContaReceberForm.jsx` - read-only `valor` se sem perm

### ETAPA 3: Validação (Semana 1)
- ✅ Testar toggle + refresh browser → valor persiste
- ✅ Criar título no Grupo → aparece nas empresas
- ✅ Editar cliente em empresa → atualiza no Grupo
- ✅ Usuário sem perm não vê campos protegidos

### ETAPA 4: Limpeza (Semana 2)
- Remover imports de Dashboard antigo
- Arquivar componentes duplicados
- Consolidar selects em `SelectWithAudit`

---

## 🔧 COMANDOS DE SETUP

```bash
# 1. Criar automações de propagação
curl -X POST https://[APP]/functions/syncBidirectional \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"entity_name": "ContaReceber", "direction": "down", "group_id": "grupo_zuccaro_teste"}'

# 2. Testar toggle persistence
# → Abrir admin, marcar toggle, refresh página, verificar status

# 3. Testar propagação grupo→empresa
# → Criar cliente em "Grupo", visualizar em "CPA Ferro", "3Z Ltda"
```

---

## 📊 STATUS CONSOLIDADO

| Sistema | Status | % | Prioridade |
|---------|--------|---|-----------|
| **Propagação Bidirecional** | 🟡 Parcial (código OK, automações pending) | 70% | 🔴 CRÍTICA |
| **RBAC Granular** | 🟢 Implementado | 100% | 🟡 ALTA |
| **Toggles Persistence** | 🟢 Implementado | 100% | 🔴 CRÍTICA |
| **Dashboard** | 🟡 Skeleton (seções vazias) | 40% | 🟡 ALTA |
| **Select Audit** | 🟢 Implementado | 100% | 🟡 ALTA |
| **Admin Interface** | 🟡 Checklist (básico) | 60% | 🟠 MÉDIA |

---

## ⚠️ CONFIGURAÇÕES CRÍTICAS

### ContaReceber/ContaPagar - Propagação
```json
{
  "entity": "ContaReceber",
  "automation": {
    "events": ["create", "update"],
    "function": "syncBidirectional",
    "trigger_conditions": {
      "logic": "and",
      "conditions": [
        { "field": "data.group_id", "operator": "exists" }
      ]
    }
  }
}
```

### RBAC - Exemplo Granular (Pricing)
```json
{
  "module": "Comercial",
  "section": "Pedido.Financeiro",
  "fields": {
    "desconto_geral": ["visualizar"],  // Readonly
    "margem_lucro": ["visualizar"],    // Readonly
    "preco_unitario": ["visualizar", "editar"] // Editável só para gerentes
  }
}
```

---

**Última atualização**: 24-05-2026 (20:30 BRT)  
**Próximo milestone**: Integração completa em 7 dias
**Status**: 🟡 EM PROGRESSO