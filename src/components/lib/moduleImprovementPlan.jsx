export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 93, focus: "Consolidação executiva e indicadores em tempo real" },
  CRM: { progress: 89, focus: "Relacionamento, churn e oportunidades com contexto multiempresa" },
  Comercial: { progress: 91, focus: "Pedidos, margens, aprovação e rastreabilidade ponta a ponta" },
  Estoque: { progress: 94, focus: "Saldo seguro, movimentações auditadas e reposição inteligente" },
  Compras: { progress: 89, focus: "Suprimentos, IA de insights, fornecedores e ordens com governança" },
  Financeiro: { progress: 87, focus: "Fluxo de caixa, cobrança, conciliação e liquidação segura" },
  Fiscal: { progress: 83, focus: "Validação fiscal, NF-e e compliance tributário" },
  RH: { progress: 81, focus: "Colaboradores, ponto, férias e permissões por empresa" },
  Expedição: { progress: 88, focus: "Entregas, roteirização e comprovantes digitais" },
  Produção: { progress: 84, focus: "Ordens, apontamentos, insumos e produtividade" },
  Relatórios: { progress: 83, focus: "Análises multiempresa, representantes, DRE e exportações" },
  Cadastros: { progress: 90, focus: "Base mestre padronizada, integrada e segura" },
  Sistema: { progress: 93, focus: "Governança, segurança, lint estável e automações ativas" },
  Contratos: { progress: 88, focus: "KPIs, IA de risco, renovação e cobrança automática" },
  Agenda: { progress: 87, focus: "Calendário, painel lateral de eventos e lembretes inteligentes" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}