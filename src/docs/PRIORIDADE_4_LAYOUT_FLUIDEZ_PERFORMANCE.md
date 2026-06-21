# PRIORIDADE 4 — LAYOUT & FLUIDEZ: SIMPLIFICAÇÃO E RESPONSIVIDADE
**Data:** 21/06/2026 | **Status:** Planejamento & Execução | **Responsável:** Base44 AI

---

## OBJETIVO
Transformar dashboards bloados em painéis limpos com **6–8 KPIs essenciais**, aplicar **w-full + h-full** em todas telas, implementar **rolagem interna por container**, e garantir fluidez + responsividade em mobile/desktop.

---

## SEÇÃO 1 — AUDITORIA DE DASHBOARDS (CARDS BLOADOS)

### 1.1 Dashboards Identificados para Simplificação

#### DASHBOARD PRINCIPAL
**Status:** ⚠️ CRÍTICA — Excesso de informação
**Cards atuais:** 15+ (demasiado)
**Cards recomendados:** 6–8

| Card | Informação | Importância | Ação |
|------|-----------|------------|------|
| Receitas do Mês | Faturamento acumulado | ✅ ESSENCIAL | Manter |
| Contas a Receber Pendentes | Valor + qtd títulos | ✅ ESSENCIAL | Manter |
| Contas a Pagar Pendentes | Valor + qtd títulos | ✅ ESSENCIAL | Manter |
| Pedidos em Aberto | Quantidade + valor | ✅ ESSENCIAL | Manter |
| Estoque em Alerta | Produtos com baixa qtd | ✅ ESSENCIAL | Manter |
| Ordens de Produção | Quantidade em andamento | ⏳ IMPORTANTE | Manter |
| Taxa de Conversão (Funil) | % Prospecção → Ganho | ⏳ IMPORTANTE | Manter |
| **Entregas Atrasadas** | Quantidade + dias | ⏳ IMPORTANTE | Manter |
| **Gráfico de Vendas 7 dias** | Trend line | ❌ REMOVER (detail em aba) |
| **Tabela de Top 10 Produtos** | Listagem | ❌ REMOVER (detail em aba) |
| **Mapa de Clientes** | Geovisualize | ❌ REMOVER (separar módulo) |
| **Alertas de IA** | Recomendações | ❌ REMOVER (painel lateral) |
| **Notificações** | Feed | ❌ REMOVER (notification center) |
| **Gráficos de Rentabilidade** | Múltiplas linhas | ❌ REMOVER (relatório dedicado) |
| **KPIs de RH** | Absenteísmo, turnover | ❌ REMOVER (dashboard RH) |

**Resultado:** 8 cards essenciais + tabs para detalhes.

---

#### DASHBOARD FINANCEIRO
**Status:** ⚠️ CRÍTICA — Múltiplas abas com cards repetidos
**Cards atuais:** 20+ (duplicação)
**Problema:** DashboardFinanceiroResumo vs DashboardFinanceiroRealtime vs ContasAbas

**Ação:** Consolidar em **UMA tela com abas**:
- [ ] Aba "Overview" — 6 KPIs (Fluxo Caixa, Receber, Pagar, Conciliação, etc)
- [ ] Aba "Contas a Receber" — Tabela + filtros
- [ ] Aba "Contas a Pagar" — Tabela + filtros
- [ ] Aba "Caixa" — Movimentações + saldo
- [ ] Aba "Formas de Pagamento" — Distribuição

---

#### DASHBOARD COMERCIAL
**Status:** ⚠️ CRÍTICA — Funil + vendas repetidos
**Cards atuais:** 18+
**Problema:** FunilVisual, KPIsCRM, OportunidadesListagem fazem mesma coisa

**Ação:** Consolidar em **DASHBOARD + ABAS**:
- [ ] Aba "Funil" — Kanban (Prospecção → Ganho)
- [ ] Aba "Vendas" — Gráfico + tabela mensal
- [ ] Aba "Oportunidades" — Listagem com filtros
- [ ] Aba "Clientes" — CRM + histórico

---

