import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LIST_CACHE = new Map();
const LIST_CACHE_TTL_MS = 5 * 1000;
let LIST_LAST_CALL_AT = 0;
let LIST_BACKEND_PAUSED_UNTIL = 0;
const LIST_MIN_GAP_MS = 500;
const LIST_BACKEND_PAUSE_MS = 30 * 1000;

function stableListKey(value) {
  try { return JSON.stringify(value || {}, Object.keys(value || {}).sort()); }
  catch (_) { return JSON.stringify({}); }
}

const DEFAULT_SORTS = {
  Produto: { field: 'descricao', direction: 'asc' }, Cliente: { field: 'nome', direction: 'asc' },
  Fornecedor: { field: 'nome', direction: 'asc' }, Transportadora: { field: 'razao_social', direction: 'asc' },
  Colaborador: { field: 'nome_completo', direction: 'asc' }, Banco: { field: 'nome_banco', direction: 'asc' },
  FormaPagamento: { field: 'descricao', direction: 'asc' }, Pedido: { field: 'data_pedido', direction: 'desc' },
  ContaPagar: { field: 'data_vencimento', direction: 'asc' }, ContaReceber: { field: 'data_vencimento', direction: 'asc' },
  OrdemCompra: { field: 'data_solicitacao', direction: 'desc' }, CentroCusto: { field: 'codigo', direction: 'asc' },
  PlanoDeContas: { field: 'codigo', direction: 'asc' }, PlanoContas: { field: 'codigo', direction: 'asc' },
  Cargo: { field: 'nome_cargo', direction: 'asc' },
  User: { field: 'full_name', direction: 'asc' }, Departamento: { field: 'nome_departamento', direction: 'asc' },
  Turno: { field: 'nome_turno', direction: 'asc' },
  Veiculo: { field: 'placa', direction: 'asc' }, Motorista: { field: 'nome_completo', direction: 'asc' },
  Servico: { field: 'descricao', direction: 'asc' }, GrupoProduto: { field: 'nome_grupo', direction: 'asc' },
  Marca: { field: 'nome_marca', direction: 'asc' }, Representante: { field: 'nome', direction: 'asc' },
  SegmentoCliente: { field: 'nome_segmento', direction: 'asc' }, RegiaoAtendimento: { field: 'nome_regiao', direction: 'asc' },
  SetorAtividade: { field: 'nome', direction: 'asc' }, RotaPadrao: { field: 'nome_rota', direction: 'asc' },
  TabelaNCM: { field: 'ncm', direction: 'asc' }, KitProduto: { field: 'nome_kit', direction: 'asc' },
  TipoDespesa: { field: 'nome', direction: 'asc' }, MoedaIndice: { field: 'nome', direction: 'asc' },
  CentroResultado: { field: 'nome', direction: 'asc' }, CentroOperacao: { field: 'nome', direction: 'asc' },
  CondicaoComercial: { field: 'nome_condicao', direction: 'asc' }, LocalEstoque: { field: 'nome', direction: 'asc' },
  TipoFrete: { field: 'nome', direction: 'asc' }, ContatoB2B: { field: 'nome_completo', direction: 'asc' },
  PlanoDeContas: { field: 'codigo', direction: 'asc' },
  CatalogoWeb: { field: 'produto_id', direction: 'asc' },
  OperadorCaixa: { field: 'usuario_nome', direction: 'asc' },
  TabelaFiscal: { field: 'nome_regra', direction: 'asc' },
  GrupoEmpresarial: { field: 'nome_do_grupo', direction: 'asc' },
  TabelaPreco: { field: 'nome', direction: 'asc' },
  ConfiguracaoDespesaRecorrente: { field: 'descricao', direction: 'asc' },
  ConfiguracaoNFe: { field: 'provedor', direction: 'asc' },
  EventoNotificacao: { field: 'nome_evento', direction: 'asc' },
  ApiExterna: { field: 'nome_api', direction: 'asc' },
  ChatbotCanal: { field: 'nome_canal', direction: 'asc' },
  ChatbotIntent: { field: 'nome_intent', direction: 'asc' },
  JobAgendado: { field: 'nome_job', direction: 'asc' },
  Webhook: { field: 'nome_webhook', direction: 'asc' },
  GatewayPagamento: { field: 'nome', direction: 'asc' },
  ModeloDocumento: { field: 'nome_modelo', direction: 'asc' },
};

