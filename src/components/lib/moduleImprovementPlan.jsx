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
  Compras: { progress: 85, focus: "Suprimentos, fornecedores e ordens com governança" },
  Financeiro: { progress: 87, focus: "Fluxo de caixa, cobrança, conciliação e liquidação segura" },
  Fiscal: { progress: 83, focus: "Validação fiscal, NF-e e compliance tributário" },
  RH: { progress: 81, focus: "Colaboradores, ponto, férias e permissões por empresa" },
  Expedição: { progress: 88, focus: "Entregas, roteirização e comprovantes digitais" },
  Produção: { progress: 84, focus: "Ordens, apontamentos, insumos e produtividade" },
  Relatórios: { progress: 83, focus: "Análises multiempresa, representantes, DRE e exportações" },
  Cadastros: { progress: 90, focus: "Base mestre padronizada, integrada e segura" },
  Sistema: { progress: 93, focus: "Governança, segurança, lint estável e automações ativas" },
  Contratos: { progress: 76, focus: "Gestão de contratos, vencimentos e alertas automáticos" },
  Agenda: { progress: 79, focus: "Eventos, follow-ups e integração com CRM" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}