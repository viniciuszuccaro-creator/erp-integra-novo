export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 95, focus: "Consolidação executiva, IA preditiva e indicadores em tempo real" },
  CRM: { progress: 93, focus: "Pipeline IA, oportunidades, interações e churn multiempresa" },
  Comercial: { progress: 93, focus: "Pedidos, margens, aprovação e rastreabilidade ponta a ponta" },
  Estoque: { progress: 95, focus: "Saldo seguro, movimentações auditadas e reposição inteligente IA" },

  Financeiro: { progress: 92, focus: "Fluxo de caixa IA, cobrança, conciliação e saúde financeira" },
  Fiscal: { progress: 92, focus: "Validação fiscal IA, NF-e, SPED e compliance tributário completo" },
  RH: { progress: 91, focus: "Colaboradores, ponto biométrico, IA de insights e férias multiempresa" },
  Expedição: { progress: 92, focus: "Entregas, IA de rotas, roteirização e comprovantes digitais" },

  Relatórios: { progress: 92, focus: "Análises multiempresa, IA executiva, representantes, DRE e exportações" },
  Cadastros: { progress: 92, focus: "Base mestre padronizada, integrada e segura com IA" },
  Sistema: { progress: 95, focus: "Governança, segurança, lint estável, IA e automações ativas" },
  Contratos: { progress: 91, focus: "KPIs, IA de risco, renovação e cobrança automática" },
  Agenda: { progress: 93, focus: "Calendário, IA de eventos, painel lateral e lembretes inteligentes" },
  Compras: { progress: 94, focus: "Suprimentos, IA insights, performance panel e ordens com governança" },
  Produção: { progress: 94, focus: "OPs listagem real, apontamentos, IA diagnóstico e kanban inteligente" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}