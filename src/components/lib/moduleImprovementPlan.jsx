export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
  "Governança",
  "Integrações",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard:         { progress: 100, focus: "Consolidação executiva, IA contextual, SemEmpresaBanner e indicadores em tempo real" },
  CRM:               { progress: 100, focus: "Pipeline IA, oportunidades, interações, churn + IAContextualModulo integrado" },
  Comercial:         { progress: 100, focus: "Pedidos, margens, aprovação, rastreabilidade + IA contextual no launchpad" },
  Estoque:           { progress: 100, focus: "Saldo seguro, movimentações auditadas, reposição IA + header integrado" },
  Financeiro:        { progress: 100, focus: "Fluxo de caixa IA, cobrança, gateway wizard e IA contextual no header" },
  Fiscal:            { progress: 100, focus: "Validação fiscal IA, NF-e, SPED, certificado guard, SemEmpresaBanner + IAContextual" },
  RH:                { progress: 100, focus: "Colaboradores, ponto biométrico, IA de insights + header integrado ciclo 12" },
  Expedição:         { progress: 100, focus: "Entregas, IA de rotas, roteirização, SemEmpresaBanner + IA header" },
  Relatórios:        { progress: 100, focus: "Análises multiempresa, IA executiva, SemEmpresaBanner, representantes, DRE e exportações" },
  Cadastros:         { progress: 99, focus: "Base mestre padronizada, integrada e segura com IA" },
  Sistema:           { progress: 100, focus: "Governança, segurança, lint estável, IA e automações ativas" },
  Contratos:         { progress: 100, focus: "KPIs, IA de risco, renovação, cobrança automática + SemEmpresaBanner + IAContextual" },
  Agenda:            { progress: 99, focus: "Calendário, IA de eventos, painel lateral e lembretes inteligentes" },
  Compras:           { progress: 100, focus: "Suprimentos, IA insights + SemEmpresaBanner + IAContextualModulo no header" },
  Produção:          { progress: 100, focus: "OPs listagem real, apontamentos, IA diagnóstico, kanban + SemEmpresaBanner + IAContextual" },
  'Hub Atendimento': { progress: 99, focus: "Omnichannel, chatbot IA, SLA, IAPanel e atendimento multicanal" },
  Empresas:          { progress: 100, focus: "Gestão de grupo empresarial, filiais, EmpresaSwitcher e configuração por empresa" },
  Portal:            { progress: 99, focus: "Portal cliente: pedidos, boletos, entregas, rastreio e BI embarcado" },
  'Gestão Acessos':  { progress: 100, focus: "RBAC granular, SoD, cobertura de perfis, auditoria de acessos e timeline" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}