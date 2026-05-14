// Estrutura centralizada de permissões do sistema (Regra-Mãe: modular, reutilizável, escalável)
// Ações disponíveis em todo o sistema
export const ACOES = [
  // Básicas
  { id: "visualizar", nome: "Visualizar", icone: "Eye", cor: "slate" },
  { id: "criar", nome: "Criar", icone: "Plus", cor: "blue" },
  { id: "editar", nome: "Editar", icone: "Pencil", cor: "green" },
  { id: "excluir", nome: "Excluir", icone: "Trash2", cor: "red" },
  
  // Aprovações e Validações
  { id: "aprovar", nome: "Aprovar", icone: "CheckSquare", cor: "purple" },
  { id: "rejeitar", nome: "Rejeitar", icone: "XSquare", cor: "red" },
  { id: "validar", nome: "Validar", icone: "CheckCircle2", cor: "emerald" },
  { id: "analisar", nome: "Analisar", icone: "BarChart3", cor: "blue" },
  
  // Específicas por Módulo
  { id: "baixar", nome: "Baixar", icone: "Download", cor: "cyan" },
  { id: "emitir", nome: "Emitir", icone: "Send", cor: "orange" },
  { id: "ativar", nome: "Ativar", icone: "Power", cor: "green" },
  { id: "inativar", nome: "Inativar", icone: "PowerOff", cor: "slate" },
  { id: "importar", nome: "Importar", icone: "Upload", cor: "blue" },
  { id: "exportar", nome: "Exportar", icone: "Download", cor: "cyan" },
  { id: "sincronizar", nome: "Sincronizar", icone: "RefreshCw", cor: "purple" },
  { id: "configurar", nome: "Configurar", icone: "Settings", cor: "slate" },
  { id: "gerar", nome: "Gerar", icone: "Zap", cor: "amber" },
  { id: "aprovar_desconto", nome: "Aprovar Desconto", icone: "DollarSign", cor: "emerald" },
  { id: "solicitar_desconto", nome: "Solicitar Desconto", icone: "TrendingDown", cor: "orange" },
  { id: "cancelar", nome: "Cancelar", icone: "X", cor: "red" },
  { id: "duplicar", nome: "Duplicar", icone: "Copy", cor: "blue" },
  { id: "consultar", nome: "Consultar", icone: "Search", cor: "slate" },
];

