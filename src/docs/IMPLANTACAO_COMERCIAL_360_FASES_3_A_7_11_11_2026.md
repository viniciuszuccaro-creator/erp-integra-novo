# IMPLANTAÇÃO DO COMERCIAL 360° — FASES 1 A 7 (11/11/2026)

Conclusão da implantação do dossiê ERP_ZUCCARO_COMERCIAL_360 sobre o que já existia.
Nenhum módulo, tela ou entidade nova foi criada: todas as entregas são evoluções da Central de Vendas 360°
e dos componentes do Comercial, conforme a Regra-Mãe.

## Fase 1 — Auditoria
`RELATORIO_AUDITORIA_COMERCIAL_360_11_11_2026.md` — inventário do que existia e classificação das lacunas.

## Fase 2 — Busca universal e peso total
- Busca universal com escopo de servidor: `useRLSQuery` repassa o termo ao `filterInContext` →
  `entityListSorted` (SEARCH_FIELDS por entidade), com espera de digitação e carga dos pedidos encontrados
  fora da página atual (`useCentral360Data`, `pedidosBase`).
- Coluna **Peso total**: usa o peso do documento quando existe e, quando não, calcula pelos cadastros
  oficiais de Produto (`pesoNegociacao.jsx`, `usePesosProdutos.jsx`), com legenda da origem no cabeçalho da célula.

## Fase 3 — Motor de validação de fechamento
- `useValidacaoFechamento.jsx` — regras de cliente/documento/contato, itens, quantidades, preços,
  saldo oficial de estoque, desconto concedido, condição de pagamento e validade da proposta.
- `PainelValidacaoFechamento.jsx` — resultado explicativo na mesa (OK / atenção / bloqueio), com detalhe por regra.
- A ação de avançar a negociação fica bloqueada quando há bloqueio estrutural em orçamento, e o rodapé
  explica o motivo.

## Fase 4 — Copiloto comercial e alertas proativos
- `useAlertasComerciais.jsx` — proposta vencida/vencendo, aprovação parada, negociação sem movimento;
  calculado sobre as negociações já carregadas (sem consulta adicional).
- Contador de alertas no cabeçalho da Central.
- `paineis/PainelCopiloto.jsx` — lista de alertas navegável (abre a negociação) e análise assistida da
  negociação via `InvokeLLM`, com auditoria em `AuditLog` e registro do contexto de grupo/empresa.

## Fase 5 — Mapa de entregas e contadores de janela
- `paineis/PainelMapaEntregas.jsx` — entregas reais da negociação/cliente, contadores por situação e por
  **janela de entrega** (manhã/tarde/noite) e mapa com as coordenadas do endereço de entrega.

## Fase 6 — RBAC granular em ação sensível
- `useAcoesComerciais.jsx` centraliza as permissões do submódulo Comercial/Pedidos.
- Desconto acima do limite (15%) passa a exigir permissão de aprovação: campo de desconto bloqueado
  (`ItensNegociacaoGrid`) e gravação recusada com registro de auditoria de bloqueio.

## Fase 7 — Preferências no registro do usuário
- `usePreferenciasCentral360.jsx` persiste larguras, ordenação, filtros e largura do painel em
  `central360_prefs` do usuário (`updateMe`, com debounce); o armazenamento local permanece só como cache.

## Fechamento das pendências (mesma rodada)
- **Amarração com o Hub de Atendimento:** novo atalho "Hub de atendimento" no painel de atendimento da
  Central abre `/HubAtendimento?busca=<telefone|cliente>`; o Hub passou a iniciar a busca a partir do
  parâmetro de URL, caindo direto nas conversas (WhatsApp/omnicanal) daquele cliente.
- **Fila de pedidos externos:** botão "Pedidos externos" no cabeçalho da Central abre o módulo já
  existente `ValidarPedidosExternos` em janela, com RBAC (Comercial/Pedidos/ver).
- **Roteirização na Central:** o painel de mapa ganhou "Otimizar rota", que usa a função já existente
  `optimizeDeliveryRoute` (Expedição) com as entregas da negociação, numera os pontos na ordem otimizada
  e mostra distância e tempo estimados.

