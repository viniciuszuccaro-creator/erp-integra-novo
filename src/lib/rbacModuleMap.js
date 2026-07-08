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
    actions: ["ver", "configurar", "auditar", "backup", "seguranca"],
    subsections: {
      Usuarios: ["criar", "editar", "excluir", "desativar"],
      Perfis: ["criar", "editar", "excluir", "duplicar"],
      Configuracoes: ["ver", "editar"],
      Auditoria: ["visualizar", "exportar"],
      Integracao: ["configurar", "testar"]
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
    // User padrão tem acesso básico de leitura
    Dashboard: ["ver"],
    CRM: ["ver"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Financeiro: ["ver"],
    RH: ["ver"]
  },
  gerente: {
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "exportar"],
    CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
    Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
    Estoque: ["ver", "criar", "editar", "excluir"],
    Compras: ["ver", "criar", "editar", "excluir", "aprovar"],
    Expedicao: ["ver", "criar", "editar", "excluir"],
    Producao: ["ver", "criar", "editar", "excluir"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar"],
    RH: ["ver", "criar", "editar", "excluir"],
    Fiscal: ["ver", "criar", "editar", "excluir"],
    Cadastros: ["ver", "criar", "editar", "excluir"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    Contratos: ["ver", "criar", "editar", "excluir", "aprovar"],
    HubAtendimento: ["ver", "criar", "editar", "excluir"],
    Sistema: ["ver", "consultar"]
  },
  operacional: {
    Dashboard: ["ver"],
    CRM: ["ver", "criar", "editar"],
    Comercial: ["ver", "criar", "editar"],
    Estoque: ["ver", "criar", "editar"],
    Compras: ["ver", "criar"],
    Expedicao: ["ver", "criar", "editar"],
    Producao: ["ver", "criar", "editar"],
    Financeiro: ["ver"],
    Fiscal: ["ver"],
    Cadastros: ["ver", "criar", "editar"],
    Agenda: ["ver", "criar", "editar"],
    Relatorios: ["ver", "exportar"],
    Contratos: ["ver"],
    HubAtendimento: ["ver", "criar", "editar"]
  },
  analista: {
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "exportar"],
    CRM: ["ver", "exportar"],
    Comercial: ["ver", "exportar"],
    Estoque: ["ver", "exportar"],
    Compras: ["ver", "exportar"],
    Expedicao: ["ver", "exportar"],
    Producao: ["ver", "exportar"],
    Financeiro: ["ver", "exportar"],
    RH: ["ver", "exportar"],
    Fiscal: ["ver", "exportar"],
    Cadastros: ["ver", "exportar"],
    Agenda: ["ver"],
    Contratos: ["ver", "exportar"],
    HubAtendimento: ["ver"],
    Sistema: ["ver", "consultar"]
  },
  financeiro: {
    Dashboard: ["ver"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Expedicao: ["ver"],
    Producao: ["ver"],
    CRM: ["ver"],
    Fiscal: ["ver"],
    Cadastros: ["ver"],
    Agenda: ["ver", "criar"],
    Contratos: ["ver", "criar", "editar"],
    Relatorios: ["ver", "exportar"],
    HubAtendimento: ["ver"]
  },
  rh: {
    Dashboard: ["ver"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar"],
    Comercial: ["ver"],
    Estoque: ["ver"],
    Compras: ["ver"],
    Expedicao: ["ver"],
    Producao: ["ver"],
    Financeiro: ["ver"],
    Fiscal: ["ver"],
    Cadastros: ["ver"],
    Agenda: ["ver", "criar", "editar"],
    Contratos: ["ver"],
    Relatorios: ["ver", "exportar"],
    HubAtendimento: ["ver"]
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