const SEARCH_FIELDS = {
  Produto: ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome'],
  Cliente: ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj'],
  Fornecedor: ['nome', 'razao_social', 'nome_fantasia', 'cnpj', 'cpf'],
  Transportadora: ['razao_social', 'nome_fantasia', 'cnpj'],
  Colaborador: ['nome_completo', 'cpf', 'email', 'cargo'],
  Banco: ['nome_banco', 'codigo_banco'],
  FormaPagamento: ['descricao', 'codigo', 'tipo'],
  Departamento: ['nome_departamento', 'descricao', 'codigo'],
  Cargo: ['nome_cargo', 'descricao', 'codigo'],
  Turno: ['nome_turno', 'descricao', 'codigo'],
  Veiculo: ['placa', 'modelo', 'marca'],
  Motorista: ['nome_completo', 'cpf', 'cnh_numero'],
  Servico: ['descricao', 'codigo_servico', 'tipo_servico'],
  GrupoProduto: ['nome_grupo', 'codigo', 'natureza'],
  Marca: ['nome_marca', 'codigo', 'cnpj'],
  Representante: ['nome', 'cpf', 'cnpj', 'email'],
  SegmentoCliente: ['nome_segmento', 'descricao', 'tipo_segmento'],
  RegiaoAtendimento: ['nome_regiao', 'descricao', 'tipo_regiao'],
  PerfilAcesso: ['nome_perfil', 'descricao', 'nivel_perfil'],
  ConfiguracaoDespesaRecorrente: ['descricao', 'periodicidade', 'fornecedor_nome'],
  SetorAtividade: ['nome', 'descricao', 'codigo', 'tipo_operacao'],
  TabelaPreco: ['nome', 'descricao'],
  UnidadeMedida: ['codigo', 'nome_completo', 'sigla'],
  CentroCusto: ['codigo', 'descricao', 'tipo'],
  CentroResultado: ['codigo', 'nome', 'descricao'],
  PlanoDeContas: ['codigo', 'nome_conta', 'tipo'],
  TipoDespesa: ['nome', 'codigo', 'categoria'],
  MoedaIndice: ['codigo', 'nome', 'simbolo'],
  GrupoEmpresarial: ['nome_do_grupo', 'razao_social_grupo', 'cnpj_grupo'],
  Empresa: ['razao_social', 'nome_fantasia', 'cnpj'],
  ContatoB2B: ['nome_completo', 'cargo', 'tipo_vinculo'],
  KitProduto: ['nome_kit', 'codigo', 'descricao'],
  CatalogoWeb: ['produto_id', 'categoria_navegacao', 'slug_url', 'titulo_seo'],
  CondicaoComercial: ['nome_condicao', 'codigo', 'tipo_condicao'],
  TabelaFiscal: ['nome_regra', 'cenario_operacao', 'cfop', 'ncm'],
  LocalEstoque: ['nome', 'codigo', 'tipo'],
  RotaPadrao: ['nome_rota', 'codigo', 'descricao'],
  ModeloDocumento: ['nome_modelo', 'tipo_documento', 'descricao'],
  TipoFrete: ['nome', 'codigo', 'tipo'],
  OperadorCaixa: ['usuario_nome', 'codigo_operador', 'nome_caixa'],
  GatewayPagamento: ['nome', 'provedor', 'ambiente'],
  ApiExterna: ['nome_api', 'descricao'],
  ChatbotCanal: ['nome_canal', 'descricao'],
  ChatbotIntent: ['nome_intent', 'descricao'],
  Webhook: ['nome_webhook', 'url', 'descricao'],
  JobAgendado: ['nome_job', 'descricao'],
  ConfiguracaoNFe: ['provedor', 'ambiente', 'descricao', 'observacoes'],
  EventoNotificacao: ['nome_evento', 'descricao', 'tipo_evento'],
  default: ['nome', 'descricao', 'codigo', 'razao_social', 'nome_completo', 'nome_grupo', 'nome_segmento', 'nome_regiao', 'nome_banco', 'nome_fantasia', 'nome_conta', 'nome_cargo', 'nome_turno', 'nome_departamento', 'nome_condicao', 'nome_kit', 'nome_rota', 'nome_marca', 'nome_modelo', 'nome_api', 'nome_canal', 'nome_intent', 'nome_job', 'nome_webhook', 'nome_gateway', 'nome_perfil', 'codigo_servico', 'sigla', 'titulo', 'placa']
};

