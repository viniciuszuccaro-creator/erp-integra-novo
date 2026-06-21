# AUDITORIA P1 — CHECKUP GERAL ERP ZUCCARO
**Data:** 21/06/2026 | **Status:** Execução Iniciada | **Responsável:** Base44 AI

---

## SEÇÃO 1 — MAPEAMENTO DE MÓDULOS EXISTENTES

### 1.1 Módulos Principais (Navegação Primária)
| Módulo | Arquivo | Status | Linhas | Observações |
|--------|---------|--------|--------|-------------|
| Dashboard | `pages/Dashboard.jsx` | ✅ Ativo | ~500+ | Hub de KPIs; distribuído em componentes |
| Relatórios | `pages/Relatorios.jsx` | ✅ Ativo | ~1000+ | **GRANDE** — precisa refatoração |
| Agenda | `pages/Agenda.jsx` | ✅ Ativo | ~100 | Refatorado em 7 componentes (P4) |
| CRM | `pages/CRM.jsx` | ✅ Ativo | ~400 | Funcional; integrado com Oportunidade/Campanha/Interacao |
| Cadastros | `pages/Cadastros.jsx` | ✅ Ativo | ~600+ | **GRANDE** — contém VisualizadorUniversalEntidadeV24 (1000+) |
| Comercial | `pages/Comercial.jsx` | ✅ Ativo | ~800+ | **MUITO GRANDE** — Pedidos, Clientes, Notas Fiscais em único arquivo |
| Estoque | `pages/Estoque.jsx` | ✅ Ativo | ~600+ | **GRANDE** — Produtos, Movimentação, Inventário juntos |
| Compras | `pages/Compras.jsx` | ✅ Ativo | ~500+ | Fornecedores, OC, Cotações; refatoração recomendada |
| Expedição | `pages/Expedicao.jsx` | ✅ Ativo | ~700+ | **GRANDE** — Entregas, Rotas, Logística; merece breakdown |
| Produção | `pages/Producao.jsx` | ✅ Ativo | ~700+ | **GRANDE** — OP, Apontamento, Controle; consolidação pesada |
| Financeiro | `pages/Financeiro.jsx` | ✅ Ativo | ~900+ | **MUITO GRANDE** — Contas Pagar/Receber, Caixa, Conciliação; split crítico |
| RH | `pages/RH.jsx` | ✅ Ativo | ~500+ | Colaboradores, Férias, Ponto; moderado |
| Fiscal | `pages/Fiscal.jsx` | ✅ Ativo | ~600+ | **GRANDE** — NFe, XML, SPED, Impostos; refatoração indicada |
| Contratos | `pages/Contratos.jsx` | ✅ Ativo | ~500+ | Moderado; refatorado em diálogos (P4) |
| Hub Atendimento | `pages/HubAtendimento.jsx` | ✅ Ativo | ~400 | Chatbot, Chamados integrados |
| Administração | `pages/AdministracaoSistema.jsx` | ✅ Ativo | ~800+ | **GRANDE** — Acessos, Configurações, Propagação; consolidação pesada |

### 1.2 Páginas Secundárias/Especializadas
| Página | Arquivo | Status | Observações |
|--------|---------|--------|-------------|
| Home | `pages/Home.jsx` | ⚠️ Backup | Raramente usada (Dashboard é mainPage) |
| Documentação | `pages/Documentacao.jsx` | ⚠️ Backup | Página estática |
| Portal Cliente | `pages/PortalCliente.jsx` | ⚠️ Externo | Público; não integrado ao ERP principal |
| Orçamento Site | `pages/OrcamentoSite.jsx` | ⚠️ Externo | Integração B2B; isolado |
| Entregas Mobile | `pages/EntregasMobile.jsx` | ⚠️ Mobile | Replicação de Expedição para mobile |
| Produção Mobile | `pages/ProducaoMobile.jsx` | ⚠️ Mobile | Replicação de Produção para mobile |
| Config. Usuário | `pages/ConfiguracoesUsuario.jsx` | ✅ Ativo | Perfil do usuário; pequeno |
| EmpresaOnboarding | `pages/EmpresaOnboarding.jsx` | ✅ Ativo | Wizard de setup; integrado |

---

## SEÇÃO 2 — ARQUIVOS GRANDES (>400–600 LINHAS)

