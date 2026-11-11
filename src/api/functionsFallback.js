/**
 * functionsFallback.js — Fallback central de leitura quando as backend functions
 * estão indisponíveis (HTTP 402 — plano sem backend functions / 404 — handler ausente)
 * + governador de tráfego (fila + nova tentativa em "Rate limit exceeded").
 *
 * Regra-Mãe 2: melhoria no existente — intercepta base44.functions.invoke APENAS para
 * as funções de leitura (entityListSorted, countEntities, countEntitiesOptimized,
 * getEntityRecord) e substitui por consultas diretas ao banco via SDK. Nenhuma função
 * de escrita é substituída (entityGuard, nfeActions, whatsappSend etc. continuam falhando alto).
 */
// Campos de busca por entidade — espelham exatamente o SEARCH_FIELDS de
// base44/functions/entityListSorted, para que a busca (Central 360°, tabelas e
// Cadastros) encontre os mesmos registros quando a leitura cai para o SDK
// (backend functions indisponíveis no plano). Regra-Mãe 2: melhoria no existente.
const SEARCH_FIELDS_POR_ENTIDADE = {
  Pedido: ['numero_pedido', 'cliente_nome', 'vendedor', 'origem_pedido', 'obra_destino_nome', 'forma_pagamento'],
  OrcamentoCliente: ['numero_orcamento', 'cliente_nome', 'vendedor_responsavel', 'descricao', 'observacoes'],
  PedidoExterno: ['numero_pedido_externo', 'cliente_nome', 'cliente_cpf_cnpj', 'cliente_email', 'cliente_telefone', 'id_externo'],
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
};

const SEARCH_FIELDS_PADRAO = [
  'nome', 'razao_social', 'nome_fantasia', 'nome_completo', 'descricao', 'titulo', 'codigo',
  'nome_cargo', 'nome_departamento', 'nome_turno', 'nome_rota', 'nome_modelo',
  'nome_perfil', 'nome_do_grupo', 'nome_api', 'nome_canal', 'nome_intent',
  'nome_job', 'nome_webhook', 'nome_evento', 'nome_condicao', 'nome_grupo',
  'nome_marca', 'nome_conta', 'sigla', 'placa', 'codigo_banco', 'cpf_cnpj',
];

export function buildSearchFilter(filter, search, entityName) {
  const term = String(search || '').trim();
  if (!term) return filter || {};
  const campos = SEARCH_FIELDS_POR_ENTIDADE[entityName] || SEARCH_FIELDS_PADRAO;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const or = campos.map(f => ({ [f]: { $regex: escaped, $options: 'i' } }));
  return { $and: [filter || {}, { $or: or }] };
}

function errText(e) { return String(e?.response?.data?.message || e?.message || ''); }

function isBlockedByPlan(e) {
  const status = e?.response?.status || e?.status;
  return status === 402 || /status code 402/.test(String(e?.message || '')) || /functions? (are )?blocked/i.test(errText(e));
}

function isUnavailable(e) {
  const status = e?.response?.status || e?.status;
  if (status === 404 || /status code 404/.test(String(e?.message || ''))) return true;
  return isBlockedByPlan(e);
}

// Funções somente-leitura que podem cair para consulta SDK direta sem risco
const READ_FUNCTIONS = new Set(['entityListSorted', 'countEntities', 'countEntitiesOptimized', 'getEntityRecord']);
function isReadFn(fn) { return READ_FUNCTIONS.has(fn); }

// Leituras interativas têm prioridade sobre contagens; uma recusa pausa toda a fila.
// 6 concorrentes / 80ms: contagens dos 6 blocos de Cadastros (~49 consultas)
// terminam ~40% mais rápido sem aproximar o limite de taxa (429 tem retry + pausa).
const MAX_CONCURRENT = 10;
const START_INTERVAL_MS = 40;
let active = 0;
let nextStart = 0;
let pausedUntil = 0;
let pumpTimer = null;
const queue = [];
function pump() {
  clearTimeout(pumpTimer);
  if (!queue.length || active >= MAX_CONCURRENT) return;
  const wait = Math.max(nextStart, pausedUntil) - Date.now();
  if (wait > 0) { pumpTimer = setTimeout(pump, wait); return; }
  queue.sort((a, b) => b.priority - a.priority);
  const { task, resolve, reject } = queue.shift();
  active++;
  nextStart = Date.now() + START_INTERVAL_MS;
  Promise.resolve().then(task).then(resolve, reject).finally(() => { active--; pump(); });
  pump();
}
function schedule(task, priority = 1) {
  return new Promise((resolve, reject) => { queue.push({ task, resolve, reject, priority }); pump(); });
}
function isRateLimited(e) {
  return (e?.response?.status || e?.status) === 429 || /rate limit/i.test(errText(e));
}
async function withRetry(fn, priority = 1) {
  for (let attempt = 0; ; attempt++) {
    try { return await schedule(fn, priority); }
    catch (e) {
      if (!isRateLimited(e) || attempt >= 3) throw e;
      const retryAfter = e?.response?.headers?.['retry-after'];
      const retryMs = Number(retryAfter) * 1000 || Math.max(0, Date.parse(retryAfter) - Date.now()) || 0;
      pausedUntil = Math.max(pausedUntil, Date.now() + Math.max(retryMs, 2000 * 2 ** attempt));
    }
  }
}