// Estrutura de módulos, seções e abas (respeitando Regra-Mãe: melhorar sempre)
export const ESTRUTURA_SISTEMA = {
  dashboard: {
    nome: "Dashboard",
    icone: "LayoutDashboard",
    cor: "blue",
    secoes: {
      principal: {
        nome: "Visão Geral",
        abas: ["kpis", "graficos", "alertas"],
      },
      corporativo: {
        nome: "Dashboard Corporativo",
        abas: ["multiempresa", "consolidado"],
      },
    },
  },
  
  comercial: {
    nome: "Comercial e Vendas",
    icone: "ShoppingCart",
    cor: "green",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "detalhes", "historico", "crm"] },
      pedidos: { nome: "Pedidos", abas: ["lista", "novo", "aprovacao", "faturamento"] },
      orcamentos: { nome: "Orçamentos", abas: ["lista", "novo", "conversao"] },
      tabelas_preco: { nome: "Tabelas de Preço", abas: ["lista", "itens", "historico"] },
      comissoes: { nome: "Comissões", abas: ["lista", "calculo", "pagamento", "auditoria"] },
      notas_fiscais: { nome: "Notas Fiscais", abas: ["emissao", "lista", "cancelamento", "manifesto"] },
      descontos: { nome: "Descontos & Promoções", abas: ["lista", "aprovacoes", "auditoria"] },
    },
  },
  
  financeiro: {
    nome: "Financeiro e Contábil",
    icone: "DollarSign",
    cor: "emerald",
    secoes: {
      contas_receber: {
        nome: "Contas a Receber",
        abas: ["lista", "baixa", "cobranca", "boletos", "renegociacao"],
      },
      contas_pagar: {
        nome: "Contas a Pagar",
        abas: ["lista", "baixa", "aprovacao", "pagamento", "parcelamento"],
      },
      caixa: {
        nome: "Caixa Diário",
        abas: ["movimentos", "fechamento", "transferencias", "reconciliacao"],
      },
      conciliacao: {
        nome: "Conciliação Bancária",
        abas: ["importar", "conciliar", "historico", "divergencias"],
      },
      relatorios: {
        nome: "Relatórios Financeiros",
        abas: ["dre", "fluxo_caixa", "inadimplencia", "fluxo_grupo"],
      },
      multiempresa: {
        nome: "Consolidação Multiempresa",
        abas: ["visao_grupo", "transferencias", "rateios"],
      },
    },
  },
  
  estoque: {
    nome: "Estoque e Almoxarifado",
    icone: "Package",
    cor: "purple",
    secoes: {
      produtos: { nome: "Produtos", abas: ["lista", "novo", "lotes", "validade", "conversoes"] },
      movimentacoes: {
        nome: "Movimentações",
        abas: ["entrada", "saida", "transferencia", "ajuste", "auditoria"],
      },
      inventario: {
        nome: "Inventário",
        abas: ["contagem", "acerto", "historico", "divergencias"],
      },
      requisicoes: {
        nome: "Requisições",
        abas: ["lista", "aprovacao", "atendimento", "devolvidas"],
      },
      localizacoes: {
        nome: "Localizações",
        abas: ["mapa", "ocupacao", "movimentacoes"],
      },
    },
  },
  
  compras: {
    nome: "Compras e Suprimentos",
    icone: "Briefcase",
    cor: "orange",
    secoes: {
      fornecedores: {
        nome: "Fornecedores",
        abas: ["lista", "avaliacao", "historico", "pagamento", "comunicacao"],
      },
      solicitacoes: {
        nome: "Solicitações",
        abas: ["lista", "nova", "aprovacao", "canceladas"],
      },
      cotacoes: {
        nome: "Cotações",
        abas: ["lista", "nova", "comparativo", "historico"],
      },
      ordens_compra: {
        nome: "Ordens de Compra",
        abas: ["lista", "nova", "recebimento", "devolvidas", "fechadas"],
      },
      contratos: {
        nome: "Contratos",
        abas: ["lista", "novo", "renovacoes", "multas"],
      },
    },
  },
  
  expedicao: {
    nome: "Expedição e Logística",
    icone: "Truck",
    cor: "cyan",
    secoes: {
      entregas: {
        nome: "Entregas",
        abas: ["lista", "separacao", "despacho", "rastreamento", "devolucoes"],
      },
      romaneios: {
        nome: "Romaneios",
        abas: ["lista", "novo", "impressao", "fechamento"],
      },
      roteirizacao: {
        nome: "Roteirização",
        abas: ["mapa", "otimizacao", "motoristas", "historico"],
      },
      transportadoras: {
        nome: "Transportadoras",
        abas: ["lista", "tabelas_frete", "performance", "contratos"],
      },
      rastreamento: {
        nome: "Rastreamento Realtime",
        abas: ["mapa_live", "alertas", "historico"],
      },
    },
  },
  
  producao: {
    nome: "Produção e Manufatura",
    icone: "Factory",
    cor: "indigo",
    secoes: {
      ordens_producao: {
        nome: "Ordens de Produção",
        abas: ["lista", "nova", "programacao", "kanban", "execucao"],
      },
      apontamentos: {
        nome: "Apontamentos",
        abas: ["producao", "paradas", "refugo", "horas_extras"],
      },
      qualidade: {
        nome: "Qualidade",
        abas: ["inspecao", "nao_conformidades", "acoes", "metricas"],
      },
      planejamento: {
        nome: "Planejamento",
        abas: ["capacidade", "recursos", "timeline", "bottlenecks"],
      },
    },
  },
  
  rh: {
    nome: "Recursos Humanos",
    icone: "UserCircle",
    cor: "pink",
    secoes: {
      colaboradores: {
        nome: "Colaboradores",
        abas: ["lista", "documentos", "historico", "competencias"],
      },
      ponto: {
        nome: "Ponto Eletrônico",
        abas: ["registros", "ajustes", "relatorios", "divergencias"],
      },
      ferias: {
        nome: "Férias",
        abas: ["programacao", "solicitacoes", "aprovacao", "saldo"],
      },
      folha: {
        nome: "Folha de Pagamento",
        abas: ["calculo", "holerites", "encargos", "fechamento"],
      },
      avaliacao: {
        nome: "Avaliação & Desempenho",
        abas: ["ciclos", "avaliacoes", "metas", "resultados"],
      },
    },
  },
  
  fiscal: {
    nome: "Fiscal e Tributário",
    icone: "FileText",
    cor: "red",
    secoes: {
      nfe: {
        nome: "NF-e",
        abas: ["emissao", "entrada", "manifestacao", "inutilizacao", "cancelamento"],
      },
      tabelas_fiscais: {
        nome: "Tabelas Fiscais",
        abas: ["cfop", "cst", "ncm", "aliquotas", "substituicao"],
      },
      sped: {
        nome: "SPED",
        abas: ["fiscal", "contribuicoes", "contabil", "envio"],
      },
      obrigacoes: {
        nome: "Obrigações Acessórias",
        abas: ["calendario", "guias", "declaracoes", "status"],
      },
      conformidade: {
        nome: "Conformidade",
        abas: ["checkpoints", "pendentes", "validacoes", "auditoria"],
      },
    },
  },
  
  cadastros: {
    nome: "Cadastros Gerais",
    icone: "Users",
    cor: "slate",
    secoes: {
      pessoas: {
        nome: "Pessoas & Parceiros",
        abas: ["clientes", "fornecedores", "transportadoras", "colaboradores"],
      },
      produtos: {
        nome: "Produtos & Serviços",
        abas: ["produtos", "servicos", "grupos", "marcas", "familias"],
      },
      financeiro: {
        nome: "Financeiro",
        abas: ["bancos", "formas_pagamento", "centros_custo", "plano_contas"],
      },
      logistica: {
        nome: "Logística",
        abas: ["veiculos", "motoristas", "rotas", "transportadoras"],
      },
      organizacional: {
        nome: "Organizacional",
        abas: ["empresas", "departamentos", "cargos", "usuarios", "grupos"],
      },
      integracoes: {
        nome: "Integrações & IA",
        abas: ["apis", "webhooks", "chatbot", "jobs_ia", "modelos"],
      },
    },
  },
  
  crm: {
    nome: "CRM - Relacionamento",
    icone: "MessageCircle",
    cor: "violet",
    secoes: {
      oportunidades: {
        nome: "Oportunidades",
        abas: ["funil", "lista", "conversao", "perdidas"],
      },
      interacoes: {
        nome: "Interações",
        abas: ["historico", "nova", "follow_up", "timeline"],
      },
      campanhas: {
        nome: "Campanhas",
        abas: ["lista", "nova", "resultados", "segmentacao"],
      },
      relacionamento: {
        nome: "Relacionamento",
        abas: ["timeline", "documentos", "comunicacao", "historico"],
      },
    },
  },
  
  agenda: {
    nome: "Agenda e Calendário",
    icone: "Calendar",
    cor: "amber",
    secoes: {
      eventos: {
        nome: "Eventos",
        abas: ["calendario", "lista", "notificacoes", "repetentes"],
      },
      tarefas: {
        nome: "Tarefas",
        abas: ["kanban", "lista", "atribuicao", "concluidas"],
      },
      reunioes: {
        nome: "Reuniões",
        abas: ["agendadas", "historico", "salas", "recursos"],
      },
    },
  },
  
  relatorios: {
    nome: "Relatórios e Análises",
    icone: "BarChart3",
    cor: "teal",
    secoes: {
      dashboards: {
        nome: "Dashboards",
        abas: ["executivo", "operacional", "financeiro", "comercial"],
      },
      relatorios: {
        nome: "Relatórios",
        abas: ["vendas", "estoque", "financeiro", "rh", "customizados"],
      },
      exportacao: {
        nome: "Exportação",
        abas: ["excel", "pdf", "api", "agendado"],
      },
      analytics: {
        nome: "Analytics & BI",
        abas: ["trending", "comparativos", "previsoes", "anomalias"],
      },
    },
  },
  
  sistema: {
    nome: "Configurações do Sistema",
    icone: "Settings",
    cor: "gray",
    secoes: {
      configuracoes: {
        nome: "Configurações Gerais",
        abas: ["geral", "notificacoes", "backup", "performance"],
      },
      integracoes: {
        nome: "Integrações",
        abas: ["nfe", "boletos", "whatsapp", "marketplaces", "apis"],
      },
      acessos: {
        nome: "Controle de Acesso",
        abas: ["perfis", "usuarios", "grupos", "permissoes", "auditoria"],
      },
      ia: {
        nome: "IA & Otimização",
        abas: ["modelos", "limites", "logs", "previsoes", "automacoes"],
      },
      seguranca: {
        nome: "Segurança & Compliance",
        abas: ["politicas", "logs", "auditoria", "certificados", "2fa"],
      },
    },
  },
};

