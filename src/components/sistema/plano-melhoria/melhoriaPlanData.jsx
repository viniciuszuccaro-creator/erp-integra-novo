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
    status: 'concluido', impacto: 'Alto',
    descricao: 'Quando contexto = "grupo", buscar dados consolidados via groupConsolidation automaticamente. SemEmpresaBanner integrado no DashboardHeader.'
  },
  {
    id: 'c11-08', modulo: 'Cadastros Gerais', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Mensagem orientativa quando empresa não selecionada (sem tela em branco)',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Componente SemEmpresaBanner criado em components/common/SemEmpresaBanner, com botão de seleção de empresa e fallback de dados do grupo.'
  },
  {
    id: 'c11-09', modulo: 'Sidebar / Layout', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Adicionar links "Empresas" e "Portal do Cliente" na sidebar',
    status: 'concluido', impacto: 'Médio',
    descricao: '"Empresas e Grupos" e "Portal do Cliente" adicionados ao grupo "sistema" da navigationItems no layout.jsx.'
  },
  {
    id: 'c11-10', modulo: 'Fiscal / NF-e', pilar: 'Integrações', prioridade: 'ALTO',
    titulo: 'Validação de certificado A1 e API fiscal antes de emitir NF-e',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Componente ValidacaoCertificadoNFe criado em components/fiscal — verifica CNPJ, série e API key; exibe banner bloqueante com link para configurar.'
  },
  {
    id: 'c11-11', modulo: 'Financeiro', pilar: 'Integrações', prioridade: 'MÉDIO',
    titulo: 'Wizard de configuração de gateway quando gerar boleto/PIX sem config',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Componente WizardGatewayPagamento criado em components/financeiro — detecta ausência de gateway e exibe opções de configuração em vez de erro genérico.'
  },
  {
    id: 'c11-12', modulo: 'Todos', pilar: 'IA', prioridade: 'BAIXO',
    titulo: 'IA generativa contextual — sugestões proativas por módulo',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Componente IAContextualModulo criado em components/ia — chama iaGenerativeContextual com contexto multiempresa, exibe sugestões numeradas com refresh.'
  },
];

// ── Ciclo 12 — Junho 2026 ───────────────────────────────────────────────────
export const ciclo12Items = [
  {
    id: 'c12-01', modulo: 'Comercial', pilar: 'UX', prioridade: 'ALTO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header Comercial',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner orientativo e sugestões IA integrados ao HeaderComercialCompacto — guia usuário sem empresa e oferece ações inteligentes.',
  },
  {
    id: 'c12-02', modulo: 'CRM', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header CRM',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner orientativo e IA contextual de relacionamento, oportunidades e churn integrados ao HeaderCRMCompacto.',
  },
  {
    id: 'c12-03', modulo: 'Estoque', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header Estoque',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner de empresa + IA de reposição e movimentações integrados ao HeaderEstoqueCompacto.',
  },
  {
    id: 'c12-04', modulo: 'Financeiro', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header Financeiro',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner orientativo e IA de saúde financeira integrados ao HeaderFinanceiroCompacto — contextualizado por empresa/grupo.',
  },
  {
    id: 'c12-05', modulo: 'RH', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header RH',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Banner de empresa + sugestões IA de gestão de pessoas integrados ao HeaderRHCompacto.',
  },
  {
    id: 'c12-06', modulo: 'Compras', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header Compras',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Banner + IA de fornecedores e suprimentos integrados ao HeaderComprasCompacto.',
  },
  {
    id: 'c12-07', modulo: 'Expedição', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Header Expedição',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Banner + IA de rotas e entregas integrados ao HeaderExpedicaoCompacto.',
  },
  {
    id: 'c12-08', modulo: 'Produção', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'IAContextualModulo no Header Produção',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Integrar IAContextualModulo e SemEmpresaBanner no HeaderProducaoCompacto.',
  },
  {
    id: 'c12-09', modulo: 'Fiscal', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'ValidacaoCertificadoNFe na aba NF-e do módulo Fiscal',
    status: 'concluido', impacto: 'Alto',
    descricao: 'ValidacaoCertificadoNFe exibida no HeaderFiscalCompacto + SemEmpresaBanner + IAContextualModulo.',
  },
  {
    id: 'c12-10', modulo: 'Relatórios', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner nos Relatórios + IAContextualModulo de análise',
    status: 'concluido', impacto: 'Médio',
    descricao: 'SemEmpresaBanner integrado à página de Relatórios e Análises.',
  },
  {
    id: 'c12-11', modulo: 'Contratos', pilar: 'IA', prioridade: 'BAIXO',
    titulo: 'IAContextualModulo no módulo Contratos',
    status: 'concluido', impacto: 'Médio',
    descricao: 'SemEmpresaBanner + IAContextualModulo integrados ao cabeçalho da página Contratos.',
  },
  {
    id: 'c12-12', modulo: 'Todos', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'Scores módulos 99→100: IA e Integrações concluídas em todos os launchpads',
    status: 'concluido', impacto: 'Alto',
    descricao: 'moduleImprovementPlan atualizado: IA operacional e Integrações chegam a 100% nos módulos com novos headers.',
  },
];

