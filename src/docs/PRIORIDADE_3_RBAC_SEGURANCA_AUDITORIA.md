# PRIORIDADE 3 — RBAC & SEGURANÇA: CONTROLE DE ACESSO GRANULAR
**Data:** 21/06/2026 | **Status:** Planejamento & Execução | **Responsável:** Base44 AI

---

## OBJETIVO
Implementar **RBAC completo** em frontend (esconder/desabilitar) e backend (bloquear definitivamente), com **auditoria de todas ações sensíveis** (antes/depois, usuário, data/hora, group_id, empresa_id).

---

## SEÇÃO 1 — PADRÃO DE PERMISSÕES

### Formato Padrão: `Modulo.Entidade.Acao`

**Módulos:**
- Financeiro, Comercial, Estoque, Compras, Produção, RH, Fiscal, Expedição, CRM, Contratos, Agenda, Sistema

**Entidades:**
- Pedido, Cliente, ContaPagar, ContaReceber, Produto, MovimentacaoEstoque, OrdemProducao, etc.

**Ações (Canonicalizadas):**
- `visualizar` — ler dados
- `criar` — criar novo registro
- `editar` — modificar dados existentes
- `excluir` — remover registro (soft-delete com auditoria)
- `aprovar` — aprovar fluxo (ContaPagar, Pedido, OC)
- `rejeitar` — rejeitar fluxo
- `exportar` — gerar relatório/planilha
- `importar` — carregar dados em massa
- `baixar` — baixa/liquidação financeira
- `cancelar` — cancelar operação
- `ajustar` — ajuste (inventário, preço, etc.)

### Exemplos de Permissões Mapeadas
```
Comercial.Pedido.visualizar
Comercial.Pedido.criar
Comercial.Pedido.editar
Comercial.Pedido.excluir
Comercial.Pedido.aprovar
Comercial.Pedido.exportar

Financeiro.ContaPagar.visualizar
Financeiro.ContaPagar.criar
Financeiro.ContaPagar.editar
Financeiro.ContaPagar.baixar ← SENSÍVEL
Financeiro.ContaPagar.excluir ← SENSÍVEL
Financeiro.ContaPagar.rejeitar

Estoque.MovimentacaoEstoque.visualizar
Estoque.MovimentacaoEstoque.criar
Estoque.MovimentacaoEstoque.ajustar ← SENSÍVEL
Estoque.MovimentacaoEstoque.excluir ← SENSÍVEL

Produção.OrdemProducao.visualizar
Produção.OrdemProducao.criar
Produção.OrdemProducao.editar
Produção.OrdemProducao.cancelar ← SENSÍVEL
```

---

## SEÇÃO 2 — MAPEAMENTO DE 50+ AÇÕES SENSÍVEIS

### 2.1 FINANCEIRO (12 ações sensíveis)

| Ação | Permissão | Risco | Auditoria Obrigatória |
|------|-----------|-------|----------------------|
| Baixar ContaPagar | `Financeiro.ContaPagar.baixar` | **CRÍTICA** | Antes: saldo; Depois: status=Pago, data_pagamento, valor_pago |
| Excluir ContaPagar | `Financeiro.ContaPagar.excluir` | **CRÍTICA** | Antes: record completo; Depois: null; motivo |
| Rejeitar aprovação | `Financeiro.ContaPagar.rejeitar` | **ALTA** | Antes: status; Depois: motivo_rejeicao |
| Baixar ContaReceber | `Financeiro.ContaReceber.baixar` | **CRÍTICA** | Antes: saldo; Depois: status, valor_recebido, forma_pagamento |
| Excluir ContaReceber | `Financeiro.ContaReceber.excluir` | **CRÍTICA** | Antes: record; Depois: null |
| Conciliar conta bancária | `Financeiro.ConciliacaoBancaria.processar` | **ALTA** | Antes: itens_pendentes; Depois: status_conciliado |
| Gerar link de pagamento | `Financeiro.ContaReceber.gerar_link_pagamento` | **ALTA** | Após: link_url gerado, expiracao |
| Registrar juros/multa | `Financeiro.ContaPagar.adicionar_juros` | **ALTA** | Antes: valor; Depois: juros_acumulados |
| Ajustar desconto | `Financeiro.ContaPagar.ajustar_desconto` | **ALTA** | Antes/Depois: valor_desconto, justificativa |
| Lançamento contábil manual | `Financeiro.LancamentoContabil.criar_manual` | **CRÍTICA** | Antes: null; Depois: D/C, conta, valor, justificativa |
| Reverter pagamento | `Financeiro.ContaPagar.reverter` | **CRÍTICA** | Antes: status=Pago; Depois: Pendente; motivo |
| Aprovar pagamento grande (> R$50k) | `Financeiro.ContaPagar.aprovar_grande` | **CRÍTICA** | Valor, aprovador, timestamp |

