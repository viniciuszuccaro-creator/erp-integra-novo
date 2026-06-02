import React, { useState, useEffect } from "react";
// AdminTabs v3 — 5 abas enxutas (IA absorvida em Segurança & Gov)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Users, Shield, FileText, Plug, ArrowDownUp } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";


// Sub-modules
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import IntegracoesIndex from "@/components/administracao-sistema/IntegracoesIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";
import PropagacaoIndex from "@/components/administracao-sistema/propagacao/PropagacaoIndex";
import CheckupRelatorio from "@/components/sistema/CheckupRelatorio";
import DashboardPropagacaoMonitor from "@/components/administracao-sistema/DashboardPropagacaoMonitor";
import Monitor429RateLimit from "@/components/administracao-sistema/Monitor429RateLimit";


const TAB_DEFS = [
  { value: "checkup",     label: "Status Sistema",        icon: Settings,    perm: "Configurações",     color: "blue" },
  { value: "gerais",      label: "Parâmetros Gerais",     icon: Settings,    perm: "Configurações",     color: "blue" },
  { value: "propagacao",  label: "Propagação Grupo↔Emp",  icon: ArrowDownUp, perm: "Configurações",     color: "blue" },
  { value: "integracoes", label: "Integrações",            icon: Plug,        perm: "Integrações",       color: "blue" },
  { value: "monitor429",  label: "🚨 Rate Limit (429s)",  icon: ArrowDownUp, perm: "Configurações",     color: "blue" },
  { value: "acessos",     label: "Gestão de Acessos",     icon: Users,       perm: "Controle de Acesso", color: "blue" },
  { value: "seguranca",   label: "Segurança, IA & Gov.",  icon: Shield,      perm: "Segurança",         color: "blue" },
  { value: "auditoria",   label: "Auditoria e Logs",      icon: FileText,    perm: "Auditoria",         color: "blue" },
];

export default function AdminTabs({ initialTab, isAdmin, empresaAtual, grupoAtual }) {
  const { hasPermission } = usePermissions();
  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : !!isAdmin;
  const [activeTab, setActiveTab] = useState(initialTab || "gerais");

  // Sync com URL param ao navegar externamente
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Atualiza URL sem recarregar a página
  const handleTabChange = (val) => {
    setActiveTab(val);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      window.history.replaceState({}, "", url.toString());
    } catch (_) {}
  };

  const canAccess = (perm) => isAdminUser || hasPermission('Sistema', perm, 'visualizar');

  const visibleTabs = TAB_DEFS.filter(t => canAccess(t.perm));

  // Garante que o tab ativo seja válido
  const resolvedTab = visibleTabs.find(t => t.value === activeTab)
    ? activeTab
    : (visibleTabs[0]?.value || "gerais");

  const triggerClass = (color) =>
    color === "purple"
      ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
      : color === "amber"
      ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white"
      : "data-[state=active]:bg-blue-600 data-[state=active]:text-white";

  return (
    <Tabs value={resolvedTab} onValueChange={handleTabChange} className="w-full h-full">
      <TabsList className="flex flex-wrap gap-1 h-auto bg-slate-100 p-1 rounded-xl">
        {visibleTabs.map(({ value, label, icon: Icon, color }) => (
          <TabsTrigger
            key={value}
            value={value}
            data-action={`AdminTabs.${value}`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${triggerClass(color)}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}

      </TabsList>

      {/* ── STATUS SISTEMA ── */}
      <TabsContent value="checkup" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Configurações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito ao Status do Sistema.</p>}
        >
          <div className="w-full h-full">
            <CheckupRelatorio />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── PARÂMETROS GERAIS ── */}
      <TabsContent value="gerais" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Configurações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</p>}
        >
          <div className="w-full h-full overflow-auto">
            <ConfiguracoesGeraisIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── INTEGRAÇÕES ── */}
      <TabsContent value="integracoes" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Integrações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</p>}
        >
          <div className="w-full h-full">
            <IntegracoesIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── GESTÃO DE ACESSOS ── */}
      <TabsContent value="acessos" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Controle de Acesso"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</p>}
        >
          <div className="w-full h-full overflow-auto">
            <GestaoAcessosIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── SEGURANÇA & GOVERNANÇA ── */}
      <TabsContent value="seguranca" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Segurança"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Segurança.</p>}
        >
          <div className="w-full h-full">
            <SegurancaGovernancaIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── PROPAGAÇÃO GRUPO ↔ EMPRESAS ── */}
      <TabsContent value="propagacao" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Configurações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Propagação.</p>}
        >
          <div className="w-full h-full overflow-auto space-y-4">
            <PropagacaoIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── AUDITORIA E LOGS ── */}
      <TabsContent value="auditoria" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Auditoria"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Auditoria.</p>}
        >
          <div className="w-full h-full">
            <AuditoriaLogsIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── RATE LIMIT (429s) ── */}
      <TabsContent value="monitor429" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Configurações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito ao Monitoramento.</p>}
        >
          <Monitor429RateLimit />
        </ProtectedSection>
      </TabsContent>

    </Tabs>
  );
}