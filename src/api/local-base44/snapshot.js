/**
 * Cliente Base44 local — Importação de snapshot Base44 (hidratação inicial)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import {
  safeStorage, USER_KEY, SNAPSHOT_IMPORT_KEY,
  AUTO_IMPORT_EXCLUDED_ENTITIES, AUTO_IMPORT_COMPLETENESS_ENTITIES,
  readDeletedRecords, isRecordDeletedLocally, makeId, now, uniqueByString,
} from './storage';
import { getEntityStore, saveDb } from './store';
import { loadDb, readUser, normalizeLocalUser, ensureLocalTopology } from './topology';
import { entities } from './entityApi';

const mergeSnapshotRecords = (db, entityName, incoming = []) => {
  if (!Array.isArray(incoming) || incoming.length === 0) return { created: 0, updated: 0 };
  const records = getEntityStore(db, entityName);
  let created = 0;
  let updated = 0;

  incoming.forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    if (raw.id && isRecordDeletedLocally(entityName, raw.id)) return;
    const record = {
      ...raw,
      id: raw.id || makeId(entityName.toLowerCase()),
      imported_from_base44: true,
      imported_at: raw.imported_at || now(),
      created_date: raw.created_date || now(),
      updated_date: raw.updated_date || raw.created_date || now(),
    };
    const index = records.findIndex((item) => String(item.id) === String(record.id));
    if (index >= 0) {
      records[index] = { ...records[index], ...record, id: records[index].id };
      updated += 1;
    } else {
      records.push(record);
      created += 1;
    }
  });

  return { created, updated };
};

const selectImportedTopology = (db) => {
  const importedGroups = getEntityStore(db, 'GrupoEmpresarial').filter((g) => g.imported_from_base44);
  const importedEmpresas = getEntityStore(db, 'Empresa').filter((e) => e.imported_from_base44);
  return {
    groupId: importedGroups[0]?.id || getEntityStore(db, 'GrupoEmpresarial')[0]?.id || 'local_grupo_cpa',
    empresaId: importedEmpresas[0]?.id || getEntityStore(db, 'Empresa')[0]?.id || 'local_empresa_3z',
    empresaIds: importedEmpresas.map((e) => e.id).filter(Boolean),
    groupIds: importedGroups.map((g) => g.id).filter(Boolean),
  };
};

const isLegacyGroupId = (value, validGroupIds = []) => {
  if (!value) return true;
  const text = String(value);
  if (validGroupIds.includes(text)) return false;
  return text === 'grupo_001' || text.startsWith('local_') || text.startsWith('grupo_');
};

const normalizeSnapshotRecord = (entityName, raw, topology) => {
  const canonicalGroupId = topology.groupId;
  const empresaIds = topology.empresaIds || [];
  const validGroupIds = topology.groupIds?.length ? topology.groupIds : [canonicalGroupId];
  const record = { ...raw };

  if (entityName === 'GrupoEmpresarial') {
    record.group_id = record.id || canonicalGroupId;
    record.grupo_id = record.id || canonicalGroupId;
    record.nome = record.nome || record.nome_do_grupo || record.razao_social_grupo;
    return record;
  }

  if (canonicalGroupId && isLegacyGroupId(record.group_id, validGroupIds)) record.group_id = canonicalGroupId;
  if (canonicalGroupId && isLegacyGroupId(record.grupo_id, validGroupIds)) record.grupo_id = canonicalGroupId;
  if (canonicalGroupId && isLegacyGroupId(record.grupo_empresarial_id, validGroupIds)) record.grupo_empresarial_id = canonicalGroupId;

  if (entityName === 'Empresa') {
    record.group_id = canonicalGroupId;
    record.grupo_id = canonicalGroupId;
    record.grupo_empresarial_id = canonicalGroupId;
  }

  if (entityName === 'PerfilAcesso') {
    record.group_id = canonicalGroupId;
    record.grupo_id = canonicalGroupId;
    record.nome = record.nome || record.nome_perfil;
  }

  if (entityName === 'User') {
    record.group_id = canonicalGroupId;
    record.grupo_id = canonicalGroupId;
    record.grupo_atual_id = canonicalGroupId;
    record.grupo_padrao_id = canonicalGroupId;
    record.contexto_atual = record.contexto_atual || 'grupo';
    record.pode_operar_em_grupo = record.pode_operar_em_grupo ?? true;
    record.pode_ver_todas_empresas = record.pode_ver_todas_empresas ?? true;
    const atuais = Array.isArray(record.empresas_vinculadas) ? record.empresas_vinculadas : [];
    record.empresas_vinculadas = uniqueByString([
      ...atuais.map((v) => (typeof v === 'string' ? v : v?.empresa_id || v?.id)),
      ...empresaIds,
    ]).map((empresa_id) => ({
      ...(atuais.find((v) => v?.empresa_id === empresa_id) || {}),
      empresa_id,
      ativo: true,
    }));
    record.grupos_vinculados = [{
      grupo_id: canonicalGroupId,
      ativo: true,
      nivel_acesso: record.role === 'admin' ? 'Administrador' : 'Operacional',
    }];
    if (!record.empresa_atual_id && empresaIds[0]) record.empresa_atual_id = empresaIds[0];
    if (!record.empresa_padrao_id && empresaIds[0]) record.empresa_padrao_id = empresaIds[0];
  }

  return record;
};

export const hydrateLocalBase44FromSnapshot = async ({ force = false, includeAuditLog = false, sourceUrl = '/base44-local-core-snapshot.json', onlyEntities = null } = {}) => {
  if (typeof window === 'undefined') return { imported: false, reason: 'server' };
  if (import.meta.env?.VITE_LOCAL_ONLY !== 'true') return { imported: false, reason: 'remote-mode' };

  let snapshot;
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const response = await fetch(sourceUrl, { cache: 'no-store', signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) return { imported: false, reason: 'snapshot-not-found' };
    snapshot = await response.json();
  } catch (error) {
    console.warn('[base44-local] Snapshot local indisponivel:', error?.message || error);
    return { imported: false, reason: 'snapshot-error' };
  }

  const snapshotId = snapshot?.exported_at || snapshot?.id || 'snapshot';
  const db = loadDb();
  const completenessEntities = Array.isArray(onlyEntities) && onlyEntities.length
    ? onlyEntities
    : AUTO_IMPORT_COMPLETENESS_ENTITIES;
  const localDbLooksComplete = completenessEntities.every((entityName) => {
    const snapshotCount = Array.isArray(snapshot?.entities?.[entityName]) ? snapshot.entities[entityName].length : 0;
    const dbCount = Array.isArray(db?.[entityName]) ? db[entityName].length : 0;
    const deletedCount = Object.keys(readDeletedRecords()[entityName] || {}).length;
    return !snapshotCount || dbCount + deletedCount >= snapshotCount;
  });
  const importKey = Array.isArray(onlyEntities) && onlyEntities.length
    ? `${SNAPSHOT_IMPORT_KEY}_${onlyEntities.join('_')}`
    : SNAPSHOT_IMPORT_KEY;
  if (!force && safeStorage.getItem(importKey) === snapshotId && localDbLooksComplete) {
    return { imported: false, reason: 'already-imported', snapshotId };
  }

  const snapshotGroups = Array.isArray(snapshot?.entities?.GrupoEmpresarial) ? snapshot.entities.GrupoEmpresarial : [];
  const snapshotEmpresas = Array.isArray(snapshot?.entities?.Empresa) ? snapshot.entities.Empresa : [];
  const snapshotTopology = {
    groupId: snapshotGroups[0]?.id || selectImportedTopology(db).groupId,
    groupIds: snapshotGroups.map((g) => g.id).filter(Boolean),
    empresaId: snapshotEmpresas[0]?.id || selectImportedTopology(db).empresaId,
    empresaIds: snapshotEmpresas.map((e) => e.id).filter(Boolean),
  };
  const summary = {};
  const allowedEntities = Array.isArray(onlyEntities) && onlyEntities.length ? new Set(onlyEntities) : null;
  Object.entries(snapshot?.entities || {}).forEach(([entityName, rows]) => {
    if (allowedEntities && !allowedEntities.has(entityName)) return;
    if (!includeAuditLog && AUTO_IMPORT_EXCLUDED_ENTITIES.has(entityName)) {
      summary[entityName] = {
        skipped: true,
        reason: 'excluded-from-auto-import',
        total: Array.isArray(rows) ? rows.length : 0,
      };
      return;
    }
    const normalizedRows = Array.isArray(rows)
      ? rows.map((row) => normalizeSnapshotRecord(entityName, row, snapshotTopology))
      : rows;
    summary[entityName] = mergeSnapshotRecords(db, entityName, normalizedRows);
  });

  const topology = {
    ...selectImportedTopology(db),
    ...snapshotTopology,
  };
  const currentStoredUser = readUser();
  const currentUser = normalizeLocalUser({
    ...currentStoredUser,
    contexto_atual: 'grupo',
    grupo_atual_id: topology.groupId,
    grupo_padrao_id: topology.groupId,
    empresa_atual_id: topology.empresaId,
    empresa_padrao_id: topology.empresaId,
    empresas_vinculadas: [
      ...(currentStoredUser?.empresas_vinculadas || []),
      ...topology.empresaIds.map((empresa_id) => ({ empresa_id, ativo: true, nivel_acesso: 'Administrador' })),
    ],
    grupos_vinculados: [
      ...(currentStoredUser?.grupos_vinculados || []),
      ...topology.groupIds.map((grupo_id) => ({ grupo_id, ativo: true, nivel_acesso: 'Administrador' })),
    ],
  });
  db.User = [currentUser, ...getEntityStore(db, 'User').filter((u) => u.id !== currentUser.id)];
  saveDb(ensureLocalTopology(db));

  safeStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  safeStorage.setItem('contexto_atual', 'grupo');
  safeStorage.setItem('empresa_atual_id', topology.empresaId);
  safeStorage.setItem('group_atual_id', topology.groupId);
  safeStorage.setItem(importKey, snapshotId);

  try {
    await entities.AuditLog.create({
      usuario: currentUser.email || 'admin@erp-local.test',
      acao: 'Importacao',
      modulo: 'Sistema',
      tipo_auditoria: 'dados',
      entidade: 'Base44Snapshot',
      descricao: 'Snapshot Base44 importado para banco local',
      dados_novos: { snapshotId, summary },
      local: true,
      data_hora: now(),
    });
  } catch {}

  return { imported: true, snapshotId, summary };
};