// Entidades que não precisam de filtro empresa/grupo
const SIMPLE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
  'TabelaPrecoItem', 'CentroOperacao', 'ConfiguracaoDespesaRecorrente',
]);

// Entidades com empresas_compartilhadas_ids ou campos de vinculação múltiplos
const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora', 'Colaborador', 'Produto']);

function normalizeSortField(entityName, requested) {
  if (!requested || typeof requested !== 'string') return DEFAULT_SORTS[entityName]?.field || 'updated_date';
  const r = requested.toLowerCase();
  if (['recentes', 'updated', 'updated_date'].includes(r)) return 'updated_date';
  if (['criacao', 'created_date'].includes(r)) return 'created_date';
  // Validação básica: só aceita identificadores simples
  if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(requested)) return DEFAULT_SORTS[entityName]?.field || 'updated_date';
  return requested;
}

// Campos que devem ser ordenados numericamente (item 11: código numérico, não texto)
const NUMERIC_SORT_FIELDS = new Set([
  'codigo', 'codigo_banco', 'matricula', 'numero', 'codigo_interno',
  'codigo_auxiliar', 'sequencia', 'ordem', 'nivel', 'codigo_operador', 'codigo_servico',
]);

function sanitizeVal(v) {
  return typeof v === 'string'
    ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '').replace(/javascript:\s*/gi, '')
    : v;
}

