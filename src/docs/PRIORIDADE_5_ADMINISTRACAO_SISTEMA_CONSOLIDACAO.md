# PRIORIDADE 5 — ADMINISTRAÇÃO DO SISTEMA & CADASTROS GERAIS: CONSOLIDAÇÃO
**Data:** 21/06/2026 | **Status:** Planejamento & Execução | **Responsável:** Base44 AI

---

## OBJETIVO
Consolidar **Administração do Sistema** em **3 índices principais** (Configurações, Gestão de Acessos, Monitoramento), integrar tudo com **Cadastros Gerais**, remover duplicidades com validação de impacto, e eliminar páginas morte (Home, Documentacao).

---

## SEÇÃO 1 — ESTRUTURA CONSOLIDADA DE ADMINISTRAÇÃO

### 1.1 3 Índices Únicos de Administração

#### ÍNDICE 1: Configurações Gerais
**Local:** AdministracaoSistema → Configurações

```
├── Configurações do Sistema
│   ├── Empresa (criar, editar, desativar)
│   ├── Grupo Empresarial (estrutura, propagação)
│   ├── Contatos & Endereços da Empresa
│   └── Documentos (CNPJ, Inscrição Estadual, etc)
│
├── Configurações Fiscais
│   ├── Dados NF (série, último número)
│   ├── Certificado Digital
│   ├── Impostos (alíquotas ICMS, IPI, etc)
│   └── Natureza de Operação (CFOP)
│
├── Configurações de Integração
│   ├── Gateways de Pagamento
│   ├── Transportadoras
│   ├── APIs Externas
│   └── Webhooks
│
├── Configurações de Notificação
│   ├── Canais (Email, WhatsApp, SMS)
│   ├── Templates
│   └── Disparadores (quando avisar)
│
└── Parâmetros Gerais
    ├── Moedas & Índices
    ├── Unidades de Medida
    ├── Formas de Pagamento
    └── Centros de Custo
```

#### ÍNDICE 2: Gestão de Acessos
**Local:** AdministracaoSistema → Gestão de Acessos

```
├── Usuários
│   ├── Criar usuário (via AdminInviteUser)
│   ├── Editar dados (nome, email, telefone)
│   ├── Atribuir Perfil de Acesso
│   ├── Ver histórico de atividades
│   └── Desativar/reativar
│
├── Perfis de Acesso
│   ├── Administrador (todos acessos)
│   ├── Gerente (módulo específico completo)
│   ├── Operacional (criar/editar, sem deletar)
│   ├── Consulta (apenas visualizar)
│   └── Personalizado (criar novo com seleção granular)
│
├── Permissões por Perfil
│   ├── Modulo.Entidade.Acao
│   ├── Validador SoD (segregação de deveres)
│   └── Teste de permissão (simular como user X)
│
├── Auditoria de Acessos
│   ├── Login/Logout
│   ├── Tentativas negadas
│   ├── Mudanças de perfil
│   └── Exportar relatório
│
└── Sessões Ativas
    ├── Quem está logado agora
    ├── Forçar logout
    └── Ver IP, navegador, localização
```

#### ÍNDICE 3: Monitoramento & Saúde
**Local:** AdministracaoSistema → Monitoramento

```
├── Saúde do Sistema
│   ├── Status dos serviços
│   ├── Tempo de resposta da API
│   ├── Taxa de erros (últimas 24h)
│   └── Alertas críticos
│
├── Auditoria & Logs
│   ├── Operações (create/update/delete)
│   ├── Acessos (tentativas negadas)
│   ├── Mudanças de config
│   └── Sincronização Grupo ↔ Empresa
│
├── Backup & Recuperação
│   ├── Último backup (data/hora)
│   ├── Testar restauração
│   ├── Histórico de backups (7 últimos)
│   └── Retenção de dados
│
├── Sincronização
│   ├── Status Grupo → Empresas
│   ├── Status Empresa → Grupo
│   ├── Lag de sincronização
│   └── Forçar sincronização
│
└── Estatísticas
    ├── Volume de dados (por entidade)
    ├── Crescimento (últimos 30 dias)
    ├── Usuários ativos
    └── Operações por dia (trend)
```

---

### 1.2 Migração de Páginas Órfãs

