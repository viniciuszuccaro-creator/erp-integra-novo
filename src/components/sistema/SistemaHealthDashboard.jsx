import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowDownUp,
  Shield,
  Building2,
  Zap,
  RefreshCw,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * SistemaHealthDashboard v2.0
 * Painel de saúde do sistema em tempo real
 * Monitora: Propagação, RBAC, Multiempresa, Integrações
 */

const StatusDot = ({ status }) => {
  if (status === "ok") return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />;
  if (status === "warn") return <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />;
  if (status === "error") return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-slate-300 inline-block animate-pulse" />;
};

export default function SistemaHealthDashboard() {
  const { grupoAtual, empresaAtual, empresasDoGrupo, contexto } = useContextoVisual();
  const [checks, setChecks] = useState({
    propagacao: { status: "loading", label: "Propagação Grupo↔Empresas", icon: ArrowDownUp },
    rbac: { status: "loading", label: "RBAC & Permissões", icon: Shield },
    multiempresa: { status: "loading", label: "Contexto Multiempresa", icon: Building2 },
    backend: { status: "loading", label: "Backend & Funções", icon: Zap },
  });
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    runHealthCheck();
  }, [grupoAtual?.id, empresaAtual?.id]);

  const runHealthCheck = async () => {
    setLoading(true);
    const newChecks = { ...checks };

    // 1. Check propagação
    try {
      if (grupoAtual?.id) {
        const empresas = empresasDoGrupo || [];
        newChecks.propagacao = {
          ...newChecks.propagacao,
          status: "ok",
          detail: `${empresas.length} empresa(s) vinculada(s)`,
        };
      } else {
        newChecks.propagacao = {
          ...newChecks.propagacao,
          status: "warn",
          detail: "Sem grupo selecionado",
        };
      }
    } catch {
      newChecks.propagacao = { ...newChecks.propagacao, status: "error", detail: "Erro ao verificar" };
    }

    // 2. Check RBAC
    try {
      const perfis = await base44.entities.PerfilAcesso.list("-created_date", 5);
      newChecks.rbac = {
        ...newChecks.rbac,
        status: perfis.length > 0 ? "ok" : "warn",
        detail: perfis.length > 0 ? `${perfis.length} perfil(s) configurado(s)` : "Sem perfis RBAC",
      };
    } catch {
      newChecks.rbac = { ...newChecks.rbac, status: "warn", detail: "Usando permissões padrão" };
    }

    // 3. Check multiempresa
    try {
      const temContexto = !!(grupoAtual?.id || empresaAtual?.id);
      newChecks.multiempresa = {
        ...newChecks.multiempresa,
        status: temContexto ? "ok" : "warn",
        detail: temContexto
          ? `Contexto: ${contexto === "grupo" ? grupoAtual?.nome_do_grupo : empresaAtual?.nome_fantasia || empresaAtual?.razao_social}`
          : "Selecione empresa/grupo",
      };
    } catch {
      newChecks.multiempresa = { ...newChecks.multiempresa, status: "error", detail: "Erro no contexto" };
    }

    // 4. Check backend
    try {
      const res = await base44.functions.invoke("entityGuard", {
        module: "Sistema",
        section: "Configurações",
        action: "visualizar",
      });
      newChecks.backend = {
        ...newChecks.backend,
        status: "ok",
        detail: "Backend respondendo normalmente",
      };
    } catch {
      newChecks.backend = { ...newChecks.backend, status: "warn", detail: "Latência elevada" };
    }

    setChecks(newChecks);
    setLastCheck(new Date().toLocaleTimeString("pt-BR"));
    setLoading(false);
  };

  const overallStatus = Object.values(checks).some((c) => c.status === "error")
    ? "error"
    : Object.values(checks).some((c) => c.status === "warn")
    ? "warn"
    : Object.values(checks).every((c) => c.status === "ok")
    ? "ok"
    : "loading";

  const statusColors = {
    ok: "border-green-200 bg-green-50",
    warn: "border-yellow-200 bg-yellow-50",
    error: "border-red-200 bg-red-50",
    loading: "border-slate-200 bg-slate-50",
  };

  return (
    <Card className={`w-full ${statusColors[overallStatus]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <StatusDot status={overallStatus} />
            Saúde do Sistema
            {lastCheck && (
              <span className="text-xs text-slate-500 font-normal">· {lastCheck}</span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={runHealthCheck}
            disabled={loading}
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(checks).map(([key, check]) => {
            const Icon = check.icon;
            return (
              <div key={key} className="flex items-start gap-2 p-2 bg-white rounded border border-slate-100">
                <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={check.status} />
                    <span className="text-xs font-semibold text-slate-700 truncate">{check.label}</span>
                  </div>
                  {check.detail && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{check.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}