#### DASHBOARD ESTOQUE
**Status:** ⚠️ CRÍTICA — Múltiplas views do mesmo dado
**Cards atuais:** 12+
**Problema:** ProdutosTab, InventarioForm, ControleEstoqueCompleto

**Ação:** Consolidar em **DASHBOARD + ABAS**:
- [ ] Aba "Overview" — 6 KPIs (qtd total, alertas, valor investido, etc)
- [ ] Aba "Produtos" — Tabela completa com filtros
- [ ] Aba "Movimentações" — Histórico
- [ ] Aba "Inventário" — Contagem + ajustes

---

#### DASHBOARD PRODUÇÃO
**Status:** ⚠️ ALTA — Redundância
**Cards atuais:** 14+
**Problema:** DashboardProducaoRealtime + KanbanProducao duplicam info

**Ação:** Consolidar:
- [ ] Aba "Overview" — 6 KPIs (OPs em andamento, concluídas, refugo %, etc)
- [ ] Aba "Kanban" — Vista visual por etapa
- [ ] Aba "Apontamentos" — Tabela de produção
- [ ] Aba "Refugo" — Análise de perdas

---

#### DASHBOARD EXPEDIÇÃO
**Status:** ⚠️ ALTA — Redundância
**Cards atuais:** 10+
**Problema:** EntregasListagem + DashboardEntregasRealtime

**Ação:** Consolidar:
- [ ] Aba "Overview" — 6 KPIs (em rota, entregues, atrasadas, taxa sucesso)
- [ ] Aba "Entregas" — Mapa + listagem
- [ ] Aba "Romaneios" — Geração + impressão
- [ ] Aba "Ocorrências" — Rastreamento de problemas

---

### 1.2 Componentes a Simplificar/Remover

| Componente | Localização | Status | Ação |
|-----------|------------|--------|------|
| DashboardAlertsBar | Dashboard | ⏳ Mover para sidebar | Criar notificação center |
| DashboardIAInsightsStrip | Dashboard | ❌ Remover | Integrar em modais contextuais |
| DashboardKPIStrip (duplicado) | Dashboard | ❌ Remover | Usar DashboardEssentialKPIs |
| ChartsSection | Dashboard | ⏳ Mover para aba "Análises" | Não misturar com overview |
| KPIsOperacionaisSection | Dashboard | ⏳ Consolidar com Financeiro | Usar padrão de abas |
| DashboardFinanceiroResumo (700+ linhas) | Financeiro | 🔧 **REFATORAR** | Quebrar em componentes menores |
| DashboardKPIsComparativosWidget | Dashboard | ❌ Remover | Usar relatividade nos cards |
| ResizableRow | Layout | ⏳ Validar | Se não usa, remover |

---

## SEÇÃO 2 — PADRÃO DE LAYOUT: w-full + h-full

### 2.1 Estrutura Padrão de Página

```jsx
// ✅ CORRETO
export default function ModulePage() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header — sempre no topo */}
      <ModuleHeader title="Módulo" />
      
      {/* Conteúdo principal — cresce para preencher altura */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="w-full h-full">
          <TabsList className="px-4 py-2 border-b">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          {/* Conteúdo com scroll interno, NÃO página inteira */}
          <TabsContent 
            value="overview" 
            className="flex-1 overflow-auto p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <KPICard />
              <KPICard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ❌ ERRADO
export default function BadPage() {
  return (
    <div>  {/* sem w-full h-full */}
      <h1>Título</h1>
      <div className="overflow-auto">  {/* scroll na div, não em container específico */}
        <Table data={data} />
      </div>
    </div>
  );
}
```

### 2.2 Componentes Redimensionáveis (Exceto Abas)

```jsx
// Painel com divisor arrastável (não aba)
<Resizable>
  <ResizablePanel defaultSize={30}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={70}>
    <MainContent />
  </ResizablePanel>
</Resizable>
```

### 2.3 Responsividade

| Breakpoint | Comportamento |
|-----------|--------------|
| **Mobile (< 640px)** | 1 coluna, cards full-width, header colapsável |
| **Tablet (640–1024px)** | 2 colunas, sidebar em drawer |
| **Desktop (> 1024px)** | 3+ colunas, sidebar fixa, layout fluido |