### 2.2 COMERCIAL (13 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Pedido | `Comercial.Pedido.criar` | **ALTA** | Após: id, cliente, valor, itens |
| Aprovar Pedido | `Comercial.Pedido.aprovar` | **ALTA** | Antes: Pendente; Depois: Aprovado; aprovador |
| Excluir Pedido | `Comercial.Pedido.excluir` | **CRÍTICA** | Antes: record; motivo |
| Aplicar desconto > 10% | `Comercial.Pedido.desconto_alto` | **ALTA** | Item, % antes/depois, justificativa |
| Gerar NF (fiscal) | `Comercial.NotaFiscal.emitir` | **CRÍTICA** | Pedido_id, empresa_faturamento, série, número |
| Cancelar NF | `Comercial.NotaFiscal.cancelar` | **CRÍTICA** | Antes: Autorizada; Depois: Cancelada; motivo |
| Devolver pedido parcial | `Comercial.Pedido.devolver_parcial` | **ALTA** | Itens devolvidos, quantidade, motivo |
| Criar Cliente | `Comercial.Cliente.criar` | **ALTA** | Após: razao_social, cnpj, email, telefone |
| Atualizar limite de crédito | `Comercial.Cliente.atualizar_limite` | **ALTA** | Antes/Depois: limite, justificativa |
| Bloquear cliente | `Comercial.Cliente.bloquear` | **ALTA** | Motivo, data_bloqueio |
| Reativar cliente bloqueado | `Comercial.Cliente.reativar` | **ALTA** | Motivo_reativacao |
| Gerar comissão | `Comercial.Comissao.gerar` | **ALTA** | Vendedor, período, valor, taxa |
| Excluir comissão | `Comercial.Comissao.excluir` | **ALTA** | Antes: record; motivo |

### 2.3 ESTOQUE (10 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Produto | `Estoque.Produto.criar` | **ALTA** | Após: codigo, descricao, unidade, preco |
| Ajustar inventário (> 10 itens) | `Estoque.Inventario.ajustar_grande` | **ALTA** | Antes/Depois: qtd, lote, motivo |
| Excluir Produto | `Estoque.Produto.excluir` | **CRÍTICA** | Antes: record; se tem movimentações = BLOQUEADO |
| Gerar movimentação de saída | `Estoque.MovimentacaoEstoque.saida` | **ALTA** | Produto_id, quantidade, destino, motivo |
| Transferência entre filiais | `Estoque.TransferenciaFilial.criar` | **ALTA** | Origem, destino, itens, valor |
| Ajustar preço de custo | `Estoque.Produto.ajustar_custo` | **ALTA** | Antes/Depois: custo_unitario, justificativa |
| Marcar como obsoleto | `Estoque.Produto.marcar_obsoleto` | **ALTA** | Motivo, data_avaliacao |
| Realizar contagem | `Estoque.Inventario.contagem` | **ALTA** | Data, responsável, itens contados |
| Excluir movimentação | `Estoque.MovimentacaoEstoque.excluir` | **CRÍTICA** | Antes: record; apenas admin; motivo |
| Importar produtos em lote | `Estoque.Produto.importar` | **ALTA** | Arquivo, quantidade carregada, erros |

