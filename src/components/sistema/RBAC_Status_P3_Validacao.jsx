/**
 * P3 — RBAC Granular — Status de Implementação
 * Validação: Frontend (UI)  + Backend (entityGuard)
 * 
 * ESTRUTURA PADRÃO:
 *   Modulo.Entidade.Acao
 *   Ex: Comercial.Pedido.aprovar, Financeiro.ContaPagar.baixar, Estoque.Movimentacao.ajustar
 * 
 * STATUS ATUAL (2026-06-21):
 */

const rbacStatus = {
  // ✅ IMPLEMENTADO
  "Comercial": {
    "Pedido": {
      permissoes: ["visualizar", "criar", "editar", "excluir", "aprovar", "fechar", "marcarProntoFaturar"],
      frontend: "✅ data-permission em PedidoFooterAcoes",
      backend: "✅ entityGuard cobre Comercial.Pedido.*",
      auditoria: "✅ AuditLog + antes/depois"
    },
    "Cliente": {
      permissoes: ["visualizar", "criar", "editar", "excluir", "consultarCredito"],
      frontend: "✅ ProtectedSection no CadastroClienteCompleto",
      backend: "✅ entityGuard",
      auditoria: "✅ AuditLog"
    }
  },

  "Financeiro": {
    "ContaPagar": {
      permissoes: ["visualizar", "criar", "editar", "excluir", "baixar", "gerar", "cancelar"],
      frontend: "✅ RBACButton em ContaPagarTab",
      backend: "✅ entityGuard",
      auditoria: "✅ Auditoria pagamento em ContaPagar.detalhes_pagamento.auditoria_pagamento"
    },
    "ContaReceber": {
      permissoes: ["visualizar", "criar", "editar", "excluir", "receber", "cancelar"],
      frontend: "🔄 Parcial (faltam botões em alguns contextos)",
      backend: "✅ entityGuard",
      auditoria: "⏳ Implementar em ContaReceber"
    },
    "CaixaCentral": {
      permissoes: ["visualizar", "liquidar", "conciliar", "gerar"],
      frontend: "⏳ Melhorar filtros RBAC",
      backend: "✅ entityGuard",
      auditoria: "⏳ Adicionar logs de liquidação"
    }
  },

  "Estoque": {
    "Movimentacao": {
      permissoes: ["visualizar", "criar", "editar", "ajustar", "cancelar"],
      frontend: "🔄 Parcial",
      backend: "✅ entityGuard",
      auditoria: "✅ AuditLog + antes/depois em MovimentacaoEstoque"
    },
    "Inventario": {
      permissoes: ["visualizar", "iniciar", "apontar", "finalizar", "ajustar"],
      frontend: "⏳ Faltam botões de ação em InventarioContagem",
      backend: "✅ entityGuard",
      auditoria: "⏳ Adicionar logs de contagem"
    },
    "TransferenciaEntreEmpresas": {
      permissoes: ["visualizar", "criar", "solicitar", "aprovar", "cancelar", "rastrear"],
      frontend: "⏳ Implementar RBAC em TransferenciaEntreEmpresasForm",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de autorização e movimentação"
    }
  },

  "Compras": {
    "SolicitacaoCompra": {
      permissoes: ["visualizar", "criar", "solicitar", "cancelar"],
      frontend: "⏳ Implementar RBAC em SolicitacaoCompraForm",
      backend: "✅ entityGuard",
      auditoria: "⏳ Adicionar logs"
    },
    "OrdemCompra": {
      permissoes: ["visualizar", "criar", "editar", "aprovar", "enviar", "receber", "cancelar"],
      frontend: "⏳ Implementar RBAC em OrdemCompraForm",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de mudanças de status"
    }
  },

  "Producao": {
    "OrdemProducao": {
      permissoes: ["visualizar", "criar", "enviar", "apontar", "validar", "finalizar", "cancelar"],
      frontend: "⏳ Implementar RBAC em FormularioOrdemProducao",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de apontamento"
    },
    "ApontamentoProducao": {
      permissoes: ["visualizar", "criar", "editar", "validar", "cancelar"],
      frontend: "⏳ Implementar RBAC em ApontamentoProducao",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de entrada/saída de horas"
    }
  },

  "Expedicao": {
    "Entrega": {
      permissoes: ["visualizar", "criar", "editar", "confirmar", "rastrear", "comprovar", "finalizar", "cancelar"],
      frontend: "🔄 Parcial (faltam validações)",
      backend: "✅ entityGuard",
      auditoria: "✅ AuditLog + antes/depois"
    }
  },

  "CRM": {
    "Oportunidade": {
      permissoes: ["visualizar", "criar", "editar", "mudarEtapa", "converter", "perder", "cancelar"],
      frontend: "⏳ Implementar RBAC em OportunidadeForm",
      backend: "✅ entityGuard",
      auditoria: "✅ Histórico de mudanças de etapa"
    },
    "Interacao": {
      permissoes: ["visualizar", "criar", "editar", "registrar"],
      frontend: "⏳ Implementar RBAC em InteracoesListagem",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de tipos de interação"
    },
    "Campanha": {
      permissoes: ["visualizar", "criar", "editar", "lancar", "pausar", "cancelar", "relatorios"],
      frontend: "⏳ Implementar RBAC em CampanhaForm",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de lançamento e pausas"
    }
  },

  "RH": {
    "Ponto": {
      permissoes: ["visualizar", "registrar", "editar", "aprovar", "relatorios"],
      frontend: "⏳ Implementar RBAC em PontoTab",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de aprovação/rejeição"
    },
    "Ferias": {
      permissoes: ["visualizar", "solicitar", "editar", "aprovar", "cancelar", "relatorios"],
      frontend: "⏳ Implementar RBAC em FeriasForm",
      backend: "✅ entityGuard",
      auditoria: "⏳ Logs de aprovação"
    }
  },

  "Fiscal": {
    "NotaFiscal": {
      permissoes: ["visualizar", "criar", "editar", "emitir", "cancelar", "importarXML"],
      frontend: "⏳ Implementar RBAC em ImportarXMLNFe",
      backend: "✅ entityGuard",
      auditoria: "✅ LogFiscal"
    }
  },

  "Administracao": {
    "PerfilAcesso": {
      permissoes: ["visualizar", "criar", "editar", "clonar", "excluir", "atribuir"],
      frontend: "✅ RBAC em GestaoAcessosIndex",
      backend: "✅ entityGuard + cleanupOrphanedPerfilAcesso",
      auditoria: "✅ AuditLog + SOD checker"
    },
    "Usuario": {
      permissoes: ["visualizar", "criar", "editar", "ativar", "desativar", "resetarSenha"],
      frontend: "✅ RBAC em UsuariosTab",
      backend: "✅ entityGuard + adminInviteUser",
      auditoria: "✅ AuditLog"
    },
    "Empresa": {
      permissoes: ["visualizar", "criar", "editar", "ativar", "desativar", "propagarConfigs"],
      frontend: "✅ RBAC em EmpresaForm",
      backend: "✅ entityGuard + propagateGroupConfigs",
      auditoria: "✅ AuditLog"
    }
  }
};

