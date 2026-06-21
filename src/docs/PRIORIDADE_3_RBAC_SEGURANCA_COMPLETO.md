# PRIORIDADE 3 — RBAC & SEGURANÇA: CONTROLE DE ACESSO GRANULAR
**Data:** 21/06/2026 | **Status:** Planejamento & Execução | **Responsável:** Base44 AI

---

## OBJETIVO
Aplicar **RBAC granular** em todas as **50+ ações sensíveis** do ERP, bloqueando acesso não autorizado em frontend (UI) e backend (API), com auditoria completa de cada tentativa e alteração.

---

## SEÇÃO 1 — MAPEAMENTO DE AÇÕES SENSÍVEIS (50+)

### Padrão de Permissão
```
Modulo.Entidade.Acao

Exemplos:
- Comercial.Pedido.criar
- Comercial.Pedido.editar
- Comercial.Pedido.aprovar
- Comercial.Pedido.cancelar
- Comercial.Pedido.excluir
- Financeiro.ContaPagar.criar
- Financeiro.ContaPagar.editar
- Financeiro.ContaPagar.baixar
- Financeiro.ContaPagar.excluir
- ...
```

### 1.1 Módulo COMERCIAL — Pedidos & Vendas (10 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Comercial.Pedido.criar** | Criar novo pedido | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Comercial.Pedido.editar** | Editar pedido | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Comercial.Pedido.visualizar** | Ver detalhes pedido | ✅ Mapeado | ⏳ ProtectedSection | ✅ entityGuard | (read-only) |
| **Comercial.Pedido.aprovar** | Aprovar pedido (liberar produção) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Comercial.Pedido.cancelar** | Cancelar pedido | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (antes/depois) |
| **Comercial.Pedido.excluir** | Deletar pedido | ❌ Falta | ⏳ ADICIONAR | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Comercial.Pedido.exportar** | Exportar pedidos (Excel/PDF) | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Comercial.NotaFiscal.emitir** | Emitir NF (SEFAZ) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Comercial.NotaFiscal.cancelar** | Cancelar NF (carta correcção) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Comercial.Desconto.aprovar** | Aprovar desconto acima de limite | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |

### 1.2 Módulo FINANCEIRO — Contas a Pagar/Receber (15 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Financeiro.ContaPagar.criar** | Criar conta a pagar | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Financeiro.ContaPagar.editar** | Editar conta a pagar | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Financeiro.ContaPagar.baixar** | Registrar pagamento | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (detalhe_pagamento) |
| **Financeiro.ContaPagar.cancelar** | Cancelar conta a pagar | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Financeiro.ContaPagar.excluir** | Deletar conta a pagar | ❌ Falta | ⏳ ADICIONAR | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Financeiro.ContaPagar.antecipar** | Antecipar pagamento | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Financeiro.ContaReceber.criar** | Criar conta a receber | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Financeiro.ContaReceber.editar** | Editar conta a receber | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Financeiro.ContaReceber.receber** | Registrar recebimento | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Financeiro.ContaReceber.cancelar** | Cancelar conta a receber | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Financeiro.ContaReceber.excluir** | Deletar conta a receber | ❌ Falta | ⏳ ADICIONAR | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Financeiro.CaixaMovimento.criar** | Criar movimentação de caixa | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Financeiro.CaixaMovimento.editar** | Editar movimentação de caixa | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Financeiro.CaixaMovimento.excluir** | Deletar movimentação de caixa | ❌ Falta | ⏳ ADICIONAR | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Financeiro.ConciliacaoBancaria.processar** | Processar conciliação bancária | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |

### 1.3 Módulo ESTOQUE — Movimentação & Inventário (8 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Estoque.Produto.criar** | Criar novo produto | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Estoque.Produto.editar** | Editar produto | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Estoque.Produto.excluir** | Deletar produto | ❌ Falta | ⏳ ADICIONAR | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Estoque.MovimentacaoEstoque.ajustar** | Ajustar quantidade (entrada/saída) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (qtd antes/depois) |
| **Estoque.MovimentacaoEstoque.transferir** | Transferir entre locais/filiais | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Estoque.Inventario.iniciar** | Iniciar contagem de inventário | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Estoque.Inventario.finalizar** | Finalizar inventário (aplicar diferenças) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (detalhes ajuste) |
| **Estoque.Inventario.cancelar** | Cancelar inventário | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |

### 1.4 Módulo COMPRAS — Pedidos & Fornecedores (7 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Compras.SolicitacaoCompra.criar** | Criar solicitação de compra | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Compras.SolicitacaoCompra.aprovar** | Aprovar solicitação | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Compras.SolicitacaoCompra.gerar_oc** | Gerar OC a partir de solicitação | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Compras.OrdemCompra.criar** | Criar ordem de compra | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Compras.OrdemCompra.editar** | Editar OC | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Compras.OrdemCompra.receber** | Receber OC (dar entrada) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Compras.Fornecedor.avaliar** | Avaliar fornecedor pós-recebimento | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |

### 1.5 Módulo PRODUÇÃO — Ordens & Apontamentos (6 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Producao.OrdemProducao.criar** | Criar ordem de produção | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Producao.OrdemProducao.editar** | Editar OP | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Producao.OrdemProducao.aprovar** | Aprovar OP (liberar produção) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Producao.OrdemProducao.finalizar** | Finalizar OP | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Producao.ApontamentoProducao.criar** | Criar apontamento de produção | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Producao.Refugo.registrar** | Registrar refugo/scrap | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (qtd/motivo) |

### 1.6 Módulo EXPEDIÇÃO — Entregas & Logística (5 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Expedicao.Entrega.criar** | Criar entrega | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **Expedicao.Entrega.editar** | Editar entrega | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **Expedicao.Entrega.confirmar** | Confirmar entrega (assinatura) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Expedicao.Romaneio.gerar** | Gerar romaneio | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Expedicao.Rota.otimizar** | Otimizar rota (IA) | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |

### 1.7 Módulo RH — Colaboradores & Folha (5 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **RH.Colaborador.criar** | Criar colaborador | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ createInContext |
| **RH.Colaborador.editar** | Editar colaborador | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ updateInContext |
| **RH.Ferias.solicitar** | Solicitar férias | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **RH.Ferias.aprovar** | Aprovar férias | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **RH.Ponto.registrar** | Registrar ponto (biometria/manual) | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |

### 1.8 Módulo FISCAL — NF & Impostos (5 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Fiscal.NotaFiscal.emitir** | Emitir NF no SEFAZ | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog (chave_nfe) |
| **Fiscal.NotaFiscal.cancelar** | Cancelar NF | ✅ Mapeado | ⏳ data-permission | ✅ entityGuard | ✅ AuditLog |
| **Fiscal.NotaFiscal.corrigir** | Emitir carta correcção | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Fiscal.ImportarXML.processar** | Processar XML recebido | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Fiscal.Config.alterar** | Alterar configurações fiscais | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |

### 1.9 Módulo SISTEMA — Admin & Configurações (5 ações)

| Ação | Descrição | RBAC | Frontend | Backend | Auditoria |
|------|-----------|------|----------|---------|-----------|
| **Sistema.PerfilAcesso.criar** | Criar novo perfil de acesso | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Sistema.PerfilAcesso.editar** | Editar perfil de acesso | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR (detalhes perms) |
| **Sistema.Usuario.criar** | Criar usuário | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Sistema.Usuario.atribuir_perfil** | Atribuir perfil a usuário | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |
| **Sistema.Empresa.editar** | Editar dados da empresa | ⏳ VERIFICAR | ⏳ data-permission | ⏳ ADICIONAR | ⏳ ADICIONAR |

---

## SEÇÃO 2 — IMPLEMENTAÇÃO FRONTEND (data-permission)

### Padrão UI

#### Botões com RBAC
```jsx
<Button
  data-permission="Comercial.Pedido.aprovar"
  onClick={handleAprovar}
  disabled={!hasPermission('Comercial.Pedido.aprovar')}
>
  Aprovar Pedido
</Button>
```

#### Seções com RBAC
```jsx
<ProtectedSection
  module="Comercial"
  section="Pedido"
  action="editar"
  fallback={<div className="text-slate-500">Sem permissão</div>}
>
  <PedidoFormEditor />
</ProtectedSection>
```

#### Abas com RBAC
```jsx
<Tabs>
  <TabsTrigger
    data-permission="Financeiro.ContaPagar.visualizar"
    disabled={!hasPermission('Financeiro.ContaPagar.visualizar')}
  >
    Contas a Pagar
  </TabsTrigger>
</Tabs>
```