### 2.1 Críticos para Refatoração (≥800 linhas)
| Arquivo | Linhas | Módulo | Ação Recomendada |
|---------|--------|--------|------------------|
| `pages/Financeiro.jsx` | ~900+ | Financeiro | **SPLIT CRÍTICO**: ContasPagar → Tab isolada + forms + dialogs; ContasReceber → idem; Caixa → dashboard independente |
| `pages/Comercial.jsx` | ~800+ | Comercial | **REFATORAR**: Pedidos (forms, tabelas, validação) → componente; Clientes → Bloco1Pessoas + tabs separadas; Notas Fiscais → módulo isolado |
| `pages/AdministracaoSistema.jsx` | ~800+ | Sistema | **REFATORAR**: Acessos/Perfis → GestaoAcessosIndex; Configurações → ConfiguracoesGeraisIndex; Propagação → PropagacaoIndex; deixar apenas dispatcher |
| `components/cadastros/VisualizadorUniversalEntidadeV24.jsx` | ~1000+ | Cadastros | **REFATORAR OBRIGATÓRIO**: Body, Toolbar, Modal, Query em arquivos separados (4-5 componentes de ~200 linhas cada) |
| `pages/Relatorios.jsx` | ~1000+ | Relatórios | **SPLIT URGENTE**: Cada relatório (DRE, Financeiro, Estoque, Vendas) → componente próprio; consolidar em index |

### 2.2 Moderados para Monitoramento (600–800 linhas)
| Arquivo | Linhas | Módulo | Ação |
|---------|--------|--------|------|
| `pages/Estoque.jsx` | ~650 | Estoque | Quebrar MovimentacoesTab, RecebimentoTab em componentes; manter index |
| `pages/Compras.jsx` | ~600 | Compras | Extrair OCSelecionadasBar, OCTabela em componentes dedicados |
| `pages/Producao.jsx` | ~700 | Produção | Separar ApontamentoProducao, KanbanProducaoInteligente em windows (não abas fixas) |
| `pages/Expedicao.jsx` | ~700 | Expedição | Usar painel-logistico com componentes isolados; manter estrutura modular |
| `pages/Fiscal.jsx` | ~600 | Fiscal | Extrair ImportarXMLNFe, MotorFiscalInteligente em componentes puros |
| `pages/Cadastros.jsx` | ~600+ | Cadastros | Manter VisualizadorUniversalEntidadeV24 isolado; adicionar blocos (Pessoas, Produtos, Financeiro, Logística, Organizacional) |
| `pages/AdministracaoSistema.jsx` | ~800 | Sistema | Separar em 3 índices (Acessos, Config, Propagação) com dispatcher |

---

## SEÇÃO 3 — TELAS DUPLICADAS OU PROPÓSITO SIMILAR

### 3.1 Duplicatas Confirmadas
| Tela 1 | Tela 2 | Tipo | Ação | Status |
|--------|--------|------|------|--------|
| `pages/Dashboard.jsx` | `pages/Home.jsx` | Substituição | Remover Home; Dashboard é mainPage | ✅ Já consolidado |
| `pages/Producao.jsx` | `pages/ProducaoMobile.jsx` | Mobile | Usar responsive design único; remover Mobile | ⏳ Pendente P4 |
| `pages/Expedicao.jsx` | `pages/EntregasMobile.jsx` | Mobile | Usar responsive design único; remover Mobile | ⏳ Pendente P4 |
| `pages/Contratos.jsx` | `components/contratos/ContratoViewDialog` | Modal vs Page | Consolidar em página única com modal para detalhes | ⏳ Pendente P4 |

### 3.2 Módulos com Redundância Interna
| Módulo | Redundância | Recomendação |
|--------|-------------|--------------|
| **Comercial** | Clientes em CRM + Comercial (abas diferentes) | Unificar: CRM.Cliente vê oportunidades; Comercial.Cliente vê pedidos — mesma entidade, contextos diferentes |
| **Estoque** | Produtos em Cadastros + Estoque (visões diferentes) | Manter separação: Cadastros = formulário CRUD; Estoque = visualização de quantidades e movimentações |
| **Financeiro** | ContaPagar tab + modal de baixa duplicados | Consolidar em único fluxo: abrir modal de registro de pagamento dentro da tab |
| **Agenda** | Evento em Agenda + Modal em Comercial (integração de agendamentos) | Manter integração; Agenda é principal; Comercial abre Agenda ao clicar |

---

## SEÇÃO 4 — BOTÕES, TOGGLES, CHECKBOXES, ABAS SEM FUNCIONAMENTO

### 4.1 Problemas Identificados

#### ⚠️ Financeiro
- **"Gerar Link Pagamento"** (ContasReceber) — função `GeradorLinkPagamento.jsx` existe mas não está wired em botão da tabela
- **"Simular Pagamento"** — modal existe (`SimularPagamentoModal`) mas disparador faltando em header
- **Toggle: "Sincronizar com Grupo"** (ContaPagar) — UI existe, lógica de sincronização incompleta
- **Checkbox: "Duplicidade Detectada"** (ContaPagar detail) — campo readonly; detecção IA não dispara automaticamente

