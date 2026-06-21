# P3 — RBAC & SEGURANÇA (EM EXECUÇÃO)
**Data:** 21/06/2026 | **Duração:** 3–4 dias | **Status:** INICIADO

---

## FASE 3.1: data-permission em Botões (Prioridade 1 — 20 botões)

### Comercial (5 botões — PedidoFooterAcoes)

- [ ] Criar Pedido — `data-permission="Comercial.Pedido.criar"`
- [ ] Aprovar Pedido — `data-permission="Comercial.Pedido.aprovar"`
- [ ] Gerar NF — `data-permission="Comercial.Pedido.gerar_nfe"`
- [ ] Cancelar Pedido — `data-permission="Comercial.Pedido.cancelar"`
- [ ] Solicitar Aprovação — `data-permission="Comercial.Pedido.solicitar_aprovacao"`

### Financeiro (5 botões — ContaPagar/Receber)

- [ ] Baixar Conta Pagar — `data-permission="Financeiro.ContaPagar.baixar"`
- [ ] Cancelar Conta Pagar — `data-permission="Financeiro.ContaPagar.cancelar"`
- [ ] Rejeitar Conta Pagar — `data-permission="Financeiro.ContaPagar.rejeitar"`
- [ ] Receber Conta Receber — `data-permission="Financeiro.ContaReceber.receber"`
- [ ] Cancelar Conta Receber — `data-permission="Financeiro.ContaReceber.cancelar"`

### Estoque (5 botões)

- [ ] Ajustar Estoque — `data-permission="Estoque.MovimentacaoEstoque.ajustar"`
- [ ] Transferir — `data-permission="Estoque.TransferenciaFilial.transferir"`
- [ ] Finalizar Inventário — `data-permission="Estoque.Inventario.finalizar"`
- [ ] Movimentar — `data-permission="Estoque.MovimentacaoEstoque.movimentar"`
- [ ] Receber — `data-permission="Estoque.RecebimentoNFe.receber"`

### Compras (5 botões)

- [ ] Aprovar OC — `data-permission="Compras.OrdemCompra.aprovar"`
- [ ] Receber OC — `data-permission="Compras.OrdemCompra.receber"`
- [ ] Avaliar Fornecedor — `data-permission="Compras.OrdemCompra.avaliar_fornecedor"`
- [ ] Enviar ao Fornecedor — `data-permission="Compras.OrdemCompra.enviar_fornecedor"`
- [ ] Cancelar OC — `data-permission="Compras.OrdemCompra.cancelar"`

---

## FASE 3.2: entityGuard em Backend (10 handlers)

**Pattern:**
```javascript
const guardResult = await base44.functions.invoke('entityGuard', {
  module: 'Financeiro',
  section: 'ContaPagar',
  action: 'baixar',
  entity_id: id,
  empresa_id,
  group_id
});
if (!guardResult.data.allowed) {
  return Response.json({ error: guardResult.data.reason }, { status: 403 });
}
```

**Handlers (em functions/):**

1. [ ] Comercial.Pedido.aprovar — `functions/onPedidoApprovalRequested.js`
2. [ ] Comercial.Pedido.cancelar — `functions/onPedidoCreated.js` (add cancel logic)
3. [ ] Financeiro.ContaPagar.baixar — `functions/paymentStatusManager.js`
4. [ ] Financeiro.ContaReceber.receber — `functions/paymentStatusManager.js`
5. [ ] Estoque.Inventario.finalizar — `functions/applyInventoryAdjustments.js`
6. [ ] Compras.OrdemCompra.receber — `functions/applyOrderStockMovements.js`
7. [ ] Producao.OrdemProducao.aprovar — criar novo handler
8. [ ] Expedicion.Entrega.confirmar — criar novo handler
9. [ ] Fiscal.NotaFiscal.emitir — `functions/nfeActions.js`
10. [ ] RH.Ferias.aprovar — criar novo handler

---

## FASE 3.3: AuditLog em Ações Sensíveis (10 handlers)

**Pattern:**
```javascript
await base44.entities.AuditLog.create({
  usuario: user.email,
  usuario_id: user.id,
  modulo: 'Financeiro',
  entidade: 'ContaPagar',
  acao: 'Baixa',
  empresa_id,
  group_id,
  dados_anteriores: { status: 'Pendente', valor: 1000 },
  dados_novos: { status: 'Pago', valor: 1000, data_pagamento: today },
  data_hora: new Date().toISOString(),
  ip_address: req.ip,
  navegador: req.headers['user-agent']
});
```

**Handlers (integrar AuditLog):**

- [ ] 1. Comercial.Pedido.aprovar — log status → Aprovado
- [ ] 2. Financeiro.ContaPagar.baixar — log status → Pago + data_pagamento
- [ ] 3. Financeiro.ContaReceber.receber — log status → Pago + data_recebimento
- [ ] 4. Estoque.Inventario.finalizar — log status → Finalizado
- [ ] 5. Compras.OrdemCompra.receber — log status → Recebida
- [ ] 6. Producao.OrdemProducao.aprovar — log status → Aprovada
- [ ] 7. Expedicion.Entrega.confirmar — log status → Confirmada
- [ ] 8. Fiscal.NotaFiscal.emitir — log chave_acesso + status → Autorizada
- [ ] 9. RH.Ferias.aprovar — log status → Aprovada
- [ ] 10. Comercial.Pedido.cancelar — log motivo_cancelamento

---

## ✅ CHECKLIST P3

| Fase | Tarefas | Status | Prazo |
|------|---------|--------|-------|
| 3.1 | 20 botões com data-permission | ⏳ 0% | 2 dias |
| 3.2 | 10 handlers com entityGuard | ⏳ 0% | 1 dia |
| 3.3 | AuditLog em 10 ações | ⏳ 0% | 1 dia |
| E2E | Testar 3 fluxos (Pedido, Financeiro, Estoque) | ⏳ 0% | 1 dia |

**Total:** 3–4 dias

---

**Próxima Ação:** Adicionar data-permission em PedidoFooterAcoes (5 botões) + outros módulos