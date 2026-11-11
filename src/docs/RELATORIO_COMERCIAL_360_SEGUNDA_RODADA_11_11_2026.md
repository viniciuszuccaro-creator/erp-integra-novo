# COMERCIAL 360° — SEGUNDA RODADA DE CONFRONTO COM A FONTE (11/11/2026)

Fonte lida nesta rodada: `b03548fa1_ERP_ZUCCARO_COMERCIAL_360.docx` (revisão 10/11/2026), texto integral e tabelas do documento. As tabelas são a origem do mapa da tela e da ordem das 12 colunas; a leitura apenas textual as omitia, e por isso as marcações anteriores não podiam certificar §2/§3.

Nenhum módulo, tela ou entidade nova foi criada. As alterações ocorreram em arquivos existentes da Central de Vendas 360°, do fechamento comercial e da fila de aprovações.

## Divergências encontradas e corrigidas

| Exigência | Antes | Agora |
|---|---|---|
| §2/§3 — 12 colunas na ordem literal (Nº Orçamento, Data, Cod Cliente, Nome Cliente, Origem, Nome Vendedor, Peso, Valor, Cidade, Condição Pagamento, Situação, Prazo) | Havia coluna Itens e não havia Cod Cliente | Colunas na ordem do dossiê, com Nº e Nome Cliente fixos; prazo separa entrega de validade |
| §2 — duas grades simultâneas (Corte e Dobra/Montagem e Materiais de Revenda) | Uma grade única com tipos misturados | Duas grades simultâneas, redimensionáveis, com totais por grupo; linha extraída para componente próprio |
| §2 — situação inicial "somente Orçamentos em Aberto" | Abria em "Todas" e misturava rascunhos de Pedido | Abre em Abertos, apenas orçamentos pendentes; pedidos rascunho continuam em Todas e na Lista completa |
| §3 — vencidos/encerrados/perdidos permanecem no histórico sem exclusão | Expirado e Rejeitado eram exibidos como Cancelados | Situações próprias: Vencidos/Encerrados, Finalizados/Convertidos, Entregues e Cancelados |
| §3/§5 — orçamento vencido não pode ficar intocável | Vencido continuava "aberto" | Vencido é sinalizado, permanece editável e o fechamento exige revalidação de validade no servidor |
| §2 — duplo clique abre edição em janela própria | Duplo clique em orçamento apenas selecionava | Abre a mesa em janela independente; pedido segue pelo formulário completo com a trava operacional |
| §4/§10.5 — abas do Cliente 360° conforme RBAC | Todos os atalhos apareciam | Atalhos e conteúdo filtrados por permissão de cada domínio, com variantes de chave de seção |
| §4/§10 — limite/crédito só com permissão financeira | Limite e crédito apareciam sempre no painel do cliente | Valores financeiros exigem permissão do Financeiro |
| §5 — rascunho com recuperação e aviso de sincronização | Alterações da mesa viviam só em memória | Rascunho local (IndexedDB existente), por usuário/grupo/empresa/registro, com aviso, recuperar ou descartar; bloqueia avanço enquanto pendente |
| §5 — Ajustar Pedido somente em Produção/Entrega/Retira | A trava existia na mesa, mas não no duplo clique, na lista nem no menu | Trava centralizada no manipulador de edição usado por mesa, lista e duplo clique |
| §5/§23 — fabricação não pode virar revenda | Conversão e importação reclassificavam fabricação | Conversão grava armado/corte em `itens_armado_padrao`; importação preserva o tipo e não reutiliza preço histórico sem preço oficial |
| §18 — segregação de funções | Solicitante podia aprovar a própria solicitação e a fila gravava direto no banco | Endpoint recusa autodecisão com auditoria de bloqueio, exige contexto e decisão única, e a fila passou a usar o endpoint |
| §18 — liberação aprovada precisa liberar o fechamento | Liberação aprovada era lida, mas o crédito/vencido continuava bloqueando | Liberação válida (mesmo cliente, mesmo valor, outro aprovador, não expirada) remove o bloqueio e fica registrada na checagem |
| §41 — crédito por empresa | Financeiro era agregado só por grupo | Limite utilizado e vencidos agregados por grupo **e** empresa |
| §41/§42 — evento não é fonte de verdade | Payload de evento podia criar pedido com dados do chamador; sem idempotência | Evento apenas identifica; o registro é relido, o tipo (OrcamentoCliente/OrcamentoSite) é resolvido, a conversão é idempotente, admin exigido e a conversão grava o vínculo |

