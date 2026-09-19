# Plano de Melhoria Geral do ERP Zuccaro

Atualizado em: 2026-09-07 (diagnóstico de entrada em operação; histórico preservado abaixo)

## Diagnóstico para começar a operar — 2026-09-07

Base examinada: commit `91c6f6c3983162f1db464800544feb288ef96029` de `viniciuszuccaro-creator/erp-integra-novo`, branch `main`. Inventário: 25 arquivos em src/pages, 150 definições de entidades, 145 entry.ts de funções (incluindo bibliotecas) e um agente configurado em base44/agents. Quantidade de arquivos não comprova prontidão.

**Situação: entrada em produção ainda não homologada.** Há bloqueios concretos no código. A análise foi estática, acompanhada da execução dos scripts existentes; não houve acesso ao ambiente implantado, banco de produção, configuração dos provedores ou ERP antigo. Não foi executada emissão fiscal, pagamento, migração nem envio de mensagens. Não foi validado build nesta rodada. Nenhuma porcentagem de conclusão ou prazo é confiável antes da homologação dos fluxos.

A regra-mãe informada em 07/09/2026 prevalece sobre orientações históricas deste documento: melhorar o existente, preservar funcionalidades, contexto obrigatório de grupo e empresa, RBAC no servidor e na interface, sanitização, auditoria e responsividade. Extrações para refatorar arquivos grandes devem preservar os contratos existentes e não criar funcionalidades duplicadas.

### Bloqueios encontrados e critérios de aceite

| Prioridade | Evidência no código existente | Correção e prova exigida |
|---|---|---|
| P0 — identidade | src/api/base44Client.js: API key VITE no navegador; em modo API key, auth.me é substituído por usuário admin e isAuthenticated retorna true. | Autenticação individual real no ambiente operacional; credenciais privilegiadas exclusivamente no servidor; demonstrar login, logout, expiração e revogação com dois funcionários. O comportamento depende da configuração de implantação, ainda não verificada. |
| P0 — isolamento | base44/entities/Pedido.jsonc: RLS de leitura/escrita admite mesmo group_id ou admin; não exige vínculo com empresa nem permissão granular da ação. grupo/empresa não constam em required. | Reforçar as políticas existentes e todos os caminhos de CRUD, inclusive acesso direto à entidade. Usuário da empresa A não pode consultar/alterar pedido B do mesmo grupo; admin também deve operar em contexto explícito. |
| P0 — falhas de autorização | base44/functions/entityGuard/entry.ts: cooldown permite leitura; bypass admin retorna antes das demais validações. nfeActions captura erro do guard e continua. | Falha, timeout ou resposta incompleta da autorização deve negar a operação. Confirmar 401/403/indisponibilidade sem consulta privilegiada ou gravação. Refatorar entityGuard (528 linhas) antes de ampliar sua lógica. |
| P0 — fiscal | base44/functions/nfeActions/entry.ts: integração ausente/inativa retorna simulação e pode persistir NotaFiscal.status = Autorizada. Resposta real sem status também recebe default Autorizada. | Preservar simulação como ambiente explicitamente separado; nenhuma simulação pode atualizar documento operacional como autorizado. Só atribuir autorização após comprovação do provedor; validar empresa emissora, pedido e grupo no servidor. |
| P0 — dados expostos | Dois snapshots versionados em public: aproximadamente 1,1 MB e 14,1 MB. A estrutura inclui exportações de entidades. O repositório é público. | Classificar o conteúdo sem divulgar valores; verificar também o ZIP versionado e histórico. Se houver dados reais/segredos, conter a exposição e rotacionar credenciais afetadas. Definir distribuição protegida dos dados, preservando a capacidade de importação. Não foi feita limpeza destrutiva de histórico. |
| P0 — testes | tests/integration depende de import do cliente Vite em Node e encerrava com código 0 ao falhar; tests/e2e apenas verifica presença de arquivos e imprime checklists. | Não tratar validação incompleta como aprovação. A sinalização foi corrigida nesta rodada; ainda faltam testes autenticados de backend e execução real dos oito fluxos. |
| P0 — eventos | base44/functions/moduleEventBus/entry.ts permite contexto nulo e filtra poll/list só quando contexto é fornecido; buffer em memória e auditoria parcial não garantem reprocessamento durável. | Validar vínculo e permissão por evento, exigir grupo/empresa, persistir conteúdo necessário, idempotência e recuperação após reinício. Não aceitar duplicação de estoque/títulos por repetição de evento. |
| P1 — marketplace | base44/functions/marketplaceSync/entry.ts contém TODO de APIs reais e gera quantidade de pedidos com Math.random. | Completar o sincronizador existente com canal real, credenciais por empresa, estoque, pedidos, cancelamentos, paginação e prevenção de duplicatas. Provar um pedido real de teste por canal. |
| P1 — motorista | src/components/mobile/useEntregasMotorista.jsx usa fila localStorage única erp_zuccaro_fila_offline e sincroniza update de entrega. | Vincular fila a usuário/grupo/empresa; impedir execução após troca de identidade, validar motorista no backend e testar perda de rede, repetição, foto e assinatura. |
| P1 — IA/agentes | iaGenerativeContextual aceita contexto vazio e monta filtros opcionais. admin_assistant.jsonc é o único agente configurado encontrado; restrição de administrador consta nas instruções. | Impor permissão e contexto antes da recuperação de dados/ferramentas. Instruções textuais do agente não substituem autorização. Validar isolamento, custo, logs, recusa de ação não permitida e confirmação humana para ações sensíveis. |
| P1 — modo local | src/api/local-base44/functionsApi.js simula funções não reconhecidas e IA; e-mail/SMS retornam success sem enviar. Persistência usa localStorage. | Identificar simulação claramente nas telas e nos testes; operação compartilhada deve usar persistência central, identidade real e provedores efetivos. Não confundir demonstração com operação concluída. |