### Implementação por Módulo

#### COMERCIAL
- [ ] PedidoTab: Botão "Aprovar" com `data-permission="Comercial.Pedido.aprovar"`
- [ ] PedidoTab: Botão "Cancelar" com `data-permission="Comercial.Pedido.cancelar"`
- [ ] PedidoFormCompleto: Campos "Desconto" desabilitados se sem `Comercial.Desconto.aprovar`
- [ ] NotaFiscalFormCompleto: Botão "Emitir NF" com `data-permission="Comercial.NotaFiscal.emitir"`

#### FINANCEIRO
- [ ] ContasPagarTab: Botão "Baixar" com `data-permission="Financeiro.ContaPagar.baixar"`
- [ ] ContasReceberTab: Botão "Receber" com `data-permission="Financeiro.ContaReceber.receber"`
- [ ] CaixaCentralLiquidacao: Botão "Liquidar" com `data-permission="Financeiro.CaixaMovimento.criar"`

#### ESTOQUE
- [ ] ProdutosTab: Botão "Criar Produto" com `data-permission="Estoque.Produto.criar"`
- [ ] MovimentacoesTab: Botão "Ajustar" com `data-permission="Estoque.MovimentacaoEstoque.ajustar"`
- [ ] InventarioForm: Botão "Finalizar" com `data-permission="Estoque.Inventario.finalizar"`

#### COMPRAS
- [ ] SolicitacaoCompraForm: Botão "Aprovar" com `data-permission="Compras.SolicitacaoCompra.aprovar"`
- [ ] OrdemCompraForm: Botão "Receber" com `data-permission="Compras.OrdemCompra.receber"`

#### PRODUÇÃO
- [ ] OrdenProducaoForm: Botão "Aprovar" com `data-permission="Producao.OrdemProducao.aprovar"`
- [ ] ApontamentoProducao: Botão "Registrar Refugo" com `data-permission="Producao.Refugo.registrar"`

#### EXPEDIÇÃO
- [ ] EntregasListagem: Botão "Confirmar Entrega" com `data-permission="Expedicao.Entrega.confirmar"`

#### RH
- [ ] FeriasTab: Botão "Solicitar Férias" com `data-permission="RH.Ferias.solicitar"`
- [ ] FeriasTab: Botão "Aprovar Férias" com `data-permission="RH.Ferias.aprovar"`

#### FISCAL
- [ ] ImportarXMLNFe: Botão "Processar" com `data-permission="Fiscal.ImportarXML.processar"`

---

## SEÇÃO 3 — IMPLEMENTAÇÃO BACKEND (entityGuard)

### entityGuard Pattern
```javascript
// Backend function
async function lowContaPagar(req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // VALIDAR PERMISSÃO
  const allowed = await base44.functions.invoke('entityGuard', {
    module: 'Financeiro',
    section: 'ContaPagar',
    action: 'baixar',
    empresa_id: req.body.empresa_id,
    group_id: req.body.group_id,
  });
  
  if (!allowed.data.allowed) {
    return Response.json(
      { error: 'Permissão negada: Financeiro.ContaPagar.baixar' },
      { status: 403 }
    );
  }
  
  // EXECUTAR AÇÃO
  const updated = await base44.entities.ContaPagar.update(
    req.body.id,
    { status: 'Pago', data_pagamento: new Date(), ... }
  );
  
  // AUDITORIA
  await base44.entities.AuditLog.create({
    usuario: user.email,
    acao: 'Baixa',
    modulo: 'Financeiro',
    entidade: 'ContaPagar',
    empresa_id: req.body.empresa_id,
    group_id: req.body.group_id,
    dados_anteriores: { status: 'Pendente' },
    dados_novos: { status: 'Pago', data_pagamento: updated.data_pagamento },
    data_hora: new Date().toISOString(),
  });
  
  return Response.json(updated);
}
```