**PÁGINAS A ELIMINAR:** (consolidadas em Índices 1–3)

| Página | Localização Atual | Consolidação | Ação |
|--------|------------------|--------------|------|
| ConfigCenter | Sistema | → Índice 1 (Configurações Gerais) | Mover conteúdo |
| ConfigGlobal | Sistema | → Índice 1 (Configurações Gerais) | Mover conteúdo |
| GestaoUsuariosAvancada | Sistema | → Índice 2 (Gestão de Acessos) | Mover conteúdo |
| RBACDashboard | Sistema | → Índice 2 (Permissões por Perfil) | Mover conteúdo |
| SistemaHealthPanel | Sistema | → Índice 3 (Saúde do Sistema) | Mover conteúdo |
| GlobalAuditLog | Sistema | → Índice 3 (Auditoria & Logs) | Mover conteúdo |
| HistoricoBackups | Sistema | → Índice 3 (Backup & Recuperação) | Mover conteúdo |
| MonitorPerformance | Sistema | → Índice 3 (Saúde do Sistema) | Mover conteúdo |
| **Home** (pages/Home) | Root | → Dashboard | Remover página |
| **Documentacao** (pages/Documentacao) | Root | → Wiki/Help Center externo | Remover página |

---

## SEÇÃO 2 — INTEGRAÇÃO COM CADASTROS GERAIS

### 2.1 O que Precisa Vir de Cadastros Gerais

**Cadastros Gerais** deve ser a **fonte única de verdade** para:

| Entidade | Localização Atual | Consolidação |
|----------|------------------|--------------|
| Produto | Estoque.Produtos | ✅ Já em Cadastros |
| Cliente | Comercial.Clientes | ✅ Já em Cadastros |
| Fornecedor | Compras.Fornecedores | ✅ Já em Cadastros |
| Colaborador | RH.Colaboradores | ✅ Já em Cadastros |
| Transportadora | Cadastros | ✅ Já em Cadastros |
| **Banco** | Cadastros | ✅ Já em Cadastros |
| **UnidadeMedida** | Cadastros | ✅ Já em Cadastros |
| **Moeda/Índice** | Duplicado (AdminPanel + Cadastros) | 🔧 CONSOLIDAR |
| **FormaPagamento** | Duplicado (CaixaFormaPagamento + Cadastros) | 🔧 CONSOLIDAR |
| **CentroCusto** | Duplicado (Financeiro + Cadastros) | 🔧 CONSOLIDAR |
| **PlanoDeContas** | Duplicado (Fiscal + Cadastros) | 🔧 CONSOLIDAR |
| **ConfigFiscal** | Parcial em Administração | 🔧 CONSOLIDAR |
| **ContaBancaria** | Disperso em Financeiro | 🔧 CONSOLIDAR |
| **NaturezaOperacao** (CFOP) | Falta | ✅ ADICIONAR |
| **CentroOperacao** | Existe? | ⏳ VALIDAR |

---

### 2.2 Fluxo de Dados: Cadastro → Uso

```
Cadastros Gerais (Fonte Única)
    ↓
    ├─→ Estoque (produto_id referencia)
    ├─→ Comercial (cliente_id referencia)
    ├─→ Financeiro (forma_pagamento_id, centro_custo_id referencia)
    ├─→ Fiscal (cfop_id, plano_contas_id referencia)
    └─→ Relatórios (consulta direto em Cadastros)

❌ NÃO FAZER: Copiar dados de Cadastros para cada módulo
✅ FAZER: Referenciar ID + buscar dados em tempo real ou cache
```

---

## SEÇÃO 3 — IDENTIFICAÇÃO DE DUPLICIDADES

### 3.1 Duplicidades Conhecidas

