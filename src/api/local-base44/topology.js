/**
 * Cliente Base44 local — Topologia multiempresa (usuário local, seeds, contexto)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { safeStorage, STORAGE_KEY, USER_KEY, isRecordDeletedLocally, uniqueByString, now } from './storage';
import { getEntityStore, saveDb } from './store';

export const localApiUser = {
  id: 'local-admin-user',
  email: 'admin@erp-local.test',
  full_name: 'Administrador Local',
  role: 'admin',
  disabled: false,
  is_verified: true,
  created_date: now(),
  updated_date: now(),
  contexto_atual: 'empresa',
  empresa_atual_id: 'local_empresa_3z',
  empresa_padrao_id: 'local_empresa_3z',
  grupo_atual_id: 'local_grupo_cpa',
  grupo_padrao_id: 'local_grupo_cpa',
  pode_operar_em_grupo: true,
  pode_ver_todas_empresas: true,
  empresas_vinculadas: [
    { empresa_id: 'local_empresa_3z', ativo: true },
    { empresa_id: 'local_empresa_cpa', ativo: true },
  ],
  grupos_vinculados: [{ grupo_id: 'local_grupo_cpa', ativo: true }],
};

export const seedRecords = () => {
  const groupId = 'local_grupo_cpa';
  const empresa1Id = 'local_empresa_3z';
  const empresa2Id = 'local_empresa_cpa';

  const configKeys = [
    'ia_leitura_projetos',
    'ia_preditiva_vendas',
    'ia_conciliacao',
    'ia_producao',
    'ia_recomendacao_produtos',
    'ia_anomalia_financeira',
    'cc_ia_preditiva_vendas',
    'cc_ia_conciliacao',
    'cc_ia_producao',
    'cc_ia_leitura_projetos',
    'cc_auditoria_automatica',
    'cc_ia_seguranca_ativa',
    'cc_exigir_mfa',
    'cc_bloquear_ips_suspeitos',
    'cc_backup_automatico',
    'cc_criptografia_dados',
    'seg_login_duplo_fator',
    'seg_bloquear_ip_suspeito',
    'seg_sessao_unica',
    'seg_auditoria_detalhada',
    'seg_notif_novo_dispositivo',
    'seg_lgpd_anonimizacao',
  ];

  return {
    GrupoEmpresarial: [
      {
        id: groupId,
        nome_do_grupo: 'GRUPO CPA LOCAL',
        nome: 'GRUPO CPA LOCAL',
        status: 'Ativo',
        created_date: now(),
        updated_date: now(),
      },
    ],
    Empresa: [
      {
        id: empresa1Id,
        nome_fantasia: '3Z LTDA LOCAL',
        razao_social: '3Z LTDA LOCAL',
        cnpj: '00.000.000/0001-01',
        tipo: 'Matriz',
        status: 'Ativa',
        group_id: groupId,
        grupo_id: groupId,
        grupo_empresarial_id: groupId,
        created_date: now(),
        updated_date: now(),
      },
      {
        id: empresa2Id,
        nome_fantasia: 'CPA FERRO E ACO LOCAL',
        razao_social: 'CPA FERRO E ACO LOCAL',
        cnpj: '00.000.000/0002-92',
        tipo: 'Filial',
        status: 'Ativa',
        group_id: groupId,
        grupo_id: groupId,
        grupo_empresarial_id: groupId,
        created_date: now(),
        updated_date: now(),
      },
    ],
    User: [
      {
        ...localApiUser,
        empresa_atual_id: empresa1Id,
        empresa_padrao_id: empresa1Id,
        grupo_atual_id: groupId,
        grupo_padrao_id: groupId,
        empresas_vinculadas: [
          { empresa_id: empresa1Id, ativo: true },
          { empresa_id: empresa2Id, ativo: true },
        ],
        grupos_vinculados: [{ grupo_id: groupId, ativo: true }],
      },
    ],
    PerfilAcesso: [
      {
        id: 'local_perfil_admin',
        nome: 'Administrador Local',
        ativo: true,
        permissoes: {},
        group_id: groupId,
        created_date: now(),
        updated_date: now(),
      },
    ],
    ConfiguracaoSistema: configKeys.map((chave) => ({
      id: `local_config_${chave}`,
      chave,
      categoria: chave.startsWith('seg_') || chave.includes('seguranca') || chave.includes('mfa') ? 'Seguranca' : 'Sistema',
      ativa: true,
      group_id: groupId,
      empresa_id: null,
      created_date: now(),
      updated_date: now(),
    })),
    AuditLog: [],
    Notificacao: [],
    IAConfig: [
      {
        id: 'local_ia_config_sistema',
        modulo: 'Sistema',
        funcionalidade: 'IA Local',
        modelo_base: 'local-simulado',
        limite_tokens: 1000,
        ativo: true,
        group_id: groupId,
        created_date: now(),
        updated_date: now(),
      },
    ],
  };
};

const ensureRecord = (db, entityName, id, factory) => {
  const records = getEntityStore(db, entityName);
  const index = records.findIndex((item) => String(item.id) === String(id));
  const next = factory();
  if (index >= 0) {
    records[index] = { ...next, ...records[index], id, updated_date: records[index].updated_date || now() };
    return records[index];
  }
  records.push(next);
  return next;
};

export const normalizeLocalUser = (user = {}) => {
  const groupId = 'local_grupo_cpa';
  const empresaIds = ['local_empresa_3z', 'local_empresa_cpa'];
  const existingEmpresas = Array.isArray(user.empresas_vinculadas) ? user.empresas_vinculadas : [];
  const existingGrupos = Array.isArray(user.grupos_vinculados) ? user.grupos_vinculados : [];
  const linkedEmpresaIds = uniqueByString([
    ...empresaIds,
    ...existingEmpresas.map((v) => (typeof v === 'string' ? v : v?.empresa_id || v?.id)),
  ]);
  const linkedGroupIds = uniqueByString([
    groupId,
    ...existingGrupos.map((v) => (typeof v === 'string' ? v : v?.grupo_id || v?.group_id || v?.id)),
  ]);

  return {
    ...localApiUser,
    ...user,
    role: user.role || 'admin',
    contexto_atual: user.contexto_atual || 'empresa',
    empresa_atual_id: user.empresa_atual_id || empresaIds[0],
    empresa_padrao_id: user.empresa_padrao_id || empresaIds[0],
    grupo_atual_id: user.grupo_atual_id || groupId,
    grupo_padrao_id: user.grupo_padrao_id || groupId,
    pode_operar_em_grupo: user.pode_operar_em_grupo ?? true,
    pode_ver_todas_empresas: user.pode_ver_todas_empresas ?? true,
    empresas_vinculadas: linkedEmpresaIds.map((empresaId) => ({
      empresa_id: empresaId,
      ativo: true,
      nivel_acesso: existingEmpresas.find((v) => v?.empresa_id === empresaId)?.nivel_acesso || 'Administrador',
    })),
    grupos_vinculados: linkedGroupIds.map((gid) => ({
      grupo_id: gid,
      ativo: true,
      nivel_acesso: existingGrupos.find((v) => v?.grupo_id === gid || v?.group_id === gid)?.nivel_acesso || 'Administrador',
    })),
  };
};

export const ensureLocalTopology = (db) => {
  const seeded = seedRecords();
  const group = seeded.GrupoEmpresarial[0];
  const empresas = seeded.Empresa;

  const importedGroup =
    (db.GrupoEmpresarial || []).find((item) => item?.id && !String(item.id).startsWith('local_')) ||
    null;
  const importedEmpresas = (db.Empresa || []).filter((item) => item?.id && !String(item.id).startsWith('local_'));

  if (importedGroup) {
    db.GrupoEmpresarial = (db.GrupoEmpresarial || []).filter((item) => String(item?.id) !== String(group.id));
  } else {
    ensureRecord(db, 'GrupoEmpresarial', group.id, () => group);
  }

  if (importedEmpresas.length > 0) {
    const localEmpresaIds = new Set(empresas.map((empresa) => String(empresa.id)));
    db.Empresa = (db.Empresa || []).filter((item) => !localEmpresaIds.has(String(item?.id)));
  } else {
    empresas.forEach((empresa) => ensureRecord(db, 'Empresa', empresa.id, () => empresa));
  }

  const canonicalGroup =
    importedGroup ||
    (db.GrupoEmpresarial || [])[0] ||
    group;
  const canonicalGroupId = canonicalGroup?.id || group.id;
  const canonicalEmpresaIds = (importedEmpresas.length > 0 ? importedEmpresas : (db.Empresa || []))
    .map((empresa) => empresa?.id)
    .filter(Boolean);

  let currentUser = normalizeLocalUser(db.User?.[0] || {});
  if (importedGroup) {
    const currentGroupIsLocal = !currentUser.grupo_atual_id || String(currentUser.grupo_atual_id).startsWith('local_');
    const defaultGroupIsLocal = !currentUser.grupo_padrao_id || String(currentUser.grupo_padrao_id).startsWith('local_');
    currentUser = {
      ...currentUser,
      grupo_atual_id: currentGroupIsLocal ? canonicalGroupId : currentUser.grupo_atual_id,
      grupo_padrao_id: defaultGroupIsLocal ? canonicalGroupId : currentUser.grupo_padrao_id,
      grupos_vinculados: uniqueByString([
        canonicalGroupId,
        ...(currentUser.grupos_vinculados || [])
          .map((v) => v?.grupo_id || v?.group_id || v?.id)
          .filter((id) => id && !String(id).startsWith('local_')),
      ]).map((grupoId) => ({ grupo_id: grupoId, ativo: true, nivel_acesso: 'Administrador' })),
    };
    safeStorage.setItem('group_atual_id', canonicalGroupId);
  }
  if (importedEmpresas.length > 0 && canonicalEmpresaIds.length > 0) {
    const currentEmpresaIsLocal = !currentUser.empresa_atual_id || String(currentUser.empresa_atual_id).startsWith('local_');
    const defaultEmpresaIsLocal = !currentUser.empresa_padrao_id || String(currentUser.empresa_padrao_id).startsWith('local_');
    currentUser = {
      ...currentUser,
      empresa_atual_id: currentEmpresaIsLocal ? canonicalEmpresaIds[0] : currentUser.empresa_atual_id,
      empresa_padrao_id: defaultEmpresaIsLocal ? canonicalEmpresaIds[0] : currentUser.empresa_padrao_id,
      empresas_vinculadas: uniqueByString([
        ...canonicalEmpresaIds,
        ...(currentUser.empresas_vinculadas || [])
          .map((v) => v?.empresa_id || v?.id)
          .filter((id) => id && !String(id).startsWith('local_')),
      ]).map((empresaId) => ({ empresa_id: empresaId, ativo: true, nivel_acesso: 'Administrador' })),
    };
    safeStorage.setItem('empresa_atual_id', currentUser.empresa_atual_id);
  }
  db.User = [currentUser, ...(db.User || []).filter((u) => u.id !== currentUser.id)];

  const perfil = seeded.PerfilAcesso[0];
  if (!isRecordDeletedLocally('PerfilAcesso', perfil.id)) {
    ensureRecord(db, 'PerfilAcesso', perfil.id, () => perfil);
  }

  db.PerfilAcesso = (db.PerfilAcesso || []).map((item) => {
    const hasScope = Boolean(item.group_id || item.grupo_id || item.empresa_id || item.empresa_atual_id);
    const legacyGroup = item.group_id === 'grupo_001' || item.grupo_id === 'grupo_001';
    if (hasScope && !legacyGroup) {
      return {
        ...item,
        nome: item.nome || item.nome_perfil,
        grupo_id: item.grupo_id || item.group_id || canonicalGroupId,
      };
    }
    return {
      ...item,
      nome: item.nome || item.nome_perfil,
      group_id: canonicalGroupId,
      grupo_id: canonicalGroupId,
    };
  });

  return db;
};

export const loadDb = () => {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const db = ensureLocalTopology(JSON.parse(raw));
      saveDb(db);
      return db;
    } catch {}
  }
  const seeded = seedRecords();
  saveDb(seeded);
  try {
    safeStorage.setItem('contexto_atual', 'empresa');
    safeStorage.setItem('empresa_atual_id', seeded.Empresa[0].id);
    safeStorage.setItem('group_atual_id', seeded.GrupoEmpresarial[0].id);
  } catch {}
  return seeded;
};

export const readUser = () => {
  const raw = safeStorage.getItem(USER_KEY);
  if (raw) {
    try {
      const user = normalizeLocalUser(JSON.parse(raw));
      safeStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {}
  }
  const db = loadDb();
  return normalizeLocalUser(db.User?.[0] || {});
};

export const writeUser = (updates) => {
  const user = { ...readUser(), ...updates, updated_date: now() };
  safeStorage.setItem(USER_KEY, JSON.stringify(user));
  const db = loadDb();
  db.User = [user, ...(db.User || []).filter((u) => u.id !== user.id)];
  saveDb(db);
  return user;
};