---

## SEÇÃO 3 — KPIs ESSENCIAIS POR MÓDULO

### 3.1 FINANCEIRO (6–8 KPIs)
```
1. 💵 Fluxo de Caixa (saldo hoje + 7 dias projetado)
2. 📊 Receitas do Mês (acumulado + meta)
3. ⏰ Contas a Receber Pendentes (valor + dias atraso)
4. 📌 Contas a Pagar Pendentes (valor + vencimentos próximos)
5. ✅ Taxa de Conciliação (% contas reconciliadas)
6. 📈 Ticket Médio (último mês)
7. 💳 Formas de Pagamento (distribuição top 3)
8. 🎯 Meta vs Realizado (mês atual %)
```

### 3.2 COMERCIAL (6–8 KPIs)
```
1. 🚀 Oportunidades em Andamento (quantidade + valor)
2. 💼 Taxa de Conversão (Funil: % por etapa)
3. 📦 Pedidos em Aberto (quantidade + valor)
4. 👥 Novos Clientes (mês atual)
5. 🎁 Ticket Médio de Vendas
6. 📅 Próximos Follow-ups (quantidade vencida)
7. 🏆 Top 5 Vendedores (este mês)
8. 📉 Taxa de Churn (clientes inativos últimos 30 dias)
```

### 3.3 ESTOQUE (6–8 KPIs)
```
1. 📦 Quantidade Total de Produtos
2. ⚠️ Itens em Alerta (abaixo de mínimo)
3. 💰 Valor Investido em Estoque
4. 🔄 Rotatividade (giro médio)
5. 📊 Produtos com Movimento (últimos 30 dias)
6. 🚫 Itens Obsoletos (sem movimento > 90 dias)
7. 📈 Entrada vs Saída (balanço do mês)
8. 📍 Localização com Maior Volume
```

### 3.4 PRODUÇÃO (6–8 KPIs)
```
1. 🏭 Ordens em Andamento (quantidade)
2. ✅ Taxa de Conclusão (% esperado vs realizado)
3. 🎯 Refugo (% do total produzido)
4. ⏱️ Tempo Médio de Produção (vs planejado)
5. 👷 Capacidade Utilizada (% da fábrica)
6. 📅 OPs Vencidas (quantidade + delay)
7. 🔧 Máquinas em Manutenção (paradas)
8. 📊 Produtividade por Operador (ytd)
```

### 3.5 EXPEDIÇÃO (6–8 KPIs)
```
1. 🚚 Entregas Agendadas (hoje/semana)
2. ✅ Taxa de Sucesso de Entrega (%)
3. ⏰ Entregas Atrasadas (quantidade + dias)
4. 📍 Em Rota Agora (quantidade)
5. 📊 Tempo Médio de Entrega (vs SLA)
6. 💰 Custo Médio de Frete (últimas 30)
7. 🚛 Transportadores Mais Usados (distribuição)
8. 🎯 Clientes com Problema (últimas entregas)
```

### 3.6 RH (6–8 KPIs)
```
1. 👥 Colaboradores Ativos
2. 📊 Taxa de Absenteísmo (%)
3. 📅 Férias Agendadas (próximas 30 dias)
4. 🔄 Turnover (últimos 12 meses %)
5. ⏱️ Horas Extras (mês atual)
6. 🎓 Cursos/Treinamentos (qtd realizada vs planejado)
7. 📊 Distribuição por Cargo/Setor
8. 🎯 Meta de Produtividade (cumprimento %)
```

### 3.7 SISTEMA (Monitoramento)
```
1. 🔒 Usuários Logados Agora
2. 📊 Operações de Hoje (create/update/delete)
3. 🚨 Alertas Não Resolvidos
4. ⏱️ Tempo Médio de Resposta da API
5. 💾 Sincronização Grupo ↔ Empresas (lag)
6. 🔐 Tentativas de Acesso Negado (últimas 24h)
7. 📈 Crescimento de Dados (volume últimos 30 dias)
8. 🎯 Saúde Geral do Sistema (%)
```

