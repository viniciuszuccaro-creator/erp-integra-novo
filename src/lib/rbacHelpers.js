/**
 * rbacHelpers.js v2.0
 * Utilitários centralizados para RBAC (Role-Based Access Control)
 * Simplifica verificações de permissão em todo o app
 */

// ─ Mapa de Módulos → Seções → Ações ─
export const RBAC_PERMISSIONS = {
  Dashboard: {
    Ver: ["visualizar"],
    KPIs: ["visualizar", "exportar"],
  },
  CRM: {
    Clientes: ["criar", "editar", "deletar", "visualizar", "exportar"],
    Oportunidades: ["criar", "editar", "deletar", "visualizar"],
    Interações: ["criar", "editar", "deletar", "visualizar"],
  },
  Comercial: {
    Pedidos: ["criar", "editar", "deletar", "visualizar", "aprovar"],
    Clientes: ["criar", "editar", "deletar", "visualizar"],
    TabelasPreço: ["criar", "editar", "deletar", "visualizar"],
  },
  Estoque: {
    Produtos: ["criar", "editar", "deletar", "visualizar"],
    Movimentações: ["criar", "editar", "deletar", "visualizar"],
    Recebimento: ["criar", "editar", "deletar", "visualizar"],
  },
  Financeiro: {
    ContaReceber: ["criar", "editar", "deletar", "visualizar", "liquidar"],
    ContaPagar: ["criar", "editar", "deletar", "visualizar", "liquidar"],
    Conciliação: ["criar", "editar", "deletar", "visualizar"],
    FormasPagamento: ["visualizar", "editar"],
  },
  Fiscal: {
    NotaFiscal: ["criar", "editar", "deletar", "visualizar", "emitir"],
    ImportarXML: ["criar", "visualizar"],
    SPED: ["visualizar", "exportar"],
  },
  RH: {
    Colaboradores: ["criar", "editar", "deletar", "visualizar"],
    Férias: ["criar", "editar", "deletar", "visualizar"],
    Ponto: ["visualizar", "editar"],
  },
  Produção: {
    OrdemProducao: ["criar", "editar", "deletar", "visualizar"],
    Apontamento: ["criar", "editar", "deletar", "visualizar"],
    ControleQualidade: ["visualizar", "editar"],
  },
  Expedicao: {
    Entregas: ["criar", "editar", "deletar", "visualizar"],
    Romaneio: ["criar", "editar", "deletar", "visualizar"],
    Rastreamento: ["visualizar"],
  },
  Compras: {
    OrdemCompra: ["criar", "editar", "deletar", "visualizar"],
    Fornecedores: ["criar", "editar", "deletar", "visualizar"],
    Cotações: ["criar", "editar", "deletar", "visualizar"],
  },
  Cadastros: {
    Geral: ["criar", "editar", "deletar", "visualizar"],
    Parametros: ["visualizar", "editar"],
  },
  Sistema: {
    Configurações: ["visualizar", "editar"],
    Integrações: ["visualizar", "editar"],
    "Controle de Acesso": ["visualizar", "editar"],
    Auditoria: ["visualizar"],
    Segurança: ["visualizar", "editar"],
    IA: ["visualizar", "editar"],
  },
};

// ─ Permissões por Role ─
export const ROLE_PERMISSIONS = {
  admin: {
    all: true, // Acesso total
  },
  gerente: {
    modules: ["Dashboard", "CRM", "Comercial", "Estoque", "Financeiro", "Produção", "Expedicao"],
    actions: ["criar", "editar", "deletar", "visualizar", "aprovar", "exportar"],
  },
  operacional: {
    modules: ["Comercial", "Estoque", "Produção", "Expedicao"],
    actions: ["criar", "editar", "visualizar"],
  },
  analista: {
    modules: ["Dashboard", "CRM", "Comercial", "Estoque", "Financeiro"],
    actions: ["visualizar", "exportar"],
  },
  user: {
    modules: ["Dashboard"],
    actions: ["visualizar"],
  },
};

/**
 * Verifica se um usuário tem permissão para uma ação
 * @param {string} userRole - Role do usuário (admin, gerente, operacional, analista, user)
 * @param {string} module - Nome do módulo (CRM, Comercial, etc)
 * @param {string} section - Seção do módulo (opcional)
 * @param {string} action - Ação a verificar (criar, editar, deletar, visualizar, etc)
 * @returns {boolean}
 */
export function hasPermission(userRole, module, section = null, action = "visualizar") {
  // Admin tem acesso a tudo
  if (userRole === "admin") return true;

  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms) return false;

  // Verificação simples: module + action
  const canAccessModule = rolePerms.modules?.includes(module);
  const canDoAction = rolePerms.actions?.includes(action);

  return canAccessModule && canDoAction;
}

/**
 * Obtém lista de módulos acessíveis para um usuário
 */
export function getAccessibleModules(userRole) {
  if (userRole === "admin") {
    return Object.keys(RBAC_PERMISSIONS);
  }

  const rolePerms = ROLE_PERMISSIONS[userRole];
  return rolePerms?.modules || [];
}

/**
 * Obtém ações acessíveis para um usuário em um módulo
 */
export function getAccessibleActions(userRole, module) {
  if (userRole === "admin") {
    return ["criar", "editar", "deletar", "visualizar", "aprovar", "exportar", "emitir"];
  }

  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms?.modules?.includes(module)) return [];

  return rolePerms.actions || [];
}

/**
 * Valida um conjunto de permissões em paralelo
 */
export function validatePermissions(userRole, permissions) {
  const result = {};
  permissions.forEach(({ module, section, action }) => {
    const key = `${module}:${section || "all"}:${action}`;
    result[key] = hasPermission(userRole, module, section, action);
  });
  return result;
}