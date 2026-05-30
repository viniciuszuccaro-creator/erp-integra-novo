import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Card import kept for the access-denied block below

const pageToModule = {
  CRM: 'CRM', Comercial: 'Comercial', Estoque: 'Estoque', Compras: 'Compras',
  Financeiro: 'Financeiro', Fiscal: 'Fiscal', RH: 'RH', Expedicao: 'Expedição'
};

export default function GuardRails({ children, currentPageName }) {
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contexto, isLoading: loadingContexto } = useContextoVisual();
  const [auth, setAuth] = useState(false);
  const [booted, setBooted] = useState(false);

  const getStoredContextId = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };

  const grupoAtivoId = grupoAtual?.id || user?.grupo_atual_id || user?.grupo_padrao_id || getStoredContextId('group_atual_id');
  const empresaAtivaId = empresaAtual?.id || user?.empresa_atual_id || user?.empresa_padrao_id || getStoredContextId('empresa_atual_id');

  const mod = pageToModule[currentPageName];
  const ready = booted && !loadingContexto && auth && user;
  const contextOk = !ready || (contexto === 'grupo' ? !!grupoAtivoId : !!empresaAtivaId);
  const denied = ready && contextOk && mod && !hasPermission(mod, null, 'ver');

  // All hooks must be called unconditionally before any return
  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => {
      if (!mounted) return;
      setAuth(!!ok);
      setBooted(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (denied && mod) {
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
    }
  }, [denied, mod, currentPageName, user?.id, empresaAtual?.id]);

  // CRITICAL: Always keep children in DOM to avoid React removeChild/insertBefore errors.
  return (
    <div className="relative w-full h-full">
      <div style={{ visibility: denied ? 'hidden' : 'visible' }}>
        {children}
      </div>
      {denied && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/80 z-10">
          <Card className="bg-white">
            <CardHeader><CardTitle>Acesso restrito</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-600">Você não possui permissão para acessar este módulo.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}