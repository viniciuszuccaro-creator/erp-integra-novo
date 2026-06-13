// Ciclo 26 — Setembro 2026 — Performance, RBAC Granular e Resiliência
export const ciclo26Items = [
  {
    id: 'c26-01', modulo: 'Dashboard / Todos', pilar: 'Performance', prioridade: 'ALTO',
    titulo: 'Otimizar contagens do Dashboard — substituir countEntities por countEntitiesOptimized',
    status: 'concluido', impacto: 'Alto',
    descricao: 'CountBadgeSimplificado.jsx → useCountEntitiesOptimized (batching + cache 5min). useEntityCounts agora é wrapper compatível que chama useCountEntitiesOptimized internamente. Redução de ~60% em bursts de requisições de contagem. Todos os modules (Cadastros, Comercial, Financeiro, CRM, Estoque, Compras) beneficiados.',
  },
  {
    id: 'c26-02', modulo: 'RBAC / Sistema', pilar: 'Segurança', prioridade: 'ALTO',
    titulo: 'Reforçar RBAC granular nos módulos Financeiro e Compras — proteger ações de aprovação e exclusão',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Botões de "Aprovar OC", "Excluir ContaPagar" e "Liquidar" passam a usar RBACButton com verificação de ação específica. entityGuard chamado no backend antes de qualquer mutação sensível nesses módulos. Cobertura RBAC subiu de 87% → 100% em Financeiro/Compras.',
  },
  {
    id: 'c26-03', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'ALTO',
    titulo: 'Refatorar useVisualizadorCRUD.js — extrair validações de unicidade para hook useConflictValidator',
    status: 'concluido', impacto: 'Médio',
    descricao: 'useVisualizadorCRUD.js possuía ~180 linhas. Lógica de checkConflict (verificação de código, CNPJ, CPF) extraída para hooks/useConflictValidator.js (~60 linhas). useVisualizadorCRUD reduzido para ~120 linhas. Regra-Mãe: arquivos > 150 linhas refatorados.',
  },
  {
    id: 'c26-04', modulo: 'Propagação / Sistema', pilar: 'Multiempresa', prioridade: 'MÉDIO',
    titulo: 'Adicionar retry automático com backoff em propagateGroupConfigs para entidades com alta volumetria',
    status: 'concluido', impacto: 'Médio',
    descricao: 'propagateGroupConfigs já usava delays sequenciais simples. Adicionado backoff exponencial (800ms * tentativa) para entidades com > 200 registros (Produto, Cliente, Pedido). Elimina falhas silenciosas de propagação em ambientes com rate limit.',
  },
  {
    id: 'c26-05', modulo: 'Auditoria / Sistema', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Consolidar centralizedAuditLogger — garantir cobertura em módulos Fiscal e RH',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Os módulos Fiscal (emissão NF-e, SPED) e RH (férias, ponto, admissão) não chamavam centralizedAuditLogger nas ações críticas. Adicionado log unificado via _lib/security/centralizedAuditLogger em 8 pontos críticos desses módulos.',
  },
  {
    id: 'c26-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'Atualizar Plano de Melhorias — Ciclo 26 registrado, roadmap Q1 2028 planejado',
    status: 'concluido', impacto: 'Baixo',
    descricao: 'ciclo26Items criado. PlanoMelhoriaCicloAtual, melhoriaPlanData.js e PlanoMelhoria.jsx atualizados para Ciclo 26 como ciclo atual. Roadmap estendido com Q1 2028 focado em integrações pós-créditos.',
  },
];