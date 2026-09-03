/**
 * Cliente Base44 local — Motor de consulta (filtros e ordenação estilo MongoDB)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
export const getValue = (record, field) => {
  if (!field) return undefined;
  return String(field).split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), record);
};

export const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export const matchesOperator = (actual, expected) => {
  if (!isPlainObject(expected)) {
    if (expected === null) return actual === null || actual === undefined;
    if (Array.isArray(actual)) return actual.includes(expected);
    return String(actual ?? '') === String(expected ?? '');
  }

  if ('$in' in expected) {
    const values = Array.isArray(expected.$in) ? expected.$in.map(String) : [];
    if (Array.isArray(actual)) return actual.some((item) => values.includes(String(item)));
    return values.includes(String(actual));
  }
  if ('$ne' in expected && String(actual ?? '') === String(expected.$ne ?? '')) return false;
  if ('$gte' in expected && !(actual >= expected.$gte)) return false;
  if ('$lte' in expected && !(actual <= expected.$lte)) return false;
  if ('$gt' in expected && !(actual > expected.$gt)) return false;
  if ('$lt' in expected && !(actual < expected.$lt)) return false;
  if ('$contains' in expected) return String(actual || '').toLowerCase().includes(String(expected.$contains || '').toLowerCase());

  return true;
};

export const matchesFilter = (record, filter = {}) => {
  if (!filter || !Object.keys(filter).length) return true;
  if (Array.isArray(filter.$or) && !filter.$or.some((item) => matchesFilter(record, item))) return false;
  if (Array.isArray(filter.$and) && !filter.$and.every((item) => matchesFilter(record, item))) return false;

  return Object.entries(filter).every(([field, expected]) => {
    if (field === '$or' || field === '$and') return true;
    return matchesOperator(getValue(record, field), expected);
  });
};

export const uniqueCondition = (conditions, condition) => {
  const key = JSON.stringify(condition);
  if (!conditions.some((item) => JSON.stringify(item) === key)) {
    conditions.push(condition);
  }
};

export const sortRecords = (records, order, direction) => {
  if (!order) return records;
  let field = order;
  let dir = direction || 'asc';
  if (typeof order === 'string' && order.startsWith('-')) {
    field = order.slice(1);
    dir = 'desc';
  }

  return [...records].sort((a, b) => {
    const av = getValue(a, field);
    const bv = getValue(b, field);
    const at = Date.parse(av);
    const bt = Date.parse(bv);
    const left = Number.isNaN(at) ? av : at;
    const right = Number.isNaN(bt) ? bv : bt;
    if (left === right) return 0;
    const result = left > right ? 1 : -1;
    return dir === 'desc' ? -result : result;
  });
};