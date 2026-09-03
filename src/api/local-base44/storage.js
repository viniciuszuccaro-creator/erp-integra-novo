/**
 * Cliente Base44 local — Camada de armazenamento (localStorage) e constantes
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
export const STORAGE_KEY = 'erp_integra_local_db_v1';
export const USER_KEY = 'erp_integra_local_user_v1';
export const SNAPSHOT_IMPORT_KEY = 'erp_integra_base44_snapshot_imported_v5_core_compact';
export const DELETED_RECORDS_KEY = 'erp_integra_local_deleted_records_v1';
export const AUTO_IMPORT_EXCLUDED_ENTITIES = new Set(['AuditLog']);
export const AUTO_IMPORT_COMPLETENESS_ENTITIES = [
  'GrupoEmpresarial',
  'Empresa',
  'PerfilAcesso',
  'Cliente',
  'Fornecedor',
  'Transportadora',
  'Colaborador',
  'Representante',
  'ContatoB2B',
  'SegmentoCliente',
  'RegiaoAtendimento',
  'Motorista',
];
export const PESSOAS_PARCEIROS_ENTITIES = [
  'Cliente',
  'Fornecedor',
  'Transportadora',
  'Colaborador',
  'Representante',
  'ContatoB2B',
  'SegmentoCliente',
  'RegiaoAtendimento',
];
export const LOCAL_ENTITY_CONTEXT_FIELD = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};
export const LOCAL_SHARED_ENTITIES = new Set(['Cliente', 'Fornecedor', 'Transportadora']);
export const LOCAL_RELAXED_CONTEXT_ENTITIES = new Set([
  'Cliente',
  'Fornecedor',
  'Transportadora',
  'Colaborador',
  'Representante',
  'ContatoB2B',
  'SegmentoCliente',
  'RegiaoAtendimento',
]);

export const now = () => new Date().toISOString();

export const safeStorage = {
  getItem(key) {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('[base44-local] Nao foi possivel gravar localStorage:', key, error?.message || error);
    }
  },
  removeItem(key) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  },
};

export const readDeletedRecords = () => {
  const raw = safeStorage.getItem(DELETED_RECORDS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveDeletedRecords = (deleted = {}) => {
  safeStorage.setItem(DELETED_RECORDS_KEY, JSON.stringify(deleted || {}));
};

export const isRecordDeletedLocally = (entityName, id) => {
  if (!entityName || !id) return false;
  const deleted = readDeletedRecords();
  return Boolean(deleted[entityName]?.[String(id)]);
};

export const markRecordDeletedLocally = (entityName, id) => {
  if (!entityName || !id) return;
  const deleted = readDeletedRecords();
  deleted[entityName] = {
    ...(deleted[entityName] || {}),
    [String(id)]: now(),
  };
  saveDeletedRecords(deleted);
};

export const makeId = (prefix = 'local') => {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
};

export const uniqueByString = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item ?? '');
    if (!key || key === 'undefined' || key === 'null' || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};