P0 significa bloqueio para entrada operacional segura. P1 é necessário para liberar o respectivo canal/fluxo; sua existência na interface não comprova implementação completa.

### Grupo e empresas: contrato a preservar

- Toda gravação deve carregar grupo e empresa operacional/origem explicitamente, validados pelo servidor. Mapear os nomes existentes group_id/empresa_id para groupId/empresaId nos limites, evitando campos divergentes e migração massiva sem necessidade.
- Cadastro compartilhado criado no grupo deve selecionar a empresa de origem e ficar disponível às empresas autorizadas do grupo. Não multiplicar o mesmo cadastro desnecessariamente.
- Operações de cada empresa alimentam a visão consolidada do grupo. Consolidação não duplica pedido, receita, estoque, título ou tributo em todas as empresas.
- Faturamento iniciado na visão do grupo exige escolha e autorização da empresa emissora. Nota, série, credencial e retorno pertencem à empresa responsável.
- Replicação e consolidação devem ter identificador de origem, prevenção de ciclos e repetição segura. Testar A → grupo e grupo → empresas, inclusive conflito de atualização.

### Sequência de execução no existente

1. **Fundação operacional:** resolver P0 de autenticação, RLS/RBAC, contexto, exposição de dados, auditoria, segurança e simulações fiscais; inventariar implantação, ambientes, integrações e automações realmente ativas.
2. **Primeiro piloto por empresa:** cadastros → pedido → aprovação → reserva/movimento de estoque → faturamento na empresa → retorno fiscal → título → recebimento → entrega. Ensaiar também reprovação, cancelamento, estorno, saldo insuficiente, falha do provedor e repetição da requisição.
3. **Demais áreas internas:** compras/recebimento, produção, contas a pagar, conciliação, fechamento, CRM, contratos, RH e relatórios. Validar totais entre módulos e consolidação por empresa/grupo.
4. **Logística e canais externos:** roteirizador → expedição → motorista → comprovante → financeiro; site/portal/marketplace → pedido → estoque → pagamento; chatbot/WhatsApp → atendimento → pedido → notificação. Reutilizar as páginas e funções existentes.
5. **IA transversal:** concluir as integrações existentes e o agente administrativo antes de ampliar capacidades. Consultas devem respeitar exatamente os acessos do usuário; sugestões explicáveis e ações sensíveis sujeitas a aprovação e auditoria.
6. **Migração e corte:** concluir o ensaio, conciliar saldos e treinar os responsáveis antes da operação definitiva. Preservar acesso ao legado para consulta e estratégia de retorno.

### Matriz mínima de homologação