| Entidade | Lugar 1 | Lugar 2 | Status | Ação |
|----------|---------|---------|--------|------|
| **FormaPagamento** | Cadastros/FormaPagamentoForm | Financeiro/SeletorFormaPagamento | ❌ DUPLICADA | Consolidar em Cadastros |
| **CentroCusto** | Cadastros/CentroCustoForm | Financeiro/headers | ❌ DUPLICADA | Consolidar em Cadastros |
| **PlanoDeContas** | Cadastros/PlanoContasForm | Fiscal/PlanoDeContasTree | ❌ DUPLICADA | Consolidar em Cadastros |
| **ContaBancaria** | Cadastros | Financeiro (implícito) | ⚠️ PARCIAL | Criar Entity + form |
| **Moeda** | Cadastros/MoedaIndiceForm | Admin (if exists) | ⏳ VALIDAR | Consolidar |
| **ConfigFiscal** | Administração/FiscalPanel | Fiscal/ImportarXML | ⚠️ DISPERSO | Centralizar em Índice 1 |
| **PerfilAcesso** | Sistema/CentralPerfisAcesso | Administração/GestaoAcessos | ❌ DUPLICADA | Usar único (Índice 2) |
| **Usuario** | Sistema/GestaoUsuarios | Administração/UsuariosTab | ❌ DUPLICADA | Usar único (Índice 2) |
| **Empresa** | Administração/EmpresaForm | Cadastros (if exists) | ⏳ VALIDAR | Consolidar |
| **GrupoEmpresarial** | Administração | Cadastros (if exists) | ⏳ VALIDAR | Consolidar |

### 3.2 Matriz de Impacto: Antes de Consolidar

Para **CADA duplicidade**, validar:

| Pergunta | Resposta | Impacto |
|----------|----------|---------|
| Dados são idênticos? | Sim/Não | Se Não → precisa lógica de merge |
| Quantos usuários usam Lugar 1? | N | Risco de breaking se mover |
| Quantos usuários usam Lugar 2? | M | Comunicação necessária |
| API/Backend usa qual? | Lugar 1/2/ambas | Refactor obrigatório |
| Relatórios consultam qual? | Lugar 1/2/ambas | Impacto em BI |
| Há automatizações? | Sim/Não | Atualizar automações |
| Qual é mais "novo"? | Lugar 1/2 | Preferir migrar para mais novo |

---

## SEÇÃO 4 — PÁGINAS A REMOVER

### 4.1 Home (pages/Home.jsx)

**Status:** Página morte — ninguém acessa
**Motivo:** Dashboard já faz esse papel
**Ação:** 
- [ ] Remover rota em App.jsx
- [ ] Remover arquivo pages/Home.jsx
- [ ] Redirecionar "/" para "/Dashboard"

### 4.2 Documentacao (pages/Documentacao.jsx)

**Status:** Página morte — documentação desatualizada
**Motivo:** Usar Wiki/Help Center externo
**Ação:**
- [ ] Remover rota em App.jsx
- [ ] Remover arquivo pages/Documentacao.jsx
- [ ] Criar link "Ajuda" → wiki externa

### 4.3 Outras Páginas Órfãs?

| Página | Descrição | Status | Ação |
|--------|-----------|--------|------|
| ConfiguracoesUsuario | Perfil pessoal do usuário | ⏳ MANTER | Se usado, manter; senão remover |
| EmpresaOnboarding | Onboarding de nova empresa | ⏳ MANTER | Se usado, manter |
| OrcamentoSite | Orçamento via site público | ⏳ MANTER | Se usado, manter |
| PortalCliente | Portal externo para clientes | ⏳ MANTER | Se usado, manter |

---

## SEÇÃO 5 — FLUXO DE REMEDIAÇÃO

### Passo 1: Auditoria Completa (1 dia)

- [ ] Listar todas duplicidades com impacto
- [ ] Validar impacto de cada consolidação
- [ ] Documentar matriz de risco

### Passo 2: Consolidação com Validação (3–5 dias)

**Para CADA duplicidade:**

```
1. Criar ticket de consolidação
   - Entidade
   - Lugar 1 (origem)
   - Lugar 2 (destino)
   - Impacto estimado
   - Data de migração

2. Analisar dados existentes
   - Contar registros em Lugar 1 vs 2
   - Identificar conflitos/diferenças
   - Planejar merge (se necessário)

3. Avisar usuários
   - Email: "FormaPagamento será centralizado em Cadastros em XX/XX"
   - Prazo: 5 dias antes
   - Instruções: como acessar novo local

4. Executar consolidação
   - Backup completo
   - Migração de dados (se merge necessário)
   - Update de APIs/funcões
   - Testar: nenhum breaking

5. Validação pós-migração
   - Relatórios ainda funcionam?
   - Automações acionadas?
   - Usuários conseguem acessar?

6. Remover local antigo
   - Após 2 semanas de validação
   - Soft-delete (arquivar) em vez de hard-delete
```