## Certificação final — 100% do dossiê implantado (11/11/2026)

Verificação item a item sobre o código existente (nenhum arquivo novo foi criado para certificar).

| Pilar do dossiê | Onde está implantado | Situação |
|---|---|---|
| Central como área única de vendas (substitui o módulo Orçamentos) | `comercialModulesConfig.jsx` (seção Pedidos) | ✅ |
| Layout V6: 12 colunas, Nº/Cliente fixos, cabeçalho fixo, rolagem horizontal | `TabelaNegociacoes.jsx` | ✅ |
| Colunas redimensionáveis + ordenação persistidas por usuário | `usePreferenciasCentral360.jsx` (`central360_prefs`) | ✅ |
| Cliente 360° lateral recolhível e redimensionável | `Cliente360Lateral.jsx` | ✅ |
| Painéis do cliente (resumo, financeiro, estoque, produção, entrega, fiscal, atendimento, retornos, histórico) | `paineis/PainelCorpo.jsx` + `usePainel*` | ✅ |
| Mesa de negociação, grade de itens e totais | `MesaNegociacao.jsx`, `ItensNegociacaoGrid.jsx`, `RodapeNegociacao.jsx` | ✅ |
| Nova negociação (proposta na mesa / pedido no formulário completo) | `NovaNegociacaoDialog.jsx`, `useNovaNegociacao.jsx` | ✅ |
| Busca universal com escopo de servidor | `useCentral360Data` → `filterInContext` → `entityListSorted` | ✅ |
| Peso total pelos cadastros oficiais de Produto | `pesoNegociacao.jsx`, `usePesosProdutos.jsx` | ✅ |
| Validação de fechamento explicativa | `useValidacaoFechamento.jsx`, `PainelValidacaoFechamento.jsx` | ✅ |
| Copiloto e alertas proativos | `useAlertasComerciais.jsx`, `paineis/PainelCopiloto.jsx` | ✅ |
| Mapa de entregas, contadores por janela e roteirização | `paineis/PainelMapaEntregas.jsx` → `optimizeDeliveryRoute` | ✅ |
| RBAC granular em ação sensível (desconto > 15%, aprovar, emitir, criar) | `useAcoesComerciais.jsx` + `MesaNegociacao.salvar` | ✅ |
| Multiempresa em toda escrita | `createInContext` / `updateInContext` (`useContextoVisual`) | ✅ |
| Auditoria antes/depois | `AuditLog` em `MesaNegociacao`, `useEnvioProposta`, `PainelCopiloto`, `usePainelRetornos` | ✅ |
| Proposta por WhatsApp/e-mail com follow-up de CRM | `useEnvioProposta.jsx` → `whatsappSend` / `sendEmailProvider` | ✅ |
| Atendimento comercial conectado ao Hub | `PainelAtendimento.jsx` → `/HubAtendimento?busca=` | ✅ |
| Fila de pedidos externos | `HeaderCentral360.jsx` → `ValidarPedidosExternos` | ✅ |

### Correções aplicadas na certificação (11/11/2026)
- A negociação em foco passou a ser relida da lista por chave: status e itens salvos aparecem na mesa na hora (antes a tela ficava presa ao registro antigo e o botão continuava em "Aprovar orçamento" após aprovar).
- O botão "Salvar" de um **pedido** rascunho não grava mais no orçamento: agora abre o formulário completo do pedido (fonte única), como já fazia o "Abrir pedido".
- O desconto por item passou a ser persistido no orçamento (antes era descartado e o desconto desaparecia ao recarregar).
- Comparação de "alterações pendentes" ignora ids gerados na tela e diferença texto/número: o botão Salvar desabilita corretamente após salvar.
- RBAC da mesa centralizado em `useAcoesComerciais` (salvar, aprovar, gerar pedido, enviar proposta, abrir pedido).
- **Busca idêntica com ou sem backend:** o fallback de leitura (`functionsFallback.js`) passou a usar os mesmos campos de busca por entidade do `entityListSorted` (Pedido, Orçamento, PedidoExterno, Cliente, Produto, entre outros). Antes, com funções de backend bloqueadas pelo plano, a busca da Central só varria campos genéricos e **não encontrava** por número do pedido, cliente, CPF/CNPJ, telefone, vendedor, origem ou cidade; agora encontra.
- **Fila de pedidos externos visível na Central:** o botão "Pedidos externos" mostra quantos pedidos aguardam validação (`PedidoExterno` com `status_importacao = A Validar`) no contexto de grupo/empresa, com RBAC de Comercial/Pedidos/ver — a fila deixa de ser só um atalho para o módulo e passa a indicar o volume pendente.

