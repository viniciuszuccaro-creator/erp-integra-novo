# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 5: ADMINISTRAÇÃO DO SISTEMA E CADASTROS GERAIS

**Data:** 13/06/2026  
**Objetivo:** Consolidar Admin + Cadastros, auditar configs, remover duplicidades (com validação).  
**Status:** 📋 AUDITORIA + CONSOLIDAÇÃO

---

## 1. ESTRUTURA ATUAL

### ✅ JÁ CONSOLIDADO CORRETAMENTE

```
MÓDULO: Administração do Sistema
├─ Perfis de Acesso (PerfilAcesso)
├─ Usuários (User)
├─ Grupos Empresariais (GrupoEmpresarial)
├─ Empresas (Empresa)
├─ Configurações Gerais
├─ Integrações
├─ Backups
├─ Auditoria
└─ Segurança

MÓDULO: Cadastros Gerais
├─ BLOCO 1: Pessoas
│  ├─ Cliente
│  ├─ Fornecedor
│  ├─ Transportadora
│  ├─ Colaborador
│  └─ Representante
├─ BLOCO 2: Produtos
│  ├─ Produto
│  ├─ GrupoProduto
│  ├─ Marca
│  └─ UnidadeMedida
├─ BLOCO 3: Financeiro
│  ├─ Banco
│  ├─ FormaPagamento
│  ├─ CondicaoComercial
│  ├─ TabelaPreco
│  ├─ PlanoDeContas
│  └─ CentroCusto
├─ BLOCO 4: Logística
│  ├─ TipoFrete
│  ├─ RotaPadrao
│  ├─ RegiaoAtendimento
│  ├─ LocalEstoque
│  └─ Veiculo
├─ BLOCO 5: Organizacional
│  ├─ Departamento
│  ├─ Cargo
│  ├─ Turno
│  └─ CentroCusto
└─ BLOCO 6: Técnico
   ├─ SetorAtividade
   ├─ SegmentoCliente
   ├─ Banco (já em Financeiro)
   └─ UnidadeMedida (já em Produtos)
```

**Status:** ✅ **Bem consolidado** — Sem duplicações gritantes

---

## 2. CHECKLIST DE CONFIGURAÇÕES

### PERFIS DE ACESSO
- [ ] Todos os perfis têm permissões explícitas no padrão `Módulo.Entidade.Ação`?
- [ ] Existe perfil Admin com acesso total?
- [ ] Existe perfil User padrão com restrições sensatas?
- [ ] Existe perfil Gerencial com acesso a dashboards?
- [ ] Conflitos de SOD (Segregation of Duties) foram auditados?

### USUÁRIOS
- [ ] Cada usuário tem role (admin/user) definida?
- [ ] Cada usuário tem grupo/empresa atribuído?
- [ ] Usuários inativos foram marcados como `ativo: false`?
- [ ] Senhas respeitam política de segurança?
- [ ] 2FA está ativado para admins?

### GRUPOS E EMPRESAS
- [ ] Todos os Grupos têm `group_id` definido?
- [ ] Todas as Empresas têm `group_id` + `empresa_id` definidos?
- [ ] Propagação bidirecional está testada em 3 cenários?
- [ ] Empresas órfãs (sem grupo) foram identificadas?

### INTEGRAÇÕES
- [ ] Todas as integrações (Stripe, APIs) estão em `ConfiguracaoSistema`?
- [ ] Secrets de integração estão seguros (não em código)?
- [ ] Cada integração tem status de saúde monitorado?

### BACKUPS
- [ ] Backups automáticos estão agendados?
- [ ] Último backup foi há menos de 24h?
- [ ] Restauração foi testada (backup → restore)?

### AUDITORIA
- [ ] AuditLog está registrando TODAS as ações críticas?
- [ ] Todos os registros têm `group_id`, `empresa_id`, `usuario_id`?
- [ ] Retenção de logs está configurada (ex: 90 dias)?

---

## 3. DUPLICIDADES A VALIDAR

