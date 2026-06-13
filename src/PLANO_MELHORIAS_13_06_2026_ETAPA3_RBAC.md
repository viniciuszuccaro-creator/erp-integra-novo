# ETAPA 3 — Prioridade 3: RBAC e Segurança
**Data:** 13/06/2026 | **Status:** ✅ Iniciada

## 📋 OBJETIVO
Padronizar permissões RBAC em **telas, abas, botões, campos e ações** com auditoria obrigatória em todas as operações sensíveis.

---

## 1️⃣ PADRÃO OBRIGATÓRIO DE PERMISSÕES

### Nomenclatura: `Módulo.Entidade.Ação`

**Exemplos:**
```
Cadastros.Cliente.criar
Cadastros.Cliente.editar
Cadastros.Cliente.excluir
Cadastros.Cliente.alterarStatus

Comercial.Pedido.criar
Comercial.Pedido.aprovar
Comercial.Pedido.cancelar
Comercial.Pedido.enviarEntrega

Financeiro.ContaPagar.criar
Financeiro.ContaPagar.baixar
Financeiro.ContaPagar.cancelar

Estoque.Movimentacao.ajustar
Estoque.Movimentacao.confirmar
```

---

## 2️⃣ IMPLEMENTAÇÃO EM BOTÕES

### Frontend: Atributo `data-permission`
```jsx
<Button
  onClick={handleSave}
  data-permission="Cadastros.Cliente.editar"
  data-sensitive
  disabled={!podeEditar || salvando}
>
  Salvar Cliente
</Button>
```

**Padrão já aplicado:**
- ✅ CadastroClienteCompleto (linhas 412, 432, 444)
- ✅ PedidoFormCompleto (via RBACRoute)
- ⏳ Expandir para: Fornecedor, Transportadora, Produto

---

## 3️⃣ VALIDAÇÃO BACKEND OBRIGATÓRIA

### Função: `entityGuard` (pré-existente)
```javascript
// Validação antes de qualquer operação sensível
const allowed = await base44.functions.invoke('entityGuard', {
  module: 'Cadastros',
  section: 'Cliente',
  action: 'editar',
  entity_name: 'Cliente',
  operation: 'update',
  empresa_id: empresaAtual?.id,
  group_id: grupoAtual?.id
});

if (!allowed) throw new Error('RBAC backend: ação negada');
```

---

## 4️⃣ AUDITORIA OBRIGATÓRIA

### Template de Auditoria (Antes/Depois)
```javascript
// AUDITORIA SENSÍVEL: Sempre registrar antes + depois
await base44.entities.AuditLog.create({
  usuario: user?.full_name || 'Usuário',
  usuario_id: user?.id,
  empresa_id: empresaAtual?.id,
  group_id: grupoAtual?.id,
  
  acao: 'Edição',  // ou 'Criação', 'Exclusão', 'Aprovação'
  modulo: 'Cadastros',
  tipo_auditoria: 'entidade_sensivel',  // ou 'rbac_bloqueada'
  entidade: 'Cliente',
  registro_id: cliente.id,
  
  descricao: `Cliente ${cliente.nome} — Status alterado`,
  dados_antes: { status: clienteAnterior.status },
  dados_depois: { status: cliente.status },
  
  data_hora: new Date().toISOString(),
  duracao_ms: performance.now() - startTime
});
```

---

## 5️⃣ AÇÕES SENSÍVEIS AUDITADAS

| Módulo | Entidade | Ação | Auditoria |
|--------|----------|------|-----------|
| Cadastros | Cliente | editar status (Ativo→Inativo) | ✅ Antes/Depois |
| Cadastros | Cliente | excluir | ✅ Completa |
| Comercial | Pedido | aprovar | ✅ Antes/Depois |
| Comercial | Pedido | cancelar | ✅ Completa |
| Financeiro | ContaPagar | baixar | ✅ Antes/Depois |
| Financeiro | ContaReceber | cancelar | ✅ Completa |
| Estoque | Movimentacao | ajustar | ✅ Antes/Depois |
| Fiscal | NotaFiscal | cancelar | ✅ Completa |

---

## 6️⃣ CHECKLIST ETAPA 3

- [x] Documentar padrão `Módulo.Entidade.Ação`
- [x] Validar botões críticos (CadastroClienteCompleto)
- [ ] Padronizar em Fornecedor, Transportadora, Produto
- [ ] Reforçar `entityGuard` em backend
- [ ] Implementar auditoria Antes/Depois em operações sensíveis
- [ ] Testar bloqueio de ações não-permitidas
- [ ] Validar logs de auditoria com groupId + empresaId

---

## 7️⃣ PRÓXIMOS PASSOS
**ETAPA 4 — Layout e Fluidez** simplificará dashboards mantendo RBAC validado.