import {
  LayoutDashboard, ShoppingCart, DollarSign, Package, Briefcase, Truck, Factory,
  UserCircle, FileText, BarChart3, Calendar, MessageCircle, Users, Settings,
  Eye, Plus, Pencil, Trash2, CheckSquare, Download
} from "lucide-react";

export const ESTRUTURA_SISTEMA = {
  dashboard: {
    nome: "Dashboard",
    icone: LayoutDashboard,
    cor: "blue",
    secoes: {
      principal: { nome: "Visão Geral", abas: ["kpis", "graficos", "alertas"] },
      corporativo: { nome: "Dashboard Corporativo", abas: ["multiempresa", "consolidado"] }
    }
  },
  comercial: {
    nome: "Comercial e Vendas",
    icone: ShoppingCart,
    cor: "green",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "detalhes", "historico", "crm"] },
      pedidos: { nome: "Pedidos", abas: ["lista", "novo", "aprovacao", "faturamento"] },
      orcamentos: { nome: "Orçamentos", abas: ["lista", "novo", "conversao"] },
      tabelas_preco: { nome: "Tabelas de Preço", abas: ["lista", "itens", "clientes_vinculados"] },
      comissoes: { nome: "Comissões", abas: ["lista", "calculo", "pagamento"] },
      notas_fiscais: { nome: "Notas Fiscais", abas: ["emissao", "lista", "cancelamento"] }
    }
  },
  financeiro: {
    nome: "Financeiro e Contábil",
    icone: DollarSign,
    cor: "emerald",
    secoes: {
      contas_receber: { nome: "Contas a Receber", abas: ["lista", "baixa", "cobranca", "boletos"] },
      contas_pagar: { nome: "Contas a Pagar", abas: ["lista", "baixa", "aprovacao", "pagamento"] },
      caixa: { nome: "Caixa Diário", abas: ["movimentos", "fechamento", "transferencias"] },
      conciliacao: { nome: "Conciliação Bancária", abas: ["importar", "conciliar", "historico"] },
      relatorios: { nome: "Relatórios Financeiros", abas: ["dre", "fluxo_caixa", "inadimplencia"] }
    }
  },
  estoque: {
    nome: "Estoque e Almoxarifado",
    icone: Package,
    cor: "purple",
    secoes: {
      produtos: { nome: "Produtos", abas: ["lista", "novo", "lotes", "validade"] },
      movimentacoes: { nome: "Movimentações", abas: ["entrada", "saida", "transferencia", "ajuste"] },
      inventario: { nome: "Inventário", abas: ["contagem", "acerto", "historico"] },
      requisicoes: { nome: "Requisições", abas: ["lista", "aprovacao", "atendimento"] }
    }
  },
  compras: {
    nome: "Compras e Suprimentos",
    icone: Briefcase,
    cor: "orange",
    secoes: {
      fornecedores: { nome: "Fornecedores", abas: ["lista", "avaliacao", "historico"] },
      solicitacoes: { nome: "Solicitações", abas: ["lista", "nova", "aprovacao"] },
      cotacoes: { nome: "Cotações", abas: ["lista", "nova", "comparativo"] },
      ordens_compra: { nome: "Ordens de Compra", abas: ["lista", "nova", "recebimento"] }
    }
  },
  expedicao: {
    nome: "Expedição e Logística",
    icone: Truck,
    cor: "cyan",
    secoes: {
      entregas: { nome: "Entregas", abas: ["lista", "separacao", "despacho", "rastreamento"] },
      romaneios: { nome: "Romaneios", abas: ["lista", "novo", "impressao"] },
      roteirizacao: { nome: "Roteirização", abas: ["mapa", "otimizacao", "motoristas"] },
      transportadoras: { nome: "Transportadoras", abas: ["lista", "tabelas_frete"] }
    }
  },
  producao: {
    nome: "Produção e Manufatura",
    icone: Factory,
    cor: "indigo",
    secoes: {
      ordens_producao: { nome: "Ordens de Produção", abas: ["lista", "nova", "programacao", "kanban"] },
      apontamentos: { nome: "Apontamentos", abas: ["producao", "paradas", "refugo"] },
      qualidade: { nome: "Qualidade", abas: ["inspecao", "nao_conformidades", "acoes"] }
    }
  },
  rh: {
    nome: "Recursos Humanos",
    icone: UserCircle,
    cor: "pink",
    secoes: {
      colaboradores: { nome: "Colaboradores", abas: ["lista", "documentos", "historico"] },
      ponto: { nome: "Ponto Eletrônico", abas: ["registros", "ajustes", "relatorios"] },
      ferias: { nome: "Férias", abas: ["programacao", "solicitacoes", "aprovacao"] },
      folha: { nome: "Folha de Pagamento", abas: ["calculo", "holerites", "encargos"] }
    }
  },
  fiscal: {
    nome: "Fiscal e Tributário",
    icone: FileText,
    cor: "red",
    secoes: {
      nfe: { nome: "NF-e", abas: ["emissao", "entrada", "manifestacao", "inutilizacao"] },
      tabelas_fiscais: { nome: "Tabelas Fiscais", abas: ["cfop", "cst", "ncm", "aliquotas"] },
      sped: { nome: "SPED", abas: ["fiscal", "contribuicoes", "contabil"] },
      obrigacoes: { nome: "Obrigações Acessórias", abas: ["calendario", "guias", "declaracoes"] }
    }
  },
  cadastros: {
    nome: "Cadastros Gerais",
    icone: Users,
    cor: "slate",
    secoes: {
      pessoas: { nome: "Pessoas & Parceiros", abas: ["clientes", "fornecedores", "transportadoras", "colaboradores"] },
      produtos: { nome: "Produtos & Serviços", abas: ["produtos", "servicos", "grupos", "marcas"] },
      financeiro: { nome: "Financeiro", abas: ["bancos", "formas_pagamento", "centros_custo"] },
      logistica: { nome: "Logística", abas: ["veiculos", "motoristas", "rotas"] },
      organizacional: { nome: "Organizacional", abas: ["empresas", "departamentos", "cargos", "usuarios"] },
      integracoes: { nome: "Integrações & IA", abas: ["apis", "webhooks", "chatbot", "jobs_ia"] }
    }
  },
  crm: {
    nome: "CRM - Relacionamento",
    icone: MessageCircle,
    cor: "violet",
    secoes: {
      oportunidades: { nome: "Oportunidades", abas: ["funil", "lista", "conversao"] },
      interacoes: { nome: "Interações", abas: ["historico", "nova", "follow_up"] },
      campanhas: { nome: "Campanhas", abas: ["lista", "nova", "resultados"] }
    }
  },
  agenda: {
    nome: "Agenda e Calendário",
    icone: Calendar,
    cor: "amber",
    secoes: {
      eventos: { nome: "Eventos", abas: ["calendario", "lista", "notificacoes"] },
      tarefas: { nome: "Tarefas", abas: ["kanban", "lista", "atribuicao"] }
    }
  },
  relatorios: {
    nome: "Relatórios e Análises",
    icone: BarChart3,
    cor: "teal",
    secoes: {
      dashboards: { nome: "Dashboards", abas: ["executivo", "operacional", "financeiro"] },
      relatorios: { nome: "Relatórios", abas: ["vendas", "estoque", "financeiro", "rh"] },
      exportacao: { nome: "Exportação", abas: ["excel", "pdf", "api"] }
    }
  },
  contratos: {
    nome: "Gestão de Contratos",
    icone: FileText,
    cor: "sky",
    secoes: {
      contratos: { nome: "Contratos", abas: ["lista", "novo", "renovacao", "aditivos"] }
    }
  },
  chatbot: {
    nome: "Hub de Atendimento",
    icone: MessageCircle,
    cor: "green",
    secoes: {
      atendimento: { nome: "Atendimento", abas: ["conversas", "fila", "transferencia"] },
      configuracoes: { nome: "Configurações", abas: ["canais", "templates", "base_conhecimento"] },
      analytics: { nome: "Analytics", abas: ["metricas", "relatorios", "sla"] }
    }
  },
  configuracoes: {
    nome: "Configurações",
    icone: Settings,
    cor: "gray",
    secoes: {
      sistema: { nome: "Sistema", abas: ["geral", "notificacoes", "backup"] },
      integracoes: { nome: "Integrações", abas: ["nfe", "boletos", "whatsapp", "marketplaces"] },
      ia: { nome: "Inteligência Artificial", abas: ["modelos", "limites", "logs"] }
    }
  }
};

export const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" }
];

export const NIVEIS_PERFIL = [
  { id: "Administrador", nome: "Administrador", descricao: "Acesso total ao sistema" },
  { id: "Gerencial", nome: "Gerencial", descricao: "Acesso gerencial com aprovações" },
  { id: "Operacional", nome: "Operacional", descricao: "Acesso operacional básico" },
  { id: "Consulta", nome: "Consulta", descricao: "Apenas visualização" },
  { id: "Personalizado", nome: "Personalizado", descricao: "Permissões customizadas" }
];