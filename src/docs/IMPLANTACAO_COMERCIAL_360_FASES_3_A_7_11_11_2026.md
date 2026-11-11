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

---

## Revisão com o dossiê original anexado (11/11/2026, 09h)

O documento `ERP_ZUCCARO_COMERCIAL_360.docx` foi finalmente lido integralmente e confrontado com o código.
Cada item abaixo corresponde a uma exigência textual do dossiê, não a uma interpretação dos relatórios anteriores.

### Implementado nesta revisão (somente sobre o existente)

| Exigência | Onde | Situação |
|---|---|---|
| §16 — motor de validações no backend (20 verificações) | `onOrcamentoConfirmed` (`acao: validar/salvar/fechar`): cliente ativo, documento com dígito verificador, endereço, empresa, itens/quantidades, produtos oficiais, estoque, produção, tabela de preço, preço/custo, desconto, condição de pagamento, validade, limite de crédito, títulos vencidos, aprovação pendente, dados fiscais e permissão | Implementado |
| §17 — resultado explicativo com “AÇÃO NECESSÁRIA” | `PainelValidacaoFechamento` exibe `acao` de cada checagem devolvida pelo servidor | Implementado |
| §18 — fila de limite de crédito | Aba “Limite de Crédito” da Central de Aprovações deixa de ser “em desenvolvimento” e lista `SolicitacaoAprovacao` real, com aprovar/rejeitar | Implementado |
| §18 — fila de títulos vencidos | Aba “Duplicatas Vencidas” com a mesma fila real + histórico | Implementado |
| §18 — contraproposta | Aprovador pode propor novo limite no ato da decisão; grava `contraproposta` e aplica `condicao_comercial.limite_credito` no cadastro único do cliente, com auditoria antes/depois | Implementado |
| §18 — solicitação gerada pelo próprio fechamento | Fechar orçamento bloqueado por limite ou título vencido abre solicitação `liberar_credito`/`liberacao_vencido` para aquele orçamento, sem duplicar pendentes | Implementado |
| §41/§5 — crédito e financeiro como referência | O Comercial consulta `ContaReceber` e `Cliente.condicao_comercial`; não copia saldos | Implementado |
| §42 — auditoria | Decisões de aprovação e abertura de solicitação geram `AuditLog` com grupo, empresa, usuário e antes/depois | Implementado |
| §3 — 12 colunas | `TabelaNegociacoes` tem 12 colunas, Nº e Cliente fixos, redimensionamento e ordenação persistidos | Já existia |
| §7 — busca universal | Servidor (`entityListSorted`) com fallback por entidade equivalente | Já existia |
| §10.10 — proibir telas simuladas | As duas abas que exibiam “Funcionalidade em desenvolvimento” foram substituídas por funcionalidade real | Corrigido |

### Verificações executadas
- `npm run build` concluído após cada bloco de alterações.
- `npx eslint` nos componentes alterados, sem erros.
- Contrato do endpoint: 400 para contexto ausente, ação inválida e identificador malformado; 404 para registro inexistente no contexto. Nenhum registro real foi alterado para testar.

### Pendências confirmadas pelo dossiê (não concluídas)
1. Testes obrigatórios do §47/§48 (ABERTO→FECHADO, bloqueios, aprovação→fechado, produção→entrega/retira, parcial, cancelamento, reabertura, usuário sem permissão, empresa diferente, `empresa_id`/`group_id` maliciosos) — devem rodar no Testing Agent com backend real; não foram executados.
2. §23 — saldos parciais por item (revenda vs. fabricação) na separação, produção, entrega, faturamento e cobrança.
3. §5 — “Ajustar Pedido somente nas telas Produção/Entrega/Retira”: a Central ainda abre o formulário completo para edição jurídica do pedido; a restrição por etapa não foi imposta.
4. §27 — comprovantes digitais completos (foto da mercadoria/local, canhoto, assinatura legível, documento do recebedor) e reflexo imediato do App do Motorista na Central.
5. §6 — bot de vendas autônomo com contador de exceções e configuração em Cadastros Gerais; §4 — GoTo/telefonia com provedor real.
6. §25/§26 — contadores de entregas do cliente (hoje, em rota, rejeitadas, reagendadas, ocorrência) e detalhe navegável do mapa.
7. §37 — dashboard do vendedor (vendas hoje/mês, meta, atingimento, ticket médio, clientes para retornar).
8. §47 — o motor de validação cobre as regras, mas ainda não há suíte automatizada que comprove cada uma com dados reais.
9. Publicação e nova análise de segurança continuam fora do editor e não foram executadas.

