// Filtro canônico: tabelas, badges e seletores consultam o mesmo cadastro único.
import { base44 } from '@/api/base44Client';
import { DEFAULT_SORTS, normalizeSortField, getLastSort, setLastSort } from '@/components/lib/contexto/contextoSorts';

export const SIMPLE_CATALOG = new Set([
  'Banco','FormaPagamento','TipoDespesa','MoedaIndice','TipoFrete','UnidadeMedida',
  'Departamento','Cargo','Turno','GrupoProduto','Marca','SetorAtividade','LocalEstoque',
  'TabelaFiscal','CentroResultado','OperadorCaixa','RotaPadrao','ModeloDocumento',
  'KitProduto','CatalogoWeb','Servico','CondicaoComercial','TabelaPreco','PerfilAcesso',
  'ConfiguracaoNFe','ConfiguracaoBoletos','ConfiguracaoWhatsApp','GatewayPagamento',
  'ApiExterna','Webhook','ChatbotIntent','ChatbotCanal','JobAgendado','EventoNotificacao',
  'SegmentoCliente','RegiaoAtendimento','ContatoB2B','CentroCusto','PlanoDeContas',
  'PlanoContas','Veiculo','Motorista','Representante','GrupoEmpresarial','Empresa',
  'ConfiguracaoDespesaRecorrente',
]);
const CADASTROS = new Set([...SIMPLE_CATALOG, 'Cliente','Fornecedor','Transportadora','Produto','Colaborador']);
const CONTEXT_FIELDS = {
  Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id', NotaFiscal: 'empresa_faturamento_id',
  TransferenciaFilial: 'empresa_origem_id',
};

export function buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo = [], campo = 'empresa_id') {
  if (!groupId && !empresaId) return { id: { $in: [] } };
  const ctx = CONTEXT_FIELDS[entityName] || campo;
  const ids = [...new Set([empresaId, ...empresasDoGrupo.map(e => typeof e === 'string' ? e : e.id)].filter(Boolean))].sort();
  const companyConditions = ids.length ? [
    { [ctx]: { $in: ids } }, { empresa_id: { $in: ids } },
    { empresas_compartilhadas_ids: { $in: ids } },
    ...(entityName === 'Cliente' ? [{ empresa_dona_id: { $in: ids } }] : []),
    ...(entityName === 'TransferenciaFilial' ? [{ empresa_destino_id: { $in: ids } }] : []),
  ] : [];
  if (entityName === 'GrupoEmpresarial') return { id: groupId || { $in: [] }, _merged: { $ne: true } };
  if (entityName === 'Empresa') return groupId ? { group_id: groupId, _merged: { $ne: true } } : { id: empresaId, _merged: { $ne: true } };
  if (groupId && (CADASTROS.has(entityName) || !empresaId)) {
    return { _merged: { $ne: true }, $or: [
      { group_id: groupId },
      ...(entityName === 'PerfilAcesso' ? [{ grupo_id: groupId, group_id: null }] : []),
      ...(companyConditions.length ? [{ group_id: null, $or: companyConditions }] : []),
    ] };
  }
  const ownCompany = [
    { [ctx]: empresaId },
    ...(entityName === 'Cliente' ? [{ empresa_dona_id: empresaId }] : []),
    ...(CADASTROS.has(entityName) ? [{ empresas_compartilhadas_ids: { $in: [empresaId] } }] : []),
  ];
  return { _merged: { $ne: true }, $and: [
    ...(groupId ? [{ $or: [{ group_id: groupId }, { group_id: null }] }] : []),
    { $or: ownCompany },
  ] };
}

export function createFilterInContext({ getFiltroContexto, empresasDoGrupo }) {
  const filterInContext = async (entityName, criterios = {}, order, limit = 100, campo = 'empresa_id', skip = 0) => {
    const ctx = CONTEXT_FIELDS[entityName] || campo;
    const scope = getFiltroContexto(ctx, true) || {};
    if (!scope.group_id && !scope[ctx]) return [];
    const contextFilter = buildContextFilter(entityName, scope[ctx], scope.group_id, empresasDoGrupo, ctx);
    const filter = Object.keys(criterios).length ? { $and: [contextFilter, criterios] } : contextFilter;
    const last = getLastSort(entityName);
    const sortField = normalizeSortField(entityName, order ? order.replace(/^-/, '') : last?.sortField || DEFAULT_SORTS[entityName]?.field || 'updated_date');
    const sortDirection = order ? (order.startsWith('-') ? 'desc' : 'asc') : last?.sortDirection || DEFAULT_SORTS[entityName]?.direction || 'desc';
    if (order) setLastSort(entityName, { sortField, sortDirection });
    const res = await base44.functions.invoke('entityListSorted', {
      entityName, filter, sortField, sortDirection, limit: limit || 100, skip: Math.max(0, Number(skip) || 0),
    });
    return res.data;
  };
  return { filterInContext };
}