## Verificações executadas

- `npm run build` concluído após as alterações.
- `npx eslint` nos diretórios comerciais alterados, sem erros.
- `npm run test:unit`: 218 aprovados, 0 falhas, 11 ignorados — inclui nova suíte pura da Central (classificação de situação, vencido editável, histórico separado, pedido misto, totalização, ordem literal das 12 colunas).
- `onOrcamentoConfirmed` testado sem dados reais: 400 para contexto ausente e identificadores inválidos, 404 para registro inexistente no contexto. Autodecisão e conflito de versão não foram exercitados com registros reais.
- `npm run typecheck` continua falhando em erros anteriores, fora dos arquivos desta rodada (`src/Layout.jsx`, `src/pages/Relatorios.jsx`, `src/api/base44Client.js`); nenhum erro apontou os arquivos alterados.

## Pendências reais (não concluídas)

1. **§47/§48 — homologação E2E/RBAC/multiempresa** no Testing Agent, com backend real: ABERTO→FECHADO, bloqueio financeiro, aprovação→fechado, produção→entrega/retira, entrega→entregue/rejeitada, pedido misto, faturamento e entrega parciais, cancelamento, reabertura, usuário sem permissão, empresa diferente, `empresa_id`/`group_id` maliciosos, desconto e preço não autorizados. Nada disso foi executado aqui.
2. **§23 — execução parcial por item**: a consulta de saldos oficiais foi integrada às duas grades nesta continuação (evidências abaixo). A cadeia de mutações separação → produção → entrega/retirada → faturamento → cobrança por item ainda não está integralmente implementada/homologada; esta consulta não a substitui.
3. **§6 — bot de vendas autônomo** com contador de exceções, autonomia por política e aprendizado supervisionado; **§4 — GoTo/telefonia** com provedor real. Ambos seguem sem provedor conectado.
4. **§5/§18 — autoridade de servidor nos demais caminhos**: duplicar e desmembrar passaram pelo servidor no lote registrado abaixo. Criar/editar pedido diretamente e abrir proposta pela criação legada ainda usam escrita do navegador com as regras existentes. A proteção desses caminhos não equivale a bloqueio global das APIs nem consolida automaticamente o conversor legado de eventos.
5. **§18 — alçadas completas** por categoria/nível e histórico imutável de contraproposta como registro próprio; a contraproposta é gravada na solicitação, mas a aplicação de limite continua no cadastro do cliente.
6. **§7 — comprovantes**: a consolidação com o caminho comercial legado (`ComprovanteEntregaDigital`, que também mexe em estoque/pedido) segue pendente e não foi substituída para não duplicar efeitos.
7. **§7 — documentos**: agendamento de envio, reimpressão de peças com alçada/segunda via e preferências por cliente ainda não estão implementados.
8. **§16/§17** — o motor de validação cobre as regras no servidor, mas não existe suíte automatizada com dados reais que comprove cada uma.
9. **Publicação e nova análise de segurança** não foram executadas; dependem do botão Publish e da página Security.

## Auditoria prévia desta continuação

Fonte: mesmo DOCX original reenviado pelo usuário, lido nesta sessão. O texto exige execução em lotes (§50) e proíbe certificar por compilação (§53).

