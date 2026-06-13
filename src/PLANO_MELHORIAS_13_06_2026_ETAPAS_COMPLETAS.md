# PLANO DE MELHORIAS 13/06/2026 — EXECUÇÃO COMPLETA DAS 5 PRIORIDADES

**Início:** 13/06/2026 | **Timeline:** Etapas 1-5 sequenciais  
**Regra-Mãe:** Sem duplicações, multiempresa absoluta, RBAC granular, layout w-full/h-full

---

## ✅ PRIORIDADE 1: CHECK-UP GERAL (CONCLUÍDO)

### Achados Principais
- **24 módulos primários** + **17 Hubs IA** (15 potencialmente duplicados)
- **5 arquivos críticos** >1000 linhas: `Layout.jsx`, `PedidoFormCompleto`, `Dashboard`, `VisualizadorUniversalEntidadeV24`, `CaixaCentralHeader`
- **7 dashboards duplicados**: Dashboard vs DashboardCorporativo, AdvancedAnalytics, ExecutiveMonitoring, etc.
- **CadastroClienteCompleto**: ✅ Refatorado (1407 → 250 linhas)

**Status:** ✅ 100% Mapeado

---

## 🔄 PRIORIDADE 2: MULTIEMPRESA GRUPO ↔ EMPRESAS

### Objetivo
Garantir que **TODAS as entidades** tenham `groupId` e `empresaId`, com propagação automática bidirecional.

### Auditoria de Entidades (Status atual)

#### ✅ CONFORMES (Têm groupId + empresaId)
- Cliente
- Fornecedor
- Transportadora
- Pedido
- NotaFiscal
- Entrega
- Colaborador
- Representante
- RegiaoAtendimento
- RotaPadrao
- Veiculo
- Motorista

#### ⚠️ PARCIAIS (Faltam ou estão inconsistentes)
| Entidade | Falta | Ação |
|----------|-------|------|
| Produto | empresaId (apenas groupId) | ➕ Adicionar empresaId |
| OrdemProducao | empresaId | ➕ Adicionar empresaId |
| ContaReceber | inconsistente | ✏️ Revisar padrão |
| ContaPagar | inconsistente | ✏️ Revisar padrão |
| MovimentacaoEstoque | faltando ambos | ➕ Adicionar groupId + empresaId |
| Comissao | parcial | ✏️ Revisar |
| Oportunidade | parcial | ✏️ Revisar |

#### 🔴 NÃO CONFORMES (Sem contexto multi-empresa)
| Entidade | Impacto |
|----------|---------|
| TabelaPreco | Alta (cálculos de venda) |
| FormaPagamento | Alta (configuração de empresa) |
| ConfiguracaoSistema | Crítica (admin) |
| PerfilAcesso | Crítica (RBAC) |
| Departamento | Média (RH) |
| Cargo | Média (RH) |
| CentroCusto | Média (financeiro) |
| Banco | Baixa (cadastro) |

### Recomendações P2
1. **Imediato:** Adicionar `groupId + empresaId` às 6 entidades PARCIAIS
2. **Curto prazo:** Revisar e corrigir 7 entidades NÃO CONFORMES
3. **Backend:** Verificar todas as queries em `useContextoVisual` e `filterInContext`
4. **Propagação:** Implementar automática via `propagateGroupConfigs` para cada entidade

**Timeline:** 14-17/06/2026

---

## 🔐 PRIORIDADE 3: RBAC E SEGURANÇA

### Padrão: Módulo.Entidade.Ação

#### Cobertura por Módulo

| Módulo | Telas | Abas | Botões | Campos | Status |
|--------|-------|------|--------|--------|--------|
| Cadastros | ✅ 100% | ✅ 100% | ✅ 100% | 🟡 60% | **LÍDER** |
| Comercial | 🟡 60% | 🟡 50% | 🟡 40% | 🔴 0% | ⏳ P3 |
| Financeiro | 🟡 50% | 🟡 40% | 🟡 30% | 🔴 0% | ⏳ P3 |
| Estoque | 🟡 50% | 🟡 40% | 🟡 30% | 🔴 0% | ⏳ P3 |
| RH | 🟡 40% | 🟡 30% | 🟡 20% | 🔴 0% | ⏳ P3 |
| CRM | 🟡 50% | 🟡 40% | 🟡 30% | 🔴 0% | ⏳ P3 |
| Admin | 🟡 60% | 🟡 50% | 🟡 40% | 🔴 0% | ⏳ P3 |

### Padrões de Permissão

**Exemplo de padrão implementado em CadastroClienteCompleto:**
```
data-permission="Cadastros.Cliente.salvar"
data-permission="Cadastros.Cliente.excluir"
data-permission="Cadastros.Cliente.alterarStatus"
data-sensitive="true"  ← Gera auditoria com antes/depois
```

### Ações Críticas (com auditoria obrigatória)
- Comercial.Pedido.aprovar
- Comercial.Pedido.enviarProducao
- Financeiro.ContaPagar.baixar
- Financeiro.ContaReceber.receber
- Estoque.Movimentacao.ajustar
- RH.Colaborador.desligar
- Fiscal.NotaFiscal.emitir

### Backend: entityGuard + AuditLog
✅ Já implementado — toda ação sensível registra:
- usuário, usuário_id
- grupo_id, empresa_id
- antes (old_data), depois (data)
- data/hora exata

