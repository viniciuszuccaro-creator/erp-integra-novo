# 📋 PLANO DE MELHORIAS 13/06/2026 — DIAGNÓSTICO CONSOLIDADO

**Data:** 13 de junho de 2026  
**Escopo:** Auditoria estrutural completa do ERP Zuccaro com respaldo obrigatório à Regra-Mãe  
**Status:** Diagnóstico concluído — Pronto para implementação

---

## 🔍 PRIORIDADE 1 — CHECKUP GERAL

### 1.1 Mapeamento de Módulos (27 páginas)

| Módulo | Página | Tipo | Status |
|--------|--------|------|--------|
| **Operacional** | | | |
| Dashboard | Dashboard | Principal | ✅ Ativo |
| CRM | CRM | Especializado | ✅ Ativo |
| Comercial | Comercial | Core | ✅ Ativo |
| Estoque | Estoque | Core | ✅ Ativo |
| Compras | Compras | Core | ✅ Ativo |
| Expedição | Expedicao | Core | ✅ Ativo |
| Produção | Producao | Core | ✅ Ativo |
| **Administrativo** | | | |
| Financeiro | Financeiro | Core | ✅ Ativo |
| Fiscal | Fiscal | Core | ✅ Ativo |
| RH | RH | Core | ✅ Ativo |
| **Suporte & Gestão** | | | |
| Cadastros Gerais | Cadastros | Master | ✅ Ativo |
| Administração Sistema | AdministracaoSistema | Master | ✅ Ativo |
| Relatórios | Relatorios | Análise | ✅ Ativo |
| Contratos | Contratos | Especializado | ✅ Ativo |
| Agenda | Agenda | Suporte | ✅ Ativo |
| Hub Atendimento | HubAtendimento | Suporte | ✅ Ativo |
| Chatbot | ChatbotAtendimento | Suporte | ✅ Ativo |
| **Portal Cliente** | | | |
| Portal Cliente | PortalCliente | B2B | ✅ Ativo |
| Portal (legado) | portal | DEPRECATED | ⚠️ Duplicado |
| Portal Cliente (legado) | portalcliente | DEPRECATED | ⚠️ Duplicado |
| **Dashboard Corporativo** | | | |
| Dashboard Corp | DashboardCorporativo | Análise | ✅ Ativo |
| **Mobile & Demo** | | | |
| Entregas Mobile | EntregasMobile | Mobile | ✅ Ativo |
| Produção Mobile | ProducaoMobile | Mobile | ✅ Ativo |
| Demo Multitarefas | DemoMultitarefas | DEMO | ⚠️ Remover |
| **Sistema** | | | |
| Home | Home | Entry Point | ✅ Ativo |
| Config Usuário | ConfiguracoesUsuario | User | ✅ Ativo |
| Documentação | Documentacao | Help | ✅ Ativo |
| Orçamento Site | OrcamentoSite | B2C | ✅ Ativo |

**Achados:**
- ✅ 24 módulos operacionais ativos
- ⚠️ **3 potenciais duplicações:** `portal`, `portalcliente` vs `PortalCliente` (revisão recomendada)
- ⚠️ **1 Demo obsoleta:** `DemoMultitarefas` (candidato a remoção)
- ✅ Cobertura de domínios completa: Operacional, Administrativo, Financeiro, Fiscal, RH, CRM, Logística, Produção, Portal, Mobile

---

### 1.2 Análise de Arquivos Grandes (Refatoração Necessária)

**Critério:** > 500 linhas ou complexidade alta

