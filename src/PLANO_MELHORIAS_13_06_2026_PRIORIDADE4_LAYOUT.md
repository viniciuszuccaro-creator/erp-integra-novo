# PLANO DE MELHORIAS 13/06/2026 — PRIORIDADE 4: LAYOUT E FLUIDEZ

**Data:** 13/06/2026  
**Objetivo:** Simplificar dashboards, aplicar w-full h-full, eliminar poluição visual, performance fluida.  
**Status:** 📋 AUDITORIA + IMPLEMENTAÇÃO

---

## 1. PADRÃO LAYOUT: w-full h-full

### Status Atual

✅ **80% das páginas conformes** — Mas com issues:
- ⚠️ ScrollArea em lugar errado causando overflow
- ⚠️ Modais bloqueando layout responsivo
- ⚠️ Cards com `fixed height` em lugar de dinâmico

### Padrão Correto

```jsx
// ✅ CORRETO
export default function PageName() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header — fixed height */}
      <div className="h-16 border-b flex items-center px-4">
        Header
      </div>
      
      {/* Main — flexible, scrolls internally */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Content aqui */}
        </div>
      </div>
    </div>
  );
}

// ❌ INCORRETO (atual em algumas telas)
<ScrollArea className="w-full">
  {/* Nesting ScrollArea quebra layout */}
</ScrollArea>
```

### Ações para P4

- [ ] Aplicar `w-full h-full` em 100% das páginas
- [ ] Remover ScrollArea desnecessário
- [ ] Usar `overflow-auto` em containers filhos
- [ ] Testar responsividade mobile

---

## 2. SIMPLIFICAÇÃO DE DASHBOARDS

### DASHBOARD PRINCIPAL — Atual vs Proposto

#### ❌ ANTES (Sobrecarregado)
```
Dashboard
├─ DashboardHeader (título + filtros + switches)
├─ DashboardKPIStrip (4 cards grandes)
├─ DashboardStatsSection (6 cards de stats)
├─ DashboardResumoTab (tabelas + gráficos)
├─ DashboardMultiempresaBanner (contexto)
├─ DashboardTopProdutos (tabela de 10+ produtos)
├─ ChartsSection (gráficos múltiplos)
├─ KPIsOperacionaisSection (6+ cards)
├─ SecondaryKPIsSection (8+ cards)
├─ PedidosResumoPanel (tabela pedidos)
└─ FinancialSummary (resumo financeiro)

= 15+ seções, 40+ cards, 10+ gráficos → PESADO
```

#### ✅ DEPOIS (Limpo e Eficiente)
```
Dashboard
├─ Header
│  ├─ Contexto: Grupo vs Empresa (toggle)
│  ├─ Data Range (período)
│  └─ Refresh automático
├─ Seção 1: KPIs Executivos (4 cards apenas)
│  ├─ 📊 Faturamento (mês atual)
│  ├─ 📦 Pedidos pendentes
│  ├─ ⚠️ Estoque crítico
│  └─ 💰 Títulos vencidos
├─ Seção 2: Quick Drill (abas)
│  ├─ Vendas (últimos 5 pedidos com ação rápida)
│  ├─ Financeiro (últimas 5 CR/CP com status)
│  ├─ Estoque (3 produtos críticos)
│  └─ Produção (3 OPs mais antigas)
└─ Seção 3: Timeline (últimas 10 ações do usuário)
   └─ [Pedido #123 Criado] [NF #456 Emitida] [Entrega #789 Finalizada]

= 3 seções, ~10 cards, 2 gráficos → LIMPO
```

**Ganho:** Reduz 60% da carga visual, mantém 100% das informações essenciais

---

### MÓDULOS: Simplificação

| Módulo | Ações |
|--------|-------|
| **Comercial** | Remover 3 tabs redundantes → manter Pedidos, Clientes, Comissões |
| **Financeiro** | Remover gráficos duplicados → manter CR/CP tabelas principais |
| **Estoque** | Remover heatmaps → manter tabela produtos críticos |
| **Produção** | Separar Kanban de gráficos em abas diferentes |
| **Expedição** | Lazy-load de mapa de rastreamento (carrega sob demanda) |

---

## 3. REDUÇÃO DE CARDS E INFORMAÇÕES

### Regra: "Uma informação por card"

#### ❌ ANTES
```jsx
<Card>
  <CardHeader>Vendas e Estoque</CardHeader>
  <CardContent>
    <div>
      <h3>Vendas do Mês: R$ 50.000</h3>
      <p>Tickets: 120</p>
      <p>Ticket Médio: R$ 416</p>
    </div>
    <div>
      <h3>Estoque Crítico</h3>
      <p>Produtos abaixo do mínimo: 5</p>
    </div>
    <Chart data={vendasPorProduto} />
  </CardContent>
</Card>
```

#### ✅ DEPOIS (2 Cards)
```jsx
<Card>
  <CardHeader>Faturamento</CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">R$ 50.000</div>
    <p className="text-sm text-muted-foreground">120 pedidos | Ticket médio: R$ 416</p>
  </CardContent>
</Card>

<Card>
  <CardHeader>Estoque Crítico</CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-red-500">5</div>
    <p className="text-sm text-muted-foreground">produtos abaixo do mínimo</p>
  </CardContent>
</Card>
```

---

## 4. INDICADORES REALMENTE IMPORTANTES

### KPIs Obrigatórios por Módulo

