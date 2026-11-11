# FASE 1 — AUDITORIA DO COMERCIAL (CENTRAL DE VENDAS 360°)

Documento de auditoria prévio à implementação, conforme item 51 do dossiê ERP_ZUCCARO_COMERCIAL_360 (revisão 10/11/2026).
Nenhum módulo, tela ou entidade nova foi criada nesta fase. Toda a evolução ocorre sobre o que já existe.

Legenda: ✅ existe e funciona · 🟡 existe e precisa melhorar · 🔴 não existe · ⚪ não foi possível validar

## 1. O que já existe no Comercial

| Item | Situação | Evidência no código |
|---|---|---|
| Módulo Comercial como central de módulos | ✅ | `src/pages/Comercial.jsx` + `comercialModulesConfig.jsx` abrem cada área em janela independente (`WindowManager`) |
| Central de Vendas 360° com layout V6 | ✅ | `central-vendas-360/CentralVendas360.jsx` |
| Tabela de 12 colunas com cabeçalho fixo e rolagem horizontal | ✅ | `TabelaNegociacoes.jsx` (Nº e Cliente fixos) |
| Colunas redimensionáveis e ordenação | ✅ | `TabelaNegociacoes.jsx` (arraste na borda, `onLargura`) |
| Preferências por usuário (larguras, ordenação, filtros, largura do painel) | ✅ | `usePreferenciasCentral360.jsx` (chave por `user.id`) |
| Cliente 360° lateral recolhível e redimensionável | ✅ | `Cliente360Lateral.jsx` |
| Painéis do Cliente 360° (resumo, financeiro, estoque, produção, entrega, fiscal, atendimento, retornos/histórico) | ✅ | `paineis/PainelCorpo.jsx` e hooks `usePainel*` com carga sob demanda |
| Mesa de negociação com grade de itens e totais | ✅ | `MesaNegociacao.jsx`, `ItensNegociacaoGrid.jsx` |
| Nova negociação (orçamento na mesa / pedido no formulário completo) | ✅ | `NovaNegociacaoDialog.jsx`, `useNovaNegociacao.jsx` |
| Envio de proposta por WhatsApp/e-mail com follow-up de CRM | ✅ | `useEnvioProposta.jsx` |
| Retornos/CRM no painel do cliente com registro de desfecho | ✅ | `paineis/usePainelRetornos.jsx`, `DesfechoRetornoDialog.jsx` |
| Busca universal (número, cliente, CPF/CNPJ, telefone, vendedor, origem, cidade, produto) | 🟡 | Hoje filtra em memória sobre os registros já carregados |
| Coluna Peso total | 🟡 | Lê apenas `peso_total` do documento; não calcula pelos cadastros oficiais de Produto |
| Lista completa de pedidos (visão clássica) | ✅ | `HeaderCentral360` alterna para `PedidosTab` |

## 2. Componentes atuais

- Cabeçalho: `HeaderCentral360.jsx` (identidade azul/branca, contadores por grupo, filtros rápidos).
- Tabela: `TabelaNegociacoes.jsx`.
- Mesa: `MesaNegociacao.jsx`, `HeaderNegociacao.jsx`, `ItensNegociacaoGrid.jsx`, `RodapeNegociacao.jsx`.
- Lateral: `Cliente360Lateral.jsx`, `AtalhosLateral.jsx`, `paineis/*`.
- Normalização de registros: `negociacaoUtils.jsx`.
- Dados: `useCentral360Data.jsx`, `useComercialPageData.jsx`, `useRLSQuery` + `filterInContext`.

## 3. Entidades utilizadas

`OrcamentoCliente`, `Pedido`, `PedidoEtapa`, `Cliente`, `Produto`, `Empresa`, `ContaReceber`, `ContaPagar`, `Entrega`, `OrdemProducao`, `NotaFiscal`, `Interacao` (CRM), `Comissao`, `TabelaPreco`, `FormaPagamento`, `CondicaoComercial`, `AuditLog`.
Nenhuma entidade foi duplicada; o Comercial apenas consulta os registros canônicos.

## 4. Funções backend utilizadas

`entityListSorted` (listagem ordenada com escopo de grupo/empresa), `countEntities`, `validatePedido`, `applyOrderStockMovements`, `onPedidoCreated`, `onPedidoApprovalRequested`, `onPedidoReadyToInvoice`, `solicitacoesAprovacao`, `auditEntityEvents`, `sanitizeOnWrite`, `nfeActions`, `emitirBoleto`, `whatsappSend`.