#### ⚠️ Estoque
- **"Ajustar Inventário"** button — backend exists (`applyInventoryAdjustments`) mas frontend form não valida antes de submit
- **"Gerar Movimentação"** toggle — UI presente mas não persiste preferência do usuário

#### ⚠️ Produção
- **"Enviar para Produção"** button (Comercial → Produção) — workflow existe mas falta feedback visual de sucesso
- **Kanban drag-drop** — UI pronta mas automatização de status não funciona em tempo real

#### ⚠️ Comercial
- **"Aprovar Desconto"** button — RBAC validado mas falta notificação de aprovação ao vendedor
- **"Validar Crédito"** toggle — backend call existe mas timeout em 3s; sem retry

#### ⚠️ CRM
- **"Converter Oportunidade"** → **Pedido** button — fluxo existe mas dados não copiam corretamente (cliente, itens)
- **Score do Lead** (sidebar) — cálculo executa mas nunca atualiza na UI (subscribe faltando)

#### ⚠️ Compras
- **"Gerar OC"** (SolicitacaoCompra) — function exists mas não marca solicitação como "Compra Gerada"
- **Cotações**: aba de comparação não ordena fornecedores por preço

#### ⚠️ Administração
- **Toggle: "Propagação Automática"** (Grupo ↔ Empresa) — existe mas não dispara `propagateGroupConfigs` ao mudar
- **"Validar RBAC"** — teste exists mas resultado não persiste como auditoria

### 4.2 Ações Recomendadas
- [ ] Mapear cada botão/toggle desconectado em **issue** separado
- [ ] Conectar UI → backend com test (`test_backend_function`)
- [ ] Adicionar feedback visual (toast, skeleton, disable state)
- [ ] Garantir RBAC + auditoria para cada ação

---

## SEÇÃO 5 — DASHBOARDS COM EXCESSO DE INFORMAÇÃO

### 5.1 Dashboards Pesados (≥10 KPIs visíveis + múltiplas abas)

#### 📊 Dashboard Principal
- **Problema:** 15+ cards de KPIs sem priorização; abas de Resumo, Operacional, Financeiro, IA Insights, etc.
- **Informação:** Muita redundância entre abas (vendas aparecem em Resumo, Operacional e IA Insights)
- **Impacto:** Carregar 20+ queries ao abrir; UI poluída
- **Solução:** 
  - Manter **4–6 KPIs essenciais** na aba Resumo (faturamento, margem, entregas, inadimplência, estoque crítico, fluxo de caixa)
  - Outras abas específicas (Operacional, Financeiro) com drill-down
  - Usar lazy loading para IA Insights e secondary metrics

#### 📊 Financeiro
- **Problema:** Contas Pagar + Receber + Caixa + Conciliação em 4 abas com redundância
- **Informação duplicada:** Saldos aparecem em Resumo e em cada tab
- **Solução:**
  - Aba Resumo: FluxoCaixa 7d, Total Receber, Total Pagar, Saldo
  - Abas específicas (Pagar, Receber, Caixa, Conciliação) com tabelas detalhadas
  - Remover cards redundantes de cada tab

#### 📊 Comercial
- **Problema:** Clientes, Pedidos, Notas Fiscais, Comissões em 4 abas grandes; cada uma tem ~200+ registros visíveis
- **Informação:** Gráficos de funil, score do cliente, histórico tudo junto
- **Solução:**
  - Tabelas com paginação + filtros
  - Expandir linha para detalhes, não carregar tudo de uma vez
  - Mover Funil para aba específica (menos frequente)

#### 📊 Estoque
- **Problema:** Produtos, Movimentação, Inventário, Requisições, Transferências em 5 abas
- **Informação:** Cada tab carrega 300+ produtos; busca sem índice
- **Solução:**
  - Implementar busca/filtro eficiente
  - Lazy load de linhas (100 por vez)
  - Mover Transferências para janela modal

#### 📊 Produção
- **Problema:** OP, Apontamento, Refugo, Dashboard 3D, Controle de Equipamentos (5+ abas)
- **Informação:** Dashboard em tempo real mas muito pesado (WebSocket + 3D rendering)
- **Solução:**
  - Dashboard 3D → janela modal (window manager)
  - Apontamento → form simples, não tab
  - Manter apenas OP list + Refugo na navegação principal

#### 📊 Administração
- **Problema:** Acessos, Configurações, Propagação, Status, Integridade em 5+ abas; checkup com 100+ items
- **Informação:** Sem paginação; scroll infinito quebrado
- **Solução:**
  - Separar em 3 páginas: Acessos (GestaoAcessos), Config (ConfiguracoesGerais), Propagação (PropagacaoIndex)
  - Usar lazy load + paginação em tabelas grandes
  - Status/Integridade como widgets (cards resumo)