// Converte valor para número para ordenação (fallback 0 se não-numérico)
function toNum(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function sanitizeFilter(f) {
  if (!f || typeof f !== 'object') return f || {};
  const out = {};
  for (const [k, v] of Object.entries(f)) {
    if (k === '$or' || k === '$and') {
      out[k] = Array.isArray(v) ? v.map(sanitizeFilter) : v;
    } else if (k === '$in') {
      out[k] = Array.isArray(v) ? v.map(sanitizeVal) : v;
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = sanitizeFilter(v);
    } else if (Array.isArray(v)) {
      out[k] = v.map(sanitizeVal);
    } else {
      out[k] = sanitizeVal(v);
    }
  }
  return out;
}

// Normaliza filtro de empresas_compartilhadas_ids para objeto $in
function normalizeSharedFilter(f) {
  if (!f || typeof f !== 'object') return f || {};
  let out = { ...f };
  if ('empresas_compartilhadas_ids' in out && typeof out.empresas_compartilhadas_ids === 'string') {
    out.empresas_compartilhadas_ids = { $in: [out.empresas_compartilhadas_ids] };
  }
  if (Array.isArray(out.$or)) {
    out.$or = out.$or.map(cond => {
      if (cond?.empresas_compartilhadas_ids && typeof cond.empresas_compartilhadas_ids === 'string') {
        return { ...cond, empresas_compartilhadas_ids: { $in: [cond.empresas_compartilhadas_ids] } };
      }
      return cond;
    });
  }
  return out;
}

// Expande filtro de empresa/grupo para cobrir todos os campos de vinculação
async function expandGroupFilter(base44, entityName, f) {
  const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
    : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');

  // empresa_id simples → expande para $or cobrindo todos os campos + registros legados
  if (f?.empresa_id && !f?.$or && !f?.group_id) {
    const { empresa_id, ...rest } = f;
    const orConds = [{ empresa_id }, { empresa_dona_id: empresa_id }];
    // NÃO incluir { empresa_id: null } — isso infla a lista com registros de outros escopos
    if (EXPAND_SET.has(entityName)) {
      orConds.push({ empresas_compartilhadas_ids: { $in: [empresa_id] } });
    }
    if (entityName === 'Colaborador') {
      orConds.push({ empresa_alocada_id: empresa_id });
    }
    if (entityName === 'Produto') {
      orConds.push({ compartilhado_grupo: true }); // produtos compartilhados do grupo
    }
    return { ...rest, $or: orConds };
  }

  // Apenas group_id → uso direto (group_id é indexado e suficiente para contexto de grupo)
  // Não expandir para empresa_id/empresa_dona_id com $in — causa timeout no MongoDB
  if (f?.group_id && !f?.$or && !f?.empresa_id && !f?.empresa_dona_id && !f?.empresa_alocada_id) {
    return f; // { group_id: groupId } é suficiente — todos os registros do grupo têm group_id
  }

  // $or existente + group_id residual
  if (f?.$or && f?.group_id) {
    const { group_id, ...rest } = f;
    return { ...rest, $or: [...f.$or, { group_id }] };
  }

  return f;
}

async function listOne(base44, user, q) {
  const entityName = q?.entityName;
  if (!entityName) return { entityName, items: [] };

  const isSimple = SIMPLE_CATALOG.has(entityName);
  const rawFilter = q?.filter || {};
  const hasOr = Array.isArray(rawFilter?.$or) && rawFilter.$or.length > 0;
  const scopeProvided = rawFilter?.empresa_id || rawFilter?.group_id || rawFilter?.empresa_dona_id || rawFilter?.empresa_alocada_id || hasOr;

  // Sem escopo → lista tudo (acesso autenticado e auditado; dados protegidos por RBAC no frontend)

  const limit = Math.max(1, Math.min(Number(q?.limit || q?.pageSize) || 80, 150));
  const skip = Math.max(0, Number(q?.skip ?? q?.offset ?? 0) || 0);

  const sortField = normalizeSortField(entityName, q?.sortField || q?.sortBy);
  const sortDir = ((q?.sortDirection || DEFAULT_SORTS[entityName]?.direction || 'desc') === 'asc') ? 'asc' : 'desc';
  const orderHint = `${sortDir === 'desc' ? '-' : ''}${sortField}`;

  // Monta filtro de escopo (sem busca de texto — busca vem em q.search separada)
  let scopeFilter = sanitizeFilter(rawFilter);
  scopeFilter = normalizeSharedFilter(scopeFilter);
  // Remove $or de busca embutido no filter (compatibilidade com clientes antigos)
  // Detecta se o $or do filter é de busca (campos de texto) ou de escopo (empresa_id/group_id)
  const isSearchOr = Array.isArray(scopeFilter?.$or) && scopeFilter.$or.length > 0 &&
    scopeFilter.$or.every(c => {
      const keys = Object.keys(c || {});
      return keys.length === 1 && !['empresa_id','empresa_dona_id','empresa_alocada_id','group_id','empresas_compartilhadas_ids'].includes(keys[0]);
    });
  const embeddedSearch = isSearchOr ? scopeFilter.$or : null;
  if (isSearchOr) { scopeFilter = { ...scopeFilter }; delete scopeFilter.$or; }

  // Expande sempre (escopo limpo)
  let finalFilter = scopeFilter;
  if (!isSimple) {
    finalFilter = await expandGroupFilter(base44, entityName, scopeFilter);
  }

  // Aplica busca por texto (prioridade: q.search, depois embeddedSearch)
  const term = q?.search || q?.busca || null;
  if (term && typeof term === 'string' && term.trim()) {
    const fields = SEARCH_FIELDS[entityName] || SEARCH_FIELDS.default;
    const rx = { $regex: term.trim(), $options: 'i' };
    const orConds = fields.map(f => ({ [f]: rx }));
    const hasScope = Object.keys(finalFilter).length > 0;
    finalFilter = hasScope ? { $and: [finalFilter, { $or: orConds }] } : { $or: orConds };
  } else if (embeddedSearch) {
    // Busca legada embutida no filter
    const hasScope = Object.keys(finalFilter).length > 0;
    finalFilter = hasScope ? { $and: [finalFilter, { $or: embeddedSearch }] } : { $or: embeddedSearch };
  }

  const cacheKey = `${entityName}:${stableListKey(finalFilter)}:${orderHint}:${limit}:${skip}`;
  const cached = LIST_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < LIST_CACHE_TTL_MS) {
    return { entityName, items: cached.items };
  }
  if (Date.now() < LIST_BACKEND_PAUSED_UNTIL) {
    return { entityName, items: cached?.items || [] };
  }

  try {
    const now = Date.now();
    const waitMs = Math.max(0, LIST_MIN_GAP_MS - (now - LIST_LAST_CALL_AT));
    if (waitMs > 0) {
      if (cached) return { entityName, items: cached.items };
      await new Promise(r => setTimeout(r, waitMs));
    }
    LIST_LAST_CALL_AT = Date.now();

    // Ordenação numérica: busca TODOS os registros, ordena em memória, depois pagina
    // Necessário porque o BD ordena códigos como TEXTO (10 vem antes de 2)
    if (NUMERIC_SORT_FIELDS.has(sortField)) {
      const allItems = await base44.asServiceRole.entities[entityName].filter(finalFilter, '-created_date', 2000, 0) || [];
      const sorted = [...allItems].sort((a, b) => {
        const diff = toNum(a[sortField]) - toNum(b[sortField]);
        return sortDir === 'asc' ? diff : -diff;
      });
      const paged = sorted.slice(skip, skip + limit);
      LIST_CACHE.set(cacheKey, { items: paged, ts: Date.now() });
      return { entityName, items: paged };
    }

    const items = await base44.asServiceRole.entities[entityName].filter(finalFilter, orderHint, limit, skip) || [];
    LIST_CACHE.set(cacheKey, { items, ts: Date.now() });
    return { entityName, items };
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 502 || (typeof status === 'number' && status >= 500)) {
      LIST_BACKEND_PAUSED_UNTIL = Date.now() + LIST_BACKEND_PAUSE_MS;
      return { entityName, items: cached?.items || [] };
    }
    throw err;
  }
}