| Frente | Prova para liberação |
|---|---|
| Acessos | Admin, gerente, vendedor, financeiro, estoquista e motorista; permitir e negar tela/aba/botão/campo/endpoint, inclusive chamadas diretas. Empresa A/B do mesmo grupo e grupo distinto. Revogação de acesso efetiva. |
| Comercial/estoque/fiscal | Um pedido percorre o fluxo inteiro; quantidades, valores e empresa permanecem consistentes; concorrência e retries não geram duplicatas; emissão testada em homologação do provedor. |
| Financeiro | Receber/pagar/baixar manualmente/conciliar/estornar exigem permissões distintas e validação dupla; títulos e caixa reconciliam com extrato e pedido. |
| Logística/motorista | Motorista vê somente entregas atribuídas e autorizadas; rota executável; offline e retomada não misturam usuários nem repetem conclusão. |
| Site/portal/marketplace | Catálogo, preço e estoque corretos; isolamento do cliente; token expirado/revogado bloqueado; pedido externo importado uma vez; webhooks autenticados. |
| Chatbot/IA | Provedor configurado, contexto autorizado, trilha auditável e encaminhamento humano; entrada maliciosa não amplia permissões nem revela outra empresa. |
| Auditoria/continuidade | Antes/depois, usuário, timestamp, grupo e empresa em ações relevantes; logs protegidos contra adulteração; backup restaurado e conferido em ambiente separado. |
| Layout | Verificação real em celular, tablet e desktop, modais e containers w-full/h-full, flex/grid/redimensionamento e abas fixas; nenhuma funcionalidade perdida. |

### Migração do ERP antigo e uso do Power Automate

Dependências pendentes: nome/versão do legado, formatos de exportação, volume, identificadores, anexos, disponibilidade de API e endereço do ERP novo implantado. Sem esses dados, não executar importação real.

1. Fazer inventário e backup do legado. Definir data de corte, responsáveis e quais sistemas recebem novas operações durante a transição.
2. Mapear campos e chaves antigas → entidades existentes. Preservar código externo, empresa, grupo e vínculo de origem; utilizar SyncMap/SyncReport e importadores existentes conforme sua implementação validada.
3. Importar em ensaio: grupo/empresas e parâmetros → usuários/perfis → clientes/fornecedores/produtos/unidades/tabelas → saldos de estoque → títulos abertos → pedidos/entregas pendentes → histórico/anexos.
4. Comparar contagens, duplicatas, documentos, unidades, estoque por local, contas a pagar/receber, saldos e vínculos. Não reemitir notas antigas nem disparar cobranças/notificações durante migração.
5. Reexecutar o mesmo lote e provar que não duplica registros. Registrar rejeitados, motivo, origem e correção, sem descartar silenciosamente.
6. Fazer carga incremental final, conciliação assinada pelos responsáveis e piloto com usuários reais. Manter backup restaurável e procedimento de retorno.

Power Automate pode transportar/exportar arquivos, orquestrar lotes e notificações de execução. Toda gravação deve passar pelo endpoint autorizado do ERP, com identidade de integração de privilégio mínimo, grupo/empresa, ID do lote, retries controlados e auditoria. Não usar Power Automate para contornar RBAC nem replicar diretamente lançamentos em todas as empresas. Conectores e disponibilidade do ambiente ainda não foram verificados.

### Trabalho coordenado no GitHub com Codex e Cursor

- Usar esta mesma regra-mãe e plano nos dois ambientes. Antes de alterar, localizar os arquivos e fluxos existentes e conferir alterações concorrentes.
- Uma correção delimitada por branch/PR; validar dependências antes de atuar em arquivos compartilhados de autenticação, guard, contexto e entidades. Integrar após revisão e evidência dos cenários positivos e negativos.
- Não interpretar presença de telas, declarações de conformidade, build ou checklist como prova de negócio funcionando.
- Mudança concluída exige: comportamento preservado, evidência de testes, RBAC/empresa/auditoria nos pontos afetados, impacto sobre dados e implantação documentado. Refatorar módulos grandes por extração com compatibilidade.

### Entrega desta rodada

Foram melhorados somente os três scripts existentes de testes e este plano; nenhuma tela, entidade ou função de negócio foi criada/removida. Os scripts passam a informar validação incompleta (exit code 2) quando integração não executa ou E2E só confere arquivos; falhas continuam com código 1. O orquestrador usa o mesmo Node em execução e trata falha de inicialização de processo. Essa melhoria não resolve os bloqueios de produção listados acima. Alterações locais, sem push/deploy.