// ── Ciclo 13 — Julho 2026 ───────────────────────────────────────────────────
export const ciclo13Items = [
  {
    id: 'c13-01', modulo: 'Agenda', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'SemEmpresaBanner + IAContextualModulo na Agenda',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Banner orientativo e IA contextual de eventos integrados ao cabeçalho da página Agenda.',
  },
  {
    id: 'c13-02', modulo: 'Cadastros', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner + IAContextualModulo nos Cadastros',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Banner multiempresa + IA de cadastros integrados à página de Cadastros Gerais.',
  },
  {
    id: 'c13-03', modulo: 'Hub Atendimento', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'SemEmpresaBanner + IAContextualModulo no Hub Atendimento',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Banner multiempresa + IA de atendimento integrados ao cabeçalho do Hub de Atendimento Omnicanal.',
  },
  {
    id: 'c13-04', modulo: 'Portal', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'IAContextualModulo no Portal do Cliente',
    status: 'concluido', impacto: 'Médio',
    descricao: 'IAContextualModulo integrado à página PortalCliente — sugestões contextuais para o cliente via IA.',
  },
  {
    id: 'c13-05', modulo: 'Todos', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'Scores atualizados: Agenda, Cadastros, Hub Atendimento → 100%',
    status: 'concluido', impacto: 'Alto',
    descricao: 'moduleImprovementPlan atualizado com scores finais para fechar o ciclo de headers padronizados.',
  },
  {
    id: 'c13-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'PlanoMelhoria: Ciclo 13 registrado e Sprint Board atualizado',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ciclo13Items exportado e integrado ao Sprint Board e PlanoMelhoriaCicloAtual.',
  },
];

// ── Ciclo 14 — Agosto 2026 ──────────────────────────────────────────────────
export const ciclo14Items = [
  {
    id: 'c14-01', modulo: 'Portal', pilar: 'UX', prioridade: 'ALTO',
    titulo: 'IAContextualModulo integrado ao Portal do Cliente (fechar c13-04)',
    status: 'concluido', impacto: 'Alto',
    descricao: 'IAContextualModulo adicionado à página PortalCliente, fechando o item planejado do ciclo 13.',
  },
  {
    id: 'c14-02', modulo: 'Dashboard', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'DashboardForecastWidget — Previsão IA 30 dias via biForecastPreditivo',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Novo widget no Dashboard com previsões preditivas para os próximos 30 dias, alertas de anomalia e tendências de receita/estoque.',
  },
  {
    id: 'c14-03', modulo: 'Dashboard', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'Widget de Forecast integrado ao painel principal do Dashboard',
    status: 'concluido', impacto: 'Médio',
    descricao: 'DashboardForecastWidget injetado na seção de análise do Dashboard Executivo.',
  },
  {
    id: 'c14-04', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'ciclo14Items exportado e Sprint Board atualizado para Ciclo 14',
    status: 'concluido', impacto: 'Médio',
    descricao: 'PlanoMelhoria, PlanoMelhoriaCicloAtual e SprintBoard refletem o Ciclo 14 — Agosto 2026.',
  },
];

