import {
  Shield, Building2, Gauge, Sparkles, Workflow, Lock, Bot, Network,
  ClipboardCheck, Rocket, TrendingUp, Zap, Users
} from 'lucide-react';

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
    status: 'concluido', progress: 99,
    icon: Bot, color: 'from-purple-600 to-indigo-500',
    goal: 'IA conectada a fluxos reais: vendas, estoque, financeiro, logística, fiscal e RH.',
    items: ['Anomalias financeiras', 'Preço inteligente', 'Rotas otimizadas', 'Previsão estoque', 'Churn', 'NF-e fiscal IA']
  },
  {
    id: 'integracoes', title: 'Integrações e automações',
    status: 'concluido', progress: 99,
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
    status: 'permanente', progress: 99,
    icon: Rocket, color: 'from-blue-700 to-violet-600',
    goal: 'Ciclos constantes: corrigir → modularizar → conectar → otimizar → validar → inovar.',
    items: ['Backlog vivo por módulo', 'Checklists vivos', 'Timeline executiva', 'Inovação Q3/Q4 2026', 'Ciclos regulares']
  }
];

export const melhoriaStatusLabels = {
  concluido:   'Concluído ✅',
  em_execucao: 'Em execução 🔄',
  prioritario: 'Prioritário ⚡',
  planejado:   'Planejado 📅',
  conectado:   'Conectado 🔗',
  permanente:  'Permanente ♾️',
};

// ── Ciclo 11 — Maio 2026 ────────────────────────────────────────────────────
export const ciclo11Items = [
  {
    id: 'c11-01', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'CRÍTICO',
    titulo: 'GestaoAcessosIndex: 4 KPIs, aba Auditoria, badge cobertura RBAC',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner com 4 KPIs (Perfis, Pendentes, Usuários, Cobertura%), nova aba Auditoria com paginação/filtros, layout 4 colunas.'
  },
  {
    id: 'c11-02', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'ALTO',
    titulo: 'AccessAuditTimeline: paginação, filtros por ação e ícones por tipo',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Busca por texto, filtro por tipo de ação, ícones coloridos e paginação de 10 eventos por página.'
  },
  {
    id: 'c11-03', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'ALTO',
    titulo: 'UsuariosTab: estatísticas, filtro "sem perfil" e botão Atribuir Perfil',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Bloco de 3 KPIs (Total/Com Perfil/Sem Perfil), filtro por status de perfil, botão destaque âmbar para pendentes.'
  },
  {
    id: 'c11-04', modulo: 'Plano de Melhorias', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'Refatorar PlanoMelhoria com abas, Ciclo Atual e Análise de Gaps',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Nova estrutura com 6 abas: Visão Geral, Ciclo Atual, Backlog, Análise de Gaps, Roadmap, Governança.'
  },
  {
    id: 'c11-05', modulo: 'Plano de Melhorias', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'moduleImprovementPlan: adicionar Gestão Acessos 100% e atualizar scores',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Módulo "Gestão Acessos" adicionado com 100% e scores de outros módulos atualizados para refletir ciclo 11.'
  },
  {
    id: 'c11-06', modulo: 'Plano de Melhorias', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'PlanoMelhoriaLiveBacklog: CRUD real com criação/edição inline de itens',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Botão de novo item, form inline, persistência no banco PlanoMelhoriaItem, filtros por status e módulo.'
  },
  {
    id: 'c11-07', modulo: 'Dashboard', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'KPIs do Dashboard mostram 0 sem empresa — consolidar do grupo',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Quando contexto = "grupo", buscar dados consolidados via groupConsolidation automaticamente.'
  },
  {
    id: 'c11-08', modulo: 'Cadastros Gerais', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Mensagem orientativa quando empresa não selecionada (sem tela em branco)',
    status: 'planejado', impacto: 'Médio',
    descricao: 'Banner com botão de seleção de empresa + fallback de dados do grupo quando contexto = "grupo".'
  },
  {
    id: 'c11-09', modulo: 'Sidebar / Layout', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Adicionar links "Empresas" e "Portal do Cliente" na sidebar',
    status: 'planejado', impacto: 'Médio',
    descricao: 'Rotas existem (/Empresas, /PortalCliente) mas não estão no menu lateral de navegação.'
  },
  {
    id: 'c11-10', modulo: 'Fiscal / NF-e', pilar: 'Integrações', prioridade: 'ALTO',
    titulo: 'Validação de certificado A1 e API fiscal antes de emitir NF-e',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Verificar se ConfigFiscalEmpresa está preenchida antes de habilitar botão Emitir NF-e — exibir wizard se não.'
  },
  {
    id: 'c11-11', modulo: 'Financeiro', pilar: 'Integrações', prioridade: 'MÉDIO',
    titulo: 'Wizard de configuração de gateway quando gerar boleto/PIX sem config',
    status: 'planejado', impacto: 'Médio',
    descricao: 'Se gateway não configurado, exibir wizard de configuração em vez de erro genérico.'
  },
  {
    id: 'c11-12', modulo: 'Todos', pilar: 'IA', prioridade: 'BAIXO',
    titulo: 'IA generativa contextual — sugestões proativas por módulo',
    status: 'planejado', impacto: 'Alto',
    descricao: 'Usar iaGenerativeContextual para sugerir próximas ações em cada módulo com base no contexto atual.'
  },
];

// ── Roadmap 2026–2027 ────────────────────────────────────────────────────────
export const roadmap2026 = [
  {
    trimestre: 'Q2 2026', cor: 'blue',
    itens: [
      'Onboarding wizard de primeira empresa',
      'Dashboard consolidado automático por grupo',
      'Sidebar: Empresas + Portal do Cliente',
      'Plano de Melhorias com CRUD de backlog',
      'Cobertura RBAC 100% em todos módulos',
    ]
  },
  {
    trimestre: 'Q3 2026', cor: 'purple',
    itens: [
      'Portal B2B self-service completo',
      'IA preditiva de churn avançada',
      'Marketplace sync automático (ML, Shopee)',
      'App mobile produção com apontamentos',
      'Open Finance / conciliação bancária',
    ]
  },
  {
    trimestre: 'Q4 2026', cor: 'emerald',
    itens: [
      'BI avançado com gráficos 3D e forecasts',
      'Automação de fluxos com triggers visuais',
      'Integração GPS real para rastreamento',
      'Certificação compliance ISO 27001',
      'Módulo de contratos eletrônicos avançado',
    ]
  },
  {
    trimestre: 'Q1 2027', cor: 'amber',
    itens: [
      'IA generativa em todos os módulos',
      'Chatbot omnicanal com GPT nativo',
      'Blockchain de auditoria imutável',
      'ERP headless API-first multi-tenant',
      'Expansão internacional (en/es)',
    ]
  },
];