### 2.4 COMPRAS (8 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Ordem de Compra | `Compras.OrdemCompra.criar` | **ALTA** | Após: fornecedor_id, itens, valor_total |
| Aprovar OC | `Compras.OrdemCompra.aprovar` | **ALTA** | Antes: Solicitada; Depois: Aprovada |
| Enviar OC ao fornecedor | `Compras.OrdemCompra.enviar` | **ALTA** | Arquivo, método envio, timestamp |
| Receber mercadoria | `Compras.OrdemCompra.receber` | **ALTA** | Itens recebidos, conferência, NF entrada |
| Rejeitar recebimento | `Compras.OrdemCompra.rejeitar_recebimento` | **ALTA** | Motivo, itens rejeitados |
| Cancelar OC | `Compras.OrdemCompra.cancelar` | **ALTA** | Status anterior, motivo, justificativa |
| Avaliar fornecedor | `Compras.Fornecedor.avaliar` | **MÉDIA** | Critérios (qualidade, prazo, preço, atendimento) |
| Criar cotação | `Compras.Cotacao.criar` | **MÉDIA** | Após: fornecedores convidados, data_resposta |

### 2.5 PRODUÇÃO (9 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Ordem de Produção | `Producao.OrdemProducao.criar` | **ALTA** | Após: produto, quantidade, data_entrega |
| Iniciar OP | `Producao.OrdemProducao.iniciar` | **ALTA** | Antes: Planejada; Depois: Em Processo |
| Pausar OP | `Producao.OrdemProducao.pausar` | **ALTA** | Motivo, duração pausa |
| Finalizar OP | `Producao.OrdemProducao.finalizar` | **ALTA** | Antes: Em Processo; Depois: Concluída; quantidade_produzida |
| Apontar produção | `Producao.ApontamentoProducao.criar` | **ALTA** | Operador, máquina, quantidade, tempo |
| Registrar refugo | `Producao.Refugo.registrar` | **ALTA** | Quantidade, motivo, causador, análise RCA |
| Cancelar OP | `Producao.OrdemProducao.cancelar` | **CRÍTICA** | Motivo, análise impacto em pedidos |
| Ajustar quantidade produzida | `Producao.ApontamentoProducao.ajustar` | **ALTA** | Antes/Depois: quantidade, motivo |
| Excluir apontamento | `Producao.ApontamentoProducao.excluir` | **ALTA** | Antes: record; apenas supervisor |

### 2.6 RH (6 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Colaborador | `RH.Colaborador.criar` | **ALTA** | Após: cpf, nome, cargo, salario, empresa_alocada |
| Atualizar salário | `RH.Colaborador.atualizar_salario` | **CRÍTICA** | Antes/Depois: valor, data_vigencia, aprovador |
| Desligar colaborador | `RH.Colaborador.desligar` | **CRÍTICA** | Motivo, data_desligamento, últimas férias |
| Aprovar férias | `RH.Ferias.aprovar` | **ALTA** | Colaborador, período, dias |
| Aprover ponto | `RH.Ponto.aprovar` | **MÉDIA** | Colaborador, data, horas_trabalhadas |
| Gerar folha de pagamento | `RH.Folha.gerar` | **CRÍTICA** | Mês, empresa, quantidade_colaboradores, valor_total |

