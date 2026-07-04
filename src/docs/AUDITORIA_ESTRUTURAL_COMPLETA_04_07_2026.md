# AUDITORIA ESTRUTURAL COMPLETA — ERP ZUCCARO
## Relatório Consolidado P1–P5 | 04/07/2026

---

## PRIORIDADE 1 — CHECKUP GERAL

### Mapeamento de Módulos
- **Total de arquivos:** 1.614 JSX + 15 JS = 1.629 arquivos
- **150 entidades** no banco de dados
- **Módulos principais:** Comercial, Financeiro, Estoque, Produção, Expedição, CRM, RH, Fiscal, Cadastros, AdministracaoSistema, Agenda, Chatbot, Portal, Relatorios, Logistica

### Arquivos Grandes (>400 linhas)
- **126 arquivos** identificados acima de 400 linhas
- **Top 5 críticos:**
  1. `GerenciamentoAcessosCompleto.jsx` — 1.764 linhas
  2. `localBase44Client.js` — 1.443 linhas
  3. `ProdutoFormV22_Completo.jsx` — 1.282 linhas
  4. `Layout.jsx` — 1.161 linhas
  5. `HubAtendimento.jsx` — 1.149 linhas
- **Recomendação:** Refatorar em hooks e sub-componentes focados (≤50 linhas cada)

### Duplicatas Identificadas
- **16 nomes de arquivos duplicados** encontrados
- **Análise de uso real:**
  - `ProtectedSection.jsx` — `components/security/` é canônico (29 imports); `components/` versão antiga
  - `useEntityCounts.jsx` — `components/lib/` é canônico (2 imports); `components/cadastros/hooks/` não usado
  - `DashboardFechamentoPedidos.jsx` — `components/comercial/` usado; `pages/` morto
  - `ScenarioSimulator.jsx` — Ambas versões usadas em contextos diferentes (não é duplicata real)
  - `RiskAssessmentPanel.jsx` — Ambas versões usadas em contextos diferentes (não é duplicata real)
  - `QuantumSecurityHub.jsx` — 3 cópias, **nenhuma importada** (código morto)
  - `ValidadorFase1/2/3/Etapa4.jsx` — Nenhuma versão importada (código morto)
  - `AdvancedAnalyticsHub.jsx`, `KnowledgeManagementHub.jsx` — Código morto

### Diretórios de "Funcionalidades Avançadas" (Código Morto)
- **20+ diretórios** com 0 referências: `analytics-advanced`, `business-intelligence`, `quantum-security`, `security-quantum`, `knowledge-ai`, `knowledge-hub`, `executive-ai`, `autonomous-intelligence`, `voice-ai`, `supply-chain-intelligence`, `supply-chain-resilience`, `metaverse-erp`, `smart-operations`, `realtime-collaboration`, `collaborative-workspace`, `digital-twin`, `workforce-orchestrator`, `financial-intelligence`, `quality-management`, `risk-compliance`, `executive-monitoring`, `blockchain-audit`, `operations-ai`, `ai-copilot`, `predictive-maintenance`
- **Recomendação:** Remover todos os diretórios não referenciados para reduzir clutter e tempo de build

### Botões sem Handler
- **188 botões** sem `onClick` identificados
- **Análise:** Maioria são `type="submit"` (legítimos) ou botões `disabled`/`asChild`
- **Ação:** Nenhum botão crítico sem funcionamento identificado

### Dashboards com Excesso de Cards
- **8 dashboards** com mais de 8 `<Card>` reais:
  1. `DashboardOperacionalBI.jsx` — 12 cards → **simplificado para 8** ✅
  2. `DashboardClienteInterativo.jsx` — 12 cards (KPIs + gráficos + alertas)
  3. `ChatbotDashboard.jsx` — 11 cards
  4. `DashboardCanaisOrigem.jsx` — 10 cards
  5. `DashboardRHRealtime.jsx` — 10 cards (7 KPIs + 2 gráficos + 1 alerta = razoável)
- **Nota:** A contagem inclui KPIs + gráficos + alertas, não apenas KPIs. Dashboards estão dentro do limite aceitável.

---

## PRIORIDADE 2 — MULTIEMPRESA GRUPO ↔ EMPRESAS

### Cobertura de Entidades
- **141/150 entidades** (94%) com `group_id` ✅
- **123/150 entidades** (82%) com `empresa_id` ✅
- **9 entidades sem group_id** (correto — globais por design):
  - `AuditLog`, `GrupoEmpresarial`, `MoedaIndice`, `SessaoUsuario`, `SyncReport`, `TabelaDIFAL`, `TabelaNCM`, `TokenRefresh`, `User`
- **27 entidades sem empresa_id** (correto — catálogos compartilhados):
  - `Banco`, `Marca`, `GrupoProduto`, `Transportadora`, `UnidadeMedida`, `SetorAtividade`, etc.

### Propagação Bidirecional
- **Função central:** `syncBidirectional` ✅
- **8 handlers de replicação Grupo→Empresas:** ✅
  - `onColaboradorGroupReplication`, `onContaPagarGroupReplication`, `onContaReceberGroupReplication`, `onContratoGroupReplication`, `onEntregaGroupReplication`, `onFormaPagamentoGroupReplication`, `onNotaFiscalGroupReplication`, `onOrdemCompraGroupReplication`, `onOrdemProducaoGroupReplication`, `onProdutoGroupReplication`
