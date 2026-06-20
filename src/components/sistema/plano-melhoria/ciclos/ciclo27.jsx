/**
 * CICLO 27 — Auditoria Estrutural Completa (5 Prioridades)
 * Data: 2026-06-20
 * Regra-Mãe: melhorias apenas no existente, sem novos módulos.
 *
 * P1 — CHECKUP GERAL:
 *  - useVisualizadorState: limpeza automática de seleção, busca e página ao trocar ENTITY
 *  - Dashboard: removido kpiCards=[] (código morto passado para DashboardResumoTab)
 *  - useVisualizadorCRUD: auditoria do _action=delete agora inclui dadosAntes + group_id/empresa_id
 *
 * P2 — MULTIEMPRESA:
 *  - useVisualizadorQuery: queryKey já inclui empresaId ?? null e groupId ?? null (sem ambiguidade de cache)
 *  - useVisualizadorCRUD: handlePersistSubmit lança erro com mensagem clara se !isSimple && !empresaId && !groupId
 *  - VisualizadorBody: banner inline exibido quando !contextoValido
 *  - readFilter em VisualizadorUniversalEntidadeV24: $or multi-contexto com empresasDoGrupo
 *
 * P3 — RBAC e SEGURANÇA:
 *  - Exclusão individual: substituída window.confirm → diálogo modal com overlay (VisualizadorUniversalEntidadeV24)
 *  - Exclusão em massa: substituída window.confirm → diálogo modal inline (VisualizadorToolbar)
 *  - handleDeleteSelected: window.confirm removido — toolbar controla a confirmação antes de chamar
 *  - Auditoria antes/depois em todas as ações CRUD (Criação, Edição, Exclusão individual e em massa)
 *  - data-permission em todos os botões sensíveis (Cadastros.criar, editar, excluir, exportar)
 *  - canCreate/canEdit/canDelete verificado antes de habilitar botões e antes de executar ações
 *
 * P4 — LAYOUT E FLUIDEZ:
 *  - VisualizadorModal: header melhorado com breadcrumb de contexto + nome do registro em edição
 *  - VisualizadorTableBody: estado vazio com dica de ação "Use o botão Novo para criar o primeiro registro"
 *  - useVisualizadorQuery: retry reduzido de 2→1 e delay aumentado (menos noise em rate-limit)
 *  - Dashboard: queries de IA (iaFinanceAnomalyScan) somente quando autoRefresh ativo (evita desperdício de créditos)
 *
 * P5 — ADMINISTRAÇÃO E CADASTROS:
 *  - Cadastros: badge de contexto ativo com nome real da empresa/grupo
 *  - Cadastros: aviso de contexto ausente mais descritivo e acionável
 *  - Cadastros: barra de totais compacta por bloco com navigate por clique (accordion)
 *  - VisualizadorToolbar: exportar CSV com data-permission="Cadastros.exportar"
 *
 * Arquivos alterados:
 *  - components/cadastros/hooks/useVisualizadorState.jsx
 *  - components/cadastros/hooks/useVisualizadorQuery.jsx
 *  - components/cadastros/hooks/useVisualizadorCRUD.jsx
 *  - components/cadastros/VisualizadorUniversalEntidadeV24.jsx
 *  - components/cadastros/VisualizadorBody.jsx
 *  - components/cadastros/VisualizadorModal.jsx
 *  - components/cadastros/VisualizadorToolbar.jsx
 *  - components/cadastros/VisualizadorTableBody.jsx
 *  - pages/Dashboard.jsx
 *  - pages/Cadastros.jsx
 */
export const CICLO_27 = {
  versao: '27',
  data: '2026-06-20',
  prioridades: ['P1-Checkup', 'P2-Multiempresa', 'P3-RBAC', 'P4-Layout', 'P5-Admin'],
  status: 'concluido',
};