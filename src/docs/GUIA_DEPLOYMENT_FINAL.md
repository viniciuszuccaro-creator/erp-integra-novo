# Guia de Deployment Final: ERP Zuccaro P1-P5

**Versão:** 1.0 Final  
**Data:** 2026-06-21

---

## 1. Pré-Requisitos

- [ ] Node.js 18+
- [ ] Base44 CLI atualizado
- [ ] Acesso ao banco de dados (backup pronto)
- [ ] Integration credits validados (no mínimo 50 para pós-07/07)
- [ ] Documentação lida: `CHECKLIST_GO_LIVE_P1_A_P5.md`

---

## 2. Build & Deploy

### 2.1 Build Frontend
```bash
npm run build
# Output: dist/
# Size: ~800KB (gzipped)
# Duração: 45-60s
```

### 2.2 Deploy Backend Functions
```bash
# Cada handler já está em functions/{name}.js
# Deployment automático ao fazer push

# Ou via CLI:
base44-cli deploy functions/onContratoGroupReplication.js
base44-cli deploy functions/validatePropagationBidirectional.js
```

### 2.3 Health Check
```bash
# Testar endpoint de validação
curl -X POST https://api.base44.io/apps/{APP_ID}/functions/validateERPStructure \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"group_id":"production"}'

# Esperado: { "success": true, ... }
```

---

## 3. Validação Pré-Go-Live (1h antes)

```bash
# 1. Backup
mysqldump -u root -p erp_zuccaro > backup_2026_06_21.sql

# 2. Smoke Test: Criar Contrato de teste
base44-cli invoke onContratoGroupReplication \
  --payload '{"entity_id":"test-123","group_id":"test-group"}'

# 3. Verificar AuditLog
SELECT COUNT(*) FROM AuditLog WHERE created_date > NOW() - INTERVAL 1 HOUR;
# Esperado: > 0 (houve atividade)

# 4. Validação de integridade
base44-cli invoke auditMultiempresaValidator \
  --payload '{"group_id":"production","limit":10}'
# Esperado: "problemas_detectados": false para todas as 18 entidades
```

---

## 4. Ativação de Automações (Pós 07/07/2026)

### Usar após 07/07/2026 quando créditos forem resetados

```javascript
// Script: ativarAutomacoes.js
const automacoes = [
  {
    name: "Contrato → Propagação",
    function: "onContratoGroupReplication",
    entity: "Contrato",
    events: ["create", "update"]
  },
  // ... (mais 7)
];

for (const auto of automacoes) {
  await base44.automations.create({
    automation_type: "entity",
    name: auto.name,
    function_name: auto.function,
    entity_name: auto.entity,
    event_types: auto.events
  });
}

// Validadores semanais
await base44.automations.create({
  automation_type: "scheduled",
  name: "Validação Semanal: Propagação",
  function_name: "validatePropagationBidirectional",
  schedule_type: "cron",
  cron_expression: "0 6 ? * MON"
});
```

---

## 5. Monitoramento Pós-Deploy (24h)

### Dashboard de Métricas (check a cada 4h)

| Métrica | Target | Frequência |
|---|---|---|
| Taxa de erro AuditLog | < 0.1% | 4h |
| Propagação (latência) | < 2s | 4h |
| RBAC denials | < 1/h | 4h |
| Uptime API | 99.9% | Contínuo |

### Comandos de Diagnóstico

```bash
# 1. Última atividade
SELECT TOP 10 * FROM AuditLog 
ORDER BY created_date DESC;

# 2. Erros registrados
SELECT COUNT(*) FROM AuditLog 
WHERE tipo_auditoria = 'sistema' AND descricao LIKE '%erro%'
AND created_date > NOW() - INTERVAL 24 HOUR;

# 3. Automações falhadas (após 07/07)
SELECT id, name, status FROM automations 
WHERE status = 'failed' OR status = 'error'
LIMIT 10;
```

---

## 6. Rollback (Se Necessário)

### Cenário: Propagação está corrompendo dados

```bash
# 1. Parar automações
base44-cli automation toggle {AUTOMATION_ID} --disable

# 2. Restaurar backup
mysql -u root -p erp_zuccaro < backup_2026_06_21.sql

# 3. Executar validação
base44-cli invoke validatePropagationBidirectional \
  --payload '{"entity_name":"Contrato","group_id":"production"}'

# 4. Corrigir dados (se detectados orfãos)
base44-cli invoke syncBidirectional \
  --payload '{"group_id":"production"}'

# 5. Re-ativar automações
base44-cli automation toggle {AUTOMATION_ID} --enable
```

---

## 7. FAQ & Troubleshooting

### P: Propagação está lenta (> 2s)?
**R:** 
1. Verificar carga do servidor: `top` / CPU
2. Verificar índices: `ANALYZE TABLE Contrato;`
3. Validar `e_replicado` flag está setada (anti-loop)

### P: Dados duplicados após propagação?
**R:**
1. Executar: `validatePropagationBidirectional`
2. Verificar: flag `e_replicado` em registros duplicados
3. Se sim: apagar duplicata manual (verificar orfãos antes)
4. Se não: reportar bug em AuditLog

### P: RBAC está bloqueando acesso válido?
**R:**
1. Verificar `data-permission` no botão (existe?)
2. Verificar `entityGuard` backend result
3. Validar `PerfilAcesso` do usuário
4. Check `role` (admin > todas permissões)

### P: Automações não rodando (pós 07/07)?
**R:**
1. Verificar status: `base44-cli automation list`
2. Verificar DLQ (dead-letter queue)
3. Executar `test_backend_function` manualmente
4. Validar integration credits (não deve ser 0)

---

## 8. Sign-Off Checklist

- [ ] Build concluído sem erros
- [ ] Health check passou
- [ ] Backup armazenado (offline)
- [ ] Smoke test executado (OK)
- [ ] AuditLog gerando registros
- [ ] Equipe notificada (go-live)
- [ ] Monitoramento ativo 24h
- [ ] Documentação accessível aos devs
- [ ] Plano de rollback testado
- [ ] Credenciais de acesso distribuídas

---

## 9. Contatos de Escalação

| Nível | Responsável | Ação |
|---|---|---|
| **Tier 1** | Ops Team | Restartar servidor, verificar logs |
| **Tier 2** | Backend Lead | Debugar handlers, analisar AuditLog |
| **Tier 3** | Arquiteto | Decisão de rollback, escalação crítica |
| **Emergência** | CTO | Decisão de downtime, comunicação |

---

**Approval:** ________________  
**Data:** 2026-06-21  
**Status Final:** ✅ PRONTO