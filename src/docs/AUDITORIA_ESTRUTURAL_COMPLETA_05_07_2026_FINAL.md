# AUDITORIA ESTRUTURAL COMPLETA — 05/07/2026 (CICLO FINAL)

## RESUMO EXECUTIVO

Auditoria completa do ERP Zuccaro seguindo Regra-Mãe, executando as 5 prioridades em ordem.

---

## P1 — CHECKUP GERAL

### Mapeamento de Módulos
- **~1.200 arquivos** `.jsx`/`.js` no diretório `src/`
- **32 arquivos componentes** acima de 400 linhas (reduzido de 39)
- **3 arquivos** acima de 600 linhas são libs/UI core (sidebar, VisualEditAgent, localBase44Client)

### Arquivos Grandes Restantes (componentes >400 linhas)
| Arquivo | Linhas | Tipo |
|---------|--------|------|
| sidebar.jsx | 627 | UI base (não refatorar) |
| calculoImpostos.jsx | 523 | Biblioteca |
| BuscaDadosPublicos.jsx | 509 | Biblioteca |
| useContextoVisual.jsx | 487 | Hook central |
| SistemaIntegridadeCheck.jsx | 476 | Painel admin |
| validacoes.jsx | 464 | Biblioteca |
| useContextoGrupoEmpresa.jsx | 462 | Hook central |
| IALeituraProjeto.jsx | 455 | Integração IA |
| EnviarComunicacaoModal.jsx | 445 | Modal |
| DataTable.jsx | 441 | UI base |
| UploadProjetoModal.jsx | 440 | Modal |
| ConfiguracaoCobranca.jsx | 439 | Config |
| AssinaturaEletronicaForm.jsx | 438 | Form |
| GerenciarEnderecosClienteForm.jsx | 437 | Form |
| permissionsConfig.jsx | 433 | Config RBAC |
| ItensRevendaTab.jsx | 432 | Tab |
| ConfiguracaoExpedicao.jsx | 430 | Config |
| DashboardInadimplencia.jsx | 428 | Dashboard |
| OtimizadorCorte.jsx | 426 | Ferramenta |
| exportacaoExcel.jsx | 425 | Biblioteca |

### Telas Duplicadas / Propósito Similar
- **Nenhuma duplicata real encontrada** — arquivos com nomes similares (`HistoricoTab` em `comercial/cliente/` vs `financeiro/remessa-retorno/`) servem contextos diferentes
- `ConfiguracaoBoletosForm.jsx` — ainda existe com 3 refs externas; **recomendação**: consolidar em `ConfiguracaoCobrancaEmpresa` após migrar importações (P5 pendente)

### Botões Sem Funcionamento
- O scan identificou `<Button>` sem `onClick` ou `data-action` — a maioria são botões de tipo `submit` (formulários) ou botões `asChild` (links), que têm funcionamento correto
- Nenhum botão órfão sem ação encontrado

### Dashboards Simplificados (ciclos anteriores)
- CanaisKPIs: 4 KPIs essenciais
- PedidosRetirada: 3 KPIs
- Apontamento: 3 cards
- Dashboards "realtime" (RH, Entregas, Produção, Financeiro): ~9 cards reais cada (número aceitável — cada card tem 4 sub-componentes)

---

## P2 — MULTIEMPRESA GRUPO ↔ EMPRESAS

### Creates Corrigidos Neste Ciclo (group_id adicionado)

| Arquivo | Entidade | Correção |
|---------|---------|----------|
| `useChatbotWidget.jsx` | ConversaOmnicanal.create | +group_id, +empresa_id |
| `useChatbotWidget.jsx` | MensagemOmnicanal.create (×3) | +group_id, +empresa_id |
| `useChatbotWidget.jsx` | Notificacao.create | +group_id, +empresa_id |
| `useChatbotWidget.jsx` | ChatbotInteracao.create | +group_id |
| `intentActions.jsx` | Pedido.create | +group_id (contexto.groupId) |
| `intentActions.jsx` | ContaReceber.create | +group_id (contexto.groupId) |
| `TimelineCliente.jsx` | HistoricoCliente.create | +group_id, +empresa_id (via hook) |
| `CalcularComissoesForm.jsx` | Comissao.create | +group_id, +empresa_id |
| `ImportacaoNFeRecebimento.jsx` | MovimentacaoEstoque.create | +group_id, +empresa_id |
| `useContratoActions.jsx` | Notificacao.create (×2) | +group_id, +empresa_id |
| `ConfigWhatsApp.jsx` | ConfiguracaoSistema.create | +group_id, +empresa_id |
| `DashboardLogistico.jsx` | ConfiguracaoSistema.create | +group_id, +empresa_id |
| `EnvioMensagemAutomatica.jsx` | HistoricoCliente.create | +group_id |
| `LogisticaReversa.jsx` | MovimentacaoEstoque.create | +group_id |
| `LogisticaReversa.jsx` | Notificacao.create | +group_id, +empresa_id |
| `RoteirizacaoInteligente.jsx` | RoteirizacaoInteligente.create | +group_id, +empresa_id |
| `PriceBrain.jsx` | AuditoriaIA.create | +group_id |
| `useNotasFiscaisTab.jsx` | LogFiscal.create | +group_id |
| `ImportadorProdutosPlanilha.jsx` | Produto (montarProduto) | +group_id |