- Reutilizar: CentralVendas360 → MesaNegociacao → ItensNegociacaoGrid/ItemNegociacaoLinha, onEntregaUpdated/comprovante.ts, Pedido, SeparacaoConferencia, OrdemProducao, EntregaItens, Entrega e PedidoEtapa.
- Lacuna verificada no código: não há consulta de EntregaItens nos fluxos comerciais; as grades mostram apenas quantidade pedida. quantidade_faturada existe nos três grupos de itens, mas não é exibida. Registros antigos podem não possuir identidade de item ou vínculos confiáveis.
- Escopo deste lote: consulta de saldos por item, calculada no servidor a partir das fontes proprietárias, sob demanda e com RBAC por domínio, integrada às duas grades existentes. Nenhuma movimentação de estoque, fechamento, pagamento ou entrega será executada por esta consulta.
- Não validados: execução real dos provedores, E2E, isolamento com usuários reais e cadeia de mutações parciais. O estoque ainda tem caminhos legados com baixa direta no navegador; sua consolidação exige lote próprio, não uma substituição silenciosa.

## Entrega desta continuação — consulta de saldos por item

### Arquivos e componentes
- Reutilizados/alterados: `ItensNegociacaoGrid.jsx`, `MesaNegociacao.jsx`, `negociacaoUtils.jsx`, `onEntregaUpdated/entry.ts`, `onEntregaUpdated/comprovante.ts` e a suíte existente `tests/unit/unit.test.mjs`.
- Extrações focadas, sem módulos/telas/entidades paralelos: `useSaldosItensPedido.jsx`, `SaldoItemNegociacao.jsx`, `onEntregaUpdated/saldos.ts` e `onEntregaUpdated/saldosCalculo.ts`.
- Nenhuma entidade, permissão, configuração compartilhada ou registro operacional foi migrado/alterado. Registros de auditoria foram criados pelas verificações de bloqueio do endpoint.

### Funcionamento implementado
- O botão **Saldos por item** expande as linhas nas duas grades existentes, sem painel permanente adicional. Consulta sob demanda; o cache inclui usuário, perfil, grupo, empresa, pedido e versão.
- O cálculo é no servidor. Fontes: `Pedido` (quantidade pedida e faturada), `SeparacaoConferencia` (separada/conferida), `OrdemProducao` (quantidades vinculadas em OPs prontas/concluídas) e `EntregaItens` + `Entrega` (entregue/retirada e saldo a atender). O saldo a faturar usa exclusivamente a quantidade faturada oficial do item.
- Mantém separados revenda, armado e corte/dobra; usa as referências legadas já geradas pelas etapas (`revenda-N`, `armado-N`, `corte-N`) ou IDs explícitos. Produto repetido sem referência única, unidade incompatível, OP com progresso somente em KG e entrega legada sem itens aparecem como **Sem vínculo verificável**, nunca como atendimento integral presumido.
- Quantidades acima do pedido são exibidas com divergência. Entregas canceladas não contam. Ausência de quantidade faturada não é tratada como zero automaticamente.
- Há estados de carregamento/erro, atualização manual e atualização por eventos das fontes autorizadas. Sem polling; em segundo plano os eventos apenas invalidam o cache sem refazer consultas.
- RBAC no servidor exige consulta em `Comercial/Pedido(s)`. Separação, Produção, Entregas e Fiscal são autorizados separadamente; fonte sem permissão não é consultada nem devolvida. Contexto exige IDs válidos, vínculo protegido do usuário, empresa no grupo e pedido no contexto. Restrição de carteira é aplicada.
- A interface não salva quantidades, não baixa estoque, não confirma pagamento e não conclui pedido/OP. Os vínculos ausentes continuam exigindo correção pelos módulos proprietários.

### Evidências e limitações
- Compilação concluída e ESLint sem erros nos componentes alterados.
- Testes unitários: **240 aprovados, 0 falhas, 11 ignorados**; 22 novas verificações de cálculo e autorização, incluindo paginação, pedido misto, atendimento parcial, campos fiscais restritos, contexto malicioso, outra empresa, vínculo ausente e carteira. São testes com fontes controladas, não E2E nem prova de isolamento da API inteira.
- Endpoint real `onEntregaUpdated`: **400** sem contexto, **404** para contexto/pedido inexistente e **200** em consulta somente leitura de um pedido existente com duas linhas de revenda. Nenhuma entrega, pedido, produto ou título foi alterado para teste.
- Typecheck global permanece com milhares de erros preexistentes de tipagem do projeto; não é aprovado. Os erros novos detectados nos componentes de saldo foram corrigidos. Erros preexistentes em Button e acesso tipado ao SDK permanecem fora deste lote.
- Não foram conectados provedores, publicadas alterações, executados testes de interface/E2E ou feita nova análise de segurança. Não há commit/PR criado nesta sessão.
- Próximo lote: consolidar confirmações legadas com movimentos oficiais idempotentes e escrita parcial por item; em seguida tratar faturamento/cobranças parciais, alçadas/documentos e integrações reais. As demais pendências numeradas acima continuam abertas.