Portanto: o núcleo de fechamento, aprovação e contraproposta do dossiê está implementado e compila; **não é possível declarar 100% de implantação** enquanto os itens 1 a 9 acima não forem executados e homologados.

---

## Revisão 11/11/2026, 09h35 — itens 3 e 6 concluídos

### §5 — Ajustar Pedido somente nas telas de Produção, Entrega e Retira (concluído)
`MesaNegociacao` bloqueia a edição jurídica do pedido na Central a partir da etapa `Em Produção`
(incluindo `Pronto para Faturar`, `Faturamento Parcial`, `Faturado`, `Pronto para Retirada`,
`Em Expedição`, `Em Trânsito` e `Entregue`) e orienta o usuário a ajustar na tela do módulo responsável.
Rascunho, Aguardando Aprovação e Aprovado continuam editáveis na Central, preservando o fluxo atual.

### §25/§26 — Contadores de entrega do cliente (concluído)
O atalho **Entregas** do Cliente 360° passou a exibir, do cadastro real de `Entrega` no contexto ativo:
entregas de hoje, em rota, prontas para expedir, atrasadas, rejeitadas, reagendadas, com ocorrência e total.
A listagem existente do pedido foi preservada; em orçamento (sem pedido) a lista passa a mostrar as entregas do cliente.
Regras em `usePainelEntregasCliente.jsx`; leitura protegida pela permissão do módulo Expedição.

### Verificação
- `npm run build` concluído; `npx eslint` sem erros nos arquivos alterados.
- Nenhuma consulta, criação ou alteração fora do contexto de grupo/empresa; tudo somente leitura.

### Ainda pendente (atualizado)
1. Testes §47/§48 no Testing Agent.
2. §23 — saldos parciais por item em separação, produção, entrega, faturamento e cobrança.
3. §27 — comprovantes digitais completos e reflexo do App do Motorista na Central.
4. §37 — dashboard do vendedor: não existe hoje fonte de meta por vendedor no cadastro (só `RegiaoAtendimento.meta_vendas_mensal`); depende de campo novo em cadastro existente e da tela que o alimenta.
5. §6 — bot de vendas autônomo; §4 — GoTo/telefonia com provedor real.
6. Publicação e nova análise de segurança.

---

## Revisão 11/11/2026, 09h39 — itens §26 e §27 concluídos

### §26 — detalhe navegável do mapa (concluído)
Cada cartão de entrega do painel **Entregas** ganhou a ação **Ver no mapa**, que abre o painel de mapa
da própria Central 360° com os pontos da negociação (os pontos continuam numerados e com popup de
cliente, situação e janela de entrega).

### §27 — reflexo imediato do App do Motorista (concluído)
`usePainelEntregasCliente` assina a entidade `Entrega` enquanto o painel está aberto e invalida as consultas
de entrega a cada evento, de modo que status, comprovante, ocorrência e reagendamento gravados pelo
motorista aparecem na Central sem recarregar a página. A assinatura é cancelada ao fechar o painel.

### Verificação
- `npm run build` concluído; `npx eslint` sem erros nos três arquivos alterados.
- Consulta por pedido quando a negociação é pedido e por cliente quando é orçamento, sempre no contexto
  de grupo/empresa e protegida pela permissão do módulo Expedição.

### Pendente atualizado
1. Testes §47/§48 no Testing Agent.
2. §23 — saldos parciais por item.
3. §6 — bot de vendas autônomo; §4 — GoTo/telefonia com provedor real.
4. §27 — foto da mercadoria/local e canhoto além dos campos já existentes em `Entrega.comprovante_entrega`.
5. Publicação e nova análise de segurança.

---

## Revisão 11/11/2026, 09h55 — §37 concluído (painel do vendedor)

Entregue como painel da própria Central 360° (atalho **Vendedor**), sem tela nova:
- vendas de hoje e do mês, quantidade de pedidos e ticket médio do vendedor logado;
- meta mensal comparada ao realizado, com percentual de atingimento, barra de progresso e quanto falta;
- clientes para retornar (interações com `data_proxima_acao` vencida) com atalho para o painel Retornos.

A meta é gravada em `ConfiguracaoSistema` na chave `comercial.meta_vendas_mensal.<id do usuário>`,
com carimbo de `group_id`/`empresa_id`, sanitização e log em `AuditLog` (Regra-Mãe 5a/5c/5d).
A edição da meta exige permissão de edição no módulo Comercial; a leitura exige permissão de visualização.
Pedidos cancelados, rascunhos e rejeitados não entram nos totais.

### Verificação
- `npm run build` concluído; `npx eslint` sem erros nos arquivos alterados.
- Nenhuma entidade, rota ou componente novo de tela: apenas um painel dentro do componente existente.

---

## Revisão 11/11/2026 — §27: comprovante completo nos fluxos principais

