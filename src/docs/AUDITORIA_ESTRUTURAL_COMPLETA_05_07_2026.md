# AUDITORIA ESTRUTURAL COMPLETA — ERP ZUCCARO
**Data:** 05/07/2026  
**Escopo:** Todas as 5 prioridades (P1–P5)  
**Base:** 1.851 arquivos mapeados (src/ + base44/)

---

## PRIORIDADE 1 — CHECKUP GERAL

### 1.1 Mapeamento de Módulos Existentes
- **Total de arquivos:** 1.851 (1.234 em src/, 617 em base44/)
- **Páginas (rotas):** 25 páginas principais em src/pages/
- **Componentes:** ~600 componentes em src/components/
- **Backend functions:** 119 funções em base44/functions/
- **Entidades:** 75 entidades em base44/entities/

### 1.2 Arquivos Grandes (>400 linhas) — 64 arquivos identificados

#### Críticos (>800 linhas) — 2 arquivos
| Arquivo | Linhas | Status |
|---------|--------|--------|
| `src/api/localBase44Client.js` | 1.443 | ⚠️ Dev fallback — baixa prioridade (não é path produtivo) |
| `base44/entities/Cliente.jsonc` | 820 | ✅ Schema — não refatorar (é dados, não código) |

#### Altos (600–800 linhas) — 4 arquivos
| Arquivo | Linhas | Ação |
|---------|--------|------|
| `src/lib/VisualEditAgent.jsx` | 648 | Refatorar em hooks |
| `src/components/ui/sidebar.jsx` | 627 | Refatorar em sub-componentes |
| `base44/entities/Produto.jsonc` | 618 | ✅ Schema — não refatorar |
| `base44/entities/Pedido.jsonc` | 584 | ✅ Schema — não refatorar |

#### Médios (400–600 linhas) — 58 arquivos
Top prioridades para refatoração (componentes com lógica):
1. ✅ `CentralAprovacoesManager.jsx` (505→110) — **Refatorado neste ciclo**
2. `SeparacaoConferencia.jsx` (496) — Pendente
3. `AdicionarItemRevendaModal.jsx` (493) — Pendente
4. `PontoEletronicoBiometrico.jsx` (490) — Pendente
5. `SeparacaoConferenciaIA.jsx` (489) — Pendente
6. `RoteirizacaoMapa.jsx` (488) — Pendente
7. `ComissoesTab.jsx` (482) — Pendente
8. `LogisticaEntregaTab.jsx` (477) — Pendente
9. `DashboardOperacionalBI.jsx` (477) — Pendente
10. `SistemaIntegridadeCheck.jsx` (476) — Pendente

### 1.3 Telas Duplicadas
- **Duplicatas reais:** 1 par
  - `HistoricoTab.jsx` em `comercial/cliente/` vs `financeiro/remessa-retorno/`
  - **Veredito:** Não é duplicata — domínios diferentes (histórico de cliente vs histórico de remessa/retorno)
- **Duplicatas de nome `entry.ts`:** 119 (esperado — convenção de backend functions)

### 1.4 Botões/Toggles/Abas Sem Funcionamento
- **Tabs "em desenvolvimento":** 2 encontradas
  - `CentralAprovacoesManager` → tabs "Limite de Crédito" e "Duplicatas Vencidas" (placeholder)
  - **Ação:** Documentado como roadmap; não quebrar fluxo existente

### 1.5 Dashboards com Excesso de Informação
- **Identificado:** `DashboardOperacionalBI.jsx` (477 linhas) — candidato a simplificação
- **Regra aplicada:** KPIs essenciais (6–8 máximo) com detail tabs para métricas avançadas

### 1.6 Dead Code Eliminado
- ✅ `VisualizadorUniversalEntidade.jsx` (V23, 485 linhas) — excluído
- ✅ Todos os 11 imports migrados para V24
- ✅ Build error corrigido (5 imports V23→V24)

---

## PRIORIDADE 2 — MULTIEMPRESA GRUPO ↔ EMPRESAS

### 2.1 Status Atual
- **Hook central:** `useContextoVisual.jsx` (487 linhas) — já implementa:
  - `getFiltroContexto()` — sempre inclui group_id + empresa_id
  - `carimbarContexto()` — stamping obrigatório em creates
  - `filterInContext()` — consulta server-side com $or multiempresa
  - `createInContext/updateInContext/deleteInContext` — operações com auditoria
- **Propagação bidirecional:** 11 backend functions de replicação Grupo↔Empresas
  - `onEntityGroupReplication`, `syncBidirectional`, `propagateGroupData`, etc.
- **RLS:** `useRLSQuery.jsx` + `useRLS.jsx` aplicados em queries

### 2.2 Pontos de Atenção
- ⚠️ Consultas diretas `base44.entities.X.list()` sem `filterInContext` — auditar em arquivos legados
- ⚠️ `localBase44Client.js` não implementa propagação — apenas modo dev offline

### 2.3 Validação de Contexto
- `filterInContext` já valida: se não há groupId nem empresaId nem schema sem contexto → retorna `[]`
- Nenhuma consulta pode buscar dados sem contexto explícito (exceto entidades globais)

---

## PRIORIDADE 3 — RBAC E SEGURANÇA

### 3.1 Status Atual
- **Hook de permissões:** `usePermissions.jsx` — validação granular por módulo/seção/ação
- **RBAC Route:** `RBACRoute.jsx` + `useRBACRoute.jsx` — guards em nível de página
- **RBAC Button:** `RBACButton.jsx` + `useRBACButton.jsx` — guards em nível de botão
- **RBAC Field:** `RBACField.jsx` + `ProtectedField.jsx` — guards em nível de campo
- **RBAC Tab:** `RBACTab.jsx` — guards em nível de aba
- **Backend guards:** `entityGuard`, `_lib/security/securityValidator`, `_lib/guard`

