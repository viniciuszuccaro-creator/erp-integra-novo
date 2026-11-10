/**
 * Conteúdo da Documentação do ERP Zuccaro
 * Extraído de src/pages/Documentacao.jsx (refatoração Regra-Mãe #3) — conteúdo preservado.
 */

export const melhoriasCriticas = [
  { id: 1, titulo: "Validação CPF/CNPJ + Consulta Receita", prioridade: "Alta", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Validação de dígitos verificadores + consulta automática na Receita Federal (ReceitaWS)" },
  { id: 2, titulo: "Cálculo Automático de Impostos", prioridade: "Crítica", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Motor completo: ICMS, PIS, COFINS, IPI, DIFAL + Tabela NCM + Calculadora interativa" },
  { id: 3, titulo: "Exportação PDF/Excel de Relatórios", prioridade: "Alta", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "PDFs de Pedidos, Romaneios, NF-e, OPs + Excel de todos módulos (12 tipos de exportação)" },
  { id: 4, titulo: "Integrações Reais (Sair do Mock)", prioridade: "Crítica", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Conectores reais: eNotas/NFe.io (NF-e), Asaas/Juno (Boletos/PIX), Evolution API (WhatsApp)" },
  { id: 5, titulo: "Notificações Email/WhatsApp Real", prioridade: "Crítica", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "SendGrid/AWS SES para emails + Motor de regras automáticas + 10 templates prontos" },
  { id: 6, titulo: "Dashboard Tempo Real", prioridade: "Média", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Auto-atualização de KPIs, pedidos, entregas e rastreamento GPS em tempo real" },
  { id: 7, titulo: "Importação XML NF-e Fornecedores", prioridade: "Alta", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Parser XML completo + Criação automática: Fornecedor, Produtos, OC, Estoque e Contas a Pagar" },
  { id: 8, titulo: "Backup Automático Cloud", prioridade: "Crítica", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Sistema completo: Agendamento, Criptografia AES-256, Compressão, Multi-cloud (AWS/GCP/Azure), Validação de Integridade" },
  { id: 9, titulo: "Logs de Performance e APM", prioridade: "Média", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "Monitoramento completo: Queries lentas, APIs, Erros, CPU/Memória, Alertas automáticos, Métricas P50/P95/P99" },
  { id: 10, titulo: "Controle de Sessão e JWT", prioridade: "Alta", tempo: "CONCLUÍDO", status: "Implementado",
    detalhes: "JWT com Access/Refresh Tokens, Rotação de Tokens, Controle de Sessões Simultâneas, MFA, Revogação Remota, Auditoria Completa" }
];

export const melhoriasFuturas = [
  { id: 1, titulo: "Open Banking (Pluggy/Celcoin)", versao: "v4.0", trimestre: "Q2 2025",
    detalhes: "Conexão direta com bancos para conciliação automática e saldo em tempo real" },
  { id: 2, titulo: "Integração CNC/Máquinas (OPC-UA)", versao: "v4.0", trimestre: "Q2 2025",
    detalhes: "Envio direto de programação para máquinas de corte/dobra CNC" },
  { id: 3, titulo: "Machine Learning Preditivo", versao: "v4.0", trimestre: "Q3 2025",
    detalhes: "Previsão de vendas, demanda, churn de clientes com modelos treinados" },
  { id: 4, titulo: "Blockchain para Rastreabilidade", versao: "v4.1", trimestre: "Q4 2025",
    detalhes: "Registro imutável de produção, entregas e contratos em blockchain" },
  { id: 5, titulo: "AR/VR Visualização 3D Projetos", versao: "v4.0", trimestre: "Q3 2025",
    detalhes: "Realidade aumentada para visualizar estruturas antes da produção" },
  { id: 6, titulo: "App Mobile Nativo (React Native)", versao: "v4.0", trimestre: "Q2 2025",
    detalhes: "App nativo iOS/Android para motoristas, operadores e vendedores" },
  { id: 7, titulo: "API Pública + Developer Portal", versao: "v4.0", trimestre: "Q3 2025",
    detalhes: "API REST documentada com Swagger/OpenAPI para integrações externas" },
  { id: 8, titulo: "Multi-idioma (i18n) Completo", versao: "v4.1", trimestre: "Q4 2025",
    detalhes: "Suporte a Inglês, Espanhol, Português" },
  { id: 9, titulo: "BI Avançado (Metabase/Looker)", versao: "v4.0", trimestre: "Q3 2025",
    detalhes: "Dashboards personalizados, queries SQL diretas, análise ad-hoc" },
  { id: 10, titulo: "Gestão de Frotas Completa", versao: "v4.1", trimestre: "Q4 2025",
    detalhes: "Manutenção preventiva, consumo combustível, rastreamento 24/7" }
];

export const padroesTecnicos = [
  {
    titulo: "Contagens de Entidades (useCadastrosAllCounts V5 — V22.1)",
    icon: "📊",
    cor: "blue",
    items: [
      "54 entidades catalogadas em 6 blocos no Cadastros Gerais",
      "Stack: countEntities (batch) → fallback batches de 8 c/ 600ms → useQuery (staleTime=20s)",
      "Normalização final obrigatória: ALL_ENTITIES.forEach → default 0 em tentativa 1 e 2",
      "Invalidação real-time via subscribe em todas as entidades",
      "placeholderData preserva contagens durante re-fetch",
      "SIMPLE_CATALOG (40+ entidades globais): sem filtro de empresa/grupo",
      "Entidades c/ escopo: empresa_id ou group_id → backend expande $or",
      "EXPAND_SET: Cliente, Fornecedor, Transportadora, Colaborador, Produto (V22.1)",
      "Produto: compartilhado_grupo=true no $or de contagem e listagem",
      "GroupCountBadge nos accordions usa precomputedTotal (sem fetch adicional)"
    ]
  },
  {
    titulo: "Estabilidade de Lista (VisualizadorUniversalEntidadeV24 V34)",
    icon: "🔒",
    cor: "green",
    items: [
      "placeholderData: (prev) => prev — lista NUNCA desaparece ao ordenar/paginar",
      "lastGoodData.current — retornado quando isFetching=true ou status='pending'",
      "handleDelete: remove item localmente em lastGoodData antes do refetch",
      "Skeleton só na carga inicial absoluta (everLoadedRef.current=false e length=0)",
      "Novos cadastros: staleTime=0 + invalidateAll() (refetchType=all) + sort reset updated_date desc",
      "invalidateAll usa refetchType padrão (all) — invalida queries mesmo inativas (troca de aba)",
      "Reset de página ao trocar entidade/empresa/grupo/busca (sem flash de lista vazia)",
      "handleCloseForm invalida após 50ms do reset de estado (query correta no refetch)",
      "Banner overlay 'atualizando…' e 'erro — exibindo cache' (absolutamente posicionados)",
      "FORM_ALIASES cobre todos os forms: tabela, evento, condicao + padrão camelCase"
    ]
  },
  {
    titulo: "Multiempresa Absoluta",
    icon: "🏢",
    cor: "purple",
    items: [
      "SDK: npm:@base44/sdk@0.8.23 em TODOS os backends",
      "propagateGroupConfigs: bidirecional (grupo→empresas e empresa→grupo)",
      "Auth Dual: funciona com usuário autenticado OU automação agendada sem auth",
      "Layout injeta empresa_id e group_id em todo create/update via wrapEntity",
      "expandGroupFilter: group_id → lista de IDs de todas empresas do grupo",
      "EXPAND_SET: Cliente, Fornecedor, Transportadora, Colaborador, Produto (empresas_compartilhadas_ids)",
      "Produto: compartilhado_grupo=true incluído no $or de listagem e contagem",
      "SIMPLE_CATALOG: entidades globais contadas/listadas sem filtro de escopo",
      "sanitizeOnWrite: verifica SIMPLE_CATALOG antes de enforce empresa/grupo"
    ]
  },
  {
    titulo: "RBAC Granular",
    icon: "🛡️",
    cor: "orange",
    items: [
      "usePermissions.hasPermission(module, section, action)",
      "Hierarquia: módulo → seção → aba → campo",
      "Aliases de módulo (compras, comercialevendas, etc.) resolvidos automaticamente",
      "Button[data-permission]: renderiza 'Acesso negado' se sem permissão",
      "Input[data-permission]: renderiza disabled com placeholder 'Acesso negado'",
      "TabsTrigger[data-permission]: oculta aba se sem permissão",
      "entityGuard backend: validação RBAC server-side para funções sensíveis",
      "Admin role: sempre permitido (sem chamada backend)"
    ]
  },
  {
    titulo: "Segurança & Auditoria",
    icon: "🔐",
    cor: "red",
    items: [
      "sanitizeOnWrite: remove <script>, javascript:, eventos inline (XSS)",
      "piiEncryptor: AES-GCM para dados sensíveis (Cliente, Colaborador)",
      "AuditLog: criado automaticamente em todo create/update/delete via layout",
      "auditEntityEvents: function backend para eventos de entidade (SDK 0.8.23)",
      "SoD (Segregação de Funções): sodValidator + IA de governança",
      "Session tracking: SessaoUsuario + TokenRefresh",
      "deployAudit: registra app_loaded e atualizações de SW",
      "TOTP/2FA: verifyTotp function disponível"
    ]
  },
  {
    titulo: "Fluxo de Cadastros",
    icon: "🔄",
    cor: "cyan",
    items: [
      "Cadastros Gerais → 6 blocos → tiles → VisualizadorUniversalEntidadeV24",
      "Abre em janela flutuante (WindowProvider) via useWindow().openWindow()",
      "Form recebe props via FORM_ALIASES (item, cliente, tabela, evento, etc.)",
      "isSelfManaged: forms complexos controlam próprio submit (sem handlePersistSubmit)",
      "Após salvar: invalidateAll() → query refetch → sort reset → novo no topo",
      "Multiempresa: injeção automática de empresa_id e group_id no save",
      "SIMPLE_CATALOG: sem injeção de escopo (entidades globais compartilhadas)"
    ]
  }
];

export const blocosCadastros = [
  { bloco: 1, nome: "Pessoas & Parceiros", cor: "blue", total: 8, entidades: "Cliente, Fornecedor, Transportadora, Colaborador, Representante, ContatoB2B, SegmentoCliente, RegiaoAtendimento" },
  { bloco: 2, nome: "Produtos & Serviços", cor: "purple", total: 9, entidades: "Produto, Servico, SetorAtividade, GrupoProduto, Marca, TabelaPreco, KitProduto, CatalogoWeb, UnidadeMedida" },
  { bloco: 3, nome: "Financeiro & Fiscal", cor: "green", total: 11, entidades: "Banco, FormaPagamento, PlanoDeContas, CentroCusto, CentroResultado, TipoDespesa, MoedaIndice, OperadorCaixa, ConfiguracaoDespesaRecorrente, TabelaFiscal, CondicaoComercial" },
  { bloco: 4, nome: "Logística & Frota", cor: "orange", total: 6, entidades: "Veiculo, Motorista, TipoFrete, LocalEstoque, RotaPadrao, ModeloDocumento" },
  { bloco: 5, nome: "Organizacional", cor: "indigo", total: 6, entidades: "Empresa, GrupoEmpresarial, Departamento, Cargo, Turno, PerfilAcesso" },
  { bloco: 6, nome: "Tecnologia & IA", cor: "cyan", total: 8, entidades: "ApiExterna, ChatbotCanal, ChatbotIntent, GatewayPagamento, JobAgendado, Webhook, ConfiguracaoNFe, EventoNotificacao" },
];

/**
 * Classes estáticas por cor — nunca construir com template string
 * (o Tailwind purga classes dinâmicas no build).
 */
export const COR_CLASSES = {
  blue: { card: "border-blue-200 bg-blue-50", badge: "bg-blue-600 text-white", icon: "text-blue-600" },
  purple: { card: "border-purple-200 bg-purple-50", badge: "bg-purple-600 text-white", icon: "text-purple-600" },
  green: { card: "border-green-200 bg-green-50", badge: "bg-green-600 text-white", icon: "text-green-600" },
  orange: { card: "border-orange-200 bg-orange-50", badge: "bg-orange-600 text-white", icon: "text-orange-600" },
  red: { card: "border-red-200 bg-red-50", badge: "bg-red-600 text-white", icon: "text-red-600" },
  cyan: { card: "border-cyan-200 bg-cyan-50", badge: "bg-cyan-600 text-white", icon: "text-cyan-600" },
  indigo: { card: "border-indigo-200 bg-indigo-50", badge: "bg-indigo-600 text-white", icon: "text-indigo-600" },
};

export const getCor = (cor) => COR_CLASSES[cor] || COR_CLASSES.blue;

export const statusResumo = [
  { label: "Entidades", valor: "70+" },
  { label: "Componentes", valor: "290+" },
  { label: "Páginas", valor: "23" },
  { label: "Módulos IA", valor: "35+" },
];