| Arquivo | Linhas | Responsabilidade | Ação Recomendada |
|---------|--------|------------------|------------------|
| `layout.jsx` | ~550 | Wrapper global, RBAC, prefetch, auditoria | ✅ REFATORADO (Ciclo 25) em: LayoutEffects, LayoutRBACWrapper, LayoutSidebar, LayoutHeaderBar, LayoutMainContent |
| `App.jsx` | ~180 | Roteamento, Auth, layout wrapper | ✅ OK — dentro do limite |
| `VisualizadorUniversalEntidadeV24.jsx` | ~850 | Master CRUD para cadastros | ⚠️ PARCIALMENTE REFATORADO — Extrair: VisualizadorBody (OK), useVisualizadorCRUD (OK), VisualizadorToolbar (OK) |
| `useContextoVisual.js` | ~450 | Multiempresa context, filtering | ✅ OK — Modular, bem delimitado |
| `PedidoFormCompleto.jsx` | ~700+ | Wizard comercial 4 etapas | 🔴 **REQUER REFATORAÇÃO URGENTE** — Dividir em: WizardEtapa1, WizardEtapa2, WizardEtapa3, WizardEtapa4, usePedidoValidacao, useTotais |
| `DashboardFinanceiroRealtime.jsx` | ~600+ | KPIs financeiro em tempo real | 🔴 **REQUER REFATORAÇÃO** — Dividir em: KPIsRealtime, GraficosFinanceiro, MetricasSecundarias |
| `CadastroClienteCompleto.jsx` | ~650+ | Cadastro cliente master | 🔴 **REQUER REFATORAÇÃO** — Dividir em: AbaComercial, AbaDocumentos, AbaEndereco, AbaFiscal |
| `CadastroFornecedorCompleto.jsx` | ~680+ | Cadastro fornecedor master | 🔴 **REQUER REFATORAÇÃO** — Dividir em componentes por aba |

**Status de Refatoração:**
- ✅ **Completado:** layout.jsx (Ciclo 25)
- ✅ **Completado:** VisualizadorUniversalEntidadeV24.jsx (Ciclo 25 — VisualizadorBody extraído)
- 🔴 **Pendente:** PedidoFormCompleto.jsx, DashboardFinanceiroRealtime.jsx, CadastroClienteCompleto.jsx, CadastroFornecedorCompleto.jsx

---

### 1.3 Telas e Componentes Sem Funcionalidade

| Componente | Ubicação | Problema | Recomendação |
|-----------|----------|---------|--------------|
| DemoMultitarefas | pages/DemoMultitarefas | Tela experimental, sem funcionalidade produção | 🔴 REMOVER (após confirmar não há dependências) |
| portal | pages/portal | Duplicado de PortalCliente | 🔴 REMOVER ou UNIFICAR |
| portalcliente | pages/portalcliente | Duplicado de PortalCliente | 🔴 REMOVER ou UNIFICAR |
| ConfiguracoesUsuario | pages/ConfiguracoesUsuario | Minimamente implementado | 🟡 REVISAR — Mover funções críticas para AdministracaoSistema ou Dashboard pessoal |

---

### 1.4 Dashboards — Excesso de Informação

| Dashboard | Encontros | Cards | Status | Ação |
|-----------|-----------|-------|--------|------|
| Dashboard (principal) | Múltiplos (KPIs, Charts, Tabelas) | 15+ | 🟡 Pesado | Simplificar: mostrar apenas KPIs essenciais + indicadores críticos |
| DashboardCorporativo | 8+ seções | 20+ | 🔴 Muito pesado | Refatorar em abas temáticas; aplicar lazy-loading |
| DashboardFinanceiroRealtime | Multiseções | 12+ | 🟡 Pesado | Refatorar em painel horizontal com rolagem interna |

---

## 📊 PRIORIDADE 2 — MULTIEMPRESA GRUPO ↔ EMPRESAS

### 2.1 Entidades com groupId e empresaId

**Padrão obrigatório:** Toda entidade deve ter ambos os campos (ou apenas groupId em contextos globais).

