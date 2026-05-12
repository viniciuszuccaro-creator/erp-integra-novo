export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 99, focus: "Consolidação executiva, IA preditiva, indicadores tempo real e corporativo" },
  CRM: { progress: 98, focus: "Pipeline IA, oportunidades, interações, churn e score multiempresa" },
  Comercial: { progress: 98, focus: "Pedidos, margens, aprovação, wizard, NF-e e rastreabilidade ponta a ponta" },
  Estoque: { progress: 99, focus: "Saldo seguro em KG, movimentações auditadas, inventário e reposição IA" },
  Financeiro: { progress: 98, focus: "Fluxo de caixa IA, cobrança, conciliação, formas de pagamento e saúde" },
  Fiscal: { progress: 97, focus: "Validação fiscal IA, NF-e multiempresa, SPED, CFOP e compliance total" },
  RH: { progress: 97, focus: "Colaboradores, ponto biométrico, férias, monitoramento IA e apontamentos" },
  Expedição: { progress: 98, focus: "Entregas, IA de rotas, roteirização, GPS, comprovantes e logística reversa" },
  Relatórios: { progress: 97, focus: "Análises multiempresa, IA executiva, DRE, representantes e exportações" },
  Cadastros: { progress: 97, focus: "Base mestre padronizada, KYC, IA de sugestão e validações integradas" },
  Sistema: { progress: 99, focus: "Governança total, RBAC+SoD, lint estável, IA, automações e backup" },
  Contratos: { progress: 97, focus: "KPIs, IA de risco, renovação automática, cobrança e assinatura digital" },
  Agenda: { progress: 97, focus: "Calendário multiempresa, IA de eventos, painel lateral e lembretes" },
  Compras: { progress: 98, focus: "Suprimentos, IA insights, cotações, performance panel e OC com governança" },
  Produção: { progress: 98, focus: "OPs reais, apontamentos, IA diagnóstico, kanban, refugo e digital twin" },
  'Hub Atendimento': { progress: 97, focus: "Omnichannel, chatbot IA, SLA, filas, templates e atendimento multicanal" },
  Empresas: { progress: 97, focus: "Gestão de grupo empresarial, filiais, EmpresaSwitcher e configs por empresa" },
  Portal: { progress: 96, focus: "Portal do cliente, boletos, pedidos, rastreamento e aprovação digital" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}