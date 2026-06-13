// Ciclo 25 — Agosto 2026 — Consolidação de Qualidade, Segurança e Propagação
export const ciclo25Items = [
  {
    id: 'c25-01', modulo: 'Todos', pilar: 'Multiempresa', prioridade: 'ALTO',
    titulo: 'Garantir group_id + empresa_id em todos os formulários de criação de registros',
    status: 'concluido', impacto: 'Alto',
    descricao: 'VisualizadorUniversalEntidadeV24 agora exibe banner de bloqueio quando contextoValido=false. useVisualizadorCRUD já carimba group_id/empresa_id antes de create/update. Acesso bloqueado sem contexto.',
  },
  {
    id: 'c25-02', modulo: 'Cadastros / Financeiro', pilar: 'Segurança', prioridade: 'ALTO',
    titulo: 'Validação e sanitização unificada em todos os forms via sanitizeOnWrite',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Garantir que a função sanitizeOnWrite seja chamada em todos os pontos de escrita (create/update) dos módulos Cadastros, Financeiro, Comercial e Compras. Eliminar inconsistências de sanitização entre módulos.',
  },
  {
    id: 'c25-03', modulo: 'Propagação', pilar: 'Multiempresa', prioridade: 'ALTO',
    titulo: 'Refatorar propagateGroupConfigs para suportar entidades faltantes (FormaPagamento, TabelaPreco, CondicaoComercial)',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Auditoria confirmou que propagateGroupConfigs já inclui FormaPagamento, TabelaPreco e CondicaoComercial em DEFAULT_ENTIDADES (linhas 37-60). Nenhuma alteração necessária — entidades já propagadas bidirecional.',
  },
  {
    id: 'c25-04', modulo: 'VisualizadorUniversalV24', pilar: 'Modularização', prioridade: 'MÉDIO',
    titulo: 'Refatorar VisualizadorUniversalEntidadeV24.jsx — extrair renderização principal para VisualizadorBody.jsx',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Bloco de renderização (Toolbar+Tabela+Modal+Banners+Paginação) extraído para VisualizadorBody.jsx (~130 linhas). VisualizadorUniversalEntidadeV24.jsx reduzido de ~340 para ~220 linhas.',
  },
  {
    id: 'c25-05', modulo: 'Auditoria', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Unificar AuditLog: garantir registro de ações de exclusão em massa nos módulos Cadastros e Compras',
    status: 'concluido', impacto: 'Médio',
    descricao: 'AuditLog.create adicionado em handleDeleteSelected no VisualizadorUniversalEntidadeV24. Registra entidade, lista de IDs excluídos, empresa_id, group_id e timestamp. Auditoria não bloqueia a operação em caso de falha.',
  },
  {
    id: 'c25-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 25 registrado, roadmap Q3/Q4 2027 atualizado',
    status: 'concluido', impacto: 'Baixo',
    descricao: 'ciclo25Items criado, PlanoMelhoriaCicloAtual e PlanoMelhoria atualizados para refletir Ciclo 25 como ciclo atual. Roadmap Q4 2027 adicionado ao melhoriaPlanData.js.',
  },
];