export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 96, focus: "Consolidação executiva, IA preditiva e indicadores em tempo real" },
  CRM: { progress: 95, focus: "Pipeline IA, oportunidades, interações, churn e listagens multiempresa" },
  Comercial: { progress: 94, focus: "Pedidos, margens, aprovação e rastreabilidade ponta a ponta" },
  Estoque: { progress: 96, focus: "Saldo seguro, movimentações auditadas e reposição inteligente IA" },
  Compras: { progress: 94, focus: "Suprimentos IA, fornecedores, OCs e governança de suprimentos" },
  Financeiro: { progress: 94, focus: "Fluxo de caixa IA, cobrança, conciliação e saúde financeira" },
  Fiscal: { progress: 93, focus: "Validação fiscal IA, NF-e, SPED e compliance tributário completo" },
  RH: { progress: 93, focus: "Colaboradores, ponto biométrico, IA de insights e férias multiempresa" },
  Expedição: { progress: 94, focus: "Entregas, IA de rotas, roteirização e comprovantes digitais" },
  Produção: { progress: 93, focus: "OPs, apontamentos, IA diagnóstico e produtividade em tempo real" },
  Relatórios: { progress: 93, focus: "Análises multiempresa, IA executiva, representantes, DRE e exportações" },
  Cadastros: { progress: 93, focus: "Base mestre padronizada, integrada e segura com IA" },
  Sistema: { progress: 96, focus: "Governança, segurança, lint estável, IA operacional e automações ativas" },
  Contratos: { progress: 94, focus: "KPIs, IA de risco contratual, renovação e cobrança automática" },
  Agenda: { progress: 93, focus: "Calendário IA, painel lateral de eventos e lembretes inteligentes" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}