## Continuação — conversão da Mesa com autoridade de servidor

### Lacuna atacada
A Mesa validava a proposta, mas o navegador criava o pedido e depois alterava o orçamento. Uma falha entre as duas gravações podia deixar pedido sem vínculo e o reenvio podia duplicá-lo. Esta continuação altera esse caminho, não a cadeia parcial por item inteira.

### Entrega integrada
- O formulário completo existente continua sendo usado. Na conversão, os atalhos que aprovavam/faturavam diretamente cedem lugar à confirmação de criação; os mesmos atalhos permanecem intactos nas demais utilizações do formulário.
- Preparação e confirmação passam pelo endpoint existente `onOrcamentoConfirmed`. O servidor exige RBAC de criação, contexto explícito, vínculo protegido, carteira, proposta aprovada, versão e conferência explícita; executa novamente a validação financeira/comercial ao confirmar.
- Itens, quantidades, preços e pagamento são conferidos contra a proposta aprovada. Totais são recalculados no servidor; revenda/fabricação e desconto individual são preservados. Alterações comerciais precisam voltar à negociação, não usar a conversão como atalho de aprovação.
- O formulário mostra totais nas convenções que os seus componentes já consomem (`valor_item` / `preco_venda_total`); antes esses valores faltavam na conversão e o cálculo do formulário podia zerar o total visual.
- Pedido nasce `Aguardando Aprovação`, com vínculo estável em `origem_externa_id`, sem baixa artificial de estoque, produção concluída, faturamento ou recebimento.
- Numeração da conversão é reservada por comparação atômica no cadastro existente da empresa, com checagem de colisão legada. Não deriva de registros parcialmente carregados nem de relógio do navegador. Lacunas na sequência por falhas são possíveis; números reservados não são reutilizados.
- Controle durável no orçamento usa reserva condicional por versão/token. Reenvio encontra o pedido existente; uma falha antes do POST permite retomada, e preparação interrompida pode ser reassumida após três minutos sem corrida com a execução anterior.
- Falha depois do POST exige conciliar pelo vínculo. Se não houver pedido verificável, a criação não é repetida automaticamente: o estado fica em revisão, exigindo conferência operacional. Isto é uma saga conservadora, não uma transação entre entidades.
- Auditorias da reserva, criação e vínculo incluem usuário, grupo, empresa e antes/depois. Os campos de controle `OrcamentoCliente.conversao_pedido` e `Empresa.sequencial_pedido_360` têm escrita protegida; as regras de acesso existentes das demais propriedades foram preservadas.
- Extrações de lógica ficam junto à função existente; nenhuma nova página, módulo de vendas ou entidade foi criada. A extração é a própria implementação do caminho de conversão, não um conversor paralelo exposto.

### Evidências e limites
- Suíte unitária: 278 aprovados, zero falhas, 11 ignorados; exercita o código de produção com fontes controladas para adulteração de cliente/contexto/preço/quantidade/desconto/pagamento, totalização, concorrência, numeração, resposta perdida, retomada, vínculo e bloqueios de autenticação/RBAC/financeiro. As fontes controladas foram extraídas para um auxiliar focado, evitando ampliar o arquivo principal acima de 600 linhas.
- Endpoint real: 400 para contexto ausente e 404 para proposta/empresa inexistentes. Nenhum pedido real foi criado para teste.
- Compilação e análise estática dos componentes alterados verificadas; não equivalem a E2E nem comprovam todos os gatilhos em ambiente real.
- A proteção é do caminho da Mesa. Criação/edição direta, duplicação/desmembramento, conversão por eventos, cadeia parcial operacional/fiscal/financeira, comprovante legado, alçadas/documentos, telefonia e bot continuam com as pendências já descritas.
- O DOCX original não está acessível no repositório desta sessão; a conferência final de cobertura exige sua disponibilização novamente. Os relatórios anteriores servem como histórico de pendências, não substituem a fonte.

