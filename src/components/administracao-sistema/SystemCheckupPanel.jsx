/**
 * SystemCheckupPanel — Painel de Saúde e Diagnóstico do Sistema
 * Verifica propagação, RBAC, configs e integrações em tempo real
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import {
  CheckCircle2, AlertCircle, XCircle, RefreshCw, ArrowDownUp,
  Shield, Settings, Zap, Database, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CheckItem({ label, status, detail }) {
  const icons = {
    ok: <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />,
    warn: <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
  };
  const colors = {
    ok: "border-green-100 bg-green-50",
    warn: "border-amber-100 bg-amber-50",
    error: "border-red-100 bg-red-50",
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[status] || colors.warn}`}>
      {icons[status] || icons.warn}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {detail && <p className="text-xs text-slate-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function Section({ title, icon: IconComp, children }) {
  const Icon = IconComp;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-slate-900">{title}</span>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

export default function SystemCheckupPanel() {
  const { grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: checkup, isLoading } = useQuery({
    queryKey: ["system-checkup", grupoAtual?.id, empresaAtual?.id, refreshKey],
    queryFn: async () => {
      const result = {
        grupo: null,
        empresas: 0,
        propagacaoAtiva: false,
        rbacAtivo: false,
        auditoriaAtiva: false,
        nfeConfigurada: false,
        totalConfigs: 0,
        totalPerfis: 0,
        errosRecentes: 0,
      };

      // Verifica Grupo
      result.grupo = grupoAtual?.nome_do_grupo || null;
      result.empresas = empresasDoGrupo?.length || 0;

      // Verifica configs
      const configs = await base44.entities.ConfiguracaoSistema
        .filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, null, 200)
        .catch(() => []);
      result.totalConfigs = configs.length;

      const get = (key) => configs.find(c => c.chave === key)?.ativa === true;
      result.propagacaoAtiva = get("propagacao_grupo_empresas_ativa");
      result.rbacAtivo = get("rbac_granular_ativo");
      result.auditoriaAtiva = get("auditoria_completa_ativa");
      result.nfeConfigurada = get("integracao_nfe_ativa");

      // Verifica perfis RBAC
      const perfis = await base44.entities.PerfilAcesso
        .filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, null, 50)
        .catch(() => []);
      result.totalPerfis = perfis.filter(p => p.ativo !== false).length;

      // Erros recentes (24h)
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog
        .filter({}, "-data_hora", 100)
        .catch(() => []);
      result.errosRecentes = logs.filter(l => {
        const t = new Date(l?.data_hora || l?.created_date || 0).getTime();
        return t >= since && /erro|error|failed/i.test(`${l?.descricao} ${l?.mensagem_erro}`);
      }).length;

      return result;
    },
    staleTime: 60000,
    enabled: true,
  });

  const c = checkup;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          Diagnóstico do Sistema
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Section title="Multiempresa & Grupo" icon={Building2}>
            <CheckItem
              label="Grupo empresarial configurado"
              status={c?.grupo ? "ok" : "error"}
              detail={c?.grupo || "Nenhum grupo encontrado — configure em Cadastros Gerais"}
            />
            <CheckItem
              label={`Empresas vinculadas (${c?.empresas || 0})`}
              status={c?.empresas > 0 ? "ok" : "warn"}
              detail={c?.empresas > 0 ? `${c.empresas} empresa(s) ativa(s) no grupo` : "Vincule empresas ao grupo para habilitar propagação"}
            />
            <CheckItem
              label="Propagação Grupo ↔ Empresas"
              status={c?.propagacaoAtiva ? "ok" : "warn"}
              detail={c?.propagacaoAtiva ? "Propagação automática ativa" : "Propagação pausada — ative nas Configurações Gerais"}
            />
          </Section>

          <Section title="Segurança & RBAC" icon={Shield}>
            <CheckItem
              label="Controle de acesso granular (RBAC)"
              status={c?.rbacAtivo ? "ok" : "warn"}
              detail={c?.rbacAtivo ? "RBAC ativo e aplicado em todos os módulos" : "RBAC desativado — recomenda-se ativar"}
            />
            <CheckItem
              label="Auditoria de ações"
              status={c?.auditoriaAtiva ? "ok" : "warn"}
              detail={c?.auditoriaAtiva ? "Todas as ações são registradas no AuditLog" : "Auditoria inativa — ative para rastreabilidade"}
            />
            <CheckItem
              label={`Perfis de acesso (${c?.totalPerfis || 0})`}
              status={c?.totalPerfis > 0 ? "ok" : "warn"}
              detail={c?.totalPerfis > 0 ? `${c.totalPerfis} perfil(s) ativo(s) configurado(s)` : "Nenhum perfil criado — configure em Gestão de Acessos"}
            />
          </Section>

          <Section title="Configurações do Sistema" icon={Settings}>
            <CheckItem
              label={`Parâmetros configurados (${c?.totalConfigs || 0})`}
              status={c?.totalConfigs >= 20 ? "ok" : c?.totalConfigs > 0 ? "warn" : "error"}
              detail={c?.totalConfigs >= 20 ? "Configurações completas" : "Execute 'Inicializar Configs' para criar os padrões"}
            />
            <CheckItem
              label="NF-e configurada"
              status={c?.nfeConfigurada ? "ok" : "warn"}
              detail={c?.nfeConfigurada ? "Emissão de NF-e habilitada" : "NF-e não configurada — configure em Integrações"}
            />
          </Section>

          <Section title="Saúde Operacional" icon={Zap}>
            <CheckItem
              label="Erros nas últimas 24h"
              status={c?.errosRecentes === 0 ? "ok" : c?.errosRecentes < 5 ? "warn" : "error"}
              detail={c?.errosRecentes === 0 ? "Nenhum erro registrado" : `${c.errosRecentes} erro(s) detectado(s) — verifique os logs de auditoria`}
            />
            <CheckItem
              label="Propagação bidirecional"
              status={c?.propagacaoAtiva && c?.empresas > 0 ? "ok" : "warn"}
              detail={
                c?.propagacaoAtiva && c?.empresas > 0
                  ? "Sincronização Grupo ↔ Empresas operacional"
                  : "Configure propagação e vincule empresas ao grupo"
              }
            />
          </Section>
        </div>
      )}

      {/* Resumo geral */}
      {!isLoading && c && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-500">Status geral:</span>
          {[
            { label: "Grupo OK", ok: !!c.grupo },
            { label: "Propagação", ok: c.propagacaoAtiva },
            { label: "RBAC", ok: c.rbacAtivo },
            { label: "Auditoria", ok: c.auditoriaAtiva },
            { label: "Sem erros 24h", ok: c.errosRecentes === 0 },
          ].map(({ label, ok }) => (
            <Badge
              key={label}
              className={ok
                ? "bg-green-50 text-green-700 border-green-200 text-[11px]"
                : "bg-amber-50 text-amber-700 border-amber-200 text-[11px]"}
            >
              {ok ? "✓" : "⚠"} {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}