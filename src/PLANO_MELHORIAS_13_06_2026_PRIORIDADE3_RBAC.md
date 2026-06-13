# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 3: RBAC E SEGURANÇA

**Data:** 13/06/2026  
**Objetivo:** Implementar RBAC granular em telas, abas, botões, campos e ações. Padrão: `Módulo.Entidade.Ação`.  
**Status:** 📋 AUDITORIA + IMPLEMENTAÇÃO

---

## 1. COBERTURA RBAC POR MÓDULO

### ✅ LÍDERES (>80% Implementado)

| Módulo | Telas | Abas | Botões | Campos | Status |
|--------|-------|------|--------|--------|--------|
| **Cadastros** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | 🟢 **COMPLETO** |
| **Admin** | ✅ 90% | ✅ 80% | ✅ 70% | 🟡 40% | 🟡 **BOM** |

### 🟡 MODERADOS (30–70% Implementado)

| Módulo | Telas | Abas | Botões | Campos | Status |
|--------|-------|------|--------|--------|--------|
| Comercial | 🟡 60% | 🟡 50% | 🟡 40% | ❌ 0% | 🟡 EM PROGRESSO |
| Financeiro | 🟡 50% | 🟡 40% | 🟡 30% | ❌ 0% | 🟡 EM PROGRESSO |
| Estoque | 🟡 50% | 🟡 40% | 🟡 30% | ❌ 0% | 🟡 EM PROGRESSO |
| RH | 🟡 40% | 🟡 30% | 🟡 20% | ❌ 0% | 🟡 EM PROGRESSO |
| CRM | 🟡 50% | 🟡 40% | 🟡 30% | ❌ 0% | 🟡 EM PROGRESSO |
| Produção | 🟡 40% | 🟡 30% | 🟡 20% | ❌ 0% | 🟡 EM PROGRESSO |
| Expedição | 🟡 45% | 🟡 35% | 🟡 25% | ❌ 0% | 🟡 EM PROGRESSO |
| Fiscal | 🟡 35% | 🟡 25% | 🟡 15% | ❌ 0% | 🔴 BAIXO |

### 🔴 CRÍTICOS (<30% Implementado)

| Módulo | Telas | Abas | Botões | Campos | Status |
|--------|-------|------|--------|--------|--------|
| Relatórios | 🔴 20% | 🔴 10% | 🔴 5% | ❌ 0% | 🔴 CRÍTICO |
| HubAtendimento | 🔴 15% | 🔴 10% | 🔴 5% | ❌ 0% | 🔴 CRÍTICO |

---

## 2. PADRÃO DE PERMISSÕES: Módulo.Entidade.Ação

### Estrutura

```
Comercial.Pedido.visualizar
Comercial.Pedido.criar
Comercial.Pedido.editar
Comercial.Pedido.aprovar         ← Ação sensível (auditoria obrigatória)
Comercial.Pedido.enviarProducao  ← Ação sensível
Comercial.Pedido.cancelar        ← Ação sensível
Comercial.Pedido.excluir         ← Ação sensível (admin only)

Financeiro.ContaReceber.visualizar
Financeiro.ContaReceber.registrar
Financeiro.ContaReceber.receber  ← Ação sensível
Financeiro.ContaReceber.cancelar ← Ação sensível
Financeiro.ContaReceber.excluir  ← Ação sensível

Estoque.MovimentacaoEstoque.registrar
Estoque.MovimentacaoEstoque.ajustar      ← Ação sensível
Estoque.MovimentacaoEstoque.reverter     ← Ação sensível
```

### Ações Críticas = Auditoria Obrigatória

Ações que devem gerar AuditLog com **antes/depois**:

```
Comercial.Pedido.aprovar              → Log: status antes/depois
Comercial.Pedido.enviarProducao       → Log: quantidade/data alterada
Comercial.NotaFiscal.emitir           → Log: NF número, série
Financeiro.ContaReceber.receber       → Log: valor/data pagto
Financeiro.ContaPagar.baixar          → Log: valor/data pagto
Estoque.Movimentacao.ajustar          → Log: quantidade antes/depois
RH.Colaborador.desligar              → Log: data desligamento
Fiscal.NotaFiscal.emitir             → Log: NF número, ambiente (teste/prod)
Compras.OrdemCompra.confirmar        → Log: valor/fornecedor
```

---

## 3. IMPLEMENTAÇÃO POR MÓDULO

### COMERCIAL — Priority High

#### Telas com RBAC
- ✅ `/Comercial` — Precisa `Comercial.ver`
- ❌ `/Comercial?tab=Pedidos` — Precisa `Comercial.Pedido.visualizar`
- ❌ `/Comercial?tab=Clientes` — Precisa `Comercial.Cliente.visualizar`

#### Botões com RBAC
```jsx
// EXEMPLO PADRÃO — Implementar em todos os módulos

<Button 
  data-permission="Comercial.Pedido.criar"
  onClick={handleCreatePedido}
>
  ➕ Novo Pedido
</Button>

<Button 
  data-permission="Comercial.Pedido.aprovar"
  data-sensitive="true"  // ← Auditoria obrigatória
  onClick={handleApprovePedido}
>
  ✓ Aprovar
</Button>

<Button 
  data-permission="Comercial.Pedido.excluir"
  data-sensitive="true"
  variant="destructive"
  onClick={handleDeletePedido}
>
  🗑️ Deletar
</Button>
```