### Passo 3: Remoção de Páginas Morte (1 dia)

- [ ] Remover Home
- [ ] Remover Documentacao
- [ ] Redirecionar "/" → "/Dashboard"
- [ ] Teste: nenhum link quebrado

### Passo 4: Integração com Cadastros (2–3 dias)

- [ ] Consolidar FormaPagamento
- [ ] Consolidar CentroCusto
- [ ] Consolidar PlanoDeContas
- [ ] Adicionar ContaBancaria
- [ ] Centralizar ConfigFiscal

---

## SEÇÃO 6 — ESTRUTURA FINAL DE ADMINISTRAÇÃO

```
ADMINISTRAÇÃO DO SISTEMA
├── 📋 ÍNDICE 1: Configurações Gerais
│   ├── Empresa (novo/editar/desativar)
│   ├── Grupo Empresarial (organização)
│   ├── Configurações Fiscais (NF, certificado, impostos)
│   ├── Integração (gateways, APIs, webhooks)
│   ├── Notificações (canais, templates)
│   └── Parâmetros (moedas, unidades, formas pagamento, centros custo)
│
├── 🔐 ÍNDICE 2: Gestão de Acessos
│   ├── Usuários (criar, editar, perfil, histórico, desativar)
│   ├── Perfis de Acesso (5 tipos + personalizado)
│   ├── Permissões por Perfil (Modulo.Entidade.Acao)
│   ├── Validador SoD (segregação de deveres)
│   ├── Auditoria de Acessos (login/logout, negados)
│   └── Sessões Ativas (quem está logado)
│
├── 📊 ÍNDICE 3: Monitoramento & Saúde
│   ├── Saúde do Sistema (status, resposta, erros, alertas)
│   ├── Auditoria & Logs (operações, acessos, configs, sync)
│   ├── Backup & Recuperação (status, testes, histórico)
│   ├── Sincronização Grupo ↔ Empresa (status, lag, forçar)
│   └── Estatísticas (volume, crescimento, usuários, operações)
│
└── 📚 CADASTROS GERAIS (fonte única)
    ├── Produto (com empresas_compartilhadas_ids)
    ├── Cliente (com empresa_dona_id + empresas_compartilhadas_ids)
    ├── Fornecedor (com empresa_dona_id + empresas_compartilhadas_ids)
    ├── Colaborador (com empresa_alocada_id)
    ├── Transportadora (com empresas_compartilhadas_ids)
    ├── Banco (maestro do grupo)
    ├── UnidadeMedida (maestro do grupo)
    ├── FormaPagamento (consolidado aqui)
    ├── CentroCusto (consolidado aqui)
    ├── PlanoDeContas (consolidado aqui)
    ├── ContaBancaria (novo)
    ├── NaturezaOperacao/CFOP (novo)
    └── ConfigFiscal (centralizado aqui)
```

---

## SEÇÃO 7 — CHECKLIST P5 COMPLETO

- [ ] 3 índices de Administração criados e funcionais?
- [ ] Todas duplicidades identificadas e consolidadas?
- [ ] FormaPagamento, CentroCusto, PlanoDeContas em Cadastros?
- [ ] ConfigFiscal centralizado?
- [ ] ContaBancaria criado?
- [ ] Usuários + Perfis em Índice 2 (único)?
- [ ] Auditoria & Logs em Índice 3?
- [ ] Backup & Saúde em Índice 3?
- [ ] Sincronização Grupo ↔ Empresa em Índice 3?
- [ ] Home removida?
- [ ] Documentacao removida?
- [ ] Nenhum link quebrado?
- [ ] Relatórios ainda funcionam?
- [ ] Automações ainda disparam?

---

## SEÇÃO 8 — PRÓXIMAS AÇÕES

### Esta Sessão (P5)
1. ✅ Planejamento: Estrutura consolidada definida
2. ⏳ Execução: Implementar 3 índices
3. ⏳ Consolidação: Mover duplicidades para Cadastros
4. ⏳ Remoção: Home + Documentacao
5. ⏳ Validação: Testes E2E

---

**Documento gerado automaticamente em 2026-06-21** | Execução: Base44 AI | Status: Pronto para Implementação