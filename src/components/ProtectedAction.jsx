import React, { useState } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Cache global leve para decisões do entityGuard (TTL: 120s) + dedupe
const __guardCache = (typeof window !== 'undefined' ? (window.__entityGuardCache || (window.__entityGuardCache = new Map())) : new Map());
const __guardInflight = (typeof window !== 'undefined' ? (window.__entityGuardInflight || (window.__entityGuardInflight = new Map())) : new Map());
const __guardLastAt = (typeof window !== 'undefined' ? (window.__entityGuardLastAt || (window.__entityGuardLastAt = new Map())) : new Map());
const GUARD_TTL_MS = 300_000; // 5 min
const MIN_GAP_MS = 1200; // throttle backend guard per key

function getGuardKey(module, section, action, empresaId, groupId) {
  return `${module || '-'}|${section || '-'}|${action || '-'}|${empresaId || '-'}|${groupId || '-'}`;
}

// ProtectedAction v2 - suporta modos: "modal" (padrão), "disable" e "hide" + auditoria opcional
export function ProtectedAction({
  children,
  module,
  section = null,
  action = "editar",
  fallback = null,
  mode = "disable", // "modal" | "disable" | "hide"
  auditDenied = true,
  auditMetadata = null,
}) {
  const { hasPermission, isLoading } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [open, setOpen] = useState(false);
  const [allowedFinal, setAllowedFinal] = useState(null);

  React.useEffect(() => {
    if (isLoading) return;

    const key = getGuardKey(module, section, action, empresaAtual?.id, grupoAtual?.id);
    const now = Date.now();

    // 1) Cache hit recente → aplica e sai
    const cached = __guardCache.get(key);
    if (cached && (now - cached.ts < GUARD_TTL_MS)) {
      setAllowedFinal(Boolean(cached.allowed) && hasPermission(module, section, action));
      return;
    }

    // 2) Avaliação local imediata
    const localAllowed = hasPermission(module, section, action);
    setAllowedFinal(localAllowed);
    // Se local já permite, não chama backend (evita 429 em massa)
    if (localAllowed) return;

    // 3) Deduplica chamadas concorrentes por chave
    if (__guardInflight.has(key)) {
      __guardInflight.get(key).then((res) => {
        const allowed = Boolean(res?.data?.allowed) && hasPermission(module, section, action);
        __guardCache.set(key, { allowed: res?.data?.allowed === true, ts: Date.now() });
        setAllowedFinal(allowed);
      }).catch(() => {/* mantém valor otimista */});
      return;
    }

    const lastAt = __guardLastAt.get(key) || 0;
    if (now - lastAt < MIN_GAP_MS) {
      // pula chamada backend; mantém valor otimista e cache atual
      return;
    }
    __guardLastAt.set(key, now);

    const p = base44.functions.invoke('entityGuard', {
      module,
      section,
      action,
      empresa_id: empresaAtual?.id || null,
      group_id: grupoAtual?.id || null,
    });
    __guardInflight.set(key, p);

    p.then(({ data }) => {
      const backendAllowed = data?.allowed === true;
      __guardCache.set(key, { allowed: backendAllowed, ts: Date.now() });
      setAllowedFinal(backendAllowed && hasPermission(module, section, action));
    }).catch((err) => {
      const status = err?.response?.status || err?.status;
      // Em 429 ou falha, mantemos valor otimista local para não travar botões
      if (status === 429) {
        setAllowedFinal(hasPermission(module, section, action));
      } else {
        setAllowedFinal(hasPermission(module, section, action));
      }
    }).finally(() => {
      __guardInflight.delete(key);
    });
  }, [isLoading, module, section, action, empresaAtual?.id, grupoAtual?.id]);

  if (isLoading || allowedFinal === null) return <div className="contents" data-pa-loading />;

  const allowed = hasPermission(module, section, action);

  if (!allowedFinal) {
    // Auditoria opcional de tentativa bloqueada (não bloqueia UI se falhar)
    if (auditDenied) {
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: "Bloqueio",
          modulo: module,
          entidade: section || "-",
          descricao: `Ação negada: ${module}/${section || "-"}/${action}`,
          dados_novos: {
            ...(auditMetadata || {}),
            contexto: contexto || 'empresa',
            group_id: grupoAtual?.id || null,
            page: typeof window !== 'undefined' ? window?.location?.pathname : undefined,
            url: typeof window !== 'undefined' ? window?.location?.href : undefined,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            headers_snapshot: {
              'x-company-id': empresaAtual?.id || null,
              'x-tenant-id': (contexto === 'grupo' ? grupoAtual?.id : empresaAtual?.id) || null,
              'x-scope': contexto || 'empresa',
            },
          },
        });
      } catch (e) { console.error('[components] catch:', e); }
    }

    if (mode === "hide") {
      return null;
    }

    if (fallback) return fallback;

    if (mode === "disable") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full h-full opacity-50 pointer-events-none select-none" aria-disabled="true">
              {children ? (
                children
              ) : (
                <Button variant="ghost" size="sm" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Sem permissão
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>Sem permissão • ação auditada</TooltipContent>
        </Tooltip>
      );
    }

    const handleOpen = (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      e?.stopPropagation?.();
      setOpen(true);
    };

    return (
      <>
        <div
          className="w-full h-full opacity-60 cursor-not-allowed select-none"
          onClick={handleOpen}
          role="button"
          aria-disabled="true"
          title="Sem permissão"
        >
          {children ? (
            children
          ) : (
            <Button variant="ghost" size="sm" onClick={handleOpen}>
              <Lock className="w-4 h-4 mr-2" />
              Sem permissão
            </Button>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Permissão negada</DialogTitle>
              <DialogDescription>
                Você não possui permissão para executar esta ação.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Módulo:</strong> {module}</p>
              {section && <p><strong>Seção:</strong> {section}</p>}
              <p><strong>Ação:</strong> {action}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Entendi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

export default ProtectedAction;