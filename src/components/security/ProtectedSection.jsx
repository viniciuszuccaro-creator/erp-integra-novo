import React, { useEffect, useRef, useState } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { Button } from "@/components/ui/button";

const GUARD_TTL_MS = 120_000;

function getGuardCache() {
  if (typeof window === 'undefined') return new Map();
  return window.__entityGuardCache || (window.__entityGuardCache = new Map());
}
function getGuardInflight() {
  if (typeof window === 'undefined') return new Map();
  return window.__entityGuardInflight || (window.__entityGuardInflight = new Map());
}
const getGuardKey = (module, section, action, empresaId, groupId) => `${module || '-'}|${section || '-'}|${action || '-'}|${empresaId || '-'}|${groupId || '-'}`;

export default function ProtectedSection({
  module: modulo,
  section,
  action = "visualizar",
  fallback = null,
  children,
  hideInstead = false,
  disableInstead = false
}) {
  const { isLoading, hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const loggedRef = useRef(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestedAccess, setRequestedAccess] = useState(false);

  // Sempre manter a mesma ordem de hooks entre renders
  const allowed = !isLoading && hasPermission(modulo, section, action);
  const [allowedFinal, setAllowedFinal] = useState(null);
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!modulo) { setAllowedFinal(allowed); return; }

    const __guardCache = getGuardCache();
    const __guardInflight = getGuardInflight();
    const key = getGuardKey(modulo, section, action, empresaAtual?.id, grupoAtual?.id);
    const now = Date.now();
    const cached = __guardCache.get(key);
    if (cached && (now - cached.ts < GUARD_TTL_MS)) {
      setAllowedFinal(Boolean(cached.allowed) && allowed);
      return;
    }

    // Valor otimista para não bloquear UI
    setAllowedFinal(allowed);

    if (__guardInflight.has(key)) {
      __guardInflight.get(key)
        .then(({ data }) => {
          const backendAllowed = data?.allowed === true;
          __guardCache.set(key, { allowed: backendAllowed, ts: Date.now() });
          setAllowedFinal(backendAllowed && allowed);
        })
        .catch(() => {/* mantém otimista */});
      return;
    }

    const p = base44.functions.invoke('entityGuard', {
      module: modulo,
      section,
      action,
      empresa_id: empresaAtual?.id || null,
      group_id: grupoAtual?.id || null,
    });
    __guardInflight.set(key, p);

    p.then(({ data }) => {
      const backendAllowed = data?.allowed === true;
      __guardCache.set(key, { allowed: backendAllowed, ts: Date.now() });
      setAllowedFinal(backendAllowed && allowed);
    }).catch(() => {
      // fallback em 429/erro
      setAllowedFinal(allowed);
    }).finally(() => {
      __guardInflight.delete(key);
    });
  }, [isLoading, allowed, modulo, section, action, empresaAtual?.id, grupoAtual?.id]);

  useEffect(() => {
    if (isLoading) return;
    if (allowedFinal === false && !loggedRef.current) {
      loggedRef.current = true;
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: 'Bloqueio',
          modulo: modulo || 'Sistema',
          tipo_auditoria: 'seguranca',
          entidade: section || 'Seção',
          descricao: `Acesso negado: ${modulo}.${section}.${action}`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
    }
  }, [isLoading, allowedFinal, action, modulo, section, user?.id, empresaAtual?.id]);

  useEffect(() => {
    if (!isLoading && allowedFinal === false) setShowDenied(true);
  }, [isLoading, allowedFinal]);

  if (isLoading || allowedFinal === null) return <div className="contents" data-ps-loading />;
  if (!allowedFinal) {
    if (hideInstead) return fallback || null;
    if (disableInstead) {
      return (
        <div className="opacity-50 pointer-events-none w-full h-full">
          {fallback || children}
        </div>
      );
    }
    // Inline denied banner — sem Dialog/Portal para evitar conflito de fiber tree em lazy contexts
    if (!showDenied) return fallback || null;
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center gap-4 text-center">
        {fallback}
        <div className="max-w-sm w-full bg-white border border-red-100 rounded-xl shadow-sm p-5">
          <p className="font-semibold text-slate-800 mb-1">Permissão negada</p>
          <p className="text-sm text-slate-500 mb-3">
            Você não possui permissão para acessar <strong>{section || modulo || 'esta seção'}</strong>.
          </p>
          {requestedAccess ? (
            <p className="text-xs text-emerald-600">Pedido de acesso enviado para aprovação.</p>
          ) : (
            <Button
              size="sm"
              disabled={requestingAccess}
              onClick={async () => {
                try {
                  setRequestingAccess(true);
                  await base44.functions.invoke('solicitacoesAprovacao', {
                    module: modulo || 'Sistema',
                    section,
                    action,
                    empresa_id: empresaAtual?.id || null,
                    group_id: grupoAtual?.id || null,
                  });
                  setRequestedAccess(true);
                } finally {
                  setRequestingAccess(false);
                }
              }}
            >
              {requestingAccess ? 'Solicitando…' : 'Solicitar acesso'}
            </Button>
          )}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}