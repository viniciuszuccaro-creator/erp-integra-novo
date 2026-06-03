/**
 * ConfiguracoesGeraisIndex v4.0
 * Layout limpo em 2 colunas:
 * - Esquerda: ParametrosGeraisPanel (toggles persistentes)
 * - Direita: ConfigGlobal (fiscal, notificações, segurança)
 * Sem SistemaHealthDashboard pesado (movido para AdminKPIBar).
 */
import React, { useState } from "react";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import ParametrosGeraisPanel from "@/components/administracao-sistema/configuracoes-gerais/ParametrosGeraisPanel";
import SistemaIntegridadeCheck from "@/components/administracao-sistema/SistemaIntegridadeCheck";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowDownUp, ShieldCheck, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function AcoesRapidasEtapas() {
  const { grupoAtual } = useContextoVisual();
  const [running, setRunning] = useState(null); // null | 'rbac' | 'configs' | 'propagacao'
  const [done, setDone] = useState({});

  const exec = async (key, fn, label) => {
    setRunning(key);
    try {
      await fn();
      setDone(prev => ({ ...prev, [key]: true }));
      toast.success(`${label} concluído!`);
    } catch (err) {
      toast.error(`Erro: ${err?.message?.slice(0, 80) || label}`);
    } finally {
      setRunning(null);
    }
  };

  const acoes = [
    {
      key: 'propagacao',
      label: 'E1: Propagar Tudo',
      title: 'Inicializar sincronização histórica em todas as entidades (Grupo → Empresas)',
      color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      fn: async () => {
        if (!grupoAtual?.id) throw new Error("Selecione um grupo primeiro");
        return base44.functions.invoke('propagateAllEntities', { group_id: grupoAtual.id });
      },
    },
    {
      key: 'configs',
      label: 'E2: Init Configs',
      title: 'Inicializar ConfiguracaoSistema padrão em ambos contextos (Grupo + Empresa)',
      color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
      fn: () => base44.functions.invoke('initDefaultConfigs', { group_id: grupoAtual?.id }),
    },
    {
      key: 'rbac',
      label: 'E3: Init RBAC',
      title: 'Criar perfis de acesso padrão com RBAC granular por módulo',
      color: 'border-purple-300 text-purple-700 hover:bg-purple-50',
      fn: () => base44.functions.invoke('initializeRBACProfiles', { group_id: grupoAtual?.id }),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
      <span className="text-xs font-semibold text-slate-600 mr-1">⚡ Ações Rápidas:</span>
      {acoes.map(a => (
        <Button
          key={a.key}
          variant="outline"
          size="sm"
          disabled={!!running}
          title={a.title}
          onClick={() => exec(a.key, a.fn, a.label)}
          className={`gap-1.5 text-xs h-7 ${a.color}`}
        >
          {running === a.key
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : done[a.key]
            ? <CheckCircle2 className="w-3 h-3 text-green-600" />
            : <Zap className="w-3 h-3" />
          }
          {a.label}
        </Button>
      ))}
      <Link
        to={createPageUrl("AdministracaoSistema?tab=propagacao")}
        className="text-xs font-medium text-blue-700 hover:text-blue-900 underline ml-auto"
      >
        Propagação completa →
      </Link>
    </div>
  );
}

export default function ConfiguracoesGeraisIndex() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Contexto atual + teste dual */}
      <ContextoConfigBanner />

      {/* Ações rápidas das 5 etapas */}
      <AcoesRapidasEtapas />

      {/* Políticas de herança documentadas */}
      <HerancaConfigNotice />

      {/* Layout: parâmetros + checkup */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
        {/* Parâmetros — 2/3 */}
        <div className="xl:col-span-2">
          <ProtectedSection
            module="Sistema"
            section={["Configurações", "Gerais"]}
            action="visualizar"
            fallback={<div className="p-4 text-sm text-slate-500 bg-slate-50 rounded-lg border">Sem permissão para Configurações Gerais.</div>}
          >
            <ParametrosGeraisPanel />
          </ProtectedSection>
        </div>

        {/* Sidebar: checkup de integridade — 1/3 */}
        <div className="space-y-4">
          <SistemaIntegridadeCheck />
        </div>
      </div>
    </div>
  );
}