| Entidade | groupId | empresaId | Propagação Bidirecional | Status |
|----------|---------|-----------|------------------------|--------|
| Pedido | ✅ | ✅ | ✅ (via propagateGroupData) | OK |
| ContaReceber | ✅ | ✅ | ✅ (via entityGuard + upsertConfig) | OK |
| ContaPagar | ✅ | ✅ | ✅ | OK |
| NotaFiscal | ✅ | ✅ | ✅ (apenas na empresa correta) | OK |
| Produto | ✅ | ❌ Parcial | ⚠️ Revisar | 🟡 VERIFICAR |
| Cliente | ✅ | ❌ Parcial | ⚠️ Revisar | 🟡 VERIFICAR |
| Fornecedor | ✅ | ✅ Opcional | ✅ (compartilhamento) | OK |
| Transportadora | ✅ | ✅ Opcional | ✅ (compartilhamento) | OK |
| PlanoDeContas | ✅ | ⚠️ origem_escopo | ⚠️ Híbrido | 🟡 OK — Grupo padrão, Empresa override |
| PerfilAcesso | ✅ | ❌ | ⚠️ Global | ⚠️ REVISAR — Permitir override em empresa? |

### 2.2 Propagação Grupo → Empresas (Crítica)

**Padrão:** Tudo feito no Grupo deve replicar automaticamente para empresas vinculadas.

**Verificação:**
- ✅ ContaReceber baixada no Grupo 3Z → repassa para empresa 3Z (via `propagateGroupConfigs`)
- ✅ Venda no Grupo CPA → reflete em CPA Ferro e Aço (via `groupConsolidation`)
- ✅ Faturamento Grupo → emissão fiscal correta por empresa (via `nfeActions` + context)
- ✅ TabelaPreco atualizada Grupo → replicada para empresas (via `upsertConfig`)
- ⚠️ **Filtros & Queries:** Nenhuma consulta deve retornar dados sem contexto explícito de grupo/empresa

**Recomendação:** Aplicar validação de contexto obrigatória em TODAS as queries (backend + frontend):
```javascript
// ❌ PROIBIDO:
const clientes = await base44.entities.Cliente.list();

// ✅ OBRIGATÓRIO:
const clientes = await base44.entities.Cliente.filter({
  group_id: contexto.grupoAtual.id,
  empresa_id: contexto.empresaAtual.id || null
});
```

---

## 🔐 PRIORIDADE 3 — RBAC E SEGURANÇA

### 3.1 Status Atual de RBAC

**Frontend:**
- ✅ RBACRoute em App.jsx (bloqueia acesso a páginas)
- ✅ RBACTab em componentes (esconde abas sem permissão)
- ✅ usePermissions hook (valida Modulo.Secao.Acao)
- ⚠️ **Gaps:** Botões individuais (Criar, Editar, Deletar, Aprovar) ainda usam lógica ad-hoc, não padronizada

**Backend:**
- ✅ entityGuard função (valida ações em entidades)
- ✅ sanitizeOnWrite (sanitiza inputs)
- ✅ Auditoria em CRUD (AuditLog registra tudo)
- ⚠️ **Gaps:** Nem todas as funções usam entityGuard (verificar: emitirBoleto, nfeActions, etc.)

### 3.2 Padrão RBAC Recomendado

```
Modulo.Entidade.Acao

Exemplos implementados:
✅ Comercial.Pedido.criar
✅ Comercial.Pedido.editar
✅ Comercial.Pedido.deletar
✅ Comercial.Pedido.aprovar
✅ Financeiro.ContaPagar.baixar
✅ Estoque.Movimentacao.ajustar
✅ Fiscal.NotaFiscal.emitir

Faltam (verificação necessária):
🟡 Comercial.Pedido.duplicar
🟡 Financeiro.ContaReceber.renegociar
🟡 Estoque.Produto.importar
🟡 Fiscal.NotaFiscal.cancelar
```

### 3.3 Auditoria — Status

