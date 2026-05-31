/**
 * AdministracaoSistema v3.0
 * - Layout limpo, responsivo, sem compressão em telas pequenas
 * - Admin vê tudo; não-admin vai ao Portal do Cliente
 * - Tab ativa sincronizada com URL param ?tab=...
 */
import React, { Suspense, lazy } from "react";
import ProtectedSection from "@/components/security/ProtectedSection";
import AdminHeader from "@/components/administracao-sistema/AdminHeader";
import AdminTabs from "@/components/administracao-sistema/AdminTabs";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Loader2 } from "lucide-react";

const PortalCliente = lazy(() => import("./PortalCliente"));

// Mapa completo de alias de URL → aba interna
const TAB_MAP = {
  gerais: "gerais", parametros: "gerais", "parametros-gerais": "gerais", geral: "gerais",
  configuracoes: "gerais", fiscal: "gerais", notificacoes: "gerais", configuração: "gerais",
  integracoes: "integracoes", connectors: "integracoes", apps: "integracoes",
  "apps-externos": "integracoes", integracao: "integracoes", integração: "integracoes",
  nfe: "integracoes", boletos: "integracoes", whatsapp: "integracoes", maps: "integracoes",
  marketplaces: "integracoes",
  acessos: "acessos", usuarios: "acessos", "controle-acesso": "acessos", acesso: "acessos",
  perfis: "acessos", rbac: "acessos", permissoes: "acessos",
  seguranca: "seguranca", governanca: "seguranca", segurança: "seguranca",
  politicas: "seguranca", jwt: "seguranca", mfa: "seguranca", sessoes: "seguranca",
  ia: "ia", tecnologia: "ia", "tecnologia-ia-parametros": "ia",
  apis: "ia", webhooks: "ia", "chatbot-intents": "ia", otimizacao: "ia", modelos: "ia",
  auditoria: "auditoria", logs: "auditoria", trilha: "auditoria", global: "auditoria",
  propagacao: "propagacao", propagação: "propagacao", sincronizacao: "propagacao",
  "grupo-empresas": "propagacao", sync: "propagacao",
};

export default function AdministracaoSistema() {
  const { isAdmin } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const params = new URLSearchParams(window.location.search);
  const rawTab = (params.get("tab") || "gerais").toLowerCase().trim();
  const initialTab = TAB_MAP[rawTab] || "gerais";

  // Não-admins vão ao Portal do Cliente
  if (!isAdmin()) {
    return (
      <div className="w-full h-full">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center w-full h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        }>
          <PortalCliente />
        </Suspense>
      </div>
    );
  }

  return (
    <ProtectedSection module="Sistema" action="visualizar">
      <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header sticky */}
        <AdminHeader />

        {/* Conteúdo principal */}
        <div className="flex-1 w-full overflow-auto">
          <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6">
            <AdminTabs
              initialTab={initialTab}
              isAdmin={isAdmin}
              empresaAtual={empresaAtual}
              grupoAtual={grupoAtual}
            />
          </div>
        </div>
      </div>
    </ProtectedSection>
  );
}