import React from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Card import kept for the access-denied block below

export default function GuardRails({ children, currentPageName }) {
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contexto, isLoading: loadingContexto } = useContextoVisual();
  const [auth, setAuth] = React.useState(false);
  const [booted, setBooted] = React.useState(false);
  const getStoredContextId = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const grupoAtivoId = grupoAtual?.id || user?.grupo_atual_id || user?.grupo_padrao_id || getStoredContextId('group_atual_id');
  const empresaAtivaId = empresaAtual?.id || user?.empresa_atual_id || user?.empresa_padrao_id || getStoredContextId('empresa_atual_id');

  React.useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => {
      if (!mounted) return;
      setAuth(!!ok);
      setBooted(true);
    });
    return () => { mounted = false; };
  }, []);

  // While loading, render children immediately to keep stable DOM anchor for Suspense boundaries.
  // Replacing the DOM tree during async load causes React's removeChild/insertBefore errors.
  if (!booted || loadingContexto || !auth || !user) {
    return <>{children}</>;
  }

  // Validação de contexto (grupo x empresa) — sem trocar estrutura DOM, apenas pass-through
  if (contexto !== 'grupo' && !empresaAtivaId) {
    return <>{children}</>;
  }
  if (contexto === 'grupo' && !grupoAtivoId) {
    return <>{children}</>;
  }

  // Permissão por módulo (Layout já valida, aqui reforçamos)
  const pageToModule = {
    CRM: 'CRM', Comercial: 'Comercial', Estoque: 'Estoque', Compras: 'Compras', Financeiro: 'Financeiro', Fiscal: 'Fiscal', RH: 'RH', Expedicao: 'Expedição'
  };
  const mod = pageToModule[currentPageName];
  if (mod && !hasPermission(mod, null, 'ver')) {
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
        acao: 'Bloqueio',
        modulo: mod,
        entidade: 'Página',
        descricao: `GuardRails bloqueou acesso a ${currentPageName}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
    return (
      <div className="p-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Você não possui permissão para acessar este módulo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}