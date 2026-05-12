import { ShieldCheck, Building2, LockKeyhole, Gauge, Sparkles, Bot, Network, ClipboardCheck, Rocket, Workflow } from 'lucide-react';

export const planoExecutionPillars = [
  {
    id: 'multiempresa',
    title: 'Multiempresa em tudo',
    icon: Building2,
    progress: 96,
    status: 'Validando',
    description: 'Carimbo automático, filtro contextual e leitura por grupo/empresa em todos os módulos operacionais. EmpresaSwitcher global com propagação descendente.',
    checkpoints: ['group_id/empresa_id', 'EmpresaSwitcher', 'filterInContext', 'auditoria por escopo', 'propagateGroupConfigs', 'Isolamento por empresa']
  },
  {
    id: 'acesso',
    title: 'Controle de acesso granular',
    icon: LockKeyhole,
    progress: 92,
    status: 'Em execução',
    description: 'Proteção visual, guard backend, ações sensíveis auditadas, permissões por módulo, aba, ação e campo com SoD.',
    checkpoints: ['ProtectedSection', 'entityGuard', 'RBAC local', 'bloqueios auditados', 'SoDValidator', 'perfis por empresa']
  },
  {
    id: 'performance',
    title: 'Performance e cache',
    icon: Gauge,
    progress: 91,
    status: 'Validando',
    description: 'Contagens otimizadas, cache seletivo IDB, prefetch preditivo e redução de chamadas repetidas com deduplicação de inflight.',
    checkpoints: ['entityListSorted', 'countEntitiesOptimized', 'prefetch preditivo', 'cache IDB offline', 'deduplicação inflight', 'limites de paginação']
  },
  {
    id: 'ux',
    title: 'UX responsiva e multitarefa',
    icon: Sparkles,
    progress: 91,
    status: 'Em execução',
    description: 'Layouts w-full/h-full em todos os módulos, cards fluidos, integração com WindowManager multitarefa e modo escuro.',
    checkpoints: ['w-full/h-full', 'mobile-first', 'WindowManager', 'cards adaptáveis', 'modo escuro', 'ModuleImprovementBar']
  },
  {
    id: 'ia',
    title: 'IA operacional conectada',
    icon: Bot,
    progress: 95,
    status: 'Validando',
    description: 'IA integrada em cada módulo: financeiro, preço, rotas, churn, agenda, compras, produção, RH, fiscal e CRM.',
    checkpoints: ['iaFinanceAnomalyScan', 'productPriceOptimizer', 'optimizeDeliveryRoute', 'iaChurnAnalyzer', 'AgendaIAPanel', 'ComprasIAInsights']
  },
  {
    id: 'governanca',
    title: 'Governança e auditoria',
    icon: ClipboardCheck,
    progress: 94,
    status: 'Validando',
    description: 'AuditLog central, rastreabilidade de função, LGPD, PII encriptado, validações de risco e SoD em todas as entidades.',
    checkpoints: ['AuditLog', 'deployAudit', 'piiEncryptor', 'sodValidator', 'securityAlerts', 'permissionOptimizer']
  }
];