## Histórico do plano (preservado)

Este plano organiza o que deve ser feito para melhorar o ERP Zuccaro respeitando a regra-mae: melhorar o existente, nao duplicar, nao apagar funcionalidades, perguntar antes de incluir ou excluir, manter multiempresa, RBAC, seguranca e auditoria.

## Objetivo central

Transformar o ERP em um sistema mais seguro, ramificado por grupo/empresa, auditavel, consistente e funcional em todos os setores, usando `Cadastros Gerais` como base estrutural para dados, relatorios, permissoes e configuracoes.

## Ordem obrigatoria de trabalho

1. Diagnosticar o que ja existe.
2. Verificar duplicidades.
3. Melhorar somente o existente.
4. Perguntar antes de criar ou excluir.
5. Corrigir persistencia e funcionamento.
6. Aplicar multiempresa.
7. Aplicar RBAC.
8. Aplicar seguranca e auditoria.
9. Validar no fluxo real.
10. Registrar o que foi feito.

## Fase 1 - Base de dados local, snapshot e contexto

Objetivo: garantir que o sistema use apenas os dados corretos do `GRUPO CPA`, `CPA FERRO E ACO` e `3Z LTDA`.

Tarefas:

1. Confirmar que existe somente um grupo ativo: `GRUPO CPA`.
2. Confirmar que existem somente duas empresas ativas:
   - `CPA FERRO E ACO`
   - `3Z LTDA`
3. Remover ou consolidar placeholders locais quando o snapshot real ja existir:
   - `GRUPO CPA LOCAL`
   - `3Z LTDA LOCAL`
   - `CPA FERRO E ACO LOCAL`
4. Revisar `localBase44Client.js` para garantir que:
   - todo registro tenha `grupo_id` quando aplicavel;
   - todo registro operacional tenha `empresa_id` quando aplicavel;
   - registros feitos no grupo alimentem as empresas quando a entidade exigir;
   - registros feitos nas empresas alimentem a visao consolidada do grupo.
5. Validar reset local:
   - `http://localhost:5173/?reset-local=1`
6. Conferir se os Cadastros Gerais aparecem com dados do snapshot.

Resultado esperado:

- O usuario ve apenas `GRUPO CPA`.
- O usuario ve apenas `CPA FERRO E ACO` e `3Z LTDA`.
- Nenhum cadastro relevante fica sem grupo/empresa quando deveria ter.

## Fase 2 - Administracao do Sistema

Objetivo: melhorar a area que sustenta seguranca, acessos, configuracoes e governanca.

Tarefas:

1. Mapear todos os arquivos existentes de `AdministracaoSistema`.
2. Mapear abas existentes:
   - Gestao de Acessos
   - Configuracoes Gerais
   - Seguranca
   - Auditoria
   - Integracoes
   - Apps externos
   - Parametros
3. Verificar botoes, toggles, checkboxes, selects e formularios.
4. Para cada controle:
   - confirmar se aparece corretamente;
   - confirmar se salva;
   - confirmar se recarrega com valor salvo;
   - confirmar se respeita grupo/empresa;
   - confirmar se exige permissao;
   - confirmar se gera auditoria quando sensivel.
5. Consolidar configuracoes duplicadas.
6. Melhorar textos, organizacao visual e responsividade sem alterar fluxo.

Resultado esperado:

- Administracao do Sistema vira a central confiavel de configuracoes, acessos, seguranca e auditoria.

## Fase 3 - Gestao de Acessos e RBAC granular

Objetivo: controlar acesso por modulo, submodulo, aba, acao, grupo e empresa.

Tarefas:

1. Mapear o modelo atual de usuarios, perfis e permissoes.
2. Identificar onde ja existe `usePermissions`, `ProtectedAction`, `ProtectedSection` e similares.
3. Criar uma matriz de permissoes usando o que ja existe.
4. Padronizar permissoes por chave granular:
   - `administracao.acessos.visualizar`
   - `administracao.acessos.editar`
   - `administracao.configuracoes.alterar`
   - `cadastros.empresa.criar`
   - `cadastros.empresa.editar`
   - `cadastros.grupo.editar`
   - `comercial.pedido.aprovar`
   - `financeiro.caixa.baixa-manual`
   - `fiscal.nota.emitir`
