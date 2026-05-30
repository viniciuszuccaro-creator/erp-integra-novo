import React from "react";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { logUIIssue } from "@/components/lib/uiAudit";

export default function BootstrapGuard({ children }) {
  const { user, isLoading: loadingUser } = useUser();
  const { empresaAtual, isLoading: loadingCtx } = useContextoVisual();
  const [bootTimeoutReached, setBootTimeoutReached] = React.useState(false);

  const { data: iaConfigs, isLoading: loadingIA } = useQuery({
    queryKey: ["ia-config"],
    queryFn: async () => {
      try {
        return await base44.entities.IAConfig.list();
      } catch (e) {
        logUIIssue({ component: "BootstrapGuard", issue: "Falha ao carregar IAConfig", severity: "error", meta: { error: String(e?.message || e) } });
        return [];
      }
    },
    initialData: [],
  });

  React.useEffect(() => {
    if (!loadingIA && iaConfigs?.length === 0) {
      logUIIssue({ component: "BootstrapGuard", issue: "IAConfig ausente (usando padrões)", severity: "info" });
    }
  }, [loadingIA, iaConfigs?.length]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBootTimeoutReached(true);
      logUIIssue({
        component: "BootstrapGuard",
        issue: "Timeout de inicializacao atingido; liberando interface com dados locais disponiveis",
        severity: "warning",
        meta: { loadingUser, loadingIA, loadingCtx }
      });
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, []);

  // Always render children immediately to keep a stable DOM anchor for Suspense/lazy boundaries.
  // Swapping between a loading div and children causes React removeChild/insertBefore errors.
  return children;
}