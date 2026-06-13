// Ciclo 21 — Q1 2027 (itens bloqueados por créditos de integração)
export const ciclo21Items = [
  {
    id: 'c21-01', modulo: 'Todos', pilar: 'IA', prioridade: 'CRÍTICO',
    titulo: 'IAGenerativaAvancadaPanel — Geração de conteúdo contextual por módulo',
    status: 'bloqueado_creditos', impacto: 'Alto',
    descricao: 'Sistema de IA generativa contextualizada por módulo. Bloqueado até reset de créditos em 07/07/2026.',
  },
  {
    id: 'c21-02', modulo: 'Hub Atendimento', pilar: 'IA', prioridade: 'CRÍTICO',
    titulo: 'ChatbotOmnicanal — Unificação WhatsApp, Telegram, Web, Email',
    status: 'bloqueado_creditos', impacto: 'Alto',
    descricao: 'Chatbot com GPT-4 nativo e suporte multi-canal. Bloqueado até reset de créditos em 07/07/2026.',
  },
  {
    id: 'c21-03', modulo: 'Sistema', pilar: 'Governança', prioridade: 'ALTO',
    titulo: 'BlockchainAuditoriaPanel — Rastreabilidade imutável com blockchain',
    status: 'em_execucao', impacto: 'Alto',
    descricao: 'Sistema de auditoria imutável usando blockchain para registros críticos, hash SHA-256 por evento.',
  },
  {
    id: 'c21-04', modulo: 'Integrações', pilar: 'Integrações', prioridade: 'ALTO',
    titulo: 'APIHeadlessMultiTenant — Exposição de recursos via REST',
    status: 'em_execucao', impacto: 'Alto',
    descricao: 'API headless RESTful com autenticação por tenant, rate limiting e webhooks bidirecionais.',
  },
  {
    id: 'c21-05', modulo: 'Sistema', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'ExpansaoInternacional — Suporte a en/es com i18n completo',
    status: 'planejado', impacto: 'Médio',
    descricao: 'i18n framework com fallback automático para português, inglês e espanhol.',
  },
  {
    id: 'c21-06', modulo: 'Dashboard', pilar: 'IA', prioridade: 'MÉDIO',
    titulo: 'DashboardIAGerador — Gerar relatórios via IA generativa',
    status: 'bloqueado_creditos', impacto: 'Médio',
    descricao: 'Interface para criar relatórios customizados com IA. Bloqueado até reset de créditos em 07/07/2026.',
  },
];