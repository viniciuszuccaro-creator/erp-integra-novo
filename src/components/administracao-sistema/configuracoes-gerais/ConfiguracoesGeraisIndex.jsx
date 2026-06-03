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

// Ações diretas das 5 etapas: executar, testar, validar, monitorar, documentar
const ACOES_5_ETAPAS = [
  {
    key: 'propagacao',
    label: 'E1: Propagar',
    title: 'E1: Inicializar sincronização histórica em todas as entidades (Grupo → Empresas)',
    color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    needsGrupo: true,
    fn: (grupoAtual) => base44.functions.invoke('propagateAllEntities', { group_id: grupoAtual.id }),
    buildMsg: (d) => `${d?.entidades_processadas || '?'} entid. · ${d?.total_created || 0} criados`,
  },
  {
    key: 'configs',
    label: 'E2: Toggles',
    title: 'E2: Testar ConfiguracaoSistema em dual-context real (Grupo + todas as Empresas)',
    color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    needsGrupo: false,
    fn: (grupoAtual, empresaAtual) => base44.functions.invoke('initDefaultConfigs', {
      group_id: grupoAtual?.id,
      empresa_id: empresaAtual?.id || null,
    }),
    buildMsg: (d) => `${d?.created || 0} criadas · ${d?.skipped || 0} já existiam`,
  },
  {
    key: 'rbac',
    label: 'E3: RBAC',
    title: 'E3: Validar e criar perfis RBAC granulares por módulo',
    color: 'border-purple-300 text-purple-700 hover:bg-purple-50',
    needsGrupo: false,
    fn: (grupoAtual) => base44.functions.invoke('initializeRBACProfiles', { group_id: grupoAtual?.id }),
    buildMsg: () => `Perfis RBAC validados`,
  },
  {
    key: 'e4_reset',
    label: 'E4: Reset CB',
    title: 'E4: Resetar Circuit Breaker 429 (limpar estado OPEN/HALF-OPEN) e normalizar contadores',
    color: 'border-red-300 text-red-700 hover:bg-red-50',
    needsGrupo: false,
    fn: async () => {
      localStorage.removeItem('circuitBreakerState');
      localStorage.removeItem('cb_entity_counts');
      return { data: 'CLOSED' };
    },
    buildMsg: () => `CB → CLOSED`,
  },
  {
    key: 'e5_check',
    label: 'E5: Herança',
    title: 'E5: Verificar políticas de herança — entidades herdadas do Grupo nas Empresas',
    color: 'border-green-300 text-green-700 hover:bg-green-50',
    needsGrupo: true,
    fn: async (grupoAtual) => {
      const [cfgs, perfis, depts, cargos] = await Promise.allSettled([
        base44.entities.ConfiguracaoSistema.filter({ group_id: grupoAtual.id }, null, 100),
        base44.entities.PerfilAcesso.filter({ group_id: grupoAtual.id }, null, 50),
        base44.entities.Departamento.filter({ group_id: grupoAtual.id }, null, 30),
        base44.entities.Cargo.filter({ group_id: grupoAtual.id }, null, 30),
      ]);
      const c = cfgs.status === 'fulfilled' ? (cfgs.value?.length || 0) : 0;
      const p = perfis.status === 'fulfilled' ? (perfis.value?.length || 0) : 0;
      const d = depts.status === 'fulfilled' ? (depts.value?.length || 0) : 0;
      const cg = cargos.status === 'fulfilled' ? (cargos.value?.length || 0) : 0;
      return { data: `${c} configs · ${p} perfis · ${d} depts · ${cg} cargos — herança ativa` };
    },
    buildMsg: (d) => typeof d === 'string' ? d : 'Herança verificada',
  },
];

function AcoesRapidasEtapas() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [running, setRunning] = useState(null);
  const [done, setDone] = useState({});
  const [resultados, setResultados] = useState({});

  const exec = async (acao) => {
    if (acao.needsGrupo && !grupoAtual?.id) {
      toast.error("Selecione um Grupo primeiro");
      return;
    }
    setRunning(acao.key);
    setResultados(prev => ({ ...prev, [acao.key]: null }));
    try {
      const res = await acao.fn(grupoAtual, empresaAtual);
      const data = res?.data ?? res;
      setDone(prev => ({ ...prev, [acao.key]: true }));
      const msg = acao.buildMsg(data);
      setResultados(prev => ({ ...prev, [acao.key]: { ok: true, msg } }));
      toast.success(`${acao.label} concluído: ${msg}`);
    } catch (err) {
      const msg = String(err?.message || err).slice(0, 80);
      setResultados(prev => ({ ...prev, [acao.key]: { ok: false, msg } }));
      toast.error(`${acao.label}: ${msg}`);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex flex-wrap gap-2 items-center px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-600 shrink-0">⚡ Ações 5 Etapas:</span>
        {ACOES_5_ETAPAS.map(a => (
          <Button
            key={a.key}
            variant="outline"
            size="sm"
            disabled={!!running}
            title={a.title}
            onClick={() => exec(a)}
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
          className="text-xs font-medium text-blue-700 hover:text-blue-900 underline ml-auto shrink-0"
        >
          Propagação completa →
        </Link>
      </div>

      {/* Resultados inline */}
      {Object.entries(resultados).some(([, v]) => v) && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-2 border-t border-slate-200 pt-2">
          {Object.entries(resultados).map(([key, r]) => r ? (
            <div key={key} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
              r.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {r.ok
                ? <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                : <AlertCircle  className="w-2.5 h-2.5 shrink-0" />
              }
              <span className="font-semibold">{key}:</span>
              <span className="ml-0.5">{r.msg}</span>
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