/**
 * melhoriaPlanData.js — Dados de pilares e roadmap do ERP Zuccaro.
 * Ciclos individuais foram movidos para ./ciclos/cicloXX.js (Regra-Mãe: arquivos > 400 linhas → refatorados).
 */
import {
  Shield, Building2, Gauge, Sparkles, Workflow, Lock, Bot, Network,
  ClipboardCheck, Rocket,
} from 'lucide-react';

// Re-exporta ciclos individuais (mantém compatibilidade com importadores existentes)
export { ciclo11Items } from './ciclos/ciclo11';
export { ciclo12Items } from './ciclos/ciclo12';
export { ciclo13Items } from './ciclos/ciclo13';
export { ciclo14Items } from './ciclos/ciclo14';
export { ciclo15Items } from './ciclos/ciclo15';
export { ciclo16Items } from './ciclos/ciclo16';
export { ciclo17Items } from './ciclos/ciclo17';
export { ciclo18Items } from './ciclos/ciclo18';
export { ciclo19Items } from './ciclos/ciclo19';
export { ciclo20Items } from './ciclos/ciclo20';
export { ciclo21Items } from './ciclos/ciclo21';
export { ciclo22Items } from './ciclos/ciclo22';
export { ciclo23Items } from './ciclos/ciclo23';
export { ciclo24Items } from './ciclos/ciclo24';
export { ciclo25Items } from './ciclos/ciclo25';
export { ciclo26Items } from './ciclos/ciclo26';

// ── Pilares estruturais ───────────────────────────────────────────────────────
export const melhoriaPlanPhases = [
  {
    id: 'estabilidade', title: 'Estabilização técnica',
    status: 'concluido', progress: 100,
    icon: Shield, color: 'from-blue-600 to-cyan-500',
    goal: 'Remover erros de build/lint, imports quebrados e pontos frágeis.',
    items: ['Lint e build limpos', 'Arquivos espelho controlados', 'Erros auditados', 'Base segura']
  },
  {
    id: 'multiempresa', title: 'Multiempresa total',
    status: 'concluido', progress: 100,
    icon: Building2, color: 'from-indigo-600 to-blue-500',
    goal: 'group_id e empresa_id em cadastros, consultas, dashboards, relatórios e funções.',
    items: ['Escopo por grupo/empresa', 'Filtros contextuais', 'Carimbo automático', 'Isolamento de dados']
  },
  {
    id: 'acesso', title: 'Controle de acesso',
    status: 'concluido', progress: 100,
    icon: Lock, color: 'from-slate-700 to-slate-500',
    goal: 'RBAC granular por módulo, aba, ação e campo com auditoria dos bloqueios.',
    items: ['RBAC granular', 'Proteção visual', 'Entity guard', 'Auditoria sensível', 'Cobertura 100%', 'Aba Auditoria Acessos']
  },
  {
    id: 'modularizacao', title: 'Modularização contínua',
    status: 'concluido', progress: 100,
    icon: Workflow, color: 'from-violet-600 to-fuchsia-500',
    goal: 'Quebrar páginas grandes em pequenos componentes reutilizáveis e conectados.',
    items: ['Componentes ≤150 linhas', 'Hooks dedicados', 'Layouts reutilizáveis', 'Sem duplicidade']
  },
  {
    id: 'performance', title: 'Performance e cache',
    status: 'concluido', progress: 100,
    icon: Gauge, color: 'from-emerald-600 to-teal-500',
    goal: 'Otimizar carregamento, contagens, dashboards e chamadas repetidas.',
    items: ['Queries otimizadas', 'Cache IDB offline', 'Prefetch preditivo', 'Deduplicação inflight']
  },
  {
    id: 'ux', title: 'UX responsiva',
    status: 'concluido', progress: 100,
    icon: Sparkles, color: 'from-amber-500 to-orange-500',
    goal: 'w-full/h-full, responsivo, mobile-first e preparado para multitarefa.',
    items: ['Mobile-first', 'Cards adaptáveis', 'Tabelas fluidas', 'Layout multitarefa WindowManager']
  },
  {
    id: 'ia', title: 'IA operacional',
    status: 'concluido', progress: 100,
    icon: Bot, color: 'from-purple-600 to-indigo-500',
    goal: 'IA conectada a fluxos reais: vendas, estoque, financeiro, logística, fiscal e RH.',
    items: ['Anomalias financeiras', 'Preço inteligente', 'Rotas otimizadas', 'Previsão estoque', 'Churn', 'NF-e fiscal IA']
  },
  {
    id: 'integracoes', title: 'Integrações e automações',
    status: 'concluido', progress: 100,
    icon: Network, color: 'from-cyan-600 to-sky-500',
    goal: 'WhatsApp, NF-e, boletos, mapas, marketplaces, notificações sem duplicidade.',
    items: ['Reuso de funções', 'Alertas automáticos', 'Conectores seguros', 'Webhooks', 'CNAB/remessa']
  },
  {
    id: 'governanca', title: 'Governança e auditoria',
    status: 'concluido', progress: 100,
    icon: ClipboardCheck, color: 'from-rose-600 to-red-500',
    goal: 'Rastreabilidade total, LGPD, logs, SoD, riscos e compliance.',
    items: ['AuditLog central', 'LGPD/PII criptografado', 'SoD checker', 'Risco e compliance', 'Deploy audit']
  },
  {
    id: 'continua', title: 'Melhoria contínua',
    status: 'permanente', progress: 100,
    icon: Rocket, color: 'from-blue-700 to-violet-600',
    goal: 'Ciclos constantes: corrigir → modularizar → conectar → otimizar → validar → inovar.',
    items: ['Backlog vivo por módulo', 'Checklists vivos', 'Timeline executiva', 'Inovação Q3/Q4 2026', 'Ciclos regulares']
  }
];

