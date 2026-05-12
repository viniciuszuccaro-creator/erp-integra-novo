export const criticalPriorityModules = [
  {
    module: 'Sistema',
    priority: 'Crítica',
    progress: 99,
    status: 'Concluído',
    objective: 'Blindar governança, acessos, auditoria, segurança, backups e integrações sem quebrar módulos existentes.',
    safeguards: ['RBAC frontend/backend', 'AuditLog central', 'SoD e riscos', 'Backup e LGPD', 'PII encriptado', 'Perfis por empresa'],
    functions: ['entityGuard', 'securityAlerts', 'sodValidator', 'permissionOptimizer', 'autoBackup'],
    nextActions: ['Revisar perfis críticos', 'Validar acessos multiempresa', 'Auditar funções sensíveis']
  },
  {
    module: 'Comercial',
    priority: 'Crítica',
    progress: 97,
    status: 'Concluído',
    objective: 'Consolidar pedido completo com aprovação, margem, estoque, produção, entrega, financeiro e fiscal conectados.',
    safeguards: ['Aprovação de desconto', 'Reserva de estoque', 'Rastreio do pedido', 'Auditoria de fechamento', 'Wizard de pedido', 'NF-e automática'],
    functions: ['applyOrderStockMovements', 'orderFlowAuditor', 'onPedidoApprovalRequested', 'onPedidoReadyToInvoice'],
    nextActions: ['Validar fluxo pedido→estoque', 'Conferir aprovação por perfil', 'Reforçar indicadores de fechamento']
  },
  {
    module: 'Estoque',
    priority: 'Crítica',
    progress: 99,
    status: 'Concluído',
    objective: 'Garantir saldo confiável, movimentações auditadas, inventário seguro e reposição inteligente por empresa/grupo.',
    safeguards: ['Movimentação auditada', 'Inventário com aprovação', 'Saldo por empresa', 'IA de reposição', 'Lotes e validade', 'Transferência entre filiais'],
    functions: ['applyInventoryAdjustments', 'countEntitiesOptimized', 'productPriceOptimizer', 'iaFinanceAnomalyScan'],
    nextActions: ['Revalidar saldo disponível', 'Conferir movimentações críticas', 'Ativar alertas de estoque baixo']
  },
  {
    module: 'Financeiro',
    priority: 'Crítica',
    progress: 94,
    status: 'Em execução',
    objective: 'Unificar caixa, cobrança, conciliação, liquidação, rateios, boletos e anomalias com rastreabilidade total.',
    safeguards: ['Liquidação segura', 'Conciliação auditável', 'Boletos/PIX controlados', 'Anomalias por IA', 'Caixa central unificado', 'Formas de pagamento rastreadas'],
    functions: ['emitirBoleto', 'paymentStatusManager', 'iaFinanceAnomalyScan', 'reconcileLogisticaCosts'],
    nextActions: ['Validar liquidação ponta a ponta', 'Reforçar conciliação', 'Auditar cobranças geradas']
  },
  {
    module: 'Expedição',
    priority: 'Alta',
    progress: 97,
    status: 'Concluído',
    objective: 'Consolidar roteirização IA, rastreio GPS, romaneio, entrega digital e logística reversa por empresa.',
    safeguards: ['Entrega com comprovante', 'Rastreio GPS auditado', 'Romaneio por empresa', 'Logística reversa controlada'],
    functions: ['optimizeDeliveryRoute', 'onEntregaUpdated', 'reconcileLogisticaCosts', 'notifyProximity'],
    nextActions: ['Validar GPS em produção', 'Reforçar notificações de entrega', 'Auditar logística reversa']
  },
  {
    module: 'Produção',
    priority: 'Alta',
    progress: 96,
    status: 'Em execução',
    objective: 'Gerenciar ordens de produção reais com apontamentos, IA de diagnóstico, kanban e multiempresa.',
    safeguards: ['OPs com aprovação', 'Apontamentos auditados', 'Estoque reservado por OP', 'Kanban por empresa'],
    functions: ['applyOrderStockMovements', 'applyInventoryAdjustments', 'orderFlowAuditor', 'iaFinanceAnomalyScan'],
    nextActions: ['Conectar OP ao pedido', 'Validar reserva de matéria-prima', 'Ativar diagnóstico IA']
  }
];

export const criticalValidationRings = [
  { label: 'Multiempresa', value: 'Obrigatório em toda leitura e gravação. group_id + empresa_id em 100% das entidades.', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Acesso RBAC', value: 'Ações críticas protegidas por perfil no frontend (ProtectedSection) e backend (entityGuard).', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: 'Auditoria', value: 'Eventos sensíveis registrados em AuditLog central com módulo, escopo e timestamp.', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'IA auditável', value: 'IA conectada apenas a fluxos auditáveis com registro de chamadas e durações.', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Performance', value: 'Consultas com limites, cache IDB offline, prefetch preditivo e contagem otimizada.', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'LGPD', value: 'PII encriptado via piiEncryptor. Consentimento registrado. Acesso validado por SoD.', tone: 'bg-rose-50 text-rose-700 border-rose-200' }
];