### 2.7 FISCAL (7 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Emitir NF | `Fiscal.NotaFiscal.emitir` | **CRÍTICA** | Série, número, chave acesso, valor |
| Cancelar NF | `Fiscal.NotaFiscal.cancelar` | **CRÍTICA** | Motivo, justificativa, motivo_cancelamento |
| Importar XML de NF | `Fiscal.NotaFiscal.importar_xml` | **ALTA** | Arquivo, quantidade NF, status validação |
| Retificar NF | `Fiscal.NotaFiscal.retificar` | **ALTA** | NF original, tipo retificação, dados alterados |
| Gerar SPED | `Fiscal.SPED.gerar` | **ALTA** | Período, empresa, arquivo_gerado |
| Enviar SPED para RFB | `Fiscal.SPED.enviar_rfb` | **CRÍTICA** | Protocolo, timestamp, assinatura digital |
| Validar impostos | `Fiscal.Validacao.executar` | **MÉDIA** | Quantidade itens, erros encontrados |

### 2.8 EXPEDIÇÃO (5 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Entrega | `Expedicao.Entrega.criar` | **ALTA** | Após: pedido_id, cliente, endereço, data_entrega |
| Marcar como entregue | `Expedicao.Entrega.marcar_entregue` | **ALTA** | Assinatura, data_hora, transportador, comprovante |
| Cancelar entrega | `Expedicao.Entrega.cancelar` | **ALTA** | Motivo, reembalagem_necessária |
| Gerar romaneio | `Expedicao.Romaneio.gerar` | **ALTA** | Rota, entregas, data_geração |
| Registrar ocorrência | `Expedicao.Entrega.registrar_ocorrencia` | **ALTA** | Tipo, descrição, impacto_entrega |

### 2.9 CRM (5 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Oportunidade | `CRM.Oportunidade.criar` | **ALTA** | Após: cliente, valor_estimado, etapa |
| Mudar etapa (Ganho/Perdido) | `CRM.Oportunidade.mudar_etapa_final` | **ALTA** | Antes/Depois: etapa, motivo_perda/observacoes |
| Criar Campanha | `CRM.Campanha.criar` | **ALTA** | Após: nome, tipo, data_inicio, data_fim, orçamento |
| Marcar contato realizado | `CRM.Interacao.registrar` | **MÉDIA** | Tipo, data, cliente, responsável, resultado |
| Converter oportunidade em pedido | `CRM.Oportunidade.converter_pedido` | **ALTA** | Oportunidade_id, pedido_criado_id |

### 2.10 CONTRATOS (4 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Contrato | `Contratos.Contrato.criar` | **ALTA** | Após: número, tipo, parte_contratante, data_inicio |
| Assinar digitalmente | `Contratos.Contrato.assinar` | **CRÍTICA** | Assinador, timestamp, IP, geolocation |
| Renovar contrato | `Contratos.Contrato.renovar` | **ALTA** | Antes: vencido; Depois: Renovado; novo_valor |
| Excluir contrato | `Contratos.Contrato.excluir` | **CRÍTICA** | Antes: record; motivo; apenas admin |

### 2.11 SISTEMA (6 ações sensíveis)

| Ação | Permissão | Risco | Auditoria |
|------|-----------|-------|-----------|
| Criar Perfil de Acesso | `Sistema.PerfilAcesso.criar` | **CRÍTICA** | Após: nome, permissões, nível_perfil |
| Editar Perfil de Acesso | `Sistema.PerfilAcesso.editar` | **CRÍTICA** | Antes/Depois: permissões, quem pode editar = admin |
| Atribuir Perfil a Usuário | `Sistema.PerfilAcesso.atribuir` | **CRÍTICA** | Usuário, perfil_anterior, perfil_novo, aprovador |
| Revogar Perfil | `Sistema.PerfilAcesso.revogar` | **CRÍTICA** | Usuário, perfil, motivo |
| Validar integridade RBAC | `Sistema.RBAC.validar` | **ALTA** | Resultado: conflitos SoD detectados, report |
| Habilitar propagação automática | `Sistema.Propagacao.habilitar` | **CRÍTICA** | Grupo, empresa, sincronização ativada |

---

