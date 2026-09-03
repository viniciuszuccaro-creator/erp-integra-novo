/**
 * Cliente Base44 local — Contexto multiempresa (stamping groupId/empresaId + expansão de filtros)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { safeStorage, LOCAL_ENTITY_CONTEXT_FIELD, LOCAL_SHARED_ENTITIES, LOCAL_RELAXED_CONTEXT_ENTITIES } from './storage';
import { isPlainObject, uniqueCondition } from './query';
import { readUser } from './topology';

const getCurrentGroupId = () => {
  try {
    return (
      safeStorage.getItem('group_atual_id') ||
      safeStorage.getItem('grupo_atual_id') ||
      readUser()?.grupo_atual_id ||
      readUser()?.grupo_padrao_id ||
      null
    );
  } catch {
    return null;
  }
};

const getCurrentEmpresaId = () => {
  try {
    return (
      safeStorage.getItem('empresa_atual_id') ||
      readUser()?.empresa_atual_id ||
      readUser()?.empresa_padrao_id ||
      null
    );
  } catch {
    return null;
  }
};

export const getCurrentContext = () => {
  const user = readUser();
  return {
    user,
    contexto: safeStorage.getItem('contexto_atual') || user?.contexto_atual || 'empresa',
    groupId: getCurrentGroupId() || user?.grupo_atual_id || user?.grupo_padrao_id || 'local_grupo_cpa',
    empresaId: getCurrentEmpresaId() || user?.empresa_atual_id || user?.empresa_padrao_id || null,
  };
};

const ENTITY_CONTEXT_FIELD_BY_NAME = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};

const shouldStampEmpresa = (entityName) => ![
  'AuditLog',
  'GrupoEmpresarial',
  'Empresa',
  'PerfilAcesso',
  'ConfiguracaoSistema',
  'Banco',
  'FormaPagamento',
  'TipoDespesa',
  'MoedaIndice',
  'TipoFrete',
  'UnidadeMedida',
  'Departamento',
  'Cargo',
  'Turno',
  'GrupoProduto',
  'Marca',
  'SetorAtividade',
  'LocalEstoque',
  'TabelaFiscal',
  'CentroResultado',
  'OperadorCaixa',
  'RotaPadrao',
  'ModeloDocumento',
  'ApiExterna',
  'Webhook',
  'ChatbotIntent',
  'ChatbotCanal',
  'JobAgendado',
  'EventoNotificacao',
].includes(entityName);

const _sanitizeStr = (s) => String(s)
  .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
  .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
  .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
  .replace(/javascript:\s*/gi, '');

export const sanitizeRecord = (value) => {
  if (typeof value === 'string') return _sanitizeStr(value);
  if (Array.isArray(value)) return value.map(sanitizeRecord);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeRecord(v)]));
  }
  return value;
};

export const stampRecordContext = (entityName, data = {}) => {
  const record = sanitizeRecord(data || {});
  const { contexto, groupId, empresaId } = getCurrentContext();
  const ctxField = ENTITY_CONTEXT_FIELD_BY_NAME[entityName] || 'empresa_id';

  if (groupId && !record.group_id && !record.grupo_id && entityName !== 'GrupoEmpresarial') {
    record.group_id = groupId;
  }
  if (contexto !== 'grupo' && empresaId && shouldStampEmpresa(entityName) && !record[ctxField] && !record.empresa_id) {
    record[ctxField] = empresaId;
    if (ctxField !== 'empresa_id') record.empresa_id = record.empresa_id || empresaId;
  }
  return record;
};

export const expandLocalContextFilter = (entityName, filter = {}) => {
  if (!isPlainObject(filter)) return filter || {};
  if (LOCAL_RELAXED_CONTEXT_ENTITIES.has(entityName)) {
    if (
      filter.$or ||
      filter.empresa_id ||
      filter.group_id ||
      filter.grupo_id ||
      filter.grupo_empresarial_id
    ) {
      return {};
    }
  }
  if (filter.$or || filter.$and) return filter || {};

  const empresaId = filter.empresa_id;
  const explicitGroupId = filter.group_id || filter.grupo_id || filter.grupo_empresarial_id;
  const groupId = explicitGroupId || (empresaId ? getCurrentGroupId() : null);
  const rest = { ...filter };
  delete rest.empresa_id;
  delete rest.group_id;
  delete rest.grupo_id;
  delete rest.grupo_empresarial_id;

  const orConds = [];
  if (empresaId) {
    const ctxField = LOCAL_ENTITY_CONTEXT_FIELD[entityName] || 'empresa_id';
    uniqueCondition(orConds, { [ctxField]: empresaId });
    uniqueCondition(orConds, { empresa_id: empresaId });
    if (entityName === 'Cliente' || LOCAL_SHARED_ENTITIES.has(entityName)) {
      uniqueCondition(orConds, { empresa_dona_id: empresaId });
      uniqueCondition(orConds, { empresas_compartilhadas_ids: { $in: [empresaId] } });
    }
  }

  if (groupId) {
    uniqueCondition(orConds, { group_id: groupId });
    uniqueCondition(orConds, { grupo_id: groupId });
    uniqueCondition(orConds, { grupo_empresarial_id: groupId });
  }

  if (!orConds.length) return filter || {};
  return { ...rest, $or: orConds };
};