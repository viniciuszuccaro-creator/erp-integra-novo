import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

let _cachedUser = null;
async function getUserSafe() {
  try {
    if (_cachedUser) return _cachedUser;
    _cachedUser = await base44.auth.me();
    return _cachedUser;
  } catch (_) {
    return null;
  }
}

function getContextSafe() {
  try {
    const empresa_id = typeof localStorage !== 'undefined' ? localStorage.getItem('empresa_atual_id') : null;
    const group_id = typeof localStorage !== 'undefined' ? localStorage.getItem('group_atual_id') : null;
    return { empresa_id, group_id };
  } catch (_) {
    return {};
  }
}

// Minimal, resilient audit logger (non-blocking) + visual feedback
export function logUIAction({ component, action, status, meta }) {
  // Visual feedback minimal por status
  try {
    if (status === 'start') {
      // noop (evitar ruído)
    } else if (status === 'success' && meta?.toastSuccess) {
      try { toast.success(`${action} concluído`); } catch (e) { console.error('[lib] catch:', e); }
    } else if (status === 'error') {
      try { toast.error(`Falha em ${action}`, { description: meta?.error || '' }); } catch (e) { console.error('[lib] catch:', e); }
    }
  } catch (e) { console.error('[lib] catch:', e); }

  try {
    const descricao = `[${component}] ${action} • ${status}`;
    getUserSafe().then((u) => {
      const ctx = getContextSafe();
      base44.entities?.AuditLog?.create?.({
        usuario: u?.full_name || u?.email || 'Usuário',
        usuario_id: u?.id,
        empresa_id: ctx?.empresa_id || u?.data?.empresa_id || null,
        group_id: ctx?.group_id || u?.data?.group_id || u?.group_id || null,
        acao: "Interação",
        modulo: "Sistema",
        entidade: "UI",
        descricao,
        dados_novos: {
          status,
          action,
          component,
          meta: sanitizeMeta(meta),
          url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      });
    });
  } catch (e) { console.error('[uiAudit] Falha ao registrar logUIAction:', e?.message || e); }
}

export function logUIIssue({ component, issue, severity = "warn", meta }) {
  try {
    const descricao = `[${component}] ISSUE: ${issue}`;
    getUserSafe().then((u) => {
      const ctx = getContextSafe();
      base44.entities?.AuditLog?.create?.({
        usuario: u?.full_name || u?.email || 'Usuário',
        usuario_id: u?.id,
        empresa_id: ctx?.empresa_id || u?.data?.empresa_id || null,
        group_id: ctx?.group_id || u?.data?.group_id || u?.group_id || null,
        acao: "Auditoria",
        modulo: "Sistema",
        entidade: "UI",
        descricao,
        dados_novos: {
          severity,
          issue,
          component,
          meta: sanitizeMeta(meta),
          url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      });
    });
  } catch (e) { console.error('[uiAudit] Falha ao registrar logUIIssue:', e?.message || e); }
}

function sanitizeMeta(meta) {
  try {
    if (!meta) return null;
    const clone = JSON.parse(JSON.stringify(meta));
    return clone;
  } catch (_) {
    return null;
  }
}

// Fase 4: auditoria completa (verbose) por padrão
const AUDIT_VERBOSE = false;

function shouldPersistUIAudit(actionName, baseMeta = {}) {
  const kind = baseMeta?.kind;
  if (kind === 'input' || kind === 'textarea') return false;
  if (!actionName) return false;
  if (String(actionName).includes('.onChange')) return false;
  return true;
}

// CORREÇÃO CRÍTICA: Wrap não-bloqueante para handlers de UI
// Não usa async/await para evitar delays imperceptíveis que interferem na digitação
function uiAuditWrapLegacy(actionName, handler, baseMeta = {}) {
  return function wrapped(...args) {
    // Log assíncrono não-bloqueante (fire-and-forget)
    Promise.resolve().then(() => {
      if (AUDIT_VERBOSE) logUIAction({ component: inferComponent(actionName), action: actionName, status: "start", meta: baseMeta });
    });
    
    try {
      const res = handler ? handler(...args) : undefined;
      
      // Log de sucesso não-bloqueante
      Promise.resolve().then(() => {
        if (AUDIT_VERBOSE) logUIAction({ component: inferComponent(actionName), action: actionName, status: "success", meta: baseMeta });
        if (baseMeta && baseMeta.toastSuccess) {
          try { toast.success(`${actionName} concluído`); } catch (_) { console.error('[lib] catch:', _); }
        }
      });
      
      return res;
    } catch (error) {
      const msg = String(error?.message || error) || 'Erro';
      
      // Log de erro não-bloqueante
      Promise.resolve().then(() => {
        try { toast.error(`Falha: ${actionName}`, { description: msg }); } catch (_) { console.error('[lib] catch:', _); }
        if (AUDIT_VERBOSE) logUIAction({ component: inferComponent(actionName), action: actionName, status: "error", meta: { ...baseMeta, error: msg } });
      });
      
      throw error;
    }
  };
}

export function uiAuditWrap(actionName, handler, baseMeta = {}) {
  return function wrapped(...args) {
    Promise.resolve().then(() => {
      if (AUDIT_VERBOSE) logUIAction({ component: inferComponent(actionName), action: actionName, status: "start", meta: baseMeta });
    });

    const logSuccess = () => {
      if (AUDIT_VERBOSE || shouldPersistUIAudit(actionName, baseMeta)) {
        logUIAction({ component: inferComponent(actionName), action: actionName, status: "success", meta: baseMeta });
      }
      if (baseMeta?.toastSuccess) {
        try { toast.success(baseMeta.successMessage || `${actionName} concluido`); } catch (_) { console.error('[lib] catch:', _); }
      }
    };

    const logError = (error) => {
      const msg = String(error?.message || error) || 'Erro';
      try { toast.error(`Falha: ${actionName}`, { description: msg }); } catch (_) { console.error('[lib] catch:', _); }
      if (AUDIT_VERBOSE || shouldPersistUIAudit(actionName, baseMeta)) {
        logUIAction({ component: inferComponent(actionName), action: actionName, status: "error", meta: { ...baseMeta, error: msg } });
      }
    };

    try {
      const res = handler ? handler(...args) : undefined;

      if (res && typeof res.then === 'function') {
        return res.then((value) => {
          Promise.resolve().then(logSuccess);
          return value;
        }).catch((error) => {
          Promise.resolve().then(() => logError(error));
          throw error;
        });
      }

      Promise.resolve().then(logSuccess);
      return res;
    } catch (error) {
      Promise.resolve().then(() => logError(error));
      throw error;
    }
  };
}

function inferComponent(actionName) {
  if (!actionName) return "UI";
  if (actionName.startsWith("Button")) return "Button";
  if (actionName.startsWith("Input")) return "Input";
  if (actionName.startsWith("Checkbox")) return "Checkbox";
  if (actionName.startsWith("Select")) return "Select";
  if (actionName.startsWith("Switch")) return "Switch";
  if (actionName.startsWith("RadioGroup")) return "RadioGroup";
  return "UI";
}