export const planoModuleSprints = [
  { module: 'Dashboard', focus: 'KPIs executivos em tempo real, IA preditiva, multiempresa e consolidação por grupo', owner: 'Sistema', priority: 'Alta', status: 'Validando' },
  { module: 'CRM', focus: 'Oportunidades reais, interações, churn IA, pipeline e escopo multiempresa validado', owner: 'Comercial', priority: 'Alta', status: 'Validando' },
  { module: 'Comercial', focus: 'Pedido completo, reserva de estoque, aprovação de desconto, fechamento e NF-e', owner: 'Vendas', priority: 'Crítica', status: 'Validando' },
  { module: 'Estoque', focus: 'Saldo confiável em KG, movimentações auditadas, inventário seguro e IA de reposição', owner: 'Operação', priority: 'Crítica', status: 'Validando' },
  { module: 'Compras', focus: 'Fornecedores compartilhados, OC com governança, IA insights e performance panel', owner: 'Suprimentos', priority: 'Alta', status: 'Em execução' },
  { module: 'Financeiro', focus: 'Liquidação segura, boletos/PIX, conciliação, anomalias IA e caixa central', owner: 'Financeiro', priority: 'Crítica', status: 'Em execução' },
  { module: 'Expedição', focus: 'Roteirização IA, romaneio, entrega digital, rastreio GPS e logística reversa', owner: 'Logística', priority: 'Alta', status: 'Validando' },
  { module: 'Fiscal', focus: 'NF-e multiempresa, validação IA, SPED, CFOP automático e logs SEFAZ', owner: 'Fiscal', priority: 'Alta', status: 'Validando' },
  { module: 'RH', focus: 'Colaboradores, ponto biométrico, férias, monitoramento IA e apontamentos', owner: 'RH', priority: 'Média', status: 'Em execução' },
  { module: 'Produção', focus: 'OPs reais, apontamentos, IA diagnóstico, kanban inteligente e multiempresa', owner: 'Fábrica', priority: 'Alta', status: 'Em execução' },
  { module: 'Agenda', focus: 'Calendário multiempresa, IA de eventos, painel lateral e lembretes automáticos', owner: 'Sistema', priority: 'Alta', status: 'Em execução' },
  { module: 'Contratos', focus: 'KPIs de contratos, IA de risco, renovação automática e cobrança integrada', owner: 'Jurídico', priority: 'Média', status: 'Em execução' },
  { module: 'Cadastros', focus: 'Base mestre padronizada, IA de sugestão, contagens otimizadas e validação KYC', owner: 'Admin', priority: 'Alta', status: 'Validando' },
  { module: 'Sistema', focus: 'Acessos granulares, auditoria total, SoD, backup, governança e plano de melhoria vivo', owner: 'Admin', priority: 'Crítica', status: 'Validando' }
];

export const planoRiskControls = [
  { title: 'Escopo multiempresa obrigatório', level: 'Crítico', mitigation: 'Bloquear leitura/escrita sem grupo ou empresa definidos. Carimbo automático em todas as entidades.' },
  { title: 'Ações sensíveis com RBAC', level: 'Crítico', mitigation: 'Validar permissões no frontend (ProtectedSection) e no backend (entityGuard) antes da execução.' },
  { title: 'Documentos não podem quebrar lint', level: 'Alto', mitigation: 'Manter espelhos técnicos fora da análise de código. Usar DOCUMENTATION_BLOCK_POLICY.' },
  { title: 'IA sempre auditável', level: 'Alto', mitigation: 'Registrar chamadas, módulo, escopo e duração no AuditLog. piiEncryptor em dados sensíveis.' },
  { title: 'Performance por paginação', level: 'Médio', mitigation: 'Usar entityListSorted com limites, countEntitiesOptimized e cache IDB offline.' },
  { title: 'LGPD e privacidade de dados', level: 'Alto', mitigation: 'PII encriptado via piiEncryptor. Consentimento registrado. Acesso auditado por SoD.' },
  { title: 'Backup e continuidade', level: 'Médio', mitigation: 'autoBackup ativo com criptografia. deployAudit rastreando versões. Restore testado.' },
  { title: 'Componentes grandes', level: 'Médio', mitigation: 'Dividir arquivos > 150 linhas em componentes menores. Hooks dedicados por domínio.' }
];

export const planoValidationTracks = [
  { label: 'Estabilidade', icon: ShieldCheck, value: 'Lint/build protegido' },
  { label: 'Modularização', icon: Workflow, value: 'Componentes pequenos' },
  { label: 'Integrações', icon: Network, value: 'Funções existentes reutilizadas' },
  { label: 'Evolução contínua', icon: Rocket, value: 'Backlog vivo por módulo' }
];