# IMPLANTAÇÃO DO COMERCIAL 360° — FASES 1 A 7 (11/11/2026)

Registro de implementação parcial do dossiê ERP_ZUCCARO_COMERCIAL_360 sobre o que já existia.
As entregas evoluem a Central de Vendas 360° e os componentes comerciais existentes, conforme a Regra-Mãe.
O documento original não está presente no repositório ou no arquivo ZIP disponível nesta revisão. Os relatórios anteriores não substituem o documento original; não há base para certificar cobertura integral de seus requisitos.

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

## Inventário de funcionalidades em código, sem certificação integral (11/11/2026)

As marcações abaixo indicam presença de implementação, não aprovação em testes ponta a ponta nem cobertura de 100% do documento original. A certificação anterior foi retirada por contradizer as pendências identificadas.

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
| Validação de fechamento explicativa | `useValidacaoFechamento.jsx`, `PainelValidacaoFechamento.jsx` + `onOrcamentoConfirmed` nas ações salvar/fechar/validar | Implementado; homologação completa pendente |
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
| Direcionamento de PRODUÇÃO / ENTREGA / RETIRA (§5, §19–22) | `DestinoPedidoDialog.jsx` registra a intenção; o pedido nasce Aguardando Aprovação, nunca como produção/expedição/retirada concluída | Implementado parcialmente; falta homologar a passagem operacional completa |
| Mais Ações: Duplicar e Desmembrar orçamento (§5) | `RodapeNegociacao.jsx` (menu) + `useAcoesOrcamento.jsx` + `DesmembrarDialog.jsx` | ✅ |
| Repetir pedido / importar itens de pedido anterior com preço revalidado (§12, §39) | `ImportarItensDialog.jsx` + `useAcoesOrcamento.importarItens` (preço relido do cadastro de Produto, desconto zerado) | ✅ |
| Imprimir documento da negociação (§5, §7) | `MesaNegociacao.imprimir` reaproveitando `ImprimirPedido` (agora com título do documento) | ✅ |
| Fila de aprovações com contador no cabeçalho (§5, §18) | `HeaderCentral360.jsx` → Central de Aprovações existente, contando pedidos com `status_aprovacao = pendente` | ✅ |
| Proteção de carteira: sinalizar negociação ativa do mesmo cliente (§8) | `CentralVendas360.jsx` → aviso na mesa com as outras negociações ativas | ✅ |
| Controle de concorrência / optimistic locking (§43) | `onOrcamentoConfirmed` usa `updateMany` condicional por id, grupo, empresa, status e `updated_date` ao salvar/fechar, com auditoria explícita | Implementado para salvar/fechar; demais escritas ainda pendentes |
| Selecionar contato quando há múltiplos (§4) | `EnviarPropostaDialog.jsx` (seletor de contato por canal) | ✅ |

### Correções do núcleo de fechamento nesta revisão
- `onOrcamentoConfirmed`, endpoint existente, passa a receber salvar/fechar/validar da Central. Exige orçamento, grupo, empresa e versão explícitos, verifica permissão comercial e mantém as leituras/escritas operacionais com o usuário autenticado.
- Valida cliente habilitado e compartilhamento com a empresa, itens, quantidade, preço, desconto, pagamento, validade e produtos oficiais. Falta de saldo continua como aviso de produção/compra, não como reserva fictícia.
- Recalcula totais no servidor, sanitiza texto e grava com condição atômica de versão; gera auditoria de antes/depois com usuário e ambos os identificadores de contexto.
- Como `updateMany` não dispara efeitos por registro, validação, sanitização e auditoria desse caminho são explícitas. A aprovação do orçamento não cria pedido automaticamente; o fluxo de conversão da mesa permanece separado.
- Fechar orçamento inclui os itens atuais e as condições na mesma operação: não descarta alterações ainda não salvas. O cabeçalho existente permite revalidar validade, condição de pagamento e prazo, com permissão de edição e salvamento no mesmo caminho validado.
- O cadastro de OrcamentoCliente passa a declarar desconto percentual e tipo dos itens. Valores legados sem percentual são inferidos do total, sem migração destrutiva; o total zero não é substituído pelo bruto.
- A mesa foi reduzida extraindo suas ações para o hook de orçamento já existente, sem criar módulo duplicado. Erros e checagens do servidor aparecem na mesa; a grade respeita RBAC e permite reduzir descontos anteriores.
- Enviar proposta não marca mais um orçamento como aprovado: envio e aprovação têm permissões e efeitos distintos.
- A conversão registra `pedido_gerado_id`, preserva descontos e inicia o pedido Aguardando Aprovação, sem antecipar execução logística.
- Verificações executadas: compilação e análise dos componentes alterados concluídas; endpoint retorna 400 para contexto ausente, ação inválida e identificadores malformados, e 404 para registros inexistentes no contexto. Não foram alterados registros reais para esses testes. Isso não equivale a homologação completa com dados válidos e usuários de perfis diferentes.

### Pendências reais para continuidade, sem declaração de 100%
1. Reanexar o documento original ERP_ZUCCARO_COMERCIAL_360 para conferir os requisitos integrais. Não se pode inferir todos os seus itens a partir destes relatórios.
2. Completar conversão transacional/idempotente e autoridade de servidor nos demais caminhos (duplicar, desmembrar, criação direta e edição de pedido); as regras de acesso existentes ainda permitem caminhos diretos de escrita. A cobertura do endpoint não equivale ao bloqueio global de todas as APIs.
3. Homologar todos os efeitos de produção, estoque, aprovação, expedição e retirada com as transições canônicas; preservar os tipos de fabricação na conversão.
4. Contraproposta e segregação de funções na fila de aprovações; numeração sequencial concorrente garantida no servidor.
5. Telefonia/GoTo com provedor real; bot autônomo com contador de exceções; processamento automático de pedidos externos.
6. Executar os cenários E2E/RBAC/multiempresa no Testing Agent, incluindo dois usuários editando o mesmo orçamento e falha parcial de conversão.
7. Confirmar condições atuais de execução e integrações, publicar pelo botão Publish e realizar nova análise de segurança. Nenhuma condição atual de plano, publicação ou achados é presumida por este relatório.