**Total: ~25 creates corrigidos neste ciclo**

### Status Final
- Creates com group_id: ~101 / ~169 totais (**60% cobertura**, vs 45% no início)
- Creates restantes sem group_id: ~68 (maioria em `localBase44Client.js` mock, `HerancaOverridesPanel` já tem, `ChatbotIntentsForm` usa `carimbarContexto`)
- Propagação bidirecional: backend functions `syncBidirectional`, `propagateGroupData`, `syncEmpresaToGroup` ativos

---

## P3 — RBAC E SEGURANÇA

### Atributos data-permission Adicionados Neste Ciclo
| Arquivo | Botão | Permissão |
|---------|-------|-----------|
| `GerarNFeModal.jsx` | Gerar NF-e | `Fiscal.NFe.emitir` |
| `TransferirConversa.jsx` | Transferir | `HubAtendimento.Conversa.transferir` |
| `ConversaoProducaoMassa.jsx` | Converter Produtos | `Cadastros.Produto.converter` |
| `AvaliacaoFornecedorForm.jsx` | Salvar Avaliação | `Compras.Fornecedor.avaliar` |

### Status Final
- **667 atributos `data-permission`** no total no sistema (vs 663 no início)
- Padrão seguido: `Modulo.Entidade.Acao`
- `usePermissions` hook integrado em componentes críticos
- `AvaliacaoFornecedorForm` já valida permissão via `hasPermission("Compras.Fornecedor.avaliar")`

### Arquivos com Gap de RBAC Restantes (próximos passos)
- `VisualizadorBody.jsx` (7 onClicks, 0 data-permission) — visualizador genérico
- `DataTable.jsx` (7 onClicks) — UI base, ações são dinâmicas
- `GerarBoletoChat.jsx`, `TagsCategorizacao.jsx` — chatbot operacional

---

## P4 — LAYOUT E FLUIDEZ

### Layout w-full h-full
- Todos os componentes refatorados neste ciclo usam `w-full h-full`
- Containers com rolagem interna (`overflow-auto`)
- `GerarNFeModal`: `overflow-hidden flex flex-col` + footer `sticky bottom-0`

### Dashboards
- Dashboards "realtime" (RH, Entregas, Produção, Financeiro): ~9 cards reais cada — número aceitável
- `DashboardInadimplencia.jsx` (428 linhas, 20 cards) — candidato a refatoração futura
- `DashboardRepresentantes.jsx` (416 linhas, 32 cards) — candidato a refatoração futura

---

## P5 — ADMINISTRAÇÃO E CADASTROS

### ConfiguracaoBoletosForm — Status
- **Não excluído** — possui 3 refs externas
- **Recomendação registrada**: consolidar em `ConfiguracaoCobrancaEmpresa` após migrar importações
- Nenhuma ação tomada sem confirmação de impacto

### Duplicidades Verificadas
- `HistoricoTab` (comercial/cliente/ vs financeiro/remessa-retorno/): **NÃO é duplicata** — contextos diferentes
- `ChatbotIntentsForm` → `ChatbotIntentForm`: adapter que grava na entidade consolidada — **funcionando corretamente**

### Permissões e Perfis
- `permissionsConfig.jsx` (433 linhas) — mapeamento central de permissões, funcionando
- `AvaliacaoFornecedorForm` — RBAC validado via `usePermissions`
- `TransferirConversa` — importa `usePermissions` e valida usuário

---

## PRÓXIMOS PASSOS RECOMENDADOS

