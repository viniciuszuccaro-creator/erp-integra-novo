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
2. **§23 — saldos parciais por item**: as entidades existem (`Pedido.quantidade_faturada`, `EntregaItens`, `PedidoEtapa`), mas a cadeia separação → produção → entrega → faturamento → cobrança por item não foi comprovada nem alterada nesta rodada. A tela também não exibe saldo por item.
3. **§6 — bot de vendas autônomo** com contador de exceções, autonomia por política e aprendizado supervisionado; **§4 — GoTo/telefonia** com provedor real. Ambos seguem sem provedor conectado.
4. **§5/§18 — autoridade de servidor nos demais caminhos**: duplicar, desmembrar, criar/editar pedido e a criação direta de pedido a partir do orçamento ainda usam escrita do navegador com as regras de acesso existentes. O endpoint cobre salvar/fechar/validar; não é bloqueio global de todas as APIs.
5. **§18 — alçadas completas** por categoria/nível e histórico imutável de contraproposta como registro próprio; a contraproposta é gravada na solicitação, mas a aplicação de limite continua no cadastro do cliente.
6. **§7 — comprovantes**: a consolidação com o caminho comercial legado (`ComprovanteEntregaDigital`, que também mexe em estoque/pedido) segue pendente e não foi substituída para não duplicar efeitos.
7. **§7 — documentos**: agendamento de envio, reimpressão de peças com alçada/segunda via e preferências por cliente ainda não estão implementados.
8. **§16/§17** — o motor de validação cobre as regras no servidor, mas não existe suíte automatizada com dados reais que comprove cada uma.
9. **Publicação e nova análise de segurança** não foram executadas; dependem do botão Publish e da página Security.

## Situação

O núcleo visual e de fechamento exigido pelo dossiê está agora alinhado ao texto e às tabelas, compila e passa nas verificações estáticas e nos testes puros. **Não é possível declarar 100% de implantação** enquanto os itens 1 a 9 não forem executados e homologados com backend real. Nenhuma integração, plano ou crédito é presumido.