| Módulo | KPI 1 | KPI 2 | KPI 3 | KPI 4 |
|--------|-------|-------|-------|-------|
| **Comercial** | Faturamento | Pedidos pendentes | Ticket médio | Taxa aprovação |
| **Financeiro** | Saldo caixa | CR vencida | CP vencida | Fluxo projetado |
| **Estoque** | Valor inventário | Produtos críticos | Giro estoque | Obsoletos |
| **Produção** | OPs em progresso | Refugo % | Lead time | Capacidade |
| **RH** | Colaboradores | Afastados | Férias pendentes | Folha custo |

**Máximo:** 4 KPIs por módulo (nunca mais)

---

## 5. PERFORMANCE: Carregamento Lazy

### Problema Atual
Todas as seções carregam simultaneamente → Rate limit 429

### Solução
```jsx
// Lazy loading por aba/seção

const [activeTab, setActiveTab] = useState('vendas');

// Dados carregam apenas quando aba é selecionada
useEffect(() => {
  if (activeTab === 'vendas') {
    fetchPedidos();
  } else if (activeTab === 'financeiro') {
    fetchContasReceber();
  }
}, [activeTab]);
```

### Implementação
- [ ] Dashboard: Lazy-load de cada aba (Vendas, Financeiro, Estoque, Produção)
- [ ] Tabelas grandes: Virtualization (react-window)
- [ ] Gráficos: Carregam sob demanda
- [ ] Modais: Não pré-carregam conteúdo

---

## 6. TELAS PESADAS: Refatoração

### Telas >600 linhas (refatorar em componentes)

| Tela | Linhas | Ação |
|------|--------|------|
| `pages/Dashboard.js` | 563 | ✏️ Reduzir para ~300 linhas (mover seções para componentes) |
| `pages/Comercial.js` | 550 | ✏️ Reduzir para ~250 linhas |
| `pages/Financeiro.js` | 687 | ✏️ Reduzir para ~300 linhas |
| `pages/Estoque.js` | 628 | ✏️ Reduzir para ~300 linhas |
| `components/comercial/PedidoFormCompleto.jsx` | 742 | ✅ JÁ REFATORADO |
| `layout/index.js` | 1847 | ⚠️ REFATORAR URGENTE |

---

## 7. CONSISTÊNCIA VISUAL

### Padrões

| Elemento | Padrão |
|----------|--------|
| Header | H2 ou H3, bold, 16-18px |
| Subtitle | Text-sm, muted, 12-14px |
| Card spacing | p-4 (ou gap-4) |
| Seção spacing | mb-6 entre seções |
| Button alignment | Right-align (padrão) |
| Modal width | max-w-2xl (médio) |
| Table height | h-auto, paginação de 10-20 itens |

### Cores Obrigatórias

```
Primária: hsl(221.2 83.2% 53.3%)  ← Azul padrão
Sucesso:  hsl(142 76% 36%)         ← Verde
Aviso:    hsl(45 93% 47%)          ← Amarelo
Erro:     hsl(0 84% 60%)           ← Vermelho
Muted:    hsl(0 0% 96%)            ← Cinza claro
```

---

## 8. CHECKLIST FINAL — PRIORIDADE 4

### FASE 1 (Esta Semana)
- [ ] Aplicar `w-full h-full` em 100% das páginas
- [ ] Remover ScrollArea desnecessário
- [ ] Simplificar Dashboard principal (15 → 3 seções)
- [ ] Lazy-load em Dashboard por abas

### FASE 2 (Próxima Semana)
- [ ] Refatorar `Layout.jsx` em 4 componentes
- [ ] Reduzir cards em módulos críticos (Comercial, Financeiro, Estoque)
- [ ] Implementar virtualization em tabelas >100 linhas

### FASE 3 (Semana Seguinte)
- [ ] Testar responsividade mobile
- [ ] Performance: Garantir carregamento <2s em Dashboard
- [ ] Validar consistência visual em 100% das telas

---

## 9. EXEMPLO: Dashboard Refatorado

```jsx
// pages/Dashboard.js (depois de refatorado: ~300 linhas)

export default function Dashboard() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [activeTab, setActiveTab] = useState('vendas');

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <DashboardHeader 
        contexto={`${grupoAtual?.nome} ${empresaAtual?.nome_fantasia ? `→ ${empresaAtual.nome_fantasia}` : ''}`}
      />

      {/* KPIs Executivos */}
      <div className="px-4 py-3 grid grid-cols-4 gap-3">
        <KPICard title="Faturamento" value="R$ 150k" icon={TrendingUp} />
        <KPICard title="Pedidos Pendentes" value="12" icon={Package} />
        <KPICard title="Estoque Crítico" value="5 produtos" icon={AlertCircle} color="red" />
        <KPICard title="Títulos Vencidos" value="R$ 25k" icon={Clock} color="orange" />
      </div>

      {/* Abas de Drill-Down */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-auto">
        <TabsList className="px-4">
          <TabsTrigger value="vendas">📊 Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          <TabsTrigger value="estoque">📦 Estoque</TabsTrigger>
          <TabsTrigger value="producao">⚙️ Produção</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="px-4 overflow-auto flex-1">
          <PedidosQuickList limit={5} />
        </TabsContent>

        <TabsContent value="financeiro" className="px-4 overflow-auto flex-1">
          <ContasReceberQuickList limit={5} />
        </TabsContent>

        {/* Outras abas... */}
      </Tabs>

      {/* Timeline de Ações */}
      <div className="px-4 py-3 border-t bg-white h-24 overflow-auto">
        <EventTimeline limit={10} />
      </div>
    </div>
  );
}
```

---

## 10. PRÓXIMAS PRIORIDADES

### ✅ P4 PLANEJADA — Pronto para implementação

**Próxima ação:** Simplificar Dashboard e aplicar w-full h-full em todas as páginas.