## SEÇÃO 3 — IMPLEMENTAÇÃO FRONTEND: data-permission

### 3.1 Padrão de Uso

```jsx
<Button 
  data-permission="Comercial.Pedido.aprovar"
  onClick={handleAprovaPedido}
>
  Aprovar Pedido
</Button>

<Tab 
  data-permission="Financeiro.ContaPagar.baixar"
  label="Baixa de Pagamentos"
>
  <BaixaForm />
</Tab>

<Field
  data-permission="Estoque.Produto.ajustar_custo"
  label="Custo Unitário"
  value={produto.custo}
/>
```

### 3.2 Componentes com Guard

**ProtectedAction** (já existe):
```jsx
<ProtectedAction 
  permission="Financeiro.ContaPagar.baixar"
  fallback={<span className="text-red-600">Sem permissão</span>}
>
  <Button onClick={handleBaixa}>Baixar</Button>
</ProtectedAction>
```

**ProtectedSection** (já existe):
```jsx
<ProtectedSection 
  module="Financeiro" 
  section="ContaPagar" 
  action="baixar"
  hideInstead={true}  // esconder em vez de desabilitar
>
  <BaixaPanel />
</ProtectedSection>
```

**RBACButton** (novo, se necessário):
```jsx
<RBACButton
  permission="Comercial.Pedido.criar"
  variant="default"
  onClick={handleCriaPedido}
>
  Novo Pedido
</RBACButton>
```

### 3.3 Mapeamento: Módulos com data-permission

**Módulos a Atualizar (em ordem de criticidade):**
1. ✅ Financeiro (ContasPagarTab, ContasReceberTab) — **CRÍTICA**
2. ✅ Comercial (PedidoForm, NotaFiscal) — **CRÍTICA**
3. ⏳ Estoque (ProdutosTab, MovimentacoesTab) — **ALTA**
4. ⏳ Compras (OrdensCompraTab, RecebimentoTab) — **ALTA**
5. ⏳ Produção (OrdemProducaoForm, ApontamentoTab) — **ALTA**
6. ⏳ RH (ColaboradoresTab, FeriasTab, PontoTab) — **MÉDIA**
7. ⏳ Fiscal (ImportarXML, EmitirNFe) — **MÉDIA**
8. ⏳ Expedição (EntregasTab, RomaneioTab) — **MÉDIA**
9. ⏳ CRM (OportunidadesTab, CampanhasTab) — **MÉDIA**
10. ⏳ Sistema (GestaoAcessosTab, ConfiguracoesTab) — **CRÍTICA**

---

## SEÇÃO 4 — IMPLEMENTAÇÃO BACKEND: entityGuard

### 4.1 Backend Guard Pattern

