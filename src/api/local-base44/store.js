/**
 * Cliente Base44 local — Store central (db em localStorage + listeners de realtime)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { safeStorage, STORAGE_KEY } from './storage';

export const listeners = new Map();

export const notify = (entityName, type, data) => {
  const set = listeners.get(entityName);
  if (!set) return;
  set.forEach((listener) => {
    try {
      listener({ type, data });
    } catch {}
  });
};

export const getEntityStore = (db, entityName) => {
  if (!Array.isArray(db[entityName])) db[entityName] = [];
  return db[entityName];
};

export const saveDb = (db) => {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};