#### Campos com RBAC (Editáveis apenas com permissão)
```jsx
<Input
  data-permission="Comercial.Pedido.editar"
  value={pedido.descricao}
  onChange={...}
  disabled={!hasPermission('Comercial.Pedido.editar')}
/>

<Select
  data-permission="Comercial.Pedido.alterarStatus"
  value={pedido.status}
  onValueChange={...}
  disabled={!hasPermission('Comercial.Pedido.alterarStatus')}
>
  ...
</Select>
```

### FINANCEIRO — Priority High

#### Ações Críticas
- `Financeiro.ContaReceber.receber` — Auditoria obrigatória
- `Financeiro.ContaPagar.baixar` — Auditoria obrigatória
- `Financeiro.CaixaCentral.liquidar` — Auditoria obrigatória

### ESTOQUE — Priority High

#### Ações Críticas
- `Estoque.MovimentacaoEstoque.ajustar` — Auditoria obrigatória
- `Estoque.Inventario.contar` — Auditoria obrigatória

### RH — Priority Medium

#### Ações Críticas
- `RH.Colaborador.desligar` — Auditoria obrigatória
- `RH.Colaborador.alterarSalario` — Auditoria obrigatória

---

## 4. BACKEND: entityGuard + AuditLog

### Fluxo de Validação

```javascript
// 1. Frontend: Botão ocultado se sem permissão
if (!hasPermission('Comercial.Pedido.aprovar')) {
  return null; // Button não renderiza
}

// 2. Backend: entityGuard valida antes de processar
const guardPayload = {
  module: 'Comercial',
  entity: 'Pedido',
  action: 'aprovar',
  user_id: user.id,
  group_id: grupoAtual.id,
  empresa_id: empresaAtual.id
};

const guardResult = await base44.functions.invoke('entityGuard', guardPayload);
if (!guardResult.data.allowed) {
  throw new Error('RBAC: Ação não permitida');
}

// 3. Backend: AuditLog registra ação
await base44.entities.AuditLog.create({
  usuario: user.full_name,
  usuario_id: user.id,
  grupo_id: grupoAtual.id,
  empresa_id: empresaAtual.id,
  modulo: 'Comercial',
  entidade: 'Pedido',
  acao: 'Aprovação',
  tipo_auditoria: 'sensivel',
  dados_antigos: pedidoAntigo, // ← Antes
  dados_novos: pedidoNovo,     // ← Depois
  descricao: `Pedido #${pedido.numero} aprovado`,
  data_hora: new Date().toISOString()
});
```

---

## 5. CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Telas (Esta Semana)
- [ ] Adicionar `data-permission="Módulo.ver"` em TODAS as páginas
- [ ] RBACRoute implementado em App.jsx para cada módulo

### FASE 2: Abas (Esta Semana)
- [ ] Adicionar `data-permission` em cada aba
- [ ] Abas ocultadas se sem permissão

### FASE 3: Botões (Próxima Semana)
- [ ] Padrão `<Button data-permission="...">` em 100% dos botões críticos
- [ ] 15 ações críticas com `data-sensitive="true"`

### FASE 4: Campos (Próxima Semana)
- [ ] Campos sensíveis com `disabled` se sem permissão
- [ ] Validação backend de edit de campo

### FASE 5: Auditoria (Semana Seguinte)
- [ ] AuditLog com antes/depois em 15 ações críticas
- [ ] Testar em 5 cenários

---

## 6. AÇÕES CRÍTICAS COM AUDITORIA (15 TOTAL)

| # | Ação | Módulo | Dados Auditados | Urgência |
|---|------|--------|-------------------|----------|
| 1 | Aprovar Pedido | Comercial | status, valor, data | 🔴 CRÍTICA |
| 2 | Enviar Produção | Comercial | itens, quantidade | 🔴 CRÍTICA |
| 3 | Emitir NF | Fiscal | número, série, ambiente | 🔴 CRÍTICA |
| 4 | Receber CR | Financeiro | valor, data pagto | 🔴 CRÍTICA |
| 5 | Baixar CP | Financeiro | valor, data pagto | 🔴 CRÍTICA |
| 6 | Liquidar (Caixa) | Financeiro | método, valor | 🔴 CRÍTICA |
| 7 | Ajustar Estoque | Estoque | qtd antes, qtd depois | 🟡 ALTA |
| 8 | Contar Inventário | Estoque | qtd física, sistema | 🟡 ALTA |
| 9 | Desligar Colaborador | RH | data, motivo | 🔴 CRÍTICA |
| 10 | Alterar Salário | RH | valor antes, valor depois | 🔴 CRÍTICA |
| 11 | Criar Usuário | Admin | nome, role | 🟡 ALTA |
| 12 | Alterar Perfil | Admin | permissões antes, depois | 🟡 ALTA |
| 13 | Confirmar OC | Compras | valor, fornecedor | 🟡 ALTA |
| 14 | Registrar Devolução | Estoque | motivo, quantidade | 🟡 ALTA |
| 15 | Cancelar Entrega | Expedição | motivo, data | 🟡 ALTA |

---

## 7. PRÓXIMAS PRIORIDADES

### ✅ P3 PLANEJADA — Pronto para implementação

**Próxima ação:** Aplicar `data-permission` em todas as telas críticas (Comercial, Financeiro, Estoque).