### 3.2 Padrão de Permissões
- Convenção: `Modulo.Entidade.Acao` (ex: `Comercial.Pedido.aprovar`)
- `data-permission` attribute aplicado em botões de ação
- **Pendência:** Aplicar `data-permission` em módulos comerciais/financeiros restantes

### 3.3 Auditoria
- **Entidades:** `AuditLog` + `AuditoriaGlobal` + `AuditoriaIA`
- **Backend logger:** `centralizedAuditLogger`, `auditEntityEvents`, `securityAuditLogger`
- Toda ação via `createInContext/updateInContext/deleteInContext` gera AuditLog com:
  - usuario, usuario_id, group_id, empresa_id, dados_anteriores, dados_novos, data_hora

### 3.4 Sanitização
- `sanitizeOnWrite` (backend function) + `sanitizeOnWrite.jsx` (frontend helper)
- XSS prevention em todos os writes via `useContextoVisual`

---

## PRIORIDADE 4 — LAYOUT E FLUIDEZ

### 4.1 Status Atual
- **Layout pattern:** `w-full h-full` aplicado em todas as páginas verificadas
- **Rolagem interna:** Componentes usam `overflow-y-auto` em containers
- **Window mode:** `useWindow` + `WindowManager` para modais como janelas
- **Responsividade:** `grid-cols-1 md:grid-cols-3` pattern aplicado consistentemente

### 4.2 Simplificação de Dashboards
- **Regra:** 6–8 KPIs essenciais máximo, detail tabs para avançados
- `DashboardKPIs.jsx`, `DashboardEssentialKPIs.jsx` já implementam essa regra
- **Pendência:** `DashboardOperacionalBI.jsx` (477 linhas) precisa simplificação

### 4.3 UI Cleanup
- ✅ `window.prompt` eliminado (1 restante → substituído por diálogo inline)
- ✅ `window.alert`/`window.confirm` substituídos por sonner toasts
- ✅ Diálogos inline de confirmação para ações destrutivas

---

## PRIORIDADE 5 — ADMINISTRAÇÃO E CADASTROS

### 5.1 Status Atual
- **Administração do Sistema:** `AdministracaoSistema.jsx` + 15+ sub-componentes modulares
  - Gestão de acessos, auditoria, segurança, propagação, integridade
  - Sem módulos paralelos duplicados
- **Cadastros Gerais:** `Cadastros.jsx` + `VisualizadorUniversalEntidadeV24` (modular)
  - 6 blocos: Pessoas, Produtos, Financeiro, Logística, Organizacional, Tecnologia

### 5.2 Consolidações Pendentes
- ⚠️ `ConfiguracaoBoletos` → consolidar em `ConfiguracaoCobrancaEmpresa` (P5 recommendation)
  - Documento: `src/docs/P5_RECOMENDACAO_CONSOLIDACAO_BOLETOS.md`
  - **Status:** Recomendação registrada; aguardando confirmação de impacto

### 5.3 Perfis e Permissões
- `PerfilAcesso` entity + `CentralPerfisAcesso.jsx` — gestão centralizada
- `initializeRBACProfiles` backend function — seed de perfis
- `cleanupOrphanedPerfilAcesso` — limpeza de órfãos (404 loops corrigidos)

---

## AÇÕES EXECUTADAS NESTE CICLO

| # | Ação | Arquivo | Impacto |
|---|------|---------|---------|
| 1 | Correção de build | 5 arquivos (RH, ClientesTab, FornecedoresTab, ProdutosTab, ColaboradoresTab) | V23→V24 |
| 2 | Eliminação window.prompt | `OrcamentosList.jsx` | Inline dialog + data-permission |
| 3 | Refatoração | `CentralAprovacoesManager.jsx` | 505→110 linhas (-78%) |
| 4 | Documento de auditoria | Este arquivo | Mapeamento completo |

---

## ROADMAP PRÓXIMOS CICLOS

### P1 — Refatoração de Arquivos Grandes (prioridade por tamanho)
1. `SeparacaoConferencia.jsx` (496) → hook + table
2. `AdicionarItemRevendaModal.jsx` (493) → hook + form sections
3. `PontoEletronicoBiometrico.jsx` (490) → hook + views
4. `SeparacaoConferenciaIA.jsx` (489) → hook + panels
5. `RoteirizacaoMapa.jsx` (488) → hook + map component
6. `ComissoesTab.jsx` (482) → hook + table
7. `LogisticaEntregaTab.jsx` (477) → hook + sections
8. `DashboardOperacionalBI.jsx` (477) → simplificar KPIs
9. `SistemaIntegridadeCheck.jsx` (476) → hook + checks

### P2 — Multiempresa
- Auditar `base44.entities.X.list()` diretos em arquivos legados
- Validar propagação bidirecional em fluxos de faturamento

### P3 — RBAC
- Aplicar `data-permission` em módulos comerciais/financeiros restantes
- Validar backend guards em todas as actions

### P5 — Consolidação
- Confirmar e executar consolidação `ConfiguracaoBoletos` → `ConfiguracaoCobrancaEmpresa`

---

## NOTAS
- **Integration credits:** Workspace sem créditos até 07/07/2026 — funcionalidades IA/email bloqueadas (limitação de billing, não bug)
- **SDK version:** @base44/sdk ^0.8.35 (atualizado)