import {
  Shield,
  Building2,
  Gauge,
  Sparkles,
  Workflow,
  Lock,
  Bot,
  Network,
  ClipboardCheck,
  Rocket
} from 'lucide-react';

export const melhoriaPlanPhases = [
  {
    id: 'estabilidade',
    title: 'Estabilização técnica',
    status: 'concluido',
    progress: 95,
    icon: Shield,
    color: 'from-blue-600 to-cyan-500',
    goal: 'Remover erros de build/lint, imports quebrados e pontos frágeis sem alterar regras de negócio.',
    items: ['Lint e build limpos', 'Arquivos espelho controlados', 'Erros auditados', 'Base segura para próximas fases']
  },
  {
    id: 'multiempresa',
    title: 'Multiempresa total',
    status: 'em_execucao',
    progress: 88,
    icon: Building2,
    color: 'from-indigo-600 to-blue-500',
    goal: 'Garantir group_id e empresa_id em cadastros, consultas, dashboards, relatórios e funções.',
    items: ['Escopo por grupo/empresa', 'Filtros contextuais', 'Carimbo automático', 'Isolamento de dados']
  },
  {
    id: 'acesso',
    title: 'Controle de acesso',
    status: 'em_execucao',
    progress: 82,
    icon: Lock,
    color: 'from-slate-700 to-slate-500',
    goal: 'Reforçar permissões por módulo, aba, ação e campo com auditoria dos bloqueios.',
    items: ['RBAC granular', 'Proteção visual', 'Entity guard', 'Auditoria de ações sensíveis']
  },
  {
    id: 'modularizacao',
    title: 'Modularização contínua',
    status: 'em_execucao',
    progress: 80,
    icon: Workflow,
    color: 'from-violet-600 to-fuchsia-500',
    goal: 'Quebrar páginas grandes em pequenos componentes reutilizáveis e conectados.',
    items: ['Componentes pequenos', 'Hooks dedicados', 'Layouts reutilizáveis', 'Menos duplicidade']
  },
  {
    id: 'performance',
    title: 'Performance e cache',
    status: 'em_execucao',
    progress: 77,
    icon: Gauge,
    color: 'from-emerald-600 to-teal-500',
    goal: 'Otimizar carregamento, contagens, dashboards e chamadas repetidas.',
    items: ['Queries otimizadas', 'Cache seletivo', 'Prefetch inteligente', 'Menos re-renderizações']
  },
  {
    id: 'ux',
    title: 'UX responsiva',
    status: 'em_execucao',
    progress: 79,
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    goal: 'Garantir telas w-full/h-full, responsivas, limpas e redimensionáveis.',
    items: ['Mobile-first', 'Cards adaptáveis', 'Tabelas fluidas', 'Layout multitarefa']
  },
  {
    id: 'ia',
    title: 'IA operacional',
    status: 'em_execucao',
    progress: 85,
    icon: Bot,
    color: 'from-purple-600 to-indigo-500',
    goal: 'Conectar IA aos fluxos reais de vendas, estoque, financeiro, logística, fiscal e RH.',
    items: ['Anomalias financeiras', 'Preço inteligente', 'Rotas otimizadas', 'Previsões de estoque']
  },
  {
    id: 'integracoes',
    title: 'Integrações e automações',
    status: 'em_execucao',
    progress: 74,
    icon: Network,
    color: 'from-cyan-600 to-sky-500',
    goal: 'Consolidar WhatsApp, NF-e, boletos, mapas, marketplaces e notificações.',
    items: ['Reuso de funções', 'Sem duplicidade', 'Alertas automáticos', 'Conectores seguros']
  },
  {
    id: 'governanca',
    title: 'Governança e auditoria',
    status: 'em_execucao',
    progress: 86,
    icon: ClipboardCheck,
    color: 'from-rose-600 to-red-500',
    goal: 'Melhorar rastreabilidade, LGPD, logs, revisão de riscos e compliance.',
    items: ['AuditLog central', 'Histórico crítico', 'LGPD', 'Risco e SoD']
  },
  {
    id: 'continua',
    title: 'Melhoria contínua',
    status: 'permanente',
    progress: 72,
    icon: Rocket,
    color: 'from-blue-700 to-violet-600',
    goal: 'Executar ciclos constantes: corrigir, modularizar, conectar, otimizar e validar.',
    items: ['Backlog por módulo', 'Checklists vivos', 'Validação por fase', 'Evolução sem apagar']
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