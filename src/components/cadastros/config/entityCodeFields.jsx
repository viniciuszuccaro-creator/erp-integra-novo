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
  KitProduto: 'codigo_kit', CatalogoWeb: 'codigo',
  FormaPagamento: 'codigo', PlanoDeContas: 'codigo', CentroCusto: 'codigo',
  CentroResultado: 'codigo', TipoDespesa: 'codigo', MoedaIndice: 'codigo',
  OperadorCaixa: 'codigo', ConfiguracaoDespesaRecorrente: 'codigo',
  TabelaFiscal: 'codigo', CondicaoComercial: 'codigo',
  TipoFrete: 'codigo', LocalEstoque: 'codigo', RotaPadrao: 'codigo',
  ModeloDocumento: 'codigo', GrupoEmpresarial: 'codigo',
  Departamento: 'codigo', Cargo: 'codigo', Turno: 'codigo',
  PerfilAcesso: 'codigo', ApiExterna: 'codigo', ChatbotCanal: 'codigo',
  ChatbotIntent: 'codigo', JobAgendado: 'codigo', Webhook: 'codigo',
  ConfiguracaoNFe: 'codigo', GatewayPagamento: 'codigo', EventoNotificacao: 'codigo',
  Banco: 'codigo', UnidadeMedida: 'codigo', Veiculo: 'codigo', Motorista: 'codigo',
};