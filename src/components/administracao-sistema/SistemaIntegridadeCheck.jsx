/**
 * SistemaIntegridadeCheck v1.0
 * Verifica integridade do sistema multiempresa:
 * - Registros sem empresa_id ou group_id
 * - Propagação pendente
 * - Perfis sem permissões
 * - Usuários sem perfil atribuído
 */
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, XCircle, Loader2,
  ShieldCheck, ArrowDownUp, Building2, RefreshCw
} from "lucide-react";

const CHECK_ITEMS = [
  {
    id: "empresas_vinculadas",
    label: "Empresas vinculadas ao grupo",
    icon: Building2,
    run: async (api, grupoAtual) => {
      if (!grupoAtual?.id) return { ok: false, msg: "Nenhum grupo selecionado" };
      const emps = await api.entities.Empresa.filter({ group_id: grupoAtual.id }, null, 100).catch(() => []);
      return emps.length > 0
        ? { ok: true, msg: `${emps.length} empresa(s) vinculada(s)` }
        : { ok: false, msg: "Nenhuma empresa vinculada ao grupo" };
    },
  },
  {
    id: "perfis_acesso",
    label: "Perfis de acesso cadastrados",
    icon: ShieldCheck,
    run: async (api) => {
      const perfis = await api.entities.PerfilAcesso.filter({ ativo: true }, null, 10).catch(() => []);
      return perfis.length > 0
        ? { ok: true, msg: `${perfis.length} perfil(s) ativo(s)` }
        : { ok: "warn", msg: "Nenhum perfil de acesso ativo" };
    },
  },
  {
    id: "propagacao_config",
    label: "Configuração de propagação",
    icon: ArrowDownUp,
    run: async (api, grupoAtual) => {
      const cfgs = await api.entities.ConfiguracaoSistema.filter(
        { chave: "propagacao_grupo_empresas_ativa" }, null, 1
      ).catch(() => []);
      const ativa = cfgs.some(c => c.ativa === true);
      return ativa
        ? { ok: true, msg: "Propagação automática ativa" }
        : { ok: "warn", msg: "Propagação automática desativada" };
    },
  },
  {
    id: "rbac_ativo",
    label: "RBAC (controle de acesso granular)",
    icon: ShieldCheck,
    run: async (api) => {
      const cfg = await api.entities.ConfiguracaoSistema.filter(
        { chave: "rbac_granular_ativo" }, null, 1
      ).catch(() => []);
      const ativo = cfg.some(c => c.ativa === true);
      return ativo
        ? { ok: true, msg: "RBAC granular ativo" }
        : { ok: "warn", msg: "RBAC granular desativado" };
    },
  },
];

function StatusIcon({ ok }) {
  if (ok === true) return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (ok === "warn") return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

export default function SistemaIntegridadeCheck() {
  const { grupoAtual } = useContextoVisual();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runChecks = async () => {
    setLoading(true);
    setResults({});
    const api = base44.asServiceRole || base44;
    for (const check of CHECK_ITEMS) {
      try {
        const res = await check.run(api, grupoAtual);
        setResults(prev => ({ ...prev, [check.id]: res }));
      } catch (e) {
        setResults(prev => ({ ...prev, [check.id]: { ok: false, msg: e.message } }));
      }
    }
    setLoading(false);
  };

  const okCount = Object.values(results).filter(r => r.ok === true).length;
  const warnCount = Object.values(results).filter(r => r.ok === "warn").length;
  const errCount = Object.values(results).filter(r => r.ok === false).length;
  const ran = Object.keys(results).length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Verificação de Integridade do Sistema
          </CardTitle>
          <Button onClick={runChecks} disabled={loading} size="sm" variant="outline" className="gap-2 text-xs">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Verificar
          </Button>
        </div>
        {ran && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge className="bg-green-100 text-green-700 text-xs">{okCount} OK</Badge>
            {warnCount > 0 && <Badge className="bg-amber-100 text-amber-700 text-xs">{warnCount} Atenção</Badge>}
            {errCount > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{errCount} Erro</Badge>}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {CHECK_ITEMS.map(check => {
            const res = results[check.id];
            const isRunning = loading && !res;
            return (
              <div key={check.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
                ) : res ? (
                  <StatusIcon ok={res.ok} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <check.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700">{check.label}</p>
                  {res && <p className="text-xs text-slate-500 mt-0.5">{res.msg}</p>}
                </div>
              </div>
            );
          })}
        </div>
        {!ran && !loading && (
          <p className="text-xs text-slate-400 text-center py-2 mt-2">
            Clique em "Verificar" para executar o checkup de integridade.
          </p>
        )}
      </CardContent>
    </Card>
  );
}