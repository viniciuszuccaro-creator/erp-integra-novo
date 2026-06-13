// Ciclo 25 — Agosto 2026 — Robustez Multiempresa, RBAC e Qualidade de Dados
export const ciclo25Items = [
  {
    id: 'c25-01', modulo: 'Cadastros', pilar: 'Multiempresa', prioridade: 'CRÍTICO',
    titulo: 'Validação automática de group_id/empresa_id em todos os forms de Cadastros',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Todos os formulários de cadastro (Cliente, Fornecedor, Produto, Colaborador, etc.) devem validar e carimbar automaticamente group_id e empresa_id antes de salvar. Bloquear salvamento se contexto não estiver definido.',
  },
  {
    id: 'c25-02', modulo: 'Comercial', pilar: 'Qualidade', prioridade: 'CRÍTICO',
    titulo: 'Validação de estoque disponível antes de confirmar Pedido',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Ao confirmar um pedido, verificar em tempo real se há estoque disponível para cada item. Exibir alerta de estoque insuficiente com quantidade atual vs. solicitada antes de prosseguir.',
  },
  {
    id: 'c25-03', modulo: 'Financeiro', pilar: 'Qualidade', prioridade: 'ALTO',
    titulo: 'Deduplicação de ContaReceber e ContaPagar — bloquear duplicatas por pedido_id',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Implementar verificação de duplicidade no momento da criação de contas a receber/pagar. Usar pedido_id + valor + data_vencimento como chave composta. Exibir alerta e bloquear criação duplicada.',
  },
  {
    id: 'c25-04', modulo: 'Estoque', pilar: 'Performance', prioridade: 'ALTO',
    titulo: 'Índice de criticidade de estoque — alertas automáticos de ruptura',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Calcular índice de criticidade (estoque_atual / estoque_minimo) para cada produto. Produtos abaixo de 1.0 exibem badge vermelho no módulo de Estoque e disparam alerta no Dashboard.',
  },
  {
    id: 'c25-05', modulo: 'RBAC', pilar: 'Segurança', prioridade: 'ALTO',
    titulo: 'Auditoria de ações sensíveis — log detalhado de aprovações, exclusões e bloqueios',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Registrar no AuditLog todas as ações sensíveis: aprovação de pedido, exclusão de registro, bloqueio de fornecedor, liquidação financeira. Incluir usuário, empresa, timestamp e dados antes/depois.',
  },
  {
    id: 'c25-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 25 registrado, roadmap Q4 2027 atualizado',
    status: 'planejado', impacto: 'Médio',
    descricao: 'ciclo25Items criado, PlanoMelhoriaCicloAtual e melhoriaPlanData.js atualizados para refletir Ciclo 25 como ciclo atual. Roadmap Q4 2027 sincronizado.',
  },
];