```javascript
// Em cada função sensível:

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // RBAC CHECK:
    const guardResult = await base44.functions.invoke('entityGuard', {
      module: 'Financeiro',
      section: 'ContaPagar',
      action: 'baixar',
      empresa_id: contaPagar.empresa_id,
      group_id: contaPagar.group_id,
    });
    
    if (!guardResult.data.allowed) {
      return Response.json({
        error: 'Acesso negado',
        details: guardResult.data.reason,
      }, { status: 403 });
    }
    
    // AÇÃO SENSÍVEL:
    const before = await base44.entities.ContaPagar.get(id);
    const updated = await base44.entities.ContaPagar.update(id, {
      status: 'Pago',
      data_pagamento: new Date().toISOString(),
      valor_pago: payload.valor,
      ...payload.detalhes_pagamento,
    });
    
    // AUDITORIA OBRIGATÓRIA:
    await base44.entities.AuditLog.create({
      usuario: user.email,
      usuario_id: user.id,
      modulo: 'Financeiro',
      entidade: 'ContaPagar',
      acao: 'Baixa',
      tipo_auditoria: 'operacao_sensivel',
      empresa_id: before.empresa_id,
      group_id: before.group_id,
      descricao: `Baixa de ContaPagar ${id}`,
      dados_anteriores: {
        status: before.status,
        valor: before.valor,
      },
      dados_novos: {
        status: updated.status,
        data_pagamento: updated.data_pagamento,
        valor_pago: updated.valor_pago,
      },
      data_hora: new Date().toISOString(),
    });
    
    return Response.json({ success: true, data: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### 4.2 entityGuard Melhorado

**Função já existe, mas precisa:**
- [ ] Validar `module.section.action` canonicalizados
- [ ] Buscar permissão do perfil do usuário
- [ ] Checar SoD (Segregação de Deveres) se necessário
- [ ] Retornar `{ allowed: true/false, reason: "..." }`

---

## SEÇÃO 5 — AUDITORIA OBRIGATÓRIA

### 5.1 Estrutura AuditLog Expandida

```json
{
  "usuario": "joao@empresa.com",
  "usuario_id": "user_123",
  "modulo": "Financeiro",
  "entidade": "ContaPagar",
  "acao": "Baixa",
  "tipo_auditoria": "operacao_sensivel",  ← importante
  "empresa_id": "3z",
  "group_id": "grupo_001",
  "descricao": "Baixa de ContaPagar CP_001 no valor de R$ 1.000",
  "dados_anteriores": {
    "status": "Pendente",
    "valor": 1000,
    "data_vencimento": "2026-06-25"
  },
  "dados_novos": {
    "status": "Pago",
    "data_pagamento": "2026-06-21",
    "valor_pago": 1000,
    "forma_pagamento": "PIX"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "data_hora": "2026-06-21T14:30:00Z"
}
```

### 5.2 Queries de Auditoria

```javascript
// Buscar todas operações sensíveis de um usuário:
await filterInContext('AuditLog', {
  usuario_id: 'user_123',
  tipo_auditoria: 'operacao_sensivel',
  data_hora: { $gte: '2026-06-01' },
}, '-data_hora', 100);

// Buscar tentativas de acesso negado:
await filterInContext('AuditLog', {
  tipo_auditoria: 'acesso_negado',
  empresa_id: 'ferro',
});

// Relatório: quem baixou quanto (financeiro):
await filterInContext('AuditLog', {
  modulo: 'Financeiro',
  acao: 'Baixa',
  data_hora: { $gte: '2026-06-01', $lte: '2026-06-30' },
});
```

---

## SEÇÃO 6 — PLANO DE IMPLEMENTAÇÃO FASEADO

### Fase 1: Framework (2 dias)
- [ ] Validar entityGuard() atende padrão Modulo.Entidade.Acao
- [ ] Testar: bloqueio de permissão negada retorna 403
- [ ] Criar função genérica de auditoria de ações sensíveis

### Fase 2: Frontend (3 dias)
- [ ] Módulo Financeiro: adicionar `data-permission` em 12 ações
- [ ] Módulo Comercial: adicionar `data-permission` em 13 ações
- [ ] Testar: botão desabilitado/ocultado quando sem permissão

### Fase 3: Backend (3 dias)
- [ ] Adicionar `entityGuard()` em todas funções sensíveis (20+ funções)
- [ ] Adicionar AuditLog.create() em cada ação sensível
- [ ] Testar: operação sem permissão = 403 + log

### Fase 4: Validação (2 dias)
- [ ] E2E: usuário sem permissão não consegue executar ação
- [ ] Auditoria: log completo com antes/depois, usuário, timestamp
- [ ] SoD: detectar conflitos de permissão (ex: criar + deletar mesma entidade)

---

## SEÇÃO 7 — EXEMPLO COMPLETO: Baixa ContaPagar

### Frontend (Financeiro)
```jsx
<ProtectedAction 
  permission="Financeiro.ContaPagar.baixar"
  hideInstead={false}  // desabilitar, não esconder
>
  <Button 
    data-permission="Financeiro.ContaPagar.baixar"
    onClick={handleBaixa}
    disabled={!hasPermission('Financeiro.ContaPagar.baixar')}
  >
    💳 Registrar Pagamento
  </Button>
</ProtectedAction>
```

### Backend (functions/registroPagamentoCompleto.js)
```javascript
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // GUARD:
    const guardResult = await base44.functions.invoke('entityGuard', {
      module: 'Financeiro',
      section: 'ContaPagar',
      action: 'baixar',
      empresa_id: payload.empresa_id,
      group_id: payload.group_id,
    });
    if (!guardResult.data.allowed) return Response.json({ error: 'Negado' }, { status: 403 });
    
    // AÇÃO:
    const before = await base44.entities.ContaPagar.get(payload.id);
    const updated = await base44.entities.ContaPagar.update(payload.id, {
      status: 'Pago',
      data_pagamento: new Date().toISOString(),
      valor_pago: payload.valor,
      detalhes_pagamento: payload.detalhes,
    });
    
    // AUDITORIA:
    await base44.entities.AuditLog.create({
      usuario: user.email,
      usuario_id: user.id,
      modulo: 'Financeiro',
      entidade: 'ContaPagar',
      acao: 'Baixa',
      tipo_auditoria: 'operacao_sensivel',
      empresa_id: before.empresa_id,
      group_id: before.group_id,
      descricao: `Baixa: ${before.descricao} - R$ ${payload.valor}`,
      dados_anteriores: { status: before.status, valor: before.valor },
      dados_novos: { status: updated.status, data_pagamento: updated.data_pagamento },
      data_hora: new Date().toISOString(),
    });
    
    return Response.json({ success: true, data: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## SEÇÃO 8 — CHECKLIST P3 COMPLETO

- [ ] Padrão Modulo.Entidade.Acao definido ✅
- [ ] 50+ ações sensíveis mapeadas ✅
- [ ] Frontend: data-permission em Financeiro + Comercial ⏳
- [ ] Frontend: data-permission em Estoque + Compras + Produção ⏳
- [ ] Backend: entityGuard() em todas ações sensíveis ⏳
- [ ] Backend: AuditLog.create() em todas ações sensíveis ⏳
- [ ] Testes: usuário sem permissão = acesso negado ⏳
- [ ] Testes: auditoria registra antes/depois + usuário + timestamp ⏳
- [ ] SoD validation: detecta conflitos de permissão ⏳

---

## SEÇÃO 9 — DEPENDÊNCIAS & PRÉ-REQUISITOS

### Já Implementado ✅
- `entityGuard()` função base
- `ProtectedAction`, `ProtectedSection` componentes
- `usePermissions()` hook
- `AuditLog` entidade
- `filterInContext()` com multi-tenant

### Precisa Validar ⏳
- entityGuard() suporta canonicalização de ações?
- PerfilAcesso.permissoes estrutura suporta Modulo.Entidade.Acao?
- AuditLog inclui todos campos necessários?

---

## SEÇÃO 10 — PRÓXIMAS AÇÕES

### P3 (Esta Sessão)
1. ✅ Planejamento: 50+ ações mapeadas
2. ⏳ Execução Fase 1: Framework validado
3. ⏳ Execução Fase 2: Frontend data-permission
4. ⏳ Execução Fase 3: Backend entityGuard + auditoria
5. ⏳ Execução Fase 4: Testes E2E

### P4 (Próxima Sessão)
- Simplificação de dashboards (6–8 KPIs essenciais)
- Layout w-full + h-full + responsivo
- Lazy loading + paginação

### P5 (Próxima Sessão)
- Consolidação Administração em 3 índices
- Remoção de páginas morte (Home, Documentacao)
- Integração de Cadastros Gerais

---

**Documento gerado automaticamente em 2026-06-21** | Execução: Base44 AI | Status: Pronto para Fase 1