export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 99, focus: "Consolidação executiva, IA preditiva e indicadores em tempo real" },
  CRM: { progress: 98, focus: "Pipeline IA, oportunidades, interações e churn multiempresa" },
  Comercial: { progress: 98, focus: "Pedidos, margens, aprovação e rastreabilidade ponta a ponta" },
  Estoque: { progress: 99, focus: "Saldo seguro, movimentações auditadas e reposição inteligente IA" },
  Financeiro: { progress: 98, focus: "Fluxo de caixa IA, cobrança, conciliação e saúde financeira" },
  Fiscal: { progress: 97, focus: "Validação fiscal IA, NF-e, SPED e compliance tributário completo" },
  RH: { progress: 97, focus: "Colaboradores, ponto biométrico, IA de insights e férias multiempresa" },
  Expedição: { progress: 98, focus: "Entregas, IA de rotas, roteirização e comprovantes digitais" },
  Relatórios: { progress: 97, focus: "Análises multiempresa, IA executiva, representantes, DRE e exportações" },
  Cadastros: { progress: 97, focus: "Base mestre padronizada, integrada e segura com IA" },
  Sistema: { progress: 99, focus: "Governança, segurança, lint estável, IA e automações ativas" },
  Contratos: { progress: 97, focus: "KPIs, IA de risco, renovação e cobrança automática" },
  Agenda: { progress: 98, focus: "Calendário, IA de eventos, painel lateral e lembretes inteligentes" },
  Compras: { progress: 98, focus: "Suprimentos, IA insights, performance panel e ordens com governança" },
  Produção: { progress: 98, focus: "OPs listagem real, apontamentos, IA diagnóstico e kanban inteligente" },
  'Hub Atendimento': { progress: 98, focus: "Omnichannel, chatbot IA, SLA, IAPanel e atendimento multicanal" },
  Empresas: { progress: 98, focus: "Gestão de grupo empresarial, filiais, EmpresaSwitcher e configuração por empresa" },
  Portal: { progress: 97, focus: "Portal cliente: pedidos, boletos, entregas, rastreio e BI embarcado" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}