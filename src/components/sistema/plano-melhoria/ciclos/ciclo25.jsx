// Ciclo 25 — Agosto 2026 — Consolidação de Qualidade, Segurança e Propagação
export const ciclo25Items = [
  {
    id: 'c25-01', modulo: 'Todos', pilar: 'Multiempresa', prioridade: 'ALTO',
    titulo: 'Garantir group_id + empresa_id em todos os formulários de criação de registros',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Auditoria em todos os forms de criação (Cliente, Fornecedor, Produto, Pedido, ContaPagar, ContaReceber, Colaborador). Garantir que o carimbo automático de group_id e empresa_id ocorra antes do save, bloqueando criação sem contexto definido.',
  },
  {
    id: 'c25-02', modulo: 'Cadastros / Financeiro', pilar: 'Segurança', prioridade: 'ALTO',
    titulo: 'Validação e sanitização unificada em todos os forms via sanitizeOnWrite',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Garantir que a função sanitizeOnWrite seja chamada em todos os pontos de escrita (create/update) dos módulos Cadastros, Financeiro, Comercial e Compras. Eliminar inconsistências de sanitização entre módulos.',
  },
  {
    id: 'c25-03', modulo: 'Propagação', pilar: 'Multiempresa', prioridade: 'ALTO',
    titulo: 'Refatorar propagateGroupConfigs para suportar entidades faltantes (FormaPagamento, TabelaPreco, CondicaoComercial)',
    status: 'planejado', impacto: 'Alto',
    descricao: 'A função propagateGroupConfigs não replica FormaPagamento, TabelaPreco e CondicaoComercial do Grupo para as empresas filhas. Adicionar essas entidades ao mapa de propagação bidirecional existente, sem criar nova função.',
  },
  {
    id: 'c25-04', modulo: 'VisualizadorUniversalV24', pilar: 'Modularização', prioridade: 'MÉDIO',
    titulo: 'Refatorar VisualizadorUniversalEntidadeV24.jsx — extrair renderização principal para VisualizadorBody.jsx',
    status: 'planejado', impacto: 'Médio',
    descricao: 'O arquivo VisualizadorUniversalEntidadeV24.jsx ainda passa de 300 linhas. Extrair o bloco de renderização principal (toolbar + tabela + modal) para um novo componente VisualizadorBody.jsx, mantendo toda a lógica de estado nos hooks existentes.',
  },
  {
    id: 'c25-05', modulo: 'Auditoria', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Unificar AuditLog: garantir registro de ações de exclusão em massa nos módulos Cadastros e Compras',
    status: 'planejado', impacto: 'Médio',
    descricao: 'Exclusões em massa (bulkDelete) nos módulos Cadastros e Compras não geram registro individual no AuditLog. Adicionar log de cada item excluído com usuario_id, empresa_id e entidade dentro do hook useVisualizadorCRUD.',
  },
  {
    id: 'c25-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 25 registrado, roadmap Q3/Q4 2027 atualizado',
    status: 'concluido', impacto: 'Baixo',
    descricao: 'ciclo25Items criado, PlanoMelhoriaCicloAtual e PlanoMelhoria atualizados para refletir Ciclo 25 como ciclo atual. Roadmap Q4 2027 adicionado ao melhoriaPlanData.js.',
  },
];