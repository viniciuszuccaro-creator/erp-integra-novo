# Automações a Ativar Após 07/07/2026 (Reset de Créditos)

**Status Atual:** ⏳ Bloqueado por falta de integration credits  
**Data de Desbloqueio:** 2026-07-07 (UTC)  
**Ação:** Criar 10 automações entity-triggered + 2 scheduled

---

## 1. Automações Entity-Triggered (8 handlers de propagação)

Após 07/07/2026, executar os seguintes comandos para criar as automações:

### 1.1 Contrato → Propagação Grupo/Empresa
```javascript
// Chamar create_automation com:
{
  automation_type: "entity",
  name: "Contrato → Propagação Bidirecional",
  function_name: "onContratoGroupReplication",
  entity_name: "Contrato",
  event_types: ["create", "update"]
}
```

### 1.2 Produto → Propagação
```javascript
{
  automation_type: "entity",
  name: "Produto → Propagação Bidirecional",
  function_name: "onProdutoGroupReplication",
  entity_name: "Produto",
  event_types: ["create", "update"]
}
```

### 1.3 Colaborador → Propagação
```javascript
{
  automation_type: "entity",
  name: "Colaborador → Propagação Bidirecional",
  function_name: "onColaboradorGroupReplication",
  entity_name: "Colaborador",
  event_types: ["create", "update"]
}
```

### 1.4 OrdemCompra → Propagação
```javascript
{
  automation_type: "entity",
  name: "OrdemCompra → Propagação Bidirecional",
  function_name: "onOrdemCompraGroupReplication",
  entity_name: "OrdemCompra",
  event_types: ["create", "update"]
}
```

### 1.5 Entrega → Propagação
```javascript
{
  automation_type: "entity",
  name: "Entrega → Propagação Bidirecional",
  function_name: "onEntregaGroupReplication",
  entity_name: "Entrega",
  event_types: ["create", "update"]
}
```

### 1.6 OrdemProducao → Propagação
```javascript
{
  automation_type: "entity",
  name: "OrdemProducao → Propagação Bidirecional",
  function_name: "onOrdemProducaoGroupReplication",
  entity_name: "OrdemProducao",
  event_types: ["create", "update"]
}
```

### 1.7 NotaFiscal → Propagação
```javascript
{
  automation_type: "entity",
  name: "NotaFiscal → Propagação Bidirecional",
  function_name: "onNotaFiscalGroupReplication",
  entity_name: "NotaFiscal",
  event_types: ["create", "update"]
}
```

### 1.8 FormaPagamento → Propagação
```javascript
{
  automation_type: "entity",
  name: "FormaPagamento → Propagação Bidirecional",
  function_name: "onFormaPagamentoGroupReplication",
  entity_name: "FormaPagamento",
  event_types: ["create", "update"]
}
```

---

## 2. Automações Scheduled (2 validadores semanais)

### 2.1 Validação Semanal de Propagação
```javascript
{
  automation_type: "scheduled",
  name: "Validação Semanal: Propagação Bidirecional",
  function_name: "validatePropagationBidirectional",
  schedule_type: "cron",
  cron_expression: "0 6 ? * MON", // Seg 06:00 UTC
  function_args: { entity_name: "Contrato", group_id: "*" } // Iterar todas
}
```

### 2.2 Auditoria Semanal: Multiempresa
```javascript
{
  automation_type: "scheduled",
  name: "Auditoria Semanal: Integridade Multiempresa",
  function_name: "auditMultiempresaValidator",
  schedule_type: "cron",
  cron_expression: "0 6 ? * MON", // Seg 06:30 UTC
  function_args: { group_id: "*", limit: 100 }
}
```

---

## 3. Checklist Pré-Ativação (07/07/2026)

- [ ] Verificar saldo de integration credits
- [ ] Testar manualmente cada handler (já testados, status 200 ✅)
- [ ] Validar AuditLog entries após criação de automações
- [ ] Monitorar DLQ (dead-letter queue) por 24h após ativação
- [ ] Documentar horários de execução em produção

---

## 4. Monitoramento Pós-Ativação

Após ativação, observar:
- **Taxa de falha (DLQ):** Deve ser < 0.5%
- **Tempo de propagação:** Deve ser < 2 segundos
- **Duplicatas detectadas:** Usar flag `e_replicado` para evitar loops
- **Orphaned records:** Executar `validatePropagationBidirectional` semanalmente

---

## 5. Rollback (se necessário)

Se detectados problemas:
1. Desativar automação via `manage_automation(action="toggle", automation_id=X)`
2. Executar `syncBidirectional` manualmente para correção
3. Validar integridade com `auditMultiempresaValidator`
4. Reportar no AuditLog com tipo_auditoria='sistema'