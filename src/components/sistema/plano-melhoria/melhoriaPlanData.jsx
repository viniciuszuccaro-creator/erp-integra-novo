import {
  Shield, Building2, Gauge, Sparkles, Workflow, Lock, Bot, Network, ClipboardCheck, Rocket, TrendingUp, Zap
} from 'lucide-react';

export const melhoriaPlanPhases = [
  {
    id: 'estabilidade',
    title: 'Estabilização técnica',
    status: 'concluido',
    progress: 100,
    icon: Shield,
    color: 'from-blue-600 to-cyan-500',
    goal: 'Remover erros de build/lint, imports quebrados e pontos frágeis sem alterar regras de negócio.',
    items: ['Lint e build limpos', 'Arquivos espelho controlados', 'Erros auditados', 'Base segura para próximas fases']
  },
  {
    id: 'multiempresa',
    title: 'Multiempresa total',
    status: 'concluido',
    progress: 99,
    icon: Building2,
    color: 'from-indigo-600 to-blue-500',
    goal: 'Garantir group_id e empresa_id em cadastros, consultas, dashboards, relatórios e funções.',
    items: ['Escopo por grupo/empresa', 'Filtros contextuais', 'Carimbo automático', 'Isolamento de dados']
  },
  {
    id: 'acesso',
    title: 'Controle de acesso',
    status: 'concluido',
    progress: 100,
    icon: Lock,
    color: 'from-slate-700 to-slate-500',
    goal: 'Reforçar permissões por módulo, aba, ação e campo com auditoria dos bloqueios.',
    items: ['RBAC granular', 'Proteção visual', 'Entity guard', 'Auditoria de ações sensíveis']
  },
  {
    id: 'modularizacao',
    title: 'Modularização contínua',
    status: 'concluido',
    progress: 99,
    icon: Workflow,
    color: 'from-violet-600 to-fuchsia-500',
    goal: 'Quebrar páginas grandes em pequenos componentes reutilizáveis e conectados.',
    items: ['Componentes pequenos', 'Hooks dedicados', 'Layouts reutilizáveis', 'Menos duplicidade']
  },
  {
    id: 'performance',
    title: 'Performance e cache',
    status: 'concluido',
    progress: 99,
    icon: Gauge,
    color: 'from-emerald-600 to-teal-500',
    goal: 'Otimizar carregamento, contagens, dashboards e chamadas repetidas.',
    items: ['Queries otimizadas', 'Cache seletivo', 'Prefetch inteligente', 'Menos re-renderizações']
  },
  {
    id: 'ux',
    title: 'UX responsiva',
    status: 'concluido',
    progress: 99,
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    goal: 'Garantir telas w-full/h-full, responsivas, limpas e redimensionáveis.',
    items: ['Mobile-first', 'Cards adaptáveis', 'Tabelas fluidas', 'Layout multitarefa']
  },
  {
    id: 'ia',
    title: 'IA operacional',
    status: 'concluido',
    progress: 99,
    icon: Bot,
    color: 'from-purple-600 to-indigo-500',
    goal: 'Conectar IA aos fluxos reais de vendas, estoque, financeiro, logística, fiscal e RH.',
    items: ['Anomalias financeiras', 'Preço inteligente', 'Rotas otimizadas', 'Previsões de estoque']
  },
  {
    id: 'integracoes',
    title: 'Integrações e automações',
    status: 'concluido',
    progress: 99,
    icon: Network,
    color: 'from-cyan-600 to-sky-500',
    goal: 'Consolidar WhatsApp, NF-e, boletos, mapas, marketplaces e notificações.',
    items: ['Reuso de funções', 'Sem duplicidade', 'Alertas automáticos', 'Conectores seguros']
  },
  {
    id: 'governanca',
    title: 'Governança e auditoria',
    status: 'concluido',
    progress: 100,
    icon: ClipboardCheck,
    color: 'from-rose-600 to-red-500',
    goal: 'Melhorar rastreabilidade, LGPD, logs, revisão de riscos e compliance.',
    items: ['AuditLog central', 'Histórico crítico', 'LGPD', 'Risco e SoD']
  },
  {
    id: 'continua',
    title: 'Melhoria contínua',
    status: 'permanente',
    progress: 99,
    icon: Rocket,
    color: 'from-blue-700 to-violet-600',
    goal: 'Executar ciclos constantes: corrigir, modularizar, conectar, otimizar e validar.',
    items: ['Backlog por módulo', 'Checklists vivos', 'Timeline executiva', 'Inovação Q3/Q4 2026']
  }
];

export const melhoriaStatusLabels = {
  concluido: 'Concluído ✅',
  em_execucao: 'Em execução',
  prioritario: 'Prioritário',
  planejado: 'Planejado',
  conectado: 'Conectado',
  permanente: 'Permanente'
};