---

## SEÇÃO 4 — COMPONENTES PARA REFATORAÇÃO

### 4.1 Arquivos > 600 linhas em Dashboards

| Arquivo | Linhas | Componentes | Ação |
|---------|--------|-----------|------|
| DashboardFinanceiroResumo | ⚠️ ~700 | 5+ | Quebrar em KPICard, ResumoTabela, etc |
| DashboardProducaoRealtime | ⚠️ ~650 | 4+ | Quebrar em KPIStrip, KanbanWidget, etc |
| PedidoFormCompleto | ⚠️ ~800 | 6+ | **REFATORAÇÃO CRÍTICA** |
| ContaReceberForm | ⚠️ ~600 | 4+ | Quebrar em abas (Dados, Vinculações, etc) |

### 4.2 Padrão de Refatoração

```jsx
// ❌ ANTES (700+ linhas em um arquivo)
export default function DashboardFinanceiro() {
  // 200 linhas de lógica de dados
  // 150 linhas de cálculos
  // 300 linhas de JSX
  return (
    <div>
      {/* tudo em um lugar */}
    </div>
  );
}

// ✅ DEPOIS (modular)
// DashboardFinanceiro.jsx (100 linhas)
import KPIStrip from './KPIStrip';
import ContasTabela from './ContasTabela';
import CaixaResumo from './CaixaResumo';

export default function DashboardFinanceiro() {
  const kpis = useDashboardKPIs();
  return (
    <div className="w-full h-full">
      <KPIStrip kpis={kpis} />
      <Tabs>
        <TabsContent value="contas">
          <ContasTabela />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// KPIStrip.jsx (80 linhas)
export default function KPIStrip({ kpis }) {
  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {kpis.map(kpi => <KPICard key={kpi.id} {...kpi} />)}
    </div>
  );
}

// CaixaResumo.jsx (60 linhas)
// ContasTabela.jsx (120 linhas)
```

---

## SEÇÃO 5 — PLANO DE IMPLEMENTAÇÃO

### Fase 1: Auditoria & Planejamento (2 dias)
- [ ] Mapear todos dashboards (24 total)
- [ ] Validar layout de cada um (w-full + h-full)
- [ ] Listar componentes > 600 linhas
- [ ] Definir 6–8 KPIs por módulo

### Fase 2: Refatoração de Dashboards Críticos (3–4 dias)
- [ ] Dashboard Principal → 8 KPIs + abas
- [ ] DashboardFinanceiroResumo → quebrar em 4 componentes
- [ ] Financeiro → consolidar em 1 dashboard + 5 abas
- [ ] Comercial → consolidar em 1 dashboard + 4 abas

### Fase 3: Responsividade & Layout (2–3 dias)
- [ ] Aplicar w-full + h-full em todas páginas
- [ ] Implementar scroll interno (não página inteira)
- [ ] Testar mobile (< 640px) — drawer sidebar
- [ ] Testar tablet (640–1024px) — 2 colunas
- [ ] Testar desktop (> 1024px) — 3+ colunas

### Fase 4: Performance & Validação (1–2 dias)
- [ ] Lazy loading de abas não visíveis
- [ ] Memoization de componentes pesados
- [ ] Teste de velocidade (Lighthouse)
- [ ] Teste em navegadores (Chrome, Firefox, Safari)

---

## SEÇÃO 6 — CHECKLIST P4 COMPLETO

- [ ] Dashboards simplificados (6–8 KPIs cada)?
- [ ] Layout w-full + h-full em todas páginas?
- [ ] Scroll interno por container (não página inteira)?
- [ ] Responsividade testada (mobile, tablet, desktop)?
- [ ] Componentes redimensionáveis (exceto abas)?
- [ ] Arquivos > 600 linhas refatorados?
- [ ] Sem cards/widgets repetidos?
- [ ] Performance otimizada (Lighthouse > 80)?

---

**Documento gerado automaticamente em 2026-06-21** | Execução: Base44 AI | Status: Pronto para Fase 1