export const melhoriaStatusLabels = {
  concluido:          'Concluído ✅',
  em_execucao:        'Em execução 🔄',
  prioritario:        'Prioritário ⚡',
  planejado:          'Planejado 📅',
  conectado:          'Conectado 🔗',
  permanente:         'Permanente ♾️',
  bloqueado_creditos: 'Bloqueado (créditos) 🔒',
};

// ── Roadmap 2026–2027 ─────────────────────────────────────────────────────────
export const roadmap2026 = [
  {
    trimestre: 'Q2 2026 ✅', cor: 'blue', status: 'concluido',
    itens: [
      '✅ Onboarding wizard de primeira empresa',
      '✅ Dashboard consolidado automático por grupo',
      '✅ Sidebar: Empresas + Portal do Cliente',
      '✅ Plano de Melhorias com CRUD de backlog',
      '✅ Cobertura RBAC 100% em todos módulos',
      '✅ IAContextualModulo em todos os módulos',
      '✅ DashboardForecastWidget (Ciclo 14)',
    ]
  },
  {
    trimestre: 'Q3 2026 ✅', cor: 'purple', status: 'concluido',
    itens: [
      '✅ DashboardAnomaliaWidget (iaFinanceAnomalyScan)',
      '✅ IAChurnWidget avançado (iaChurnAnalyzer)',
      '✅ DashboardSaudeWidget — score global por módulo',
      '✅ DashboardVendasPrevisaoWidget — gráfico de área 30d',
      '✅ PortalSelfServiceB2B — self-service completo',
      '✅ Marketplace sync automático — DashboardMarketplaceWidget',
      '✅ Open Finance / conciliação bancária — ConciliacaoIAWidget',
      '✅ KPIs comparativos mês atual vs anterior',
      '✅ CRM Score integrado ao Dashboard e módulo CRM',
    ]
  },
  {
    trimestre: 'Q4 2026 ✅', cor: 'emerald', status: 'concluido',
    itens: [
      '✅ BI avançado com gráficos 3D e forecasts — Ciclo 18',
      '✅ Automação de fluxos com triggers visuais — Ciclo 18',
      '✅ Integração GPS real para rastreamento — Ciclo 19',
      '✅ App mobile produção com apontamentos — Ciclo 19',
      '✅ Certificação compliance ISO 27001 — Ciclo 20',
      '✅ Módulo de contratos eletrônicos avançado — Ciclo 20',
    ]
  },
  {
    trimestre: 'Q1 2027 ✅', cor: 'amber', status: 'concluido',
    itens: [
      '🔒 IA generativa avançada — bloqueado até 07/07/2026 (créditos esgotados)',
      '🔒 Chatbot omnicanal GPT-4 — bloqueado até 07/07/2026',
      '🔄 Blockchain de auditoria imutável',
      '🔄 API headless multi-tenant',
      '📅 Expansão internacional (en/es)',
      '✅ Backfill `codigo` em 20 entidades — Ciclo 22',
      '✅ Refatoração VisualizadorUniversalEntidadeV24 — Ciclo 22',
      '✅ Refatoração melhoriaPlanData.js — Ciclo 22',
    ]
  },
  {
    trimestre: 'Q2 2027 ✅', cor: 'teal', status: 'concluido',
    itens: [
      '✅ Recriação hooks useVisualizadorState/Query/CRUD — Ciclo 23',
      '✅ Correção imports absolutos VisualizadorUniversalEntidadeV24 — Ciclo 23',
      '✅ Correção imports CicloExecucaoPanel — Ciclo 23',
      '🔒 IA generativa avançada — desbloqueio após 07/07/2026',
      '🔒 Chatbot omnicanal GPT-4 — desbloqueio após 07/07/2026',
      '🔒 Dashboard IA Gerador — desbloqueio após 07/07/2026',
    ]
  },
  {
    trimestre: 'Q3 2027 ✅', cor: 'indigo', status: 'concluido',
    itens: [
      '✅ Extrair FORM_ALIASES + DEFAULT_FORM_COMPONENTS → visualizadorConfig.js — Ciclo 24',
      '✅ Extrair ENTITY_CODE_FIELD → config/entityCodeFields.js — Ciclo 24',
      '✅ Extrair fmtValue/getDisplayValue → utils/tableFormatters.js — Ciclo 24',
      '✅ Export CSV nativo na VisualizadorToolbar — Ciclo 24',
      '✅ Ajuste staleTime queries Cadastros para 60s — Ciclo 24',
      '🔒 Expansão internacional (en/es) — pós desbloqueio créditos',
      '🔒 API headless multi-tenant completa — pós desbloqueio créditos',
    ]
  },
  {
    trimestre: 'Q4 2027 ✅', cor: 'rose', status: 'concluido',
    itens: [
      '✅ Garantir group_id + empresa_id em todos os forms de criação — Ciclo 25',
      '✅ Sanitização unificada via sanitizeOnWrite em todos os módulos — Ciclo 25',
      '✅ Confirmação propagação FormaPagamento/TabelaPreco/CondicaoComercial — Ciclo 25',
      '✅ Refatorar VisualizadorUniversalEntidadeV24 → VisualizadorBody.jsx — Ciclo 25',
      '✅ AuditLog para exclusões em massa nos Cadastros — Ciclo 25',
    ]
  },
  {
    trimestre: 'Q1 2028 🔄', cor: 'violet', status: 'em_execucao',
    itens: [
      '✅ Otimizar contagens Dashboard — countEntitiesOptimized em todos módulos — Ciclo 26',
      '✅ RBAC granular Financeiro/Compras — aprovar OC, liquidar, excluir — Ciclo 26',
      '✅ Refatorar useVisualizadorCRUD → useConflictValidator separado — Ciclo 26',
      '✅ Retry com backoff exponencial em propagateGroupConfigs — Ciclo 26',
      '✅ centralizedAuditLogger nos módulos Fiscal e RH — Ciclo 26',
      '🔒 IA generativa avançada — desbloqueio após 07/07/2026',
      '🔒 API headless multi-tenant completa — pós desbloqueio créditos',
    ]
  },
];