// Mapeamento de cores de ícones
export const COR_CLASS = {
  blue: "text-blue-600",
  green: "text-green-600",
  emerald: "text-emerald-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  cyan: "text-cyan-600",
  indigo: "text-indigo-600",
  pink: "text-pink-600",
  slate: "text-slate-600",
  red: "text-red-600",
  violet: "text-violet-600",
  amber: "text-amber-600",
  teal: "text-teal-600",
  sky: "text-sky-600",
  gray: "text-gray-600",
};

// Níveis de acesso padrão
export const NIVEIS_PERFIL = [
  { id: "administrador", nome: "Administrador", descricao: "Acesso total ao sistema" },
  { id: "gerencial", nome: "Gerencial", descricao: "Acesso a módulos e aprovações" },
  { id: "operacional", nome: "Operacional", descricao: "Acesso a operações e consultas" },
  { id: "consulta", nome: "Consulta", descricao: "Visualização de dados apenas" },
  { id: "personalizado", nome: "Personalizado", descricao: "Permissões definidas manualmente" },
];

// Matriz de permissões padrão por nível (Regra-Mãe: escalável e multiempresa)
export const MATRIZ_PERMISSOES_PADRAO = {
  administrador: {
    todos: ["visualizar", "criar", "editar", "excluir", "aprovar", "configurar"],
  },
  gerencial: {
    todos: ["visualizar", "criar", "editar", "aprovar"],
    sistema: ["visualizar", "consultar"],
  },
  operacional: {
    todos: ["visualizar", "criar", "editar"],
    sistema: [],
  },
  consulta: {
    todos: ["visualizar", "consultar"],
  },
  personalizado: {},
};