// Regra-Mãe 3: Extraído de useContextoVisual.jsx — ordenações padrão e persistência de sort por entidade

export const DEFAULT_SORTS = {
  Produto: { field: 'descricao', direction: 'asc' },
  Cliente: { field: 'nome', direction: 'asc' },
  Fornecedor: { field: 'nome', direction: 'asc' },
  Pedido: { field: 'data_pedido', direction: 'desc' },
  ContaPagar: { field: 'data_vencimento', direction: 'asc' },
  ContaReceber: { field: 'data_vencimento', direction: 'asc' },
  OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
  CentroCusto: { field: 'codigo', direction: 'asc' },
  PlanoDeContas: { field: 'codigo', direction: 'asc' },
  PlanoContas: { field: 'codigo', direction: 'asc' },
  User: { field: 'full_name', direction: 'asc' },
  CondicaoComercial: { field: 'nome_condicao', direction: 'asc' },
  Departamento: { field: 'nome_departamento', direction: 'asc' },
  Turno: { field: 'nome_turno', direction: 'asc' },
  Marca: { field: 'nome_marca', direction: 'asc' },
  GrupoProduto: { field: 'nome_grupo', direction: 'asc' },
  SetorAtividade: { field: 'nome', direction: 'asc' },
  RotaPadrao: { field: 'nome_rota', direction: 'asc' },
  TabelaNCM: { field: 'ncm', direction: 'asc' },
  KitProduto: { field: 'nome_kit', direction: 'asc' },
  TipoDespesa: { field: 'nome', direction: 'asc' },
  MoedaIndice: { field: 'nome', direction: 'asc' },
  CentroResultado: { field: 'nome', direction: 'asc' },
  CentroOperacao: { field: 'nome', direction: 'asc' },
  LocalEstoque: { field: 'nome', direction: 'asc' },
  TipoFrete: { field: 'nome', direction: 'asc' },
  Motorista: { field: 'nome_completo', direction: 'asc' },
  Servico: { field: 'descricao', direction: 'asc' },
  FormaPagamento: { field: 'descricao', direction: 'asc' },
  ContatoB2B: { field: 'nome_completo', direction: 'asc' },
  CatalogoWeb: { field: 'produto_id', direction: 'asc' },
  OperadorCaixa: { field: 'usuario_nome', direction: 'asc' },
  TabelaFiscal: { field: 'nome_regra', direction: 'asc' },
  GrupoEmpresarial: { field: 'nome_do_grupo', direction: 'asc' },
  TabelaPreco: { field: 'nome', direction: 'asc' },
  ConfiguracaoDespesaRecorrente: { field: 'nome', direction: 'asc' },
  ConfiguracaoNFe: { field: 'provedor', direction: 'asc' },
  EventoNotificacao: { field: 'nome_evento', direction: 'asc' },
  ApiExterna: { field: 'nome_api', direction: 'asc' },
  ChatbotCanal: { field: 'nome_canal', direction: 'asc' },
  ChatbotIntent: { field: 'nome_intent', direction: 'asc' },
  JobAgendado: { field: 'nome_job', direction: 'asc' },
  Webhook: { field: 'nome_webhook', direction: 'asc' },
  GatewayPagamento: { field: 'nome_gateway', direction: 'asc' },
  ModeloDocumento: { field: 'nome_modelo', direction: 'asc' },
};

export const normalizeSortField = (entityName, field) => {
  if (!field) return field;
  const f = String(field).toLowerCase();
  if (entityName === 'Produto') {
    if (f === 'cod' || f === 'código' || f === 'codigo') return 'codigo';
    if (f === 'tipo' || f === 'tipoitem' || f === 'tipo_item') return 'tipo_item';
    if (f === 'descrição' || f === 'descricao') return 'descricao';
  }
  if (entityName === 'CondicaoComercial' && (f === 'nome' || f === 'name')) return 'nome_condicao';
  if (entityName === 'Departamento' && (f === 'nome' || f === 'name')) return 'nome_departamento';
  if (entityName === 'Turno' && (f === 'nome' || f === 'name')) return 'nome_turno';
  if (entityName === 'Marca' && (f === 'nome' || f === 'name')) return 'nome_marca';
  if (entityName === 'GrupoProduto' && (f === 'nome' || f === 'name')) return 'nome_grupo';
  if (entityName === 'SetorAtividade' && (f === 'name')) return 'nome';
  if (entityName === 'CatalogoWeb' && (f === 'nome' || f === 'name')) return 'produto_id';
  if (entityName === 'OperadorCaixa' && (f === 'nome' || f === 'name')) return 'usuario_nome';
  if (entityName === 'TabelaFiscal' && (f === 'nome' || f === 'name')) return 'nome_regra';
  if (entityName === 'GrupoEmpresarial' && (f === 'nome' || f === 'name')) return 'nome_do_grupo';
  return field;
};

export const getLastSort = (entityName) => {
  try {
    const v = JSON.parse(localStorage.getItem(`sort_${entityName}`) || 'null');
    if (v?.sortField) v.sortField = normalizeSortField(entityName, v.sortField);
    return v;
  } catch { return null; }
};

export const setLastSort = (entityName, sort) => {
  try {
    const s = { ...sort, sortField: normalizeSortField(entityName, sort?.sortField) };
    localStorage.setItem(`sort_${entityName}`, JSON.stringify(s));
  } catch (e) { console.error('[lib] catch:', e); }
};