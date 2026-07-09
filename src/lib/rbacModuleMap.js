// Mapeamento centralizado de módulos e suas permissões
export const RBAC_MODULES = {
  // Principal
  Dashboard: {
    label: "Dashboard",
    icon: "LayoutDashboard",
    section: "Dashboard",
    actions: ["ver", "exportar"],
    default: true
  },
  Relatorios: {
    label: "Relatórios e Análises",
    icon: "BarChart3",
    section: "Dashboard",
    actions: ["ver", "criar", "editar", "exportar"]
  },
  Agenda: {
    label: "Agenda e Calendário",
    icon: "Calendar",
    section: "Dashboard",
    actions: ["ver", "criar", "editar", "excluir"]
  },
  CRM: {
    label: "CRM - Relacionamento",
    icon: "Users",
    section: "Principal",
    actions: ["ver", "criar", "editar", "excluir", "aprovar"]
  },

  // Cadastros
  Cadastros: {
    label: "Cadastros Gerais",
    icon: "Users",
    section: "Cadastros",
    actions: ["ver", "criar", "editar", "excluir", "importar", "exportar"]
  },

  // Operacional
  Comercial: {
    label: "Comercial e Vendas",
    icon: "ShoppingCart",
    section: "Operacional",
    actions: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    subsections: {
      Pedidos: ["criar", "editar", "excluir", "aprovar", "cancelar"],
      Clientes: ["ver", "criar", "editar", "excluir"],
      NotasFiscais: ["emitir", "cancelar", "visualizar"],
      Comissoes: ["ver", "calcular", "pagar"]
    }
  },
  Estoque: {
    label: "Estoque e Almoxarifado",
    icon: "Box",
    section: "Operacional",
    actions: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    subsections: {
      Produtos: ["ver", "criar", "editar", "excluir"],
      Movimentacoes: ["registrar", "corrigir"],
      Inventario: ["contar", "conciliar", "ajustar"]
    }
  },
  Compras: {
    label: "Compras e Suprimentos",
    icon: "Package",
    section: "Operacional",
    actions: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    subsections: {
      SolicitacoeCompra: ["criar", "aprovar", "rejeitar"],
      OrdemCompra: ["gerar", "editar", "receber"],
      Fornecedores: ["ver", "criar", "editar", "avaliar"]
    }
  },
  Expedicao: {
    label: "Expedição e Logística",
    icon: "Truck",
    section: "Operacional",
    actions: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    subsections: {
      Entregas: ["separar", "conferir", "expedir", "entregar"],
      Romaneios: ["gerar", "imprimir"],
      Rastreamento: ["visualizar", "atualizar"]
    }
  },
  Producao: {
    label: "Produção e Manufatura",
    icon: "Factory",
    section: "Operacional",
    actions: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    subsections: {
      OrdensProducao: ["criar", "editar", "parar", "concluir"],
      Apontamentos: ["registrar", "editar"],
      Qualidade: ["inspecionar", "aprovar", "rejeitar"]
    }
  },

  // Administrativo
  Financeiro: {
    label: "Financeiro e Contábil",
    icon: "DollarSign",
    section: "Administrativo",
    actions: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar", "cancelar"],
    subsections: {
      ContasReceber: ["visualizar", "gerar_cobranca", "registrar_pagamento", "cancelar"],
      ContasPagar: ["visualizar", "registrar", "aprovar", "pagar", "cancelar"],
      Caixa: ["abrir", "registrar", "fechar", "conciliar"],
      Conciliacao: ["conciliar", "corrigir"]
    }
  },
  RH: {
    label: "Recursos Humanos",
    icon: "UserCircle",
    section: "Administrativo",
    actions: ["ver", "criar", "editar", "excluir", "aprovar"],
    subsections: {
      Colaboradores: ["ver", "criar", "editar", "desligar"],
      Ponto: ["registrar", "corrigir", "fechar"],
      Ferias: ["solicitar", "aprovar", "registrar"],
      Beneficios: ["administrar"]
    }
  },
  Fiscal: {
    label: "Fiscal e Tributário",
    icon: "FileText",
    section: "Administrativo",
    actions: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    subsections: {
      NotasFiscais: ["emitir", "cancelar", "corrigir", "visualizar"],
      Impostos: ["calcular", "validar"],
      SPED: ["gerar", "exportar"]
    }
  },
  Contratos: {
    label: "Gestão de Contratos",
    icon: "FileText",
    section: "Administrativo",
    actions: ["ver", "criar", "editar", "excluir", "assinar", "renovar"]
  },

  // Sistema
  Sistema: {
    label: "Administração do Sistema",
    icon: "Settings",
    section: "Sistema",
    actions: ["ver", "editar", "configurar", "auditar", "backup", "seguranca", "executar", "testar", "exportar"],
    subsections: {
      Usuarios: ["criar", "editar", "excluir", "desativar"],
      Perfis: ["criar", "editar", "excluir", "duplicar"],
      Configuracoes: ["ver", "editar", "configurar", "executar"],
      Configuracao: ["ver", "editar", "configurar", "executar"],
      "Configurações": ["ver", "editar", "configurar", "executar"],
      Auditoria: ["visualizar", "exportar"],
      Integracoes: ["ver", "configurar", "testar"],
      Integracao: ["ver", "configurar", "testar"],
      Acessos: ["ver", "criar", "editar", "excluir"],
      Seguranca: ["ver", "configurar", "editar"],
      "Segurança": ["ver", "configurar", "editar"],
      Propagacao: ["ver", "executar", "configurar"],
      Notificacoes: ["ver", "editar", "configurar"],
      "Notificações": ["ver", "editar", "configurar"],
      IA: ["ver", "editar", "configurar"],
      "IA e Otimizacao": ["ver", "editar", "configurar"],
      "IA e Otimização": ["ver", "editar", "configurar"],
      Backup: ["ver", "configurar", "executar", "editar"],
      ConfigCenter: ["ver", "atualizar", "editar", "configurar"],
      Sistema: ["ver", "editar", "configurar"],
    }
  },
  HubAtendimento: {
    label: "Hub de Atendimento",
    icon: "MessageCircle",
    section: "Principal",
    actions: ["ver", "criar", "editar", "excluir", "responder", "transferir"],
    subsections: {
      Conversas: ["ver", "responder", "transferir", "fechar"],
      FilaEspera: ["ver", "assumir", "transferir"],
      Atendimentos: ["ver", "criar", "editar", "excluir", "responder"]
    }
  }
};