// Leituras de entidades: fila + nova tentativa + junção de chamadas idênticas simultâneas
const READ_METHODS = new Set(['list', 'filter', 'get', 'count', 'aggregate']);
function installEntitiesGovernor(base44) {
  const original = base44.entities;
  const inflight = new Map();
  base44.entities = new Proxy(original, {
    get(target, name) {
      const handler = target[name];
      if (!handler || typeof name !== 'string' || typeof handler !== 'object') return handler;
      return new Proxy(handler, {
        get(h, method) {
          const fn = h[method];
          if (typeof fn !== 'function') return fn;
          if (!READ_METHODS.has(method)) return fn.bind(h);
          return (...args) => {
            let key = null;
            try { key = `${name}.${method}:${JSON.stringify(args)}`; } catch { key = null; }
            if (key && inflight.has(key)) return inflight.get(key);
            const p = withRetry(() => fn.apply(h, args), method === 'count' || method === 'aggregate' ? 0 : 1);
            if (key) { inflight.set(key, p); p.finally(() => inflight.delete(key)).catch(() => {}); }
            return p;
          };
        },
      });
    },
  });
}

// Usuário logado: mesma proteção (várias telas pedem ao mesmo tempo no carregamento)
function installAuthRetry(base44) {
  if (typeof base44?.auth?.me !== 'function') return;
  const me = base44.auth.me.bind(base44.auth);
  let pending = null;
  base44.auth.me = () => {
    if (pending) return pending;
    pending = withRetry(() => me(), 2);
    pending.finally(() => { pending = null; }).catch(() => {});
    return pending;
  };
}

export function installFunctionsFallback(base44) {
  if (!base44?.functions?.invoke || base44.__functionsFallbackInstalled) return;
  base44.__functionsFallbackInstalled = true;
  installEntitiesGovernor(base44);
  installAuthRetry(base44);
  const invoke = base44.functions.invoke.bind(base44.functions);

  // As quatro leituras usam o SDK autenticado diretamente, sem sondagens bloqueadas.
  // Escritas continuam no fluxo original; permissões e auditoria não são substituídas.
  base44.functions.invoke = async (functionName, payload = {}) => {
    if (!isReadFn(functionName)) return invoke(functionName, payload);
    const e = new Error(`Leitura indisponível para ${payload.entityName || functionName}`);

      // entityListSorted → filtro direto + ordenação + paginação (skip/limit)
      // SDK autenticado: assinatura paginada { sort, limit, cursor } — o salto (skip)
      // é feito juntando as páginas por cursor até o alvo, sem assinatura legada.
      if (functionName === 'entityListSorted') {
        const { entityName, filter, search, sortField, sortDirection, limit = 50, skip = 0 } = payload;
        const api = base44.entities?.[entityName];
        if (!api) throw e;
        const sf = (!sortField || sortField === 'id') ? 'created_date' : sortField;
        const sort = `${sortDirection === 'desc' ? '-' : ''}${sf}`;
        const finalFilter = buildSearchFilter(filter, search, entityName);
        const lim = Number(limit) || 50;
        const start = Math.max(0, Number(skip) || 0);
        const target = start + lim;
        const collected = [];
        let cursor; let waves = 0;
        while (collected.length < target && waves < 100) {
          const page = await api.filter(finalFilter, { sort, limit: Math.min(1000, target - collected.length), cursor });
          const items = Array.isArray(page) ? page : (page?.items || []);
          if (!items.length) break;
          collected.push(...items);
          if (Array.isArray(page) || !page?.has_more) break;
          cursor = page.next_cursor;
          waves++;
        }
        return { data: collected.slice(start, start + lim) };
      }

      // getEntityRecord → { data: [registro] } (contrato original: array)
      if (functionName === 'getEntityRecord') {
        const { entityName, filter, limit = 1 } = payload;
        const api = base44.entities?.[entityName];
        if (!api) throw e;
        const page = await api.filter(filter || {}, { limit: Number(limit) || 1 });
        const arr = Array.isArray(page?.items) ? page.items : (Array.isArray(page) ? page : []);
        return { data: arr };
      }

      // countEntities → count direto por entidade (batch: {entities:[{entityName, filter}]} ou único)
      if (functionName === 'countEntities' || functionName === 'countEntitiesOptimized') {
        if (Array.isArray(payload?.entities)) {
          const counts = {};
          await Promise.all(payload.entities.map(async (item) => {
            const entityName = typeof item === 'string' ? item : item?.entityName || item?.name;
            const api = base44.entities?.[entityName];
            if (!api?.count) throw e;
            counts[entityName] = await api.count(item?.filter || {});
          }));
          // Contrato original da função: { data: { counts: { entidade: n } } }
          return { data: { counts } };
        }
        const api = base44.entities?.[payload?.entityName];
        if (!api?.count) throw e;
        const n = await api.count(payload.filter || {});
        return { data: { count: n, total: n } };
      }

      throw e;
  };
}