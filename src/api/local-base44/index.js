/**
 * Cliente Base44 local — Assembly do cliente (auth, users, analytics, appLogs)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { safeStorage, STORAGE_KEY, USER_KEY, DELETED_RECORDS_KEY, now } from './storage';
import { loadDb, readUser, writeUser } from './topology';
import { entities } from './entityApi';
import { functions, Core } from './functionsApi';

export const localBase44 = {
  entities,
  functions,
  integrations: { Core },
  appLogs: {
    async logUserInApp(pageName) {
      try {
        await entities.AuditLog.create({
          usuario: readUser()?.email || 'admin@erp-local.test',
          acao: 'Navegacao',
          modulo: pageName || 'Sistema',
          tipo_auditoria: 'ui',
          entidade: 'AppLog',
          descricao: `Acesso local a ${pageName || 'pagina'}`,
          data_hora: now(),
          local: true,
        });
      } catch {}
      return { success: true, local: true };
    },
  },
  analytics: {
    async track(event = {}) {
      try {
        await entities.AuditLog.create({
          usuario: readUser()?.email || 'admin@erp-local.test',
          acao: 'Analytics',
          modulo: 'Sistema',
          tipo_auditoria: 'ui',
          entidade: 'Analytics',
          descricao: event?.eventName || event?.name || 'Evento local',
          dados_novos: event,
          data_hora: now(),
          local: true,
        });
      } catch {}
      return { success: true, local: true };
    },
  },
  users: {
    async inviteUser(email, role = 'user') {
      const user = await entities.User.create({
        email,
        role,
        full_name: email,
        disabled: false,
        is_verified: false,
        convite_local: true,
        group_id: readUser()?.grupo_atual_id || 'local_grupo_cpa',
      });
      return { success: true, local: true, user };
    },
  },
  auth: {
    async me() {
      return readUser();
    },
    async isAuthenticated() {
      return true;
    },
    async updateMe(updates = {}) {
      const user = writeUser(updates);
      try {
        if (updates.contexto_atual) safeStorage.setItem('contexto_atual', updates.contexto_atual);
        if (updates.empresa_atual_id) safeStorage.setItem('empresa_atual_id', updates.empresa_atual_id);
        if (updates.grupo_atual_id) safeStorage.setItem('group_atual_id', updates.grupo_atual_id);
      } catch {}
      return user;
    },
    logout() {
      return true;
    },
    redirectToLogin() {
      return true;
    },
  },
  __local: {
    reset() {
      safeStorage.removeItem(STORAGE_KEY);
      safeStorage.removeItem(USER_KEY);
      safeStorage.removeItem(DELETED_RECORDS_KEY);
      return loadDb();
    },
    export() {
      return loadDb();
    },
  },
};

localBase44.asServiceRole = localBase44;