### Ações que Precisam entityGuard
- [ ] Comercial.Pedido.aprovar → `onPedidoApprovalRequested()` ou novo handler
- [ ] Comercial.Pedido.cancelar → handler novo
- [ ] Comercial.NotaFiscal.emitir → `nfeActions()`
- [ ] Financeiro.ContaPagar.baixar → handler novo (BaixaContaPagarDialog)
- [ ] Financeiro.ContaReceber.receber → handler novo
- [ ] Estoque.MovimentacaoEstoque.ajustar → `applyInventoryAdjustments()`
- [ ] Estoque.Inventario.finalizar → handler novo
- [ ] Compras.SolicitacaoCompra.aprovar → handler novo
- [ ] Compras.OrdemCompra.receber → handler novo
- [ ] Producao.OrdemProducao.aprovar → handler novo
- [ ] Producao.Refugo.registrar → handler novo
- [ ] Expedicao.Entrega.confirmar → handler novo
- [ ] RH.Ferias.aprovar → handler novo

---

## SEÇÃO 4 — AUDITORIA OBRIGATÓRIA

### Padrão AuditLog

Toda ação sensível DEVE logar:

```javascript
{
  usuario: string,              // email do usuário
  usuario_id: string,           // ID do usuário
  acao: string,                 // "Criação", "Edição", "Exclusão", "Aprovação", "Baixa"
  modulo: string,               // "Comercial", "Financeiro", etc
  entidade: string,             // "Pedido", "ContaPagar", etc
  tipo_auditoria: string,       // "entidade", "seguranca", "financeira"
  grupo_id: string,             // Sempre para multiempresa
  empresa_id: string,           // Sempre para multiempresa
  dados_anteriores: object,     // Estado anterior (para UPDATE/DELETE)
  dados_novos: object,          // Estado novo (para CREATE/UPDATE)
  descricao: string,            // Descrição legível
  data_hora: datetime,          // ISO 8601
  ip_address: string,           // IP da requisição (optional)
  resultado: string,            // "sucesso" | "falha"
  motivo_falha: string,         // Se resultado = "falha"
}
```

### Ações que Geram AuditLog Automático
- [ ] ContaPagar.update (status = "Pago") → registra detalhe_pagamento
- [ ] Pedido.update (status = "Aprovado") → registra valor total
- [ ] NotaFiscal.create → registra chave_nfe, número série
- [ ] ContaReceber.update (status = "Recebido") → registra data_recebimento
- [ ] MovimentacaoEstoque → registra qtd antes/depois
- [ ] InventarioFinalizado → registra todas diferenças
- [ ] PerfilAcesso.update → registra mudanças de permissões
- [ ] Usuario.update → registra troca de perfil/role

---

## SEÇÃO 5 — EXEMPLO: FLUXO COMPLETO Baixa ContaPagar

### Frontend: BaixaContaPagarDialog
```jsx
<Dialog>
  <form onSubmit={async (data) => {
    // 1. Validar permissão em frontend
    if (!hasPermission('Financeiro.ContaPagar.baixar')) {
      toast.error('Sem permissão para baixar contas');
      return;
    }
    
    // 2. Chamar backend
    const result = await base44.functions.invoke('lowContaPagar', {
      id: contaPagar.id,
      empresa_id: contaPagar.empresa_id,
      group_id: contaPagar.group_id,
      forma_pagamento: data.forma_pagamento,
      data_pagamento: data.data_pagamento,
      valor_pago: data.valor_pago,
    });
    
    // 3. Feedback
    if (result.status === 403) {
      toast.error('Permissão negada: Financeiro.ContaPagar.baixar');
    } else {
      toast.success('Conta baixada com sucesso');
      // Refetch / invalidate query
    }
  }}>
    <input name="forma_pagamento" />
    <input name="data_pagamento" />
    <input name="valor_pago" />
    <button data-permission="Financeiro.ContaPagar.baixar">Confirmar Baixa</button>
  </form>
</Dialog>
```