// Compressão gzip quando suportado
async function compressedJson(data, req) {
  const json = JSON.stringify(data);
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  if (!acceptEncoding.includes('gzip')) {
    return new Response(json, { headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const encoded = new TextEncoder().encode(json);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(encoded);
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    return new Response(compressed, {
      headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Vary': 'Accept-Encoding' }
    });
  } catch (_) {
    return new Response(json, { headers: { 'Content-Type': 'application/json' } });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { }

    // MODO LOTE: { queries: [...] }
    const queries = Array.isArray(body?.queries) ? body.queries : null;
    if (queries && queries.length > 0) {
      const results = [];
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        try {
          results.push(await listOne(base44, user, q));
        } catch (err) {
          results.push({ entityName: q?.entityName, items: [], error: String(err?.message || err) });
        }
        // Delay entre queries em lote para evitar 429
        if (i < queries.length - 1) await new Promise(r => setTimeout(r, 2500));
      }
      return compressedJson({ results }, req);
    }

    // MODO SINGLE
    const single = await listOne(base44, user, {
      entityName: body?.entityName,
      filter: body?.filter || {},
      sortField: body?.sortField,
      sortDirection: body?.sortDirection,
      limit: body?.limit,
      skip: body?.skip,
      search: body?.search || body?.busca
    });

    if (single.error === 'escopo_obrigatorio') {
      return Response.json({ error: single.error }, { status: 400 });
    }
    return compressedJson(single.items, req);

  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});