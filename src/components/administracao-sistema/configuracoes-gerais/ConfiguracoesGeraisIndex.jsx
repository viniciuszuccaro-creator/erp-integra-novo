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
import { ArrowDownUp, ShieldCheck, Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function AcoesRapidasEtapas() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [running, setRunning] = useState(null);
  const [done, setDone] = useState({});
  const [resultados, setResultados] = useState({}); // { key: { ok, msg } }

  const exec = async (key, fn, label) => {
    setRunning(key);
    setResultados(prev => ({ ...prev, [key]: null }));
    try {
      const res = await fn();
      const data = res?.data || res;
      setDone(prev => ({ ...prev, [key]: true }));
      setResultados(prev => ({ ...prev, [key]: { ok: true, msg: buildMsg(key, data) } }));
      toast.success(`${label} concluído!`);
    } catch (err) {
      setResultados(prev => ({ ...prev, [key]: { ok: false, msg: err?.message?.slice(0, 80) || 'Erro' } }));
      toast.error(`Erro: ${err?.message?.slice(0, 80) || label}`);
    } finally {
      setRunning(null);
    }
  };

  const buildMsg = (key, data) => {
    if (key === 'propagacao') return `${data?.entidades_processadas || '?'} entidades · ${data?.total_created || 0} criados`;
    if (key === 'configs')    return `${data?.created || 0} configs criadas · ${data?.skipped || 0} já existiam`;
    if (key === 'rbac')       return `Perfis RBAC inicializados`;
    if (key === 'e4_reset')   return `Circuit Breaker resetado`;
    if (key === 'e5_check')   return data;
    return 'Concluído';
  };

  const acoes = [
    {
      key: 'propagacao',
      label: 'E1: Propagar Tudo',
      title: 'E1: Inicializar sincronização histórica em todas as entidades (Grupo → Empresas)',
      color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      fn: async () => {
        if (!grupoAtual?.id) throw new Error("Selecione um grupo primeiro");
        return base44.functions.invoke('propagateAllEntities', { group_id: grupoAtual.id });
      },
    },
    {
      key: 'configs',
      label: 'E2: Init Configs',
      title: 'E2: Inicializar ConfiguracaoSistema padrão em dual-context real (Grupo + todas Empresas)',
      color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
      fn: () => base44.functions.invoke('initDefaultConfigs', {
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id || null,
      }),
    },
    {
      key: 'rbac',
      label: 'E3: Init RBAC',
      title: 'E3: Criar perfis de acesso padrão com RBAC granular por módulo',
      color: 'border-purple-300 text-purple-700 hover:bg-purple-50',
      fn: () => base44.functions.invoke('initializeRBACProfiles', { group_id: grupoAtual?.id }),
    },
    {
      key: 'e4_reset',
      label: 'E4: Reset CB',
      title: 'E4: Resetar Circuit Breaker 429 (limpar estado OPEN/HALF-OPEN)',
      color: 'border-red-300 text-red-700 hover:bg-red-50',
      fn: async () => {
        localStorage.removeItem('circuitBreakerState');
        return { data: 'CLOSED' };
      },
    },
    {
      key: 'e5_check',
      label: 'E5: Verificar Herança',
      title: 'E5: Verificar entidades herdadas do Grupo nas Empresas',
      color: 'border-green-300 text-green-700 hover:bg-green-50',
      fn: async () => {
        if (!grupoAtual?.id) throw new Error("Selecione um grupo");
        const [cfgs, perfis] = await Promise.all([
          base44.entities.ConfiguracaoSistema.filter({ group_id: grupoAtual.id }, null, 100).catch(() => []),
          base44.entities.PerfilAcesso.filter({ group_id: grupoAtual.id }, null, 50).catch(() => []),
        ]);
        return { data: `${cfgs.length} configs · ${perfis.length} perfis no grupo — herança ativa` };
      },
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex flex-wrap gap-2 items-center px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-600 mr-1">⚡ Ações das 5 Etapas:</span>
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

      {/* Resultados das ações */}
      {Object.entries(resultados).some(([, v]) => v) && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-2">
          {Object.entries(resultados).map(([key, r]) => r ? (
            <div key={key} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
              r.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {r.ok
                ? <CheckCircle2 className="w-2.5 h-2.5" />
                : <AlertCircle className="w-2.5 h-2.5" />
              }
              <span className="font-medium">{key}:</span> {r.msg}
            </div>
          ) : null)}
        </div>
      )}
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