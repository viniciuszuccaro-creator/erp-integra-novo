/**
 * cadastroEntities.jsx — Definições completas das 48 entidades do Cadastro Gerais
 * Extraído de CadastrosConfig para manter arquivo < 400 linhas (Regra-Mãe §3)
 * 6 grupos: 8 + 9 + 11 + 6 + 6 + 8 = 48 entidades
 */
import { Users, Package, DollarSign, Truck, Building2, Zap } from "lucide-react";

export const CADASTROS_ENTITIES = {
  // ═══════════════════════════════════════════════════
  // Bloco 1 — Pessoas & Parceiros (8 entidades)
  // ═══════════════════════════════════════════════════
  Cliente: {
    label: "Clientes", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "tipo", label: "Tipo", searchable: true },
      { field: "cpf", label: "CPF/CNPJ", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  Fornecedor: {
    label: "Fornecedores", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "cnpj", label: "CNPJ", searchable: true },
      { field: "status_fornecedor", label: "Status", searchable: true },
    ],
  },
  Transportadora: {
    label: "Transportadoras", group: "Pessoas & Parceiros", icon: Truck,
    columns: [
      { field: "razao_social", label: "Razão Social", searchable: true, sortable: true },
      { field: "cnpj", label: "CNPJ", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  Colaborador: {
    label: "Colaboradores", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome_completo", label: "Nome", searchable: true, sortable: true },
      { field: "cpf", label: "CPF", searchable: true },
      { field: "cargo", label: "Cargo", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  Representante: {
    label: "Representantes", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "cpf", label: "CPF", searchable: true },
      { field: "tipo_representante", label: "Tipo", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  ContatoB2B: {
    label: "Contatos B2B", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome_completo", label: "Nome", searchable: true, sortable: true },
      { field: "cargo", label: "Cargo", searchable: true },
      { field: "tipo_vinculo", label: "Vínculo", searchable: true },
    ],
  },
  SegmentoCliente: {
    label: "Segmentos de Cliente", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome_segmento", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  RegiaoAtendimento: {
    label: "Regiões de Atendimento", group: "Pessoas & Parceiros", icon: Users,
    columns: [
      { field: "nome_regiao", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Bloco 2 — Produtos & Serviços (9 entidades)
  // ═══════════════════════════════════════════════════
  Produto: {
    label: "Produtos", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "descricao", label: "Descrição", searchable: true, sortable: true },
      { field: "codigo", label: "Código", searchable: true, sortable: true, numeric: true },
      { field: "marca_nome", label: "Marca", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  Servico: {
    label: "Serviços", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "descricao", label: "Descrição", searchable: true, sortable: true },
      { field: "codigo_servico", label: "Código", searchable: true, numeric: true },
      { field: "tipo_servico", label: "Tipo", searchable: true },
    ],
  },
  SetorAtividade: {
    label: "Setores de Atividade", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "tipo_operacao", label: "Tipo", searchable: true },
    ],
  },
  GrupoProduto: {
    label: "Grupos de Produtos", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "nome_grupo", label: "Nome", searchable: true, sortable: true },
      { field: "natureza", label: "Natureza", searchable: true },
    ],
  },
  Marca: {
    label: "Marcas", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "nome_marca", label: "Nome", searchable: true, sortable: true },
      { field: "categoria", label: "Categoria", searchable: true },
    ],
  },
  TabelaPreco: {
    label: "Tabelas de Preço", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  KitProduto: {
    label: "Kits de Produtos", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "nome_kit", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  CatalogoWeb: {
    label: "Catálogos Web", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "produto_id", label: "Produto", searchable: true, sortable: true },
      { field: "categoria_navegacao", label: "Categoria", searchable: true },
      { field: "exibir_no_app", label: "No App", type: "boolean" },
    ],
  },
  UnidadeMedida: {
    label: "Unidades de Medida", group: "Produtos & Serviços", icon: Package,
    columns: [
      { field: "codigo", label: "Código", searchable: true, sortable: true },
      { field: "nome", label: "Nome", searchable: true, sortable: true },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Bloco 3 — Financeiro & Fiscal (11 entidades)
  // ═══════════════════════════════════════════════════
  Banco: {
    label: "Bancos", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "nome_banco", label: "Nome", searchable: true, sortable: true },
      { field: "codigo_banco", label: "Código", searchable: true, numeric: true },
    ],
  },
  FormaPagamento: {
    label: "Formas de Pagamento", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "descricao", label: "Nome", searchable: true, sortable: true },
      { field: "tipo", label: "Tipo", searchable: true },
      { field: "ativa", label: "Ativa", type: "boolean" },
    ],
  },
  PlanoDeContas: {
    label: "Plano de Contas", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "codigo", label: "Código", searchable: true, sortable: true, numeric: true },
      { field: "nome_conta", label: "Nome", searchable: true },
      { field: "tipo", label: "Tipo", searchable: true },
    ],
  },
  CentroCusto: {
    label: "Centros de Custo", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "codigo", label: "Código", searchable: true, sortable: true, numeric: true },
      { field: "descricao", label: "Descrição", searchable: true },
      { field: "tipo", label: "Tipo", searchable: true },
    ],
  },
  CentroResultado: {
    label: "Centros de Resultado", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "codigo", label: "Código", searchable: true, sortable: true, numeric: true },
      { field: "nome", label: "Nome", searchable: true, sortable: true },
    ],
  },
  TipoDespesa: {
    label: "Tipos de Despesa", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "categoria", label: "Categoria", searchable: true },
    ],
  },
  MoedaIndice: {
    label: "Moedas e Índices", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "codigo", label: "Código", searchable: true, sortable: true },
      { field: "nome", label: "Nome", searchable: true, sortable: true },
    ],
  },
  OperadorCaixa: {
    label: "Operadores de Caixa", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "usuario_nome", label: "Nome", searchable: true, sortable: true },
      { field: "codigo_operador", label: "Código", searchable: true, numeric: true },
      { field: "status_caixa", label: "Status", searchable: true },
    ],
  },
  ConfiguracaoDespesaRecorrente: {
    label: "Despesas Recorrentes", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  TabelaFiscal: {
    label: "Tabelas Fiscais", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "nome_regra", label: "Nome da Regra", searchable: true, sortable: true },
      { field: "cenario_operacao", label: "Cenário", searchable: true },
      { field: "cfop", label: "CFOP", searchable: true },
    ],
  },
  CondicaoComercial: {
    label: "Condições Comerciais", group: "Financeiro & Fiscal", icon: DollarSign,
    columns: [
      { field: "nome_condicao", label: "Nome", searchable: true, sortable: true },
      { field: "tipo_condicao", label: "Tipo", searchable: true },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Bloco 4 — Logística, Frotas & Almoxarifado (6 entidades)
  // ═══════════════════════════════════════════════════
  Veiculo: {
    label: "Veículos", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "placa", label: "Placa", searchable: true, sortable: true },
      { field: "marca", label: "Marca", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  Motorista: {
    label: "Motoristas", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "nome_completo", label: "Nome", searchable: true, sortable: true },
      { field: "cpf", label: "CPF", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  TipoFrete: {
    label: "Tipos de Frete", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "codigo", label: "Código", searchable: true, numeric: true },
    ],
  },
  LocalEstoque: {
    label: "Locais de Estoque", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "tipo", label: "Tipo", searchable: true },
    ],
  },
  RotaPadrao: {
    label: "Rotas Padrão", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "nome_rota", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  ModeloDocumento: {
    label: "Modelos de Documento", group: "Logística, Frotas & Almoxarifado", icon: Truck,
    columns: [
      { field: "nome_modelo", label: "Nome", searchable: true, sortable: true },
      { field: "tipo_documento", label: "Tipo", searchable: true },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Bloco 5 — Estrutura Organizacional (6 entidades)
  // ═══════════════════════════════════════════════════
  Empresa: {
    label: "Empresas", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "razao_social", label: "Razão Social", searchable: true, sortable: true },
      { field: "cnpj", label: "CNPJ", searchable: true },
      { field: "status", label: "Status", searchable: true },
    ],
  },
  GrupoEmpresarial: {
    label: "Grupos Empresariais", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "nome_do_grupo", label: "Nome do Grupo", searchable: true, sortable: true },
      { field: "razao_social_grupo", label: "Razão Social", searchable: true },
      { field: "cnpj_grupo", label: "CNPJ", searchable: true },
    ],
  },
  Departamento: {
    label: "Departamentos", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "nome_departamento", label: "Nome", searchable: true, sortable: true },
      { field: "tipo_departamento", label: "Tipo", searchable: true },
    ],
  },
  Cargo: {
    label: "Cargos", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "nome_cargo", label: "Nome", searchable: true, sortable: true },
      { field: "nivel_hierarquico", label: "Nível", searchable: true },
    ],
  },
  Turno: {
    label: "Turnos", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "nome_turno", label: "Nome", searchable: true, sortable: true },
      { field: "horario_inicio", label: "Início", searchable: false },
      { field: "horario_fim", label: "Fim", searchable: false },
    ],
  },
  PerfilAcesso: {
    label: "Perfis de Acesso", group: "Estrutura Organizacional", icon: Building2,
    columns: [
      { field: "nome_perfil", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },

  // ═══════════════════════════════════════════════════
  // Bloco 6 — Tecnologia, IA & Parâmetros (8 entidades)
  // ═══════════════════════════════════════════════════
  ApiExterna: {
    label: "APIs Externas", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_api", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  ChatbotCanal: {
    label: "Canais de Chatbot", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_canal", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  ChatbotIntent: {
    label: "Intents de Chatbot", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_intent", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  JobAgendado: {
    label: "Jobs Agendados", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_job", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  Webhook: {
    label: "Webhooks", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_webhook", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  ConfiguracaoNFe: {
    label: "Configurações NF-e", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "descricao", label: "Descrição", searchable: true, sortable: true },
    ],
  },
  GatewayPagamento: {
    label: "Gateways de Pagamento", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome_gateway", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
  EventoNotificacao: {
    label: "Eventos de Notificação", group: "Tecnologia, IA & Parâmetros", icon: Zap,
    columns: [
      { field: "nome", label: "Nome", searchable: true, sortable: true },
      { field: "descricao", label: "Descrição", searchable: true },
    ],
  },
};