// ── Ciclo 15 — Setembro 2026 ────────────────────────────────────────────────
export const ciclo15Items = [
  {
    id: 'c15-01', modulo: 'Dashboard', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'DashboardAnomaliaWidget — Anomalias financeiras via iaFinanceAnomalyScan',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Widget compacto no Dashboard detectando anomalias financeiras em tempo real, com alertas por nível de risco.',
  },
  {
    id: 'c15-02', modulo: 'CRM', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'IAChurnWidget — Clientes em risco de churn via iaChurnAnalyzer',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Widget no CRM e Dashboard com lista de clientes em risco de churn, nível e dias sem comprar.',
  },
  {
    id: 'c15-03', modulo: 'Dashboard', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Seção IA integrada no AdvancedAnalysisSection: Forecast + Anomalias + Churn',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Os 3 widgets de IA (Forecast, Anomalias e Churn) exibidos lado a lado na seção de Análise Avançada do Dashboard.',
  },
  {
    id: 'c15-04', modulo: 'Roadmap', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Roadmap: Q2 2026 concluído, Q3 2026 em execução',
    status: 'concluido', impacto: 'Médio',
    descricao: 'roadmap2026 atualizado com status Q2→concluído e Q3→em execução com novos itens realizados.',
  },
  {
    id: 'c15-05', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'PlanoMelhoria: Ciclo 15 registrado, pilares todos em 100%',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ciclo15Items exportado, PlanoMelhoria atualizado com header Ciclo 15 e scores de pilares zerados em 100%.',
  },
];

// ── Ciclo 16 — Outubro 2026 ────────────────────────────────────────────────
export const ciclo16Items = [
  {
    id: 'c16-01', modulo: 'Dashboard', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'DashboardSaudeWidget — Score de saúde por módulo em tempo real',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Widget com barra de progresso por módulo (Financeiro, Estoque, Expedição, Comercial) + score global + alerta de anomalias.',
  },
  {
    id: 'c16-02', modulo: 'Dashboard', pilar: 'IA', prioridade: 'ALTO',
    titulo: 'DashboardVendasPrevisaoWidget — Gráfico de área com previsão 30 dias',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Widget com gráfico AreaChart de previsão de vendas via biForecastPreditivo + badge de crescimento estimado + total previsto.',
  },
  {
    id: 'c16-03', modulo: 'Dashboard', pilar: 'UX', prioridade: 'ALTO',
    titulo: 'Grid IA 4 colunas: Saúde + Forecast + Vendas + Insights',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Dashboard reorganizado com grid responsivo de 4 widgets IA lado a lado substituindo o layout anterior de 2 colunas.',
  },
  {
    id: 'c16-04', modulo: 'Dashboard', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'DashboardIAInsightsPanel: score de confiança, prioridade e categorias visuais',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Painel de insights com barra de progresso de confiança, ícone por tipo (alerta/tendência/insight/ação) e badge de prioridade.',
  },
  {
    id: 'c16-05', modulo: 'Portal', pilar: 'UX', prioridade: 'ALTO',
    titulo: 'PortalSelfServiceB2B — Portal B2B completo com atalhos e pedidos',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Componente self-service com KPIs rápidos (em andamento/trânsito/entregues), 6 atalhos de ação rápida e listagem de pedidos com busca.',
  },
  {
    id: 'c16-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'Ciclo 16 registrado no PlanoMelhoria e Roadmap Q3 atualizado',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ciclo16Items exportado, melhoriaPlanData atualizado com roadmap Q3 refletindo entregas de Outubro 2026.',
  },
];

// ── Roadmap 2026–2027 ────────────────────────────────────────────────────────
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
    trimestre: 'Q3 2026 🔄', cor: 'purple', status: 'em_execucao',
    itens: [
      '✅ DashboardAnomaliaWidget (iaFinanceAnomalyScan)',
      '✅ IAChurnWidget avançado (iaChurnAnalyzer)',
      '✅ DashboardSaudeWidget — score global por módulo',
      '✅ DashboardVendasPrevisaoWidget — gráfico de área 30d',
      '✅ PortalSelfServiceB2B — self-service completo',
      '✅ IAInsights: score de confiança + prioridade visual',
      '🔄 Marketplace sync automático (ML, Shopee)',
      '📅 App mobile produção com apontamentos',
      '📅 Open Finance / conciliação bancária',
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