### Implementação desta revisão
- O formulário existente `ComprovanteDigital` é reutilizado na Expedição, no detalhe da entrega e no App do Motorista, sem nova página ou módulo.
- Passa a exigir foto do canhoto, foto da mercadoria, foto do local, nome e documento do recebedor, assinatura desenhada e conferência explícita antes da confirmação. Cargo e observações continuam disponíveis; GPS é registrado quando autorizado no dispositivo.
- Fotos e assinatura usam `UploadPrivateFile`; `Entrega.comprovante_entrega` guarda somente referências, nunca arquivos/base64 novos. Novos campos opcionais preservam os comprovantes legados.
- A Central 360° e o detalhe comercial consultam o comprovante existente em modo somente leitura. O servidor verifica grupo/empresa/permissão antes de gerar links temporários dos arquivos vinculados à entrega. Comprovantes legados sem as novas evidências são identificados como tal, sem inventar arquivos.
- O endpoint existente `onEntregaUpdated` recebe ações explícitas `registrar_comprovante` e `consultar_comprovante`. Autenticação, vínculo administrativo ao contexto, permissão granular `Expedição/Entrega`, empresa pertencente ao grupo, situação em rota, versão, arquivos privados, coordenadas, data e conferência são verificados no servidor.
- A confirmação gera auditoria com usuário, antes/depois, grupo, empresa e data. A atualização individual da entrega preserva seus gatilhos existentes; esta revisão não altera cálculo financeiro, baixa de estoque ou conclusão de produção.
- Perfis, grupo de acesso, vínculos empresariais, restrições e bloqueio no `User` ficam protegidos contra autoatribuição por usuários comuns. A gestão existente por administradores é preservada; administradores têm acesso global e devem atribuir os vínculos de usuários que ainda não os possuem.
- O desenho da assinatura reutiliza o componente existente e corrige as coordenadas para o tamanho real da tela, com suporte a toque. O formulário não aceita canvas vazio.
- No motorista, comprovantes capturados offline são persistidos no IndexedDB com seus arquivos e referenciados na fila existente, vinculados a usuário/grupo/empresa. O envio ocorre ao reconectar. Pendências têm retenção local de sete dias; registros antigos da fila sem usuário não são enviados em nome de outro usuário.
- A versão da entrega após iniciar a rota é repassada ao formulário, inclusive quando início e confirmação são sincronizados na mesma fila offline, evitando rejeição por versão desatualizada criada pelo próprio fluxo.

### Verificações e limites
- Compilação concluída. Verificação estática executada nos componentes alterados.
- Testes não destrutivos do endpoint: 400 para contexto ausente e 404 para entrega/empresa/grupo inexistentes. Nenhum pedido, estoque ou entrega real foi alterado para testar.
- Não houve homologação visual/E2E, teste real de upload, teste em dispositivo offline ou comprovação integral de concorrência. O bloqueio por versão é otimista, não uma transação atômica entre registros.
- O caminho comercial legado `ComprovanteEntregaDigital`, que também altera estoque e pedido, ainda precisa de consolidação cuidadosa com o fluxo proprietário; não foi substituído para evitar retirada ou duplicação desses efeitos. Portanto §27 não está integralmente homologado em todos os caminhos do ERP.

### Critério para continuar sem falsas declarações de 100%
1. §23: implementar saldos parciais por item e seus reflexos em separação, produção, entrega, faturamento e cobrança.
2. Consolidar o caminho comercial legado de comprovante com os efeitos operacionais existentes.
3. §4/§6: concluir telefonia/GoTo e bot/WhatsApp com provedores reais e configuração autorizada, sem simular conexão.
4. §47/§48: homologar fluxos e bloqueios no Testing Agent, incluindo arquivos privados, offline, concorrência, perfis e empresas diferentes.
5. Revisar o documento original completo para certificar cada requisito; o arquivo original não está disponível neste repositório nesta sessão. Só depois avaliar publicação desta revisão e nova análise de segurança.

**Situação: implantação parcial avançada, não 100%.** Requisitos sem evidência de execução permanecem pendentes, mesmo quando a interface compila.

---

## Atualização posterior — 11/11/2026 (segunda rodada)

O documento original `b03548fa1_ERP_ZUCCARO_COMERCIAL_360.docx` foi recebido e lido integralmente, incluindo as tabelas do mapa da tela e das 12 colunas que a extração de texto simples omitia. A auditoria, as correções e as pendências remanescentes estão em `RELATORIO_COMERCIAL_360_SEGUNDA_RODADA_11_11_2026.md`. As declarações anteriores de ✅ indicavam presença no código e não homologação; valem as pendências daquele relatório.