5. Aplicar permissao em:
   - menus;
   - abas;
   - botoes;
   - campos editaveis;
   - acoes sensiveis;
   - funcoes da API local.
6. Bloquear no frontend e tambem na API/local client.
7. Auditar mudancas de permissao.

Resultado esperado:

- Cada usuario ve e executa somente o que tem permissao.
- O bloqueio visual nao e a unica seguranca; a acao tambem e bloqueada na execucao.

## Fase 4 - Seguranca obrigatoria

Objetivo: reduzir riscos de entrada invalida, XSS, acao indevida e alteracao sensivel sem validacao.

Tarefas:

1. Localizar sanitizadores existentes, como `sanitizeOnWrite.ts` ou equivalente.
2. Aplicar sanitizacao nas escritas de entidades.
3. Validar dados antes de salvar:
   - campos obrigatorios;
   - CNPJ/CPF;
   - email;
   - telefone;
   - valores monetarios;
   - datas;
   - IDs de grupo e empresa.
4. Proteger acoes sensiveis:
   - alterar perfil;
   - alterar permissao;
   - excluir/inativar registro;
   - emitir nota;
   - baixar financeiro;
   - alterar configuracao de seguranca;
   - alterar integracao.
5. Exigir confirmacao ou dupla validacao quando necessario.
6. Gerar alerta de seguranca para evento critico.

Resultado esperado:

- Escritas mais seguras.
- Acoes sensiveis rastreadas e protegidas.

## Fase 5 - Auditoria completa

Objetivo: toda acao relevante deve deixar rastro claro.

Tarefas:

1. Mapear `AuditLog`, `auditEntityEvents.ts`, `securityAlerts.ts` e equivalentes.
2. Padronizar evento de auditoria com:
   - usuario;
   - data/hora;
   - modulo;
   - entidade;
   - acao;
   - antes;
   - depois;
   - grupo;
   - empresa;
   - origem da tela.
3. Aplicar auditoria em:
   - criar;
   - editar;
   - aprovar;
   - inativar;
   - excluir;
   - emitir;
   - baixar;
   - alterar permissao;
   - alterar configuracao.
4. Mostrar historico nas telas onde fizer sentido.

Resultado esperado:

- Qualquer alteracao importante pode ser rastreada.

## Fase 6 - Cadastros Gerais como base do ERP

Objetivo: garantir que Cadastros Gerais alimente todos os setores e relatorios.

Tarefas:

1. Revisar blocos de Cadastros Gerais:
   - Pessoas e Parceiros
   - Produtos e Servicos
   - Financeiro e Fiscal
   - Logistica
   - Organizacional
   - Tecnologia
2. Verificar entidades duplicadas ou similares.
3. Confirmar campos obrigatorios para relatorios.
4. Garantir que cada entidade tenha grupo/empresa quando necessario.
5. Garantir que cadastros compartilhados no grupo fiquem disponiveis nas empresas.
6. Garantir que cadastros de empresa aparecam no consolidado do grupo.
7. Corrigir contadores, filtros e buscas.
8. Verificar formularios e listas.

Resultado esperado:

- Cadastros Gerais vira a fonte confiavel dos dados usados por todos os setores.

## Fase 7 - Ramificacao grupo e empresas

Objetivo: consolidar a regra operacional entre `GRUPO CPA`, `CPA FERRO E ACO` e `3Z LTDA`.

Regras:

1. O grupo consolida tudo.
2. As empresas operam individualmente.
3. Cadastro feito no grupo deve poder ser usado pelas empresas quando for cadastro compartilhado.
4. Cadastro feito na empresa deve aparecer na visao do grupo.
5. Operacao fiscal sempre deve sair pela empresa, mesmo se iniciada no grupo.
6. Relatorio no grupo deve consolidar empresas.
7. Relatorio na empresa deve mostrar apenas a empresa.

Tarefas:

1. Revisar filtros por contexto.
2. Revisar `useContextoVisual`, `useContextoGrupoEmpresa` e componentes relacionados.
3. Padronizar escrita de `grupo_id`, `group_id`, `empresa_id`, `empresa_atual_id`.
4. Corrigir telas que listam tudo sem respeitar contexto.
5. Corrigir telas que escondem dados compartilhados do grupo indevidamente.