// Ciclo 11 — Maio 2026 — Itens concretos do backlog atual
export const ciclo11Items = [
  {
    id: 'c11-01', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'CRÍTICO',
    titulo: 'Refatorar GestaoAcessosIndex com nova aba Auditoria e KPIs de cobertura RBAC',
    status: 'concluido', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Adicionar 4 KPIs (Perfis, Cobertura %, Usuários, Sem Perfil), aba Auditoria com paginação e filtros, e badge dinâmico de usuários sem perfil.'
  },
  {
    id: 'c11-02', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'ALTO',
    titulo: 'AccessAuditTimeline com paginação, filtros e ícones por tipo de ação',
    status: 'concluido', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Busca por texto, filtro por ação, ícones coloridos e paginação de 10 eventos por página.'
  },
  {
    id: 'c11-03', modulo: 'Gestão de Acessos', pilar: 'Acesso', prioridade: 'ALTO',
    titulo: 'UsuariosTab com estatísticas, filtros e badge de usuários sem perfil',
    status: 'concluido', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Bloco de estatísticas (Total/Com Perfil/Sem Perfil), filtro por status de perfil, botão "Atribuir Perfil" em destaque para usuários pendentes.'
  },
  {
    id: 'c11-04', modulo: 'Plano de Melhorias', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'Refatorar página de Plano de Melhorias com visão consolidada e ciclo atual',
    status: 'em_execucao', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Nova estrutura com abas: Visão Geral, Ciclo Atual, Backlog, Roadmap e Análise. Eliminar excesso de componentes redundantes.'
  },
  {
    id: 'c11-05', modulo: 'Dashboard', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'KPIs do Dashboard exibem 0 sem empresa selecionada — mostrar soma do grupo',
    status: 'planejado', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Quando contexto = "grupo", buscar dados consolidados do grupo automaticamente via groupConsolidation.'
  },
  {
    id: 'c11-06', modulo: 'Cadastros Gerais', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Exibir mensagem orientativa quando empresa não selecionada em vez de tela em branco',
    status: 'planejado', impacto: 'Médio', responsavel: 'Sistema',
    descricao: 'Banner com botão de seleção de empresa + fallback de dados do grupo quando contexto = "grupo".'
  },
  {
    id: 'c11-07', modulo: 'Sidebar / Layout', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Adicionar links "Empresas" e "Portal do Cliente" na sidebar de navegação',
    status: 'planejado', impacto: 'Médio', responsavel: 'Sistema',
    descricao: 'Rotas existem (/Empresas, /PortalCliente) mas não estão no menu — usuários não encontram essas páginas.'
  },
  {
    id: 'c11-08', modulo: 'Financeiro', pilar: 'Integrações', prioridade: 'MÉDIO',
    titulo: 'Validação de gateway de pagamento configurado antes de gerar boleto/PIX',
    status: 'planejado', impacto: 'Médio', responsavel: 'Sistema',
    descricao: 'Se gateway não configurado, exibir wizard de configuração em vez de erro genérico.'
  },
  {
    id: 'c11-09', modulo: 'Fiscal / NF-e', pilar: 'Integrações', prioridade: 'ALTO',
    titulo: 'Validação de certificado A1 e API fiscal antes de emitir NF-e',
    status: 'planejado', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Verificar se ConfigFiscalEmpresa está preenchida antes de habilitar botão Emitir NF-e.'
  },
  {
    id: 'c11-10', modulo: 'Todos', pilar: 'IA', prioridade: 'BAIXO',
    titulo: 'IA generativa contextual — sugestões proativas por módulo',
    status: 'planejado', impacto: 'Alto', responsavel: 'Sistema',
    descricao: 'Usar iaGenerativeContextual para sugerir próximas ações em cada módulo com base nos dados do contexto atual.'
  },
];

export const roadmap2026 = [
  { trimestre: 'Q2 2026', itens: ['Refinamento RBAC granular', 'Onboarding wizard de empresa', 'Dashboard consolidado por grupo', 'Melhorias Plano de Melhorias'] },
  { trimestre: 'Q3 2026', itens: ['Portal B2B self-service', 'IA preditiva de churn avançada', 'Marketplace sync automático', 'App mobile produção'] },
  { trimestre: 'Q4 2026', itens: ['BI avançado com gráficos 3D', 'Automação de fluxos com triggers', 'Integração bancária Open Finance', 'Certificação ISO 27001 compliance'] },
  { trimestre: 'Q1 2027', itens: ['IA generativa em todos módulos', 'Chatbot omnicanal com GPT', 'Blockchain de auditoria', 'ERP headless API-first'] },
];