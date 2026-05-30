import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Settings, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import MiniMapaNavegacao from "@/components/MiniMapaNavegacao";
import EmpresaSwitcher from "@/components/EmpresaSwitcher";
import AtalhosTecladoInfo from "@/components/sistema/AtalhosTecladoInfo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import AcoesRapidasGlobal from "@/components/AcoesRapidasGlobal";
import NotificationCenter from "@/components/NotificationCenter";

export default function LayoutHeader({
  setPesquisaOpen,
  isOffline,
  empresaAtual,
  contexto,
  integracoesOk,
  hasPermission,
}) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:hidden">
            <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
          </div>

          <div className="hidden lg:block flex-1 max-w-md">
            <MiniMapaNavegacao />
          </div>
        </div>

        <div className="hidden sm:block">
          <EmpresaSwitcher />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPesquisaOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden md:flex items-center gap-2"
            title="Pesquisa Universal (Ctrl+K)"
          >
            <Search className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-500 hidden lg:inline">Ctrl+K</span>
          </button>

          <AtalhosTecladoInfo />
          <LanguageSwitcher />
          <AcoesRapidasGlobal />
          <NotificationCenter />

          <Link to={createPageUrl("ConfiguracoesUsuario")}>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </Link>
        </div>
      </div>

      {/* Banners de status */}
      {isOffline && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
          Modo offline: exibindo dados em cache (última sincronização). Algumas ações podem não estar disponíveis.
        </div>
      )}

      {!empresaAtual?.id && contexto !== "grupo" && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
          Selecione uma empresa para carregar os dados. O acesso está bloqueado sem empresa selecionada.
        </div>
      )}

      {!integracoesOk && hasPermission("Sistema", null, "ver") && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
          Integrações fiscais pendentes nesta empresa.{" "}
          <Link to={createPageUrl("AdministracaoSistema?tab=integracoes")} className="underline">
            Configurar agora
          </Link>
          .
        </div>
      )}
    </header>
  );
}