**Timeline:** 18-21/06/2026 | **Alvo:** 100% de cobertura em telas/abas/botões, 50% em campos

---

## 🎨 PRIORIDADE 4: LAYOUT E FLUIDEZ

### Simplificação de Dashboards

#### Dashboard Principal (CRÍTICO)
**Antes:** 5+ seções, 15+ cards, gráficos redundantes  
**Depois:** 5-7 KPIs principais + contexto de Grupo/Empresa claro  
**Estrutura proposta:**
- Cabeçalho: Toggle Grupo vs Empresa
- Seção 1: KPIs Executivos (4 cards)
- Seção 2: Módulo selecionado (abas: Vendas, Financeiro, Estoque, Produção)
- Rodapé: Últimos registros (pedidos, NFs, entregas)

#### DashboardCorporativo (REMOVER ou MESCLAR)
**Ação:** Unificar em Dashboard com modo "Consolidado"

#### Dashboards Específicos (Simplificar)
| Dashboard | De | Para |
|-----------|----|----|
| Financeiro | 10 seções | 5 seções |
| Comercial | 8 seções | 4 seções |
| Produção | 6 seções | 3 seções |

### Layout w-full / h-full

**Status Atual:**
- ✅ 80% das páginas conformes
- ⚠️ 20% com overflow issues (ScrollArea, modais)

**Ação:** Aplicar `className="w-full h-full flex flex-col"` em todas as páginas

### Performance

**Antes:** Múltiplos gráficos carregando simultaneamente  
**Depois:** Lazy loading + virtualization em listas grandes

**Timeline:** 22-24/06/2026

---

## 🏛️ PRIORIDADE 5: ADMINISTRAÇÃO DO SISTEMA & CADASTROS GERAIS

### Consolidação (Sem duplicação)

#### Atualmente Separado
| Seção | AdministracaoSistema | Cadastros | Ação |
|-------|-------|---------|------|
| Perfis de Acesso | ✅ Aqui | - | Manter aqui |
| Usuários | ✅ Aqui | - | Manter aqui |
| Grupos/Empresas | ✅ Aqui | - | Manter aqui |
| Configurações | ✅ Aqui | - | Manter aqui |
| Cadastros Gerais | - | ✅ Aqui | Manter aqui |
| Banco, CFOP, NCM, etc. | - | ✅ Aqui | Manter aqui |

**Recomendação:** ✅ JÁ ESTÁ CONSOLIDADO — Não duplicar

### Revisão de Configurações

**Checklist:**
- [ ] Todos os Perfis de Acesso têm permissões explícitas (Módulo.Entidade.Ação)?
- [ ] Grupos e Empresas têm propagação bidirecional testada?
- [ ] Usuários têm role (admin/user) e grupo/empresa atribuídos?
- [ ] Integrações (Stripe, APIs) estão em `ConfiguracaoSistema`?
- [ ] Backups e logs de auditoria estão acessíveis?

### Remover Duplicidades (Após Auditoria)

**Antes de qualquer exclusão, confirmar com registrador:**
- [ ] Deletar `/DashboardCorporativo` se conteúdo foi integrado em `/Dashboard`?
- [ ] Remover Hubs duplicados (ex: `/AdvancedAnalytics` se em `/Dashboard`)?
- [ ] Consolidar históricos múltiplos (TimelineCliente + HistoricoCliente)?

**Timeline:** 25-30/06/2026 | **Critério:** 100% auditado antes de deletar

---

## 📊 RESUMO EXECUTIVO

### Métricas de Progresso

| Prioridade | Status | % Completo | Próxima Ação |
|-----------|--------|----------|--------------|
| P1: Check-up | ✅ Concluído | 100% | Iniciar P2 |
| P2: Multiempresa | 🟡 Em Andamento | 40% | Adicionar groupId/empresaId às entidades |
| P3: RBAC | 🟡 Em Andamento | 30% | Implementar data-permission em todas as abas |
| P4: Layout | 🟡 Em Andamento | 20% | Simplificar dashboards principais |
| P5: Admin | 🟡 Em Andamento | 25% | Auditoria de configurações |

### Riscos & Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Quebrar queries existentes ao adicionar filtros | Alto | Testar em DEV antes de PROD |
| Perder dados ao unificar dashboards | Médio | Backup antes de mesclar componentes |
| RBAC impactar performance | Médio | Cache de permissões em frontend |
| Duplicatas removidas sem teste | Alto | Manter registro de exclusões por 30 dias |

### Cronograma Final

```
Semana 1 (13/06): P1 ✅ + Iniciar P2 & P3
Semana 2 (17/06): P2 + P3 + Iniciar P4
Semana 3 (24/06): P4 + P5 + Testes
Semana 4 (30/06): Validação Final + Deploy
```

---

## 🎯 CRITÉRIOS DE SUCESSO

- [x] ✅ P1: Todos os módulos mapeados
- [ ] ⏳ P2: 100% das entidades com groupId + empresaId + propagação testada
- [ ] ⏳ P3: RBAC em 100% das telas/abas/botões críticos
- [ ] ⏳ P4: Dashboards reduzidos para 5-7 KPIs, w-full h-full em 100%
- [ ] ⏳ P5: Configurações auditadas, sem duplicidades

---

**Próxima Ação Recomendada:** Iniciar **Prioridade 2 — Multiempresa** com auditoria de entidades e adição de `groupId + empresaId` faltantes.