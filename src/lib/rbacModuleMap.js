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
    actions: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
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
      Configuracoes: ["ver", "editar", "configurar"],
      Configuracao: ["ver", "editar", "configurar"],
      Auditoria: ["visualizar", "exportar"],
      Integracoes: ["ver", "configurar", "testar"],
      Integracao: ["ver", "configurar", "testar"],
      Acessos: ["ver", "criar", "editar", "excluir"],
      Seguranca: ["ver", "configurar", "editar"],
      Propagacao: ["ver", "executar", "configurar"],
      Notificacoes: ["ver", "editar", "configurar"],
      IA: ["ver", "editar", "configurar"],
      Backup: ["ver", "configurar", "executar", "editar"],
      ConfigCenter: ["ver", "atualizar", "editar", "configurar"],
    }
  },
  HubAtendimento: {
    label: "Hub de Atendimento",
    icon: "MessageCircle",
    section: "Principal",
    actions: ["ver", "criar", "editar", "excluir", "responder"]
  }
};

// Mapeamento de ações por categoria
export const ACTION_CATEGORIES = {
  read: ["ver", "visualizar", "listar", "exportar"],
  write: ["criar", "editar", "duplicar"],
  delete: ["excluir", "deletar", "remover"],
  approve: ["aprovar", "rejeitar", "validar"],
  finance: ["liquidar", "pagar", "receber", "conciliar"],
  special: ["emitir", "cancelar", "assinar", "transferir", "rastrear"]
};

// Permissões padrão por role — alinhado com initializeRBACProfiles (backend)
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    // Admin tem acesso total a tudo
    _global: ["*"]
  },
  user: {
    // User padrão tem acesso básico de leitura a todos os módulos
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
  },
  gerente: {
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
  },
  operacional: {
    Dashboard: ["ver", "exportar"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
  },
  analista: {
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar", "exportar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto", "exportar"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario", "exportar"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber", "exportar"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar", "exportar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir", "exportar"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar", "exportar"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar", "exportar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar", "exportar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
  },
  financeiro: {
    Dashboard: ["ver", "exportar"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
  },
  rh: {
    Dashboard: ["ver", "exportar"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
    Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
    Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"],
    Sistema: ["ver", "configurar", "auditar", "backup", "seguranca"]
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