Resultado esperado:

- O usuario entende onde esta operando: grupo ou empresa.
- O dado aparece no lugar certo sem duplicar.

## Fase 8 - Setores do sistema

Objetivo: revisar cada setor para melhorar funcionamento, seguranca, permissao e relatorios.

Setores a revisar:

1. Comercial
2. Financeiro
3. Fiscal
4. Estoque
5. Logistica
6. Producao
7. Compras
8. CRM
9. Atendimento
10. RH
11. Contratos
12. Relatorios
13. Dashboard
14. Integracoes
15. IA e automacoes

Para cada setor:

1. Mapear telas existentes.
2. Mapear botoes/toggles/selects.
3. Verificar se cada acao funciona.
4. Verificar duplicidades.
5. Aplicar contexto grupo/empresa.
6. Aplicar RBAC.
7. Aplicar auditoria.
8. Validar relatorios.
9. Melhorar layout mantendo fluxo.

Resultado esperado:

- Cada setor funciona de ponta a ponta e conversa com Cadastros Gerais, grupo/empresa, RBAC e auditoria.

## Fase 9 - Relatorios e dashboards

Objetivo: tornar relatorios confiaveis por grupo e empresa.

Tarefas:

1. Listar todos os relatorios existentes.
2. Verificar fonte de dados de cada relatorio.
3. Garantir filtros:
   - grupo;
   - empresa;
   - periodo;
   - status;
   - entidade relacionada.
4. Validar consolidado do grupo.
5. Validar individual por empresa.
6. Garantir que dados venham dos Cadastros Gerais quando necessario.
7. Corrigir exportacoes.
8. Auditar geracao/exportacao quando sensivel.

Resultado esperado:

- Relatorios confiaveis para decisao gerencial.

## Fase 10 - UX, layout e responsividade

Objetivo: melhorar uso diario sem quebrar padrao visual.

Tarefas:

1. Garantir `w-full` e `h-full` em telas, paginas e containers principais.
2. Corrigir telas cortadas ou com overflow ruim.
3. Melhorar modais grandes.
4. Garantir funcionamento em celular, tablet e desktop.
5. Padronizar botoes e icones.
6. Nao criar landing page.
7. Nao criar cards dentro de cards.
8. Manter abas fixas.
9. Evitar texto quebrando layout.

Resultado esperado:

- Sistema mais limpo, responsivo e facil de usar.

## Fase 11 - Duplicidades

Objetivo: evitar que o ERP cresca com telas, funcoes e componentes repetidos.

Tarefas:

1. Procurar entidades/telas/componentes com nomes parecidos.
2. Comparar proposito antes de alterar.
3. Se houver duplicidade:
   - nao excluir automaticamente;
   - documentar;
   - perguntar;
   - consolidar no existente aprovado.
4. Dar prioridade ao componente mais usado e mais integrado.
5. Migrar comportamento sem perder funcionalidade.

Resultado esperado:

- Menos repeticao, mais manutencao, menos erro.

## Fase 12 - Validacao final continua

Objetivo: cada melhoria deve ser validada antes de seguir.

Checklist por alteracao:

1. A tela abre.
2. O fluxo antigo continua funcionando.
3. Nao criou duplicidade.
4. Grupo/empresa estao corretos.
5. Permissao funciona.
6. Botao/toggle/select salva e recarrega.
7. Auditoria e gerada quando necessario.
8. Build passa.
9. O usuario aprovou inclusao ou exclusao, se houver.

## Primeira frente recomendada para executar agora

Comecar por:

`Administracao do Sistema > Gestao de Acessos`

Motivo:

Essa area controla usuarios, perfis, permissoes, seguranca, configuracoes e governanca. Sem ela consolidada, os outros setores continuam sem base segura.

Primeiro pacote de trabalho:

1. Mapear arquivos existentes de Gestao de Acessos.
2. Mapear permissoes atuais.
3. Verificar toggles/botoes/checkboxes da tela.
4. Corrigir persistencia real.
5. Aplicar grupo/empresa.
6. Aplicar auditoria.
7. Aplicar RBAC visual e funcional.
8. Confirmar duplicidades antes de qualquer criacao/exclusao.

