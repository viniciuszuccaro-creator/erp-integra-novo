// Helpers de importação de planilha de produtos
export const num = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : undefined;
};

export const sanitize = (v) => {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const norm = (s) => String(s || "").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const removeDiacritics = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const get = (row, keys) => {
  const normKey = (s) => removeDiacritics(String(s || '').toLowerCase().trim().replace(/^\uFEFF/, ''));
  const tryReturn = (key) => (key != null && row[key] != null && row[key] !== '') ? row[key] : undefined;
  const rowKeys = Object.keys(row || {});
  const rowKeysNorm = rowKeys.map((rk) => ({ raw: rk, norm: normKey(rk) }));
  for (const k of keys) {
    if (!k) continue;
    const direct = tryReturn(k); if (direct !== undefined) return direct;
    const upper = tryReturn(String(k).toUpperCase()); if (upper !== undefined) return upper;
    const target = normKey(k);
    const eq = rowKeysNorm.find((rk) => rk.norm === target);
    if (eq) { const v = tryReturn(eq.raw); if (v !== undefined) return v; }
    if (target.length >= 4) {
      const incl = rowKeysNorm.find((rk) => rk.norm.includes(target));
      if (incl) { const v = tryReturn(incl.raw); if (v !== undefined) return v; }
    }
  }
  return undefined;
};

export const isHeaderRow = () => false;

export const HEADERS = {
  codigo: ["Cód. Material","Cod. Material","Código","Codigo","SKU","Código Interno","Codigo Interno","A"],
  descricao: ["Descrição","Descricao","Descrição Produto","Descricao Produto","Produto","Nome","Item","B"],
  unidade_medida: ["Un.","UN","Un","Unidade","Unid.","UNIDADE","UM","UNI","UND","C"],
  estoque_minimo: ["Estoque Minimo","Estoque Mínimo","D"],
  ncm: ["Classif. Fiscal","NCM","Classificação Fiscal","E"],
  peso_teorico_kg_m: ["Peso Teórico","Peso Teorico","F"],
  grupo_produto_id: ["Codigo da Classe","Código da Classe","G"],
  grupo_produto_nome: ["Descrição da Classe","Descricao da Classe","Grupo do Produto","H"],
  peso_liquido_kg: ["Peso Liquido","Peso Líquido","I"],
  peso_bruto_kg: ["Peso Bruto","J"],
  setor_atividade_id: ["Codigo do Grupo","Código do Grupo","K"],
  setor_atividade_nome: ["Descrição do Grupo","Descricao do Grupo","Setor de Atividade","L"],
  custo_aquisicao: ["Custo Principal","Custo","Preço de Custo","M"],
  tipo_item: ["Descrição Tipo","Descricao Tipo","Tipo do Item","N"],
};

export const FIELD_LABELS = {
  codigo: 'Código', descricao: 'Descrição', unidade_medida: 'Unidade',
  estoque_minimo: 'Estoque Mínimo', ncm: 'NCM', peso_teorico_kg_m: 'Peso Teórico KG/M',
  grupo_produto_id: 'ID Grupo Produto', grupo_produto_nome: 'Grupo Produto Nome',
  peso_liquido_kg: 'Peso Líquido KG', peso_bruto_kg: 'Peso Bruto KG',
  setor_atividade_id: 'ID Setor Atividade', setor_atividade_nome: 'Setor Atividade Nome',
  custo_aquisicao: 'Custo Aquisição', tipo_item: 'Tipo Item',
};

export const UNIDADES_ACEITAS = ['UN','PC','KG','LT','MT','CX','M2','M3'];

export const autoMapFromHeaders = (headers = []) => {
  const n = (s) => norm(s).replace(/^\uFEFF/, '');
  const headersNorm = headers.map((h) => ({ raw: h, norm: n(String(h || '')) }));
  const result = {};
  Object.keys(HEADERS).forEach((field) => {
    const syns = HEADERS[field] || [];
    let found = '';
    for (const syn of syns) {
      const target = n(String(syn));
      const eq = headersNorm.find((h) => h.norm === target);
      if (eq) { found = eq.raw; break; }
      if (target.length >= 3) {
        const incl = headersNorm.find((h) => h.norm.includes(target));
        if (incl) { found = incl.raw; break; }
      }
    }
    result[field] = found;
  });
  const has = (k) => headers.includes(k);
  if (!result.codigo && has('A')) result.codigo = 'A';
  if (!result.descricao && has('B')) result.descricao = 'B';
  if (!result.unidade_medida && has('C')) result.unidade_medida = 'C';
  return result;
};

export const mapUnidade = (v) => {
  const s = norm(v || '').replace(/\./g, '');
  switch (s) {
    case 'un': case 'und': case 'unid': case 'um': case 'uni': return 'UN';
    case 'pc': case 'pç': case 'peca': case 'pec': case 'peça': return 'PC';
    case 'kg': case 'kilo': return 'KG';
    case 'lt': case 'l': return 'LT';
    case 'mt': case 'm': return 'MT';
    case 'cx': case 'caixa': return 'CX';
    case 'm2': case 'm²': return 'M2';
    case 'm3': case 'm³': return 'M3';
    default: return undefined;
  }
};

export const mapTipoItem = (v) => {
  const s = norm(v || '');
  if (s.includes('rev')) return 'Revenda';
  if (s.includes('mater') || s.includes('prima')) return 'Matéria-Prima Produção';
  if (s.includes('acab')) return 'Produto Acabado';
  if (s.includes('consum')) return 'Consumo Interno';
  if (s.includes('serv')) return 'Serviço';
  return 'Revenda';
};

export const sanitizeNCM = (v) => {
  const s = String(v || '').replace(/\./g, '').trim();
  return s || undefined;
};

export const isNCMValido = (v) => {
  const s = String(v || '').replace(/\./g, '').trim();
  return s === '' || /^\d{8}$/.test(s);
};

export const makeKey = (empresaId, codigo) => `${empresaId || ''}__${String(codigo || '').toUpperCase()}`;

/**
 * Resolve código sequencial para produtos importados (Regra-Mãe §5c)
 * - Se código fornecido e NÃO existe no grupo → mantém o código
 * - Se código fornecido e JÁ existe → busca próximo na sequência
 * - Se sem código → auto-gera sequencial
 * @param {string} codigoFornecido - código da planilha/NF-e (pode ser vazio)
 * @param {string} groupId - ID do grupo empresarial
 * @param {object} base44 - instância do SDK
 * @returns {Promise<string>} código resolvido
 */
export async function resolverCodigoProduto(codigoFornecido, groupId, base44) {
  const getNext = async () => {
    const res = await base44.functions.invoke("entityListSorted", {
      entityName: "Produto", filter: { group_id: groupId, _merged: { $ne: true } },
      sortField: "codigo", sortDirection: "desc", limit: 1, skip: 0,
    });
    const last = res?.data?.[0];
    const n = last ? parseInt(String(last.codigo).replace(/\D/g, ''), 10) : 0;
    return String(isNaN(n) ? 1 : n + 1).padStart(3, '0');
  };

  if (codigoFornecido && String(codigoFornecido).trim()) {
    const codeVal = String(codigoFornecido).trim();
    try {
      const existing = await base44.entities.Produto.filter(
        { group_id: groupId, codigo: codeVal }, 'created_date', 1
      );
      if (existing && existing.length > 0) return getNext(); // já existe → sequencial
      return codeVal; // não existe → mantém
    } catch { return getNext(); } // fail-closed → sequencial
  }
  return getNext(); // sem código → sequencial
}