### Antes de deletar, confirmar com o usuário:

#### DUPLICATA 1: Dashboard vs DashboardCorporativo
**Status:** Praticamente idênticas  
**Ação Proposta:** ❌ Deletar `/DashboardCorporativo`, unificar em `/Dashboard` com abas "Empresa" vs "Consolidado"

**Validação Necessária:**
- [ ] DashboardCorporativo tem dados que Dashboard não tem?
- [ ] Alguém usa especificamente DashboardCorporativo como favorito?
- [ ] Ao mesclar, qual será o padrão de visualização (Empresa vs Consolidado)?

**Impacto:** Baixo — Reduz código duplicado

---

#### DUPLICATA 2: HubAtendimento vs ChatbotAtendimento
**Status:** Mesma funcionalidade  
**Ação Proposta:** ❌ Deletar `/ChatbotAtendimento`, unificar em `/HubAtendimento`

**Validação Necessária:**
- [ ] Qual é a diferença de funcionalidade entre os dois?
- [ ] Alguém usa especificamente ChatbotAtendimento?
- [ ] Routes precisam ser atualizadas em App.jsx?

**Impacto:** Baixo — Reduz confusão

---

#### DUPLICATA 3: Múltiplos Dashboards (AdvancedAnalytics, ExecutiveMonitoring, etc.)
**Status:** Sobrepõem-se com Dashboard  
**Ação Proposta:** ❌ Deletar Hubs duplicados, integrar como abas em `/Dashboard`

**Validação Necessária:**
- [ ] Quais dados são ÚNICOS em cada Hub?
- [ ] Ao integrar em abas, a performance será adequada?
- [ ] Routes em App.jsx precisam ser removidas?

**Impacto:** Médio — Consolida UI, reduz navegação

---

#### DUPLICATA 4: Relatórios (Module separado vs Dashboard)
**Status:** Alguns relatórios duplicam Dashboard, outros são únicos  
**Ação Proposta:** ⚠️ Manter `/Relatorios` mas remover duplicatas (ex: Vendas que existem em Dashboard)

**Validação Necessária:**
- [ ] Quais relatórios são ÚNICOS vs duplicam Dashboard?
- [ ] Relatórios têm agendamento/exportação que Dashboard não tem?
- [ ] Ao remover duplicatas, que relatórios permanecem?

**Impacto:** Médio — Consolida mas preserva funcionalidades únicas

---

## 4. CONSOLIDAÇÃO RECOMENDADA

### Fase 1: Duplicatas Óbvias (deletar)
```
❌ /DashboardCorporativo  → Mesclar em /Dashboard
❌ /ChatbotAtendimento    → Mesclar em /HubAtendimento
❌ /AdvancedAnalytics     → Integrar em /Dashboard (aba)
❌ /ExecutiveMonitoring   → Integrar em /Dashboard (aba)
```

### Fase 2: Revisão de Relatórios
```
⚠️ /Relatorios
├─ RelatorioVendas (DUPLICA Dashboard) → ❌ Remover
├─ RelatorioFinanceiro (DUPLICA Dashboard) → ❌ Remover
├─ RelatorioEstoque (tem detalhes extras) → ✅ Manter + melhorar
└─ RelatoriosCustomizados (agendamento) → ✅ Manter
```

### Fase 3: Consolidação Admin
```
✅ /AdministracaoSistema (manter como está)
├─ Perfis (100% aqui) ✅
├─ Usuários (100% aqui) ✅
├─ Grupos/Empresas (100% aqui) ✅
├─ Integrações (100% aqui) ✅
└─ Backups (100% aqui) ✅

✅ /Cadastros (manter como está)
├─ Pessoas (100% aqui) ✅
├─ Produtos (100% aqui) ✅
├─ Financeiro (100% aqui) ✅
├─ Logística (100% aqui) ✅
└─ Organizacional (100% aqui) ✅

CONSOLIDAÇÃO MELHORADA:
/AdministracaoSistema
├─ Gestão de Acessos (Perfis + Usuários)
├─ Gestão de Grupos/Empresas
├─ Configurações (Integrações, Backups, Segurança)
└─ Auditoria & Logs

/Cadastros (com subcategorias mais claras)
├─ Pessoas (Clientes, Fornecedores, etc.)
├─ Produtos & Materiais
├─ Financeiro & Contabilidade
├─ Logística & Distribuição
└─ Organizacional (Deps, Cargos, etc.)
```

