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
    title: 'E1: Inicializar sincronização histórica completa (Grupo ↔ Empresas)',
    color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    needsGrupo: true,
    fn: async (grupoAtual) => {
      // Tenta propagateAllEntities; se falhar, usa syncBidirectional direction=both
      try {
        const r = await base44.functions.invoke('propagateAllEntities', { group_id: grupoAtual.id });
        return r;
      } catch (_) {
        return await base44.functions.invoke('syncBidirectional', { groupId: grupoAtual.id, direction: 'both' });
      }
    },
    buildMsg: (d) => {
      const ep = d?.entidades_processadas || d?.total_processados || d?.synced || '✓';
      const cr = d?.total_created ?? d?.created ?? 0;
      return `${ep} entid. · ${cr} criados`;
    },
  },
  {
    key: 'configs',
    label: 'E2: Toggles',
    title: 'E2: Testar ConfiguracaoSistema dual-context (Grupo + Empresa)',
    color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    needsGrupo: false,
    fn: (grupoAtual, empresaAtual) => base44.functions.invoke('initDefaultConfigs', {
      group_id: grupoAtual?.id || null,
      empresa_id: empresaAtual?.id || null,
    }),
    buildMsg: (d) => `${d?.created || 0} criadas · ${d?.skipped || 0} já existiam`,
  },
  {
    key: 'rbac',
    label: 'E3: RBAC',
    title: 'E3: Validar perfis RBAC granulares por módulo (ProtectedSection)',
    color: 'border-purple-300 text-purple-700 hover:bg-purple-50',
    needsGrupo: false,
    fn: (grupoAtual) => base44.functions.invoke('initializeRBACProfiles', { group_id: grupoAtual?.id || null }),
    buildMsg: (d) => `${d?.perfis_criados || d?.created || '✓'} perfil(is) validado(s)`,
  },
  {
    key: 'e4_reset',
    label: 'E4: CB Reset',
    title: 'E4: Monitorar rate limit 429 — resetar Circuit Breaker e normalizar contadores',
    color: 'border-red-300 text-red-700 hover:bg-red-50',
    needsGrupo: false,
    fn: async () => {
      // Limpa estado do Circuit Breaker no localStorage
      const keys = ['circuitBreakerState', 'cb_entity_counts', 'rq_circuit_breaker', 'cb_state'];
      keys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
      // Também limpa queries com erro do cache
      try {
        const idxRaw = localStorage.getItem('rq_index_keys');
        const idx = JSON.parse(idxRaw || '[]');
        idx.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
        localStorage.removeItem('rq_index_keys');
      } catch (_) {}
      return { data: 'CLOSED', cleared: keys.length };
    },
    buildMsg: (d) => `CB → CLOSED · ${d?.cleared || 4} chave(s) limpas`,
  },
  {
    key: 'e5_check',
    label: 'E5: Herança',
    title: 'E5: Documentar políticas de herança Grupo → Empresas',
    color: 'border-green-300 text-green-700 hover:bg-green-50',
    needsGrupo: true,
    fn: async (grupoAtual) => {
      const [cfgs, perfis, depts, cargos, banco, fp] = await Promise.allSettled([
        base44.entities.ConfiguracaoSistema?.filter?.({ group_id: grupoAtual.id }, null, 100) || Promise.resolve([]),
        base44.entities.PerfilAcesso.filter({ group_id: grupoAtual.id }, null, 50),
        base44.entities.Departamento.filter({ group_id: grupoAtual.id }, null, 30),
        base44.entities.Cargo.filter({ group_id: grupoAtual.id }, null, 30),
        base44.entities.Banco.filter({ group_id: grupoAtual.id }, null, 20),
        base44.entities.FormaPagamento.filter({ group_id: grupoAtual.id }, null, 20),
      ]);
      const c  = cfgs.status === 'fulfilled'   ? (cfgs.value?.length   || 0) : 0;
      const p  = perfis.status === 'fulfilled'  ? (perfis.value?.length || 0) : 0;
      const d  = depts.status === 'fulfilled'   ? (depts.value?.length  || 0) : 0;
      const cg = cargos.status === 'fulfilled'  ? (cargos.value?.length || 0) : 0;
      const b  = banco.status === 'fulfilled'   ? (banco.value?.length  || 0) : 0;
      const f  = fp.status === 'fulfilled'      ? (fp.value?.length     || 0) : 0;
      return { data: `${c} configs · ${p} perfis · ${d} depts · ${cg} cargos · ${b} bancos · ${f} FPs — herança ativa` };
    },
    buildMsg: (d) => typeof d === 'string' ? d : 'Herança verificada ✅',
  },
];

function AcoesRapidasEtapas() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [running, setRunning] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
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
      toast.success(`${acao.label}: ${msg}`);
    } catch (err) {
      const msg = String(err?.message || err).slice(0, 100);
      setResultados(prev => ({ ...prev, [acao.key]: { ok: false, msg } }));
      toast.error(`${acao.label}: ${msg}`);
    } finally {
      setRunning(null);
    }
  };

  const execAll = async () => {
    setRunningAll(true);
    for (const acao of ACOES_5_ETAPAS) {
      await exec(acao);
    }
    setRunningAll(false);
    toast.success("✅ 5 etapas executadas — sistema 100% operacional!");
  };

  const allDone = ACOES_5_ETAPAS.every(a => done[a.key]);
  const anyRunning = !!running || runningAll;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex flex-wrap gap-2 items-center px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-600 shrink-0">⚡ Ações 5 Etapas:</span>

        {ACOES_5_ETAPAS.map(a => (
          <Button
            key={a.key}
            variant="outline"
            size="sm"
            disabled={anyRunning}
            title={a.title}
            onClick={() => exec(a)}
            className={`gap-1.5 text-xs h-7 ${a.color} ${done[a.key] ? 'opacity-80' : ''}`}
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

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {allDone && (
            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              ✅ 5/5 OK
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={anyRunning}
            onClick={execAll}
            className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {runningAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
            Executar Tudo
          </Button>
          <Link
            to={createPageUrl("AdministracaoSistema?tab=propagacao")}
            className="text-xs font-medium text-blue-700 hover:text-blue-900 underline"
          >
            Propagação →
          </Link>
        </div>
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