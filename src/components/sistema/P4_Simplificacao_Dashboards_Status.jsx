/**
 * P4 — Layout e Fluidez — Status de Simplificação de Dashboards
 * Objetivo: Remover excesso de informação, manter apenas KPIs críticos
 * 
 * Dashboard (525 linhas):
 * ✅ OK — Estrutura clara com lazy loading
 * 🟡 Revisar: 6+ cards de KPI OK, mas muitos Lazy com suspense desnecessários
 * 📋 Tamanho cards: 4 cards críticos (Vendas, Fluxo Caixa, Contas Receber, Contas Pagar)
 * ⏳ Ação P4: Remover ou colapsar informações secundárias em modais/janelas
 * 
 * Recomendações P4:
 * 1. Dashboard home: Manter APENAS 4 KPIs críticos + 1 atalho rápido
 * 2. Remover cards "secundários" (chatbot, IA panels) → mover para módulos específicos
 * 3. Usar abas colapsáveis para "Análises Avançadas" em vez de exibir tudo
 * 4. Layout: w-full h-full com scroll interno por seção
 * 5. Testes responsividade: mobile (sm) e desktop (lg)
 */

const p4Status = {
  Dashboard: {
    linhas: 525,
    status: "🟡 Revisar",
    cards: 6,
    cards_criticos: 4,
    cards_secundarios: 2,
    "recomendacao": "Colapsar análises avançadas em modal; manter home simples"
  },
  
  "Dashboard/Financeiro": {
    status: "⏳ Implementar",
    "problema": "Múltiplos cards de contas; redundância visual",
    "solucao": "Abas: Visão Geral | Contas Receber | Contas Pagar | Fluxo"
  },

  "Dashboard/Comercial": {
    status: "🟡 Revisar",
    "problema": "Muitos pedidos exibidos; paginação necessária",
    "solucao": "Table com paginação e filtros RBAC"
  },

  "Dashboard/Estoque": {
    status: "⏳ Implementar",
    "problema": "Não existe dashboard dedicado",
    "solucao": "Criar dashboard minimalista: Produtos Críticos | Movimentações | Inventários"
  },

  "Dashboard/Producao": {
    status: "⏳ Implementar",
    "problema": "Não existe dashboard dedicado",
    "solucao": "Kanban de OP + KPI taxa aprovação"
  },

  "Dashboard/RH": {
    status: "⏳ Implementar",
    "problema": "Não existe dashboard dedicado",
    "solucao": "Horas trabalhadas + Férias pendentes + Ausências"
  }
};

/**
 * P4 TAREFAS (Ordem de prioridade):
 * 1. Dashboard Home: Remover cards secondarios em lazy (mover para botões de atalho)
 * 2. Criar Dashboard/Financeiro com abas colapsáveis
 * 3. Melhorar layout: grid responsivo (sm: 1 coluna, lg: 2-3 colunas)
 * 4. Adicionar suporte dark mode nos cards
 * 5. Implementar Dashboards para Estoque, Producao, RH (template mínimo)
 * 6. Validar responsividade em mobile (viewport < 768px)
 */

export default p4Status;