### Backend: functions/lowContaPagar.js
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await req.json();
    
    // GUARD: Validar permissão
    const guardResult = await base44.functions.invoke('entityGuard', {
      module: 'Financeiro',
      section: 'ContaPagar',
      action: 'baixar',
      empresa_id: payload.empresa_id,
      group_id: payload.group_id,
    });
    
    if (!guardResult.data.allowed) {
      return Response.json(
        { error: 'Permissão negada: Financeiro.ContaPagar.baixar' },
        { status: 403 }
      );
    }
    
    // GET current state (para auditoria)
    const before = await base44.entities.ContaPagar.get(payload.id);
    
    // UPDATE
    const after = await base44.entities.ContaPagar.update(payload.id, {
      status: 'Pago',
      data_pagamento: payload.data_pagamento,
      valor_pago: payload.valor_pago,
      forma_pagamento: payload.forma_pagamento,
      detalhes_pagamento: {
        forma_pagamento: payload.forma_pagamento,
        data_compensacao: null, // será preenchido após compensação bancária
        taxa_operadora: 0,
        observacoes: '',
      },
    });
    
    // AUDITORIA
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      acao: 'Baixa',
      modulo: 'Financeiro',
      entidade: 'ContaPagar',
      tipo_auditoria: 'financeira',
      empresa_id: payload.empresa_id,
      group_id: payload.group_id,
      descricao: `Baixa de ${before.descricao} | Valor: ${payload.valor_pago}`,
      dados_anteriores: {
        status: before.status,
        valor: before.valor,
      },
      dados_novos: {
        status: after.status,
        valor_pago: after.valor_pago,
        forma_pagamento: after.forma_pagamento,
        data_pagamento: after.data_pagamento,
      },
      data_hora: new Date().toISOString(),
      resultado: 'sucesso',
    });
    
    // Propagação (P2): se baixa no Grupo, propagar para empresa
    if (before.grupo_id && before.empresa_id !== payload.empresa_id) {
      // Criar réplica da baixa na empresa
      await base44.functions.invoke('propagatePagamento', {
        conta_id: payload.id,
        empresa_id: before.empresa_id,
      });
    }
    
    return Response.json(after);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### Auditoria Gerada
```json
{
  "usuario": "gerente@empresa.com",
  "usuario_id": "usr_123",
  "acao": "Baixa",
  "modulo": "Financeiro",
  "entidade": "ContaPagar",
  "tipo_auditoria": "financeira",
  "grupo_id": "grupo_001",
  "empresa_id": "3z",
  "descricao": "Baixa de Fornecedor XYZ - Inv 2024-001 | Valor: R$ 1.000,00",
  "dados_anteriores": {
    "status": "Pendente",
    "valor": 1000.00
  },
  "dados_novos": {
    "status": "Pago",
    "valor_pago": 1000.00,
    "forma_pagamento": "Transferência",
    "data_pagamento": "2026-06-21T15:30:00Z"
  },
  "data_hora": "2026-06-21T15:30:45Z",
  "resultado": "sucesso"
}
```

---

## SEÇÃO 6 — PLANO DE IMPLEMENTAÇÃO

### Fase 1: Mapeamento (1 dia)
- [ ] Validar 50+ ações no P3 (ESTE DOCUMENTO)
- [ ] Atualizar permissões em todas entidades/perfis
- [ ] Documentar matriz de RBAC (quem pode fazer o quê)

### Fase 2: Frontend (3-4 dias)
- [ ] Adicionar `data-permission` em 50+ botões/seções
- [ ] Conectar usePermissions() em componentes
- [ ] Testar: botão desabilitado para usuário sem permissão

### Fase 3: Backend (3-4 dias)
- [ ] Criar handlers com `entityGuard()` para 15+ ações críticas
- [ ] Adicionar `AuditLog.create()` em cada ação
- [ ] Testar: 403 se sem permissão; 200 se autorizado

### Fase 4: Testes & Auditoria (2 dias)
- [ ] E2E: Usuário sem permissão não consegue executar ação
- [ ] E2E: Auditoria registra todas operações
- [ ] Relatório: Todas 50+ ações cobertas

---

## SEÇÃO 7 — VALIDAÇÃO TÉCNICA

### Checklist P3 Completo?
- [ ] 50+ ações mapeadas (Modulo.Entidade.Acao)?
- [ ] Frontend: `data-permission` em todos botões sensíveis?
- [ ] Backend: `entityGuard()` bloqueia acesso não autorizado?
- [ ] Auditoria: `AuditLog` registra antes/depois, user, data/hora, group_id, empresa_id?
- [ ] Permissões seguem estrutura de perfis (Administrador > Gerente > Operacional)?
- [ ] Nenhuma ação sensível sem RBAC + auditoria?

---

**Documento gerado automaticamente em 2026-06-21** | Execução: Base44 AI | Status: Pronto para Fase 1 (Mapeamento)