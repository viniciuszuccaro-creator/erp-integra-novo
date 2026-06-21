# Automações P2 — Propagação Bidirecional

## ⏸️ NOTA: Créditos de Integração Esgotados

**Automações estão bloqueadas até 07/07/2026** (reset de créditos)

As automações abaixo foram planejadas mas **NÃO PODEM SER CRIADAS** neste momento. Criar manualmente após o reset via dashboard ou executar manualmente via `syncBidirectional`.

---

## Automação 1: Replicação Grupo→Empresas (CREATE)

**Tipo:** Entity Automation  
**Nome:** P2.2 — Propagação Grupo→Empresas (Conta Receber)  
**Trigger:** ContaReceber.create  
**Condição:** `data.origem == 'grupo'` AND `!data.empresa_id` (sem empresa = é do grupo)  
**Função:** `syncBidirectional`  
**Payload:**

```json
{
  "entity_name": "ContaReceber",
  "entity_id": "{{entity_id}}",
  "direction": "down",
  "group_id": "{{data.group_id}}"
}
```

**Resultado esperado:** ContaReceber criada no grupo replica para todas as empresas do grupo, com `e_replicado=true` e `documento_grupo_id` apontando ao original.

---

## Automação 2: Sincronização Empresa→Grupo (UPDATE)

**Tipo:** Entity Automation  
**Nome:** P2.3 — Sincronização Empresa→Grupo (Status Conta Receber)  
**Trigger:** ContaReceber.update  
**Condição:** `data.empresa_id` AND `data.group_id` AND `changed_fields` contains 'status'  
**Função:** `syncEmpresaToGroup`  
**Payload:**

```json
{
  "entity_name": "ContaReceber",
  "entity_id": "{{entity_id}}",
  "novo_status": "{{data.status}}",
  "grupo_id": "{{data.group_id}}",
  "empresa_id": "{{data.empresa_id}}"
}
```

**Resultado esperado:** Quando ContaReceber é baixada na empresa, o registro-pai no grupo reflete o novo status automaticamente.

---

## Como Criar (após 07/07/2026)

1. Dashboard → Automações
2. Criar Nova → Entity Automation
3. Copiar valores acima
4. Salvar e Ativar

Ou usar `create_automation` tool com os parâmetros acima.