// Mapeamento de ações por categoria — usado pela UI de gestão de perfis
export const ACTION_CATEGORIES = {
  read: ["ver", "visualizar", "listar", "consultar", "status", "exportar"],
  write: ["criar", "editar", "duplicar", "importar", "gerar", "enviar", "registrar", "atualizar", "configurar", "apontar", "responder", "roteirizar", "solicitar", "abrir", "fechar", "calcular", "administrar"],
  delete: ["excluir", "deletar", "remover", "desligar"],
  approve: ["aprovar", "rejeitar", "validar", "desconto"],
  finance: ["liquidar", "pagar", "receber", "conciliar", "cancelar"],
  logistics: ["transferir", "rastrear", "inventario", "concluir", "separar", "conferir", "expedir", "entregar", "contar", "ajustar", "parar"],
  fiscal: ["emitir", "cancelar", "assinar", "renovar"],
  production: ["apontar", "parar", "concluir", "inspecionar"],
  system: ["auditar", "backup", "seguranca", "testar", "executar"]
};

// Permissões padrão por role — alinhado com initializeRBACProfiles (backend)
// Princípio do menor privilégio + Segregação de Funções (SoD):
// - Executor (Operacional): cria/edita, NÃO aprova nem exclui
// - Aprovador (Gerente): aprova/autoriza, NÃO cria nem exclui
// - Especialista (Financeiro/RH): executa ações específicas, NÃO aprova nem exclui
// - Sistema é exclusivo de admin. Exclusão é admin-only em todos os módulos.
// - Quem cria não aprova; quem aprova não liquida; quem emite não cancela.
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    _global: ["*"]
  },
  gerente: {
    // Aprovador/Gestor — aprova e autoriza, não cria nem exclui
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    CRM: ["ver", "editar", "aprovar", "exportar"],
    Cadastros: ["ver", "editar", "exportar"],
    Comercial: ["ver", "aprovar", "cancelar", "exportar"],
    Estoque: ["ver", "transferir", "inventario", "exportar"],
    Compras: ["ver", "aprovar", "exportar"],
    Expedicao: ["ver", "rastrear", "roteirizar", "exportar"],
    Producao: ["ver", "aprovar", "concluir", "exportar"],
    Financeiro: ["ver", "aprovar", "conciliar", "exportar"],
    RH: ["ver", "aprovar"],
    Fiscal: ["ver", "exportar"],
    Contratos: ["ver", "aprovar", "assinar", "renovar", "exportar"],
    HubAtendimento: ["ver", "responder", "transferir", "exportar"],
  },
  operacional: {
    // Executor — cria e edita, não aprova nem exclui
    Dashboard: ["ver", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    CRM: ["ver", "criar", "editar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "importar"],
    Comercial: ["ver", "criar", "editar", "exportar"],
    Estoque: ["ver", "criar", "editar", "transferir"],
    Compras: ["ver", "criar", "editar", "receber"],
    Expedicao: ["ver", "criar", "editar", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "apontar", "concluir"],
    Financeiro: ["ver"],
    RH: ["ver"],
    Fiscal: ["ver"],
    Contratos: ["ver"],
    Relatorios: ["ver", "exportar"],
    HubAtendimento: ["ver", "criar", "editar", "responder"],
  },
  analista: {
    // Consultor — leitura + exportação, sem ações destrutivas nem Sistema
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    Agenda: ["ver"],
    CRM: ["ver", "exportar"],
    Cadastros: ["ver", "exportar"],
    Comercial: ["ver", "exportar"],
    Estoque: ["ver", "exportar"],
    Compras: ["ver", "exportar"],
    Expedicao: ["ver", "exportar"],
    Producao: ["ver", "exportar"],
    Financeiro: ["ver", "exportar"],
    RH: ["ver", "exportar"],
    Fiscal: ["ver", "exportar"],
    Contratos: ["ver", "exportar"],
    HubAtendimento: ["ver"],
  },
  financeiro: {
    // Especialista — executa liquidações e emissões, não aprova nem exclui
    Dashboard: ["ver", "exportar"],
    Financeiro: ["ver", "criar", "editar", "liquidar", "conciliar", "exportar"],
    Fiscal: ["ver", "criar", "editar", "emitir", "exportar"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Expedicao: ["ver"],
    Producao: ["ver"],
    CRM: ["ver"],
    RH: ["ver"],
    Cadastros: ["ver"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "assinar", "renovar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    HubAtendimento: ["ver"],
  },
  rh: {
    // Especialista — edita dados de pessoal, não aprova nem exclui
    Dashboard: ["ver", "exportar"],
    RH: ["ver", "criar", "editar", "exportar"],
    Cadastros: ["ver", "criar", "editar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Expedicao: ["ver"],
    Producao: ["ver"],
    Financeiro: ["ver"],
    Fiscal: ["ver"],
    CRM: ["ver"],
    Contratos: ["ver"],
    Relatorios: ["ver", "exportar"],
    HubAtendimento: ["ver"],
  },
  user: {
    // Leitura em todos os módulos, sem escrita nem Sistema
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    CRM: ["ver"],
    Cadastros: ["ver"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Expedicao: ["ver"],
    Producao: ["ver"],
    Financeiro: ["ver"],
    RH: ["ver"],
    Fiscal: ["ver"],
    Contratos: ["ver"],
    HubAtendimento: ["ver"],
  }
};

export function getModuleLabel(moduleName) {
  return RBAC_MODULES[moduleName]?.label || moduleName;
}

export function getModuleActions(moduleName) {
  return RBAC_MODULES[moduleName]?.actions || [];
}

export function getModuleSubsections(moduleName) {
  return RBAC_MODULES[moduleName]?.subsections || {};
}