---

## 5. CHECKLIST DE DELETAR DUPLICATAS

### ✅ ANTES de deletar qualquer arquivo:

1. **Validação Funcional**
   - [ ] Funcionalidade existe em outro lugar?
   - [ ] Dados são replicados ou únicos?
   - [ ] Há dependências (imports) em outro lugar?

2. **Backup**
   - [ ] Código deletado está em repositório (git)?
   - [ ] Histórico de commits preserva o código?

3. **Impacto**
   - [ ] Routes precisam ser removidas de App.jsx?
   - [ ] Imports precisam ser atualizados?
   - [ ] Testes precisam ser ajustados?

4. **Comunicação**
   - [ ] Usuários foram notificados?
   - [ ] Há um período de transição (ex: 2 semanas)?
   - [ ] Links antigos redirecionam?

5. **Validação Final**
   - [ ] Deploy em DEV funcionou?
   - [ ] Nenhum erro 404 após deploy?
   - [ ] Performance melhorou?

---

## 6. EXEMPLO: Deletar /DashboardCorporativo

### PASSO 1: Validação Funcional
```
✅ Dashboard e DashboardCorporativo são idênticas
✅ Nenhuma funcionalidade única em DashboardCorporativo
✅ Não há imports de DashboardCorporativo em outro lugar
```

### PASSO 2: Backup
```
✅ Arquivo já está em git history
✅ Commit será registrado com data/motivo
```

### PASSO 3: Impacto
```
⚠️ Route /DashboardCorporativo em App.jsx deve ser removida
⚠️ Nenhum outro lugar importa o componente
```

### PASSO 4: Comunicação
```
📧 Notificar: "Dashboard será único; usar /Dashboard para acessar"
⏰ Período de transição: 2 semanas
```

### PASSO 5: Execução
```
// App.jsx — Remover:
<Route path="/DashboardCorporativo" element={<DashboardCorporativo />} />

// Deletar arquivo:
delete_file("pages/DashboardCorporativo.jsx")

// Commit:
"chore: consolidar Dashboard + DashboardCorporativo (Plano P5)"
```

---

## 7. CRONOGRAMA FINAL — P5

### Semana 1 (13-17/06)
- [ ] Auditar todas as configurações (Perfis, Usuários, Integrações)
- [ ] Validar duplicatas (Dashboard, Chatbot, Analytics)
- [ ] Documentar impacto de cada deleção

### Semana 2 (18-24/06)
- [ ] Deletar duplicatas óbvias (DashboardCorporativo, ChatbotAtendimento)
- [ ] Integrar Hubs em Dashboard (abas)
- [ ] Testar routes e imports

### Semana 3 (25-30/06)
- [ ] Revisar Relatórios (remover duplicatas)
- [ ] Consolidar Admin & Cadastros (melhorar UX)
- [ ] Validação final em DEV + PROD

---

## 8. CHECKLIST FINAL — PRIORIDADE 5

- [x] ✅ Estrutura Admin + Cadastros já está consolidada
- [ ] ⏳ Auditar configurações (Perfis, Usuários, Integrações)
- [ ] ⏳ Validar duplicatas com impacto
- [ ] ⏳ Deletar duplicatas (com backup + comunicação)
- [ ] ⏳ Testar consolidação em DEV + PROD

---

## 9. PRÓXIMAS PRIORIDADES

### ✅ P5 PLANEJADA — Pronto para implementação

**Próxima ação:** Auditar configurações críticas (Perfis, Usuários, Integrações) e validar impacto de cada deleção.