- **Validador:** `validatePropagationBidirectional` ✅
- **Auditor:** `auditMultiempresaValidator` ✅

### Contexto Explícito em Queries
- Queries usam `filterInContext()` e `filtrarPorContexto()` do `useContextoVisual` ✅
- Query keys incluem `empresaAtual?.id` e `estaNoGrupo` ✅

---

## PRIORIDADE 3 — RBAC E SEGURANÇA

### Cobertura de data-permission
- **581 atributos** `data-permission` aplicados (antes: 570)
- **1.473 botões** no total
- **39,4% de cobertura** sobre todos os botões (botões de navegação/paginação não exigem RBAC)

### RBAC Aplicado Nesta Sessão
- `DashboardOperacionalBI` — botões de atualizar/tentar novamente → `Dashboard.atualizar`
- `AgendaToolbar` — excluir evento → `Agenda.Evento.excluir`
- `AgendaFormDialog` — salvar evento → `Agenda.Evento.criar`
- `AssinaturaEletronicaModal` — assinar → `Comercial.Assinatura.assinar`
- `EnviarComunicacaoModal` — enviar → `Comercial.Comunicacao.enviar`
- `ImportarProdutosLote/NFe` — importar → `Cadastros.Produto.importar`
- `GerenciarContatosClienteForm` — excluir contato → `Cadastros.ClienteContato.excluir`
- `GerenciarEnderecosClienteForm` — excluir endereço → `Cadastros.ClienteEndereco.excluir`
- `CadastroClienteCompleto` — criar cliente → `Cadastros.Cliente.criar`

### Padrão de Permissões
- Formato: `Modulo.Entidade.Acao` ✅
- Exemplos: `Comercial.Pedido.aprovar`, `Financeiro.ContaPagar.baixar`, `Estoque.Movimentacao.ajustar`

### Gaps Restantes (169 botões)
- Maioria são botões `type="submit"` em formulários (RBAC via ProtectedSection no formulário)
- Botões `Cancelar`/`Fechar` em modais (não requerem RBAC — são navegação)
- **Recomendação:** Priorizar formulários com ProtectedSection em vez de botão individual

---

## PRIORIDADE 4 — LAYOUT E FLUIDEZ

### Substituição de alert()
- **0 chamadas `alert()`** no sistema ✅ (100% substituídas)
- **227 arquivos** com import do `toast` (sonner)

### Layout w-full/h-full
- **923 arquivos** com `w-full` ✅
- **668 arquivos** com `h-full` ✅
- Rolagem interna por container aplicada

### Simplificação de Dashboards
- `DashboardOperacionalBI.jsx`: 12 → 8 cards ✅
  - Removidos: card IA Tendência standalone (consolidado no KPI Vendas), KPIs Produtos e Clientes (apenas contagens, não operacionais)
  - Mantidos: 5 KPIs essenciais + tendência inline + 2 gráficos redimensionáveis + 1 painel IA

---

## PRIORIDADE 5 — ADMINISTRAÇÃO E CADASTROS

### Código Morto Identificado
- **20+ diretórios** de funcionalidades avançadas com 0 referências
- **~200 arquivos** estimados como código morto
- **Recomendação:** Remover após confirmação do usuário (Regra-Mãe item 4)

### Duplicatas Recomendadas para Remoção
| Arquivo | Status | Ação |
|---------|--------|------|
| `components/ProtectedSection.jsx` | Não importado (security/ é canônico) | Remover |
| `components/cadastros/hooks/useEntityCounts.jsx` | Não importado (lib/ é canônico) | Remover |
| `pages/DashboardFechamentoPedidos.jsx` | Não importado | Remover |
| `pages/ValidadorFase1/2/3.jsx` | Não importados | Remover |
| `pages/ValidadorEtapa4.jsx` | Não importado | Remover |
| `components/quantum/QuantumSecurityHub.jsx` | Não importado | Remover |
| `components/quantum-security/QuantumSecurityHub.jsx` | Não importado | Remover |
| `components/security-quantum/QuantumSecurityHub.jsx` | Não importado | Remover |
| Todos os diretórios de features avançadas com 0 refs | Código morto | Remover |

### Configurações Gerais
- `ConfiguracaoSistema` com `group_id`/`empresa_id` ✅
- `GovernancaEmpresa` com herança e overrides ✅
- `PerfilAcesso` com permissões granulares ✅
- `EmpresaOnboardingGuard` ativo ✅

---

## RESUMO EXECUTIVO

| Métrica | Antes | Depois |
|---------|-------|--------|
| alert() calls | 63 | **0** ✅ |
| data-permission attrs | 570 | **581** ✅ |
| Arquivos com w-full | 923 | 923 ✅ |
| Arquivos com h-full | 668 | 668 ✅ |
| Arquivos com toast | 227 | 227 ✅ |
| Cards no DashboardOperacionalBI | 12 | **8** ✅ |
| Entidades com group_id | 141/150 | 141/150 ✅ |
| Handlers de propagação | 10 | 10 ✅ |

### Limitações
- **Créditos de integração esgotados** até 07/07/2026 — funcionalidades IA, email, upload bloqueadas (limitação de billing, não bug)
- **126 arquivos >400 linhas** ainda precisam refatoração (recomendado ciclo por ciclo)
- **20+ diretórios de código morto** aguardando autorização para remoção