---

## Complemento da implantação — 11/11/2026 (rodada do dossiê anexado)

Implementado sobre a Central existente, sem módulos, telas ou entidades novas:

| Requisito do dossiê | Onde | Situação |
|---|---|---|
| Abas de etapa PRODUÇÃO / ENTREGA / RETIRA (§6, §19–22) | `negociacaoUtils.jsx` (classificação por status do pedido) + contadores do cabeçalho; "Em execução" segue como visão agregada | ✅ |
| ABERTO: ação primária **Fechar orçamento** (§5) | `MesaNegociacao.jsx` (rótulo da ação primária) | ✅ |
| FECHADO → PRODUÇÃO / ENTREGA / RETIRA, sem salto de etapa (§5, §19–22) | `DestinoPedidoDialog.jsx` → pedido criado já com status e tipo de frete do destino escolhido | ✅ |
| Mais Ações: Duplicar e Desmembrar orçamento (§5) | `RodapeNegociacao.jsx` (menu) + `useAcoesOrcamento.jsx` + `DesmembrarDialog.jsx` | ✅ |
| Repetir pedido / importar itens de pedido anterior com preço revalidado (§12, §39) | `ImportarItensDialog.jsx` + `useAcoesOrcamento.importarItens` (preço relido do cadastro de Produto, desconto zerado) | ✅ |
| Imprimir documento da negociação (§5, §7) | `MesaNegociacao.imprimir` reaproveitando `ImprimirPedido` (agora com título do documento) | ✅ |
| Fila de aprovações com contador no cabeçalho (§5, §18) | `HeaderCentral360.jsx` → Central de Aprovações existente, contando pedidos com `status_aprovacao = pendente` | ✅ |
| Proteção de carteira: sinalizar negociação ativa do mesmo cliente (§8) | `CentralVendas360.jsx` → aviso na mesa com as outras negociações ativas | ✅ |
| Controle de concorrência / optimistic locking (§43) | `MesaNegociacao.salvar` compara `updated_date` e recusa sobrescrever versão alterada, com auditoria de bloqueio | ✅ |
| Selecionar contato quando há múltiplos (§4) | `EnviarPropostaDialog.jsx` (seletor de contato por canal) | ✅ |

### Pendências reais desta rodada (não implantadas)
- Validação de fechamento **no backend** (§16): hoje o motor é frontend (`useValidacaoFechamento`) e o backend valida apenas reservas/propagação.
- Contraproposta na fila de aprovações e segregação de funções dedicada (§18).
- GoTo/telefonia (§4) depende de integração real do provedor; hoje o atalho abre o atendimento/telefone disponível.
- Bot de vendas autônomo com contador de exceções (§6) — o Hub de Atendimento existente cobre a conversa, não o bot de vendas.
- Testes E2E/RBAC/multiempresa (§47, §53) e publicação da versão atual.

### O que falta para operar 100% (fora do código do Comercial)
1. **Publicar** — há alterações no editor ainda não publicadas (o site serve a versão de 09/11/2026).
2. **Validação E2E** pela aba de testes: abrir negociação → montar itens → validar fechamento → enviar proposta → follow-up → aprovar → gerar pedido.
3. **Plano/execução de backend** — busca de servidor, roteirização, copiloto e e-mails dependem de funções de backend e créditos de integração.
4. **Nova varredura de segurança** — a última está desatualizada (12 achados abertos, incluindo Pedido/Cliente/Produto).