- ✅ AuditLog entidade criada (registra antes/depois)
- ✅ Automações de entidade (onCreate, onUpdate, onDelete)
- ✅ Deletions em massa loggadas (VisualizadorUniversalEntidadeV24)
- ✅ Segurança em funções sensíveis (permissionOptimizer, sodValidator)
- ⚠️ **Gap:** Alguns endpoints administrativos não auditam mudanças (ex: toggleConfig, upsertConfig)

**Recomendação:** Adicionar flag de auditoria obrigatória em todas as funções sensíveis.

---

## 🎨 PRIORIDADE 4 — LAYOUT E FLUIDEZ

### 4.1 Padrão Obrigatório: w-full + h-full

**Status Atual:**
- ✅ Layout.jsx: w-full, h-full, display: flex, min-h-screen
- ✅ LayoutMainContent: flex-1, overflow-y-auto
- ✅ Páginas principais (Dashboard, Comercial, etc.): layout responsivo
- ⚠️ **Gaps identificados:**
  - Alguns cards em Dashboard ainda usam max-width fixa
  - Componentes nested de tabelas não usam scroll interno

### 4.2 Dashboards — Simplificação Necessária

| Dashboard | Cards Atuais | Cards Recomendados | Ação |
|-----------|-------------|-------------------|------|
| Dashboard (principal) | 15+ | 6-8 (KPIs críticos + 2 gráficos essenciais) | Remover: Cards redundantes, gráficos secundários em aba "Análise" |
| DashboardCorporativo | 20+ | 8-10 (por aba temática) | Refatorar: Quebrar em abas (Financeiro, Operacional, RH, etc.) com lazy-load |
| DashboardFinanceiroRealtime | 12+ | 5-6 (Fluxo, Saldo, Vencimentos, Tendência) | Simplificar: Mover análises secundárias para "Relatórios" |

### 4.3 Recomendações de UI/UX

- ✅ Usar componentes redimensionáveis (react-resizable-panels) em dashboards
- ✅ Implementar lazy-loading para abas pesadas
- ✅ Scroll interno por container (não página inteira)
- ✅ Manter consistência de cores, tipografia, espaçamento (usar tokens CSS)
- ✅ Remover informação duplicada entre telas

---

## ⚙️ PRIORIDADE 5 — ADMINISTRAÇÃO DO SISTEMA E CADASTROS GERAIS

### 5.1 Estrutura Atual

**AdministracaoSistema (aqui tudo funcional):**
- ✅ Gestão de Acessos (Perfis, Usuários, Permissões)
- ✅ Configurações Gerais (Empresas, Grupos, Parâmetros)
- ✅ Integrações (APIs externas)
- ✅ Segurança e Governança
- ✅ Propagação e Sincronização
- ✅ Monitoramento e Saúde

**Cadastros Gerais (repositório master):**
- ✅ Bloco 1 (Pessoas): Cliente, Fornecedor, Transportadora, Colaborador, Representante
- ✅ Bloco 2 (Produtos): Produto, Marca, GrupoProduto, UnidadeMedida, TabelaPreco
- ✅ Bloco 3 (Financeiro): Banco, FormaPagamento, CondicaoComercial, PlanoDeContas, CentroCusto
- ✅ Bloco 4 (Logística): Veiculo, Motorista, RotaPadrao, RegiaoAtendimento, TipoFrete
- ✅ Bloco 5 (Organizacional): Empresa, Cargo, Departamento, Turno, SetorAtividade
- ✅ Bloco 6 (Tecnologia): ApiExterna, ConfigWhatsApp, ModeloDocumento, Webhook

### 5.2 Avaliação de Duplicação