## Continuação — duplicação e desmembramento com autoridade de servidor

### Escopo entregue
- Reutilizados `onOrcamentoConfirmed`, `useAcoesOrcamento`, `MesaNegociacao` e `DesmembrarDialog`. O mesmo diálogo confirma as duas ações, com conferência explícita e erro dentro da janela. Não há nova página, módulo, entidade ou provedor.
- O navegador envia somente ação, identificação/contexto, versão, seleção de posições e chave de operação. Itens, valores, cliente, condições e totais são relidos/recalculados no servidor; campos comerciais enviados à força são ignorados.
- Duplicar exige leitura e criação; desmembrar também exige edição. O endpoint verifica usuário bloqueado, perfil ativo, vínculos protegidos, empresa no grupo e carteira antes de elevar a escrita dos controles protegidos.
- Ambas criam proposta **Pendente**, preservando fabricação/revenda/serviço e descontos (inclusive legados), sem copiar aprovação, assinatura ou vínculo com pedido. Preços copiados continuam sujeitos à validação do fechamento.
- Desmembrar só atua em origem pendente e sem conversão. O destino é criado antes da remoção das linhas; os totais das duas propostas são recalculados. A origem só é liberada quando os vínculos terminam de ser conciliados.
- Controle durável no próprio orçamento: `preparando → criando → vinculada → concluida`, com `preparada` para retomada anterior ao POST e `revisao` para resultado incerto. A reserva e a transferência usam versão/token condicionais. Reenvio local, após recarregar ou após resposta perdida procura o destino existente; não há segundo POST quando uma criação pode já ter ocorrido.
- Alteração concorrente na origem ou no destino impede remoção/conciliação automática. Uma preparação interrompida antes do POST pode ser retomada após três minutos. Resultado incerto sem destino verificável permanece bloqueado para revisão operacional, sem repetição automática nem exclusão compensatória.
- A numeração reutiliza o reservador da empresa existente, agora parametrizado para pedidos/orçamentos, com contador protegido e checagem de número ocupado. A numeração da criação direta legada ainda não usa esse contador; portanto não há garantia global contra corrida com aquele caminho.
- Os novos controles de `OrcamentoCliente` e o sequencial de `Empresa` têm escrita protegida; as regras de acesso anteriores das outras propriedades foram preservadas. Auditorias incluem usuário, contexto e antes/depois; os vínculos condicionais possuem auditoria explícita porque operações em lote não disparam efeitos por registro.

### Evidências e limites
- Testes de produção com fontes controladas cobrem duplicação/desmembramento, conservação das linhas, tipos, desconto legado, sanitização, seleção maliciosa, contexto/empresa/carteira/RBAC, concorrência, numeração, resposta perdida, falha anterior ao POST e retomada após transferência. Não são E2E nem prova de isolamento de todas as APIs.
- Compilação e ESLint dos componentes alterados concluídos. Endpoint real retornou **400** para contexto ausente e **404** para registros inexistentes; nenhum orçamento/pedido real foi criado ou alterado para testes.
- Ainda pendentes: criação direta/edição de pedido, conversor legado por eventos, cadeia operacional/fiscal/financeira parcial, comprovante legado, alçadas/documentos, telefonia/bot e homologação E2E. O DOCX original continua necessário para conferir cobertura integral. Não foi feita publicação nem conectada integração.

## Situação

O núcleo visual e de fechamento exigido pelo dossiê está agora alinhado ao texto e às tabelas, compila e passa nas verificações estáticas e nos testes puros. **Não é possível declarar 100% de implantação** enquanto os itens 1 a 9 não forem executados e homologados com backend real. Nenhuma integração, plano ou crédito é presumido.