/**
 * ⏳ P3 TAREFAS PENDENTES (em ordem de prioridade):
 * 
 * 1. Implementar ProtectedSection/RBACButton em:
 *    - SolicitacaoCompraForm (Compras.SolicitacaoCompra.*)
 *    - OrdemCompraForm (Compras.OrdemCompra.*)
 *    - FormularioOrdemProducao (Producao.OrdemProducao.*)
 *    - ApontamentoProducao (Producao.ApontamentoProducao.*)
 *    - OportunidadeForm (CRM.Oportunidade.*)
 *    - InteracoesListagem (CRM.Interacao.*)
 *    - CampanhaForm (CRM.Campanha.*)
 *    - PontoTab (RH.Ponto.*)
 *    - FeriasForm (RH.Ferias.*)
 *    - ImportarXMLNFe (Fiscal.NotaFiscal.importarXML)
 *    - ContaReceberForm (Financeiro.ContaReceber.*)
 *    - InventarioContagem (Estoque.Inventario.*)
 *    - TransferenciaEntreEmpresasForm (Estoque.TransferenciaEntreEmpresas.*)
 * 
 * 2. Adicionar AuditLog para:
 *    - ContaReceber (não tem auditoria_pagamento como ContaPagar)
 *    - MovimentacaoEstoque (contagem/ajustes)
 *    - Inventario (contagem finalizada)
 *    - SolicitacaoCompra (aprovação/rejeição)
 *    - OrdenCompra (status changes)
 *    - OrdemProducao (apontamentos)
 *    - Oportunidade (mudarEtapa já tem histórico, precisa de AuditLog)
 *    - Ponto (aprovação/rejeição)
 *    - Ferias (aprovação/rejeição)
 * 
 * 3. Testes:
 *    - Validar entityGuard em 10+ fluxos críticos
 *    - Testar permissões negadas em cada módulo
 *    - Validar AuditLog com antes/depois
 *    - Testar multi-tenant (empresa A não vê dados de B)
 * 
 * 4. Documentação:
 *    - Gerar matriz de permissões por perfil (Administrador, Gerencial, Operacional, Consulta)
 *    - Publicar em Documentacao.md
 */

export default rbacStatus;