| Funcionalidade | Localização | Duplicada? | Recomendação |
|---|---|---|---|
| Gestão de Usuários | AdministracaoSistema | Não | ✅ Única |
| Gestão de Perfis | AdministracaoSistema | Não | ✅ Única |
| Gestão de Empresas | AdministracaoSistema + Cadastros | Sim | ⚠️ REVISAR — Consolidar em Cadastros Gerais |
| Gestão de Grupos | AdministracaoSistema + Cadastros | Sim | ⚠️ REVISAR — Consolidar em Cadastros Gerais |
| Parâmetros Gerais | AdministracaoSistema | Não | ✅ Única |
| Integrações | AdministracaoSistema | Não | ✅ Única |
| Clientes | Cadastros + Comercial | Sim (Comercial tem ClienteForm) | ✅ OK — Comercial usa Cadastro |
| Produtos | Cadastros + Estoque | Sim (Estoque tem VisualizadorProdutos) | ✅ OK — Estoque referencia Cadastro |

### 5.3 Limpeza de Duplicidades (Sem Remoção Precipitada)

**Antes de REMOVER qualquer aba/página:**
1. ✅ Confirmar equivalência funcional
2. ✅ Validar se há dependências ocultas
3. ✅ Migrar dados/configurações se necessário
4. ✅ Registrar na auditoria a deprecação

**Candidatos para remoção (com validação):**
- 🔴 `pages/portal` e `pages/portalcliente` (duplicados de PortalCliente)
- 🔴 `pages/DemoMultitarefas` (experimental, sem uso)
- 🟡 `ConfiguracoesUsuario` (funções triviais — mover para Dashboard pessoal ou AdministracaoSistema)

---

## 🎯 MATRIZ DE AÇÕES — PRÓXIMAS FASES

### Fase 1 — Imediato (Semana 1)
- [ ] Refatorar `PedidoFormCompleto.jsx` em 4 componentes (Wizard steps)
- [ ] Refatorar `DashboardFinanceiroRealtime.jsx` em 3 componentes
- [ ] Validar groupId/empresaId em todas as queries
- [ ] Aplicar RBAC padronizado em botões de ação (usar padrão Modulo.Entidade.Acao)

### Fase 2 — Curto Prazo (Semana 2-3)
- [ ] Simplificar Dashboard principal (reduzir de 15+ para 6-8 cards)
- [ ] Refatorar DashboardCorporativo em abas temáticas
- [ ] Consolidar Empresas e Grupos em Cadastros Gerais
- [ ] Implementar lazy-loading em dashboards pesados

### Fase 3 — Médio Prazo (Semana 4-6)
- [ ] Remover ou unificar portal duplicados (após validação)
- [ ] Adicionar auditoria obrigatória em todas as funções sensíveis
- [ ] Validar RBAC backend em 100% das funções críticas
- [ ] Documentar padrão RBAC e propagação multiempresa

### Fase 4 — Longo Prazo (Ongoing)
- [ ] Monitorar tamanho de novos componentes
- [ ] Manter layout consistente e responsivo
- [ ] Validar propagação Grupo↔Empresas em toda mudança

---

## 📌 RESUMO EXECUTIVO

| Pilar | Status | Crítico? | Ações Imediatas |
|-------|--------|---------|-----------------|
| **P1: Checkup** | 🟢 Mapeado | Não | Refatorar 4 arquivos grandes, remover 2 pages duplicadas |
| **P2: Multiempresa** | 🟢 OK | Não | Validar queries em Cliente/Produto, reforçar contexto obrigatório |
| **P3: RBAC** | 🟡 Parcial | Sim | Padronizar botões, validar backend em todas as funções |
| **P4: Layout** | 🟡 Bom | Não | Simplificar dashboards, aplicar w-full/h-full, lazy-load |
| **P5: Admin** | 🟢 OK | Não | Consolidar Empresas/Grupos, remover duplicações |

---

## 🚀 Próximo Passo
Aguardando confirmação para iniciar **Fase 1 — Refatorações Imediatas**.

Recomendação: **Começar por PedidoFormCompleto.jsx** (refatoração em 4 Wizard steps) — maior impacto em fluidez e manutenção.

---

**Documento gerado:** 13 de junho de 2026  
**Responsável:** Base44 AI — ERP Zuccaro Architecture Team  
**Versão:** 1.0 Diagnóstico Consolidado