### 5.2 Simplificação Proposta — KPIs Essenciais por Módulo

| Módulo | KPIs Essenciais (máx 6) | Secundários (em drill-down) |
|--------|------------------------|----------------------------|
| Dashboard | Faturamento 30d, Margem %, Entregas OK %, Inadimplência, Estoque Crítico, Fluxo Caixa | Detalhes por região, produto, vendedor |
| Financeiro | Saldo Caixa, Receber Vencido, Pagar Vencido, Conciliado %, Fluxo 30d | Detalhes bancários, histórico movimentos |
| Comercial | Vendas 30d, Margem, Ticket Médio, Clientes Ativos, Funil Conversão | Detalhes cliente, histórico pedidos |
| Estoque | Total Itens, Críticos, Em Falta, Obsoletos, Valor Total, Cobertura | Por categoria, localização, fornecedor |
| Produção | OP Abertas, Refugo %, Eficiência, Throughput, Capacidade Utilizada | Por máquina, turno, operador |
| Compras | Compras 30d, Lead Time Médio, Desvios, Fornecedores Ativos, Taxa Rejeição | Por fornecedor, categoria, prazo |
| RH | Colaboradores Ativos, Absenteísmo %, Folha Atual, Férias Acumuladas | Detalhes por departamento |
| Fiscal | NF Emitidas 30d, Impostos Acumulados, Status Validação, Retificações | Detalhes por tipo, série, período |

---

## SEÇÃO 6 — COMPONENTES REFATORADOS (JÁ EXECUTADOS)

✅ **Agenda** — Refatorado em 7 componentes (P4):
- `AgendaCalendarioView.jsx`
- `AgendaListaView.jsx`
- `AgendaFormDialog.jsx`
- `AgendaToolbar.jsx`
- `EventoForm.jsx`
- `AgendaCalendario.jsx`
- `AgendaPainelLateral.jsx`

✅ **Contratos** — Refatorado em diálogos (P4):
- `ContratoViewDialog.jsx` (detalhes + histórico)
- `ContratoHistoryDialog.jsx`
- `ContratoForm.jsx`

✅ **Financeiro (Pagar)** — Parcialmente refatorado:
- `ContasPagarTab.jsx` (340 linhas)
- `BaixaContaPagarDialog.jsx` (extração)
- `TabelaPagar.jsx`

---

## SEÇÃO 7 — RECOMENDAÇÕES PRIORITÁRIAS PARA P2–P5

### P2 — Multiempresa Validação
- [ ] Audit: Todas entidades têm `groupId` e `empresaId`?
- [ ] Propagação: Quando ContaPagar.baixa no Grupo → ContaPagar.baixa na empresa correspondente?
- [ ] Query guard: Nenhuma query sem `getFiltroContexto()`?

### P3 — RBAC Aplicação
- [ ] Mapear 50+ ações sensíveis (exemplo: Financeiro.ContaPagar.baixar)
- [ ] Frontend: `data-permission="Modulo.Entidade.Acao"` em cada botão
- [ ] Backend: `entityGuard()` bloqueando acesso não autorizado

### P4 — Layout Simplificação
- [ ] Dashboard: Reduzir de 15+ para 6–8 KPIs essenciais
- [ ] Comercial: Paginar tabelas (100 registros por página, não carregar tudo)
- [ ] Financeiro: 3 abas (Resumo, Pagar, Receber) em vez de 5+
- [ ] Mobile: Usar responsive design em vez de páginas duplicadas

### P5 — Administração Consolidação
- [ ] Separar AdministracaoSistema em 3 índices (Acessos, Config, Propagação)
- [ ] Movimentacao de `VisualizadorUniversalEntidadeV24` para hook reutilizável
- [ ] Remover páginas morte (Home, Documentacao como static, não page)

---

## SEÇÃO 8 — PRÓXIMAS AÇÕES

### Imediatas (Esta sessão)
1. ✅ **P1 Checkup** — Diagnóstico completo (ESTE DOCUMENTO)
2. ⏳ **P1 Detalhes** — Refatorar top 5 arquivos grandes
3. ⏳ **P1 Consolidação** — Remover duplicatas (Home → Dashboard, Mobile pages)

### Próxima sessão
4. **P2 Execução** — Multiempresa propagação bidirecional
5. **P3 Execução** — RBAC em 50+ ações
6. **P4 Execução** — Simplificação dashboards + layout responsivo
7. **P5 Execução** — Consolidação Administração

---

**Documento gerado automaticamente em 2026-06-21** | Manutenção: Base44 AI | Próxima auditoria: P2