## 5. Status existentes

- Orçamento: `Pendente`, `Aprovado`, `Convertido`, `Rejeitado`, `Expirado`.
- Pedido: `Rascunho`, `Aguardando Aprovação`, `Aprovado`, `Em Produção`, `Pronto para Faturar`, `Faturamento Parcial`, `Faturado`, `Pronto para Retirada`, `Em Expedição`, `Em Trânsito`, `Entregue`, `Cancelado`.
- Agrupamento visual: Abertos, Aguardando cliente, Em aprovação, Em execução, Fechados, Cancelados (`GRUPOS_NEGOCIACAO`).

## 6. Fluxo atual do Pedido

`Rascunho → Aguardando Aprovação → Aprovado → Em Produção | Em Expedição | Pronto para Retirada → Faturado → Entregue`.
Aprovação com alçadas já existe (`CentralAprovacoesManager`, `SolicitacaoAprovacao`, `onPedidoApprovalRequested`). Alteração de status e estoque passam por funções oficiais (`applyOrderStockMovements`, `_lib/pedido/*`).

## 7. Integrações

| Domínio | Situação | Observação |
|---|---|---|
| Estoque | ✅ | `MovimentacaoEstoque`, `applyOrderStockMovements` — reserva/saída/estorno |
| Financeiro | ✅ | `ContaReceber`/`ContaPagar` consultados em modo leitura pelos painéis |
| Produção | ✅ | `OrdemProducao`, `ApontamentoProducao` no painel do pedido |
| Expedição | ✅ | `Entrega`, `Romaneio`, roteirização existente |
| Entrega / App do motorista | ✅ | `AppEntregasMotorista`, `onEntregaUpdated` |
| Fiscal | ✅ | `NotaFiscal`, `nfeActions`, `ConfiguracaoNFe` |
| CRM | ✅ | `Interacao`, `Oportunidade`, painel de retornos |
| Chatbot / WhatsApp | 🟡 | `HubAtendimento`, `chatbot/*` existem; a amarração do canal ao atendimento comercial precisa ser finalizada |
| Site / Catálogo | 🟡 | `CatalogoWeb`, `OrcamentoSite`, `PedidoExterno` existem; a fila de validação é manual (`ValidarPedidosExternos`) |
| Vendas multicanal | 🟡 | `VendasMulticanal`, `ConfiguracaoIntegracaoMarketplace`; origem rastreável no pedido |
| Mapa de entregas | 🟡 | `MapaRoteirizacaoIA` existe na Expedição; falta incorporar na Central |
| IA | 🟡 | `iaGenerativaAvancada`, `iaGenerativeContextual`, `IAConfig`, `AuditoriaIA`; copiloto comercial ainda não está na Central |

## 8. Multiempresa

`useContextoVisual` injeta `empresa_id`/`group_id`; `filterInContext` monta o escopo (`$or` grupo + empresas, `empresas_compartilhadas_ids`) e a consulta vai ao backend (`entityListSorted`). Cadastros são únicos e compartilhados — não há cópia por empresa. ✅

## 9. RBAC

`usePermissions` + `ProtectedSection` + `RBACRoute` no frontend; `PerfilAcesso`/`PermissaoEmpresaModulo` e `_lib/guard` no backend. O Comercial já usa `ProtectedSection` em ações de criar/visualizar. 🟡 Falta granularidade explícita em ações sensíveis (desconto, preço, aprovar).

## 10. Segurança e auditoria

`sanitizeOnWrite`, `validatePedido` no backend, `AuditLog`/`auditEntityEvents` com antes/depois, `securityAlerts`. ✅

## 11. Pendências classificadas para as próximas fases

- 🔴 Busca universal com escopo de servidor (não limitada aos registros carregados).
- 🟡 Peso total calculado com regras de unidade e pesos oficiais de Produto.
- 🟡 Motor de validação de fechamento com resultado explicativo na tela.
- 🟡 Copiloto comercial e alertas proativos dentro da Central.
- 🟡 Mapa de entregas e contadores de janela dentro da Central.
- 🟡 Granularidade RBAC por ação comercial sensível.
- 🟡 Persistência de preferências: hoje em armazenamento local por usuário; avaliar migração para registro do usuário.

## 12. Conclusão

A base da Central de Vendas 360° (layout V6, 12 colunas, Cliente 360°, mesa e preferências) já existe e deve ser evoluída — não recriada. As fases seguintes atacam apenas as lacunas acima, reutilizando entidades, funções e componentes existentes.
