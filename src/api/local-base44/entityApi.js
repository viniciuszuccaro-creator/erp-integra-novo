/**
 * Cliente Base44 local — API de entidades (CRUD + subscribe via Proxy)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { makeId, markRecordDeletedLocally, now } from './storage';
import { getEntityStore, listeners, notify, saveDb } from './store';
import { loadDb } from './topology';
import { stampRecordContext } from './context';
import { assertLocalMutationAllowed, auditLocalMutation } from './permissions';
import { matchesFilter, sortRecords } from './query';

export const createEntityApi = (entityName) => ({
  async list(order, limit, skip = 0) {
    if (typeof order === 'number') {
      limit = order;
      order = undefined;
    }
    const db = loadDb();
    const records = sortRecords(getEntityStore(db, entityName), order);
    return records.slice(skip || 0, limit ? (skip || 0) + limit : undefined);
  },

  async filter(filter = {}, order, limit, skip = 0) {
    if (typeof order === 'number') {
      skip = limit || 0;
      limit = order;
      order = undefined;
    }
    const db = loadDb();
    const records = getEntityStore(db, entityName).filter((record) => matchesFilter(record, filter));
    return sortRecords(records, order).slice(skip || 0, limit ? (skip || 0) + limit : undefined);
  },

  async get(id) {
    const db = loadDb();
    const record = getEntityStore(db, entityName).find((item) => String(item.id) === String(id));
    if (!record) throw new Error(`${entityName} local nao encontrado: ${id}`);
    return record;
  },

  async create(data = {}) {
    assertLocalMutationAllowed(entityName, 'criar');
    const db = loadDb();
    const records = getEntityStore(db, entityName);
    const payload = stampRecordContext(entityName, data);
    const record = {
      ...payload,
      id: payload.id || makeId(entityName.toLowerCase()),
      created_date: payload.created_date || now(),
      updated_date: now(),
    };
    records.unshift(record);
    saveDb(db);
    notify(entityName, 'create', record);
    auditLocalMutation(entityName, 'Criacao', { after: record, recordId: record.id });
    return record;
  },

  async update(id, data = {}) {
    assertLocalMutationAllowed(entityName, 'editar', id);
    const db = loadDb();
    const records = getEntityStore(db, entityName);
    const index = records.findIndex((item) => String(item.id) === String(id));
    if (index < 0) throw new Error(`${entityName} local nao encontrado: ${id}`);
    const before = { ...records[index] };
    const payload = stampRecordContext(entityName, data);
    records[index] = {
      ...records[index],
      ...payload,
      id: records[index].id,
      updated_date: now(),
    };
    saveDb(db);
    notify(entityName, 'update', records[index]);
    auditLocalMutation(entityName, 'Atualizacao', { before, after: records[index], recordId: records[index].id });
    return records[index];
  },

  async delete(id) {
    assertLocalMutationAllowed(entityName, 'excluir', id);
    const db = loadDb();
    const records = getEntityStore(db, entityName);
    const index = records.findIndex((item) => String(item.id) === String(id));
    markRecordDeletedLocally(entityName, id);
    if (index < 0) return { success: true };
    const [removed] = records.splice(index, 1);
    saveDb(db);
    notify(entityName, 'delete', removed);
    auditLocalMutation(entityName, 'Exclusao', { before: removed, recordId: removed?.id || id });
    return { success: true };
  },

  async bulkCreate(items = []) {
    const created = [];
    for (const item of items) {
      created.push(await this.create(item));
    }
    return created;
  },

  async schema() {
    const db = loadDb();
    const sample = getEntityStore(db, entityName)[0] || {};
    const properties = Object.fromEntries(
      ['id', 'created_date', 'updated_date', 'empresa_id', 'group_id', ...Object.keys(sample)].map((key) => [key, { type: 'string' }])
    );
    return { properties };
  },

  subscribe(listener) {
    if (!listeners.has(entityName)) listeners.set(entityName, new Set());
    listeners.get(entityName).add(listener);
    return () => listeners.get(entityName)?.delete(listener);
  },
});

export const entities = new Proxy({}, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (!target[prop]) target[prop] = createEntityApi(prop);
    return target[prop];
  },
});