1. ~~**P1**: Refatorar `SistemaIntegridadeCheck.jsx` (476)~~ ✅ **FEITO** — refatorado em hook + 3 sub-componentes
2. **P1**: Refatorar `IALeituraProjeto.jsx` (455) — pendente
3. ~~**P2**: Corrigir creates restantes sem group_id~~ ✅ Cobertura 62%→**73.4%** (124/169)
4. ~~**P3**: Adicionar `data-permission` em `VisualizadorBody.jsx`, `GerarBoletoChat.jsx`, `TagsCategorizacao.jsx`~~ ✅ **FEITO** — total 667→**674**
5. **P4**: Simplificar `DashboardInadimplencia.jsx` (428) e `DashboardRepresentantes.jsx` (311) — pendente
6. **P5**: Consolidar `ConfiguracaoBoletosForm` após auditoria de imports

---

## ATUALIZAÇÃO CICLO 05/07/2026 (EXECUÇÃO)

### P1 — Refatoração SistemaIntegridadeCheck (476→~110 linhas)
- Extraído `integridadeMeta.jsx` — constantes, cache, resultados offline
- Extraído `useSistemaIntegridade.jsx` — hook com state management
- Extraído `IntegridadeEtapaRow.jsx` — componente de linha expansível
- `SistemaIntegridadeCheck.jsx` → wrapper fino (~110 linhas)

### P2 — Creates Corrigidos Neste Ciclo
| Arquivo | Entidade | Correção |
|---------|---------|----------|
| `useEntregaForm.jsx` | Entrega.create | +group_id, +empresa_id |
| `ConciliacaoAutomaticaIA.jsx` | ConciliacaoBancaria.create | +group_id |
| `GerarLinkPagamentoModal.jsx` | PagamentoOmnichannel.create | +group_id |
| `VendasMulticanal.jsx` | PagamentoOmnichannel.create | +group_id |
| `ReguaCobrancaIA.jsx` | Interacao.create (×2) | +group_id, +empresa_id |
| `ReguaCobrancaIA.jsx` | Notificacao.create | +group_id, +empresa_id |
| `SincronizacaoMarketplacesAtiva.jsx` | Cliente.create | +group_id, +empresa_id |
| `SincronizacaoMarketplacesAtiva.jsx` | Pedido.create | +group_id, +empresa_id |
| `SincronizacaoMarketplacesAtiva.jsx` | PedidoExterno.create | +group_id, +empresa_id |
| `ExportacaoSPED.jsx` | SPEDFiscal.create | +group_id |
| `IAGovernancaCompliance.jsx` | LogsIA.create (×2) | +group_id |
| `ContasPagarTab.jsx` | CaixaOrdemLiquidacao.create | +group_id |
| `ConfigFinanceiroLogistica.jsx` | ConfiguracaoSistema.create | +group_id, +empresa_id |
| `ConfiguracaoCobranca.jsx` | ConfiguracaoCobrancaEmpresa.create | +group_id |
| `aprovarPedido.jsx` | HistoricoCliente.create | +group_id |
| `integracaoBoletos.jsx` | LogCobranca.create | +group_id |
| `GerarBoletoChat.jsx` | ContaReceber.update + ConversaOmnicanal.update | +group_id |
| `TagsCategorizacao.jsx` | ConversaOmnicanal.update | +group_id, +empresa_id |

**Total: ~19 creates/updates corrigidos neste ciclo**

### P3 — data-permission Adicionados
| Arquivo | Botão | Permissão |
|---------|-------|-----------|
| `VisualizadorBody.jsx` | Selecionar todos | `Cadastros.Selecao.selecionar_todos` |
| `VisualizadorBody.jsx` | Cancelar seleção | `Cadastros.Selecao.cancelar` |
| `GerarBoletoChat.jsx` | Gerar 2ª Via | `Financeiro.ContaReceber.gerar_boleto` |
| `GerarBoletoChat.jsx` | Copiar linha | `Financeiro.ContaReceber.visualizar` |
| `GerarBoletoChat.jsx` | Ver PDF | `Financeiro.ContaReceber.visualizar` |
| `TagsCategorizacao.jsx` | Editar tags | `HubAtendimento.Conversa.editar_tags` |
| `TagsCategorizacao.jsx` | Adicionar tag | `HubAtendimento.Conversa.editar_tags` |

### Métricas Finais
- **data-permission**: 667 → **674** atributos no sistema
- **Creates com group_id**: 105/169 (62%) → **124/169 (73.4%)**
- **Creates restantes**: 45 (15 falsos positivos do scan; ~12 em mock/lib genérico; ~18 reais)
- **Arquivo refatorado**: SistemaIntegridadeCheck.jsx 476→~110 linhas (main) + 3 sub-arquivos