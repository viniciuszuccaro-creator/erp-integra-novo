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
      Fiscal: ["ver", "editar", "configurar"],
      Backup: ["ver", "configurar", "executar", "editar"],
      ConfigCenter: ["ver", "atualizar", "editar", "configurar"],
      Sistema: ["ver", "editar", "configurar"],
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
// Princípio do menor privilégio: cada role tem acesso apenas ao necessário para sua função.
// Sistema é exclusivo de admin. Ações sensíveis (emitir, cancelar, liquidar) são restritas.
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    // Admin tem acesso total a tudo
    _global: ["*"]
  },
  gerente: {
    // Gerente: CRUD + aprovação em módulos operacionais e administrativos, sem acesso a Sistema
    Dashboard: ["ver", "exportar"],
    Relatorios: ["ver", "criar", "editar", "exportar"],
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
  },
  operacional: {
    // Operacional: CRUD em módulos operacionais, leitura em administrativos, sem Sistema
    Dashboard: ["ver", "exportar"],
    Agenda: ["ver", "criar", "editar", "excluir"],
    CRM: ["ver", "criar", "editar", "excluir"],
    Cadastros: ["ver", "criar", "editar", "excluir", "importar"],
    Comercial: ["ver", "criar", "editar", "excluir"],
    Estoque: ["ver", "criar", "editar", "excluir", "transferir"],
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
    // Analista: leitura + exportação em todos os módulos, sem ações destrutivas nem Sistema
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
    // Financeiro: controle total no Financeiro/Fiscal, leitura nos demais, sem Sistema
    Dashboard: ["ver", "exportar"],
    Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
    Fiscal: ["ver", "criar", "editar", "emitir", "cancelar", "exportar"],
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
    // RH: controle total no RH, leitura nos demais, sem Sistema
    Dashboard: ["ver", "exportar"],
    RH: ["ver", "criar", "editar", "excluir", "aprovar"],
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
    // User padrão: leitura em todos os módulos, sem ações de escrita nem Sistema
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