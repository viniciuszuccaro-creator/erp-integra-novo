/**
 * entityCodeFields.js — Mapeamento de entidade → campo código único
 * Extraído no Ciclo 24 para uso em useVisualizadorCRUD e qualquer outro hook/componente
 */
export const ENTITY_CODE_FIELD = {
  Cliente: 'codigo', Fornecedor: 'codigo', Transportadora: 'codigo',
  Colaborador: 'matricula', Representante: 'codigo', ContatoB2B: 'codigo',
  SegmentoCliente: 'codigo', RegiaoAtendimento: 'codigo_regiao',
  Produto: 'codigo', Servico: 'codigo_servico', SetorAtividade: 'codigo',
  GrupoProduto: 'codigo', Marca: 'codigo', TabelaPreco: 'codigo',
  KitProduto: 'codigo_kit', CatalogoWeb: 'produto_id',
  FormaPagamento: 'codigo', PlanoDeContas: 'codigo', CentroCusto: 'codigo',
  CentroResultado: 'codigo', TipoDespesa: 'codigo', MoedaIndice: 'codigo',
  OperadorCaixa: 'codigo_operador', ConfiguracaoDespesaRecorrente: 'codigo',
  TabelaFiscal: 'nome_regra', CondicaoComercial: 'codigo',
  TipoFrete: 'codigo', LocalEstoque: 'codigo', RotaPadrao: 'codigo',
  ModeloDocumento: 'nome_modelo', GrupoEmpresarial: 'nome_do_grupo',
  Departamento: 'codigo', Cargo: 'codigo', Turno: 'codigo',
  PerfilAcesso: 'nome_perfil', ApiExterna: 'nome_api', ChatbotCanal: 'nome_canal',
  ChatbotIntent: 'nome_intent', JobAgendado: 'nome_job', Webhook: 'nome_webhook',
  ConfiguracaoNFe: 'provedor', GatewayPagamento: 'nome_gateway', EventoNotificacao: 'nome_evento',
  Banco: 'codigo_banco', UnidadeMedida: 'codigo', Veiculo: 'codigo', Motorista: 'codigo',
};