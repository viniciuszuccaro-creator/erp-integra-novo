/**
 * SistemaStatusBar — Barra de status global do sistema.
 * Mostra: contexto ativo, propagação, RBAC, integrações.
 * Compacta, sempre visível no topo da Administração do Sistema.
 */
import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Building2, Layers, Shield, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function SistemaStatusBar() {
  const { empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();

  const { data: syncCount = 0 } = useQuery({
    queryKey: ["sync-maps-total", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return 0;
      const maps = await base44.entities.SyncMap.filter({ group_id: grupoAtual.id }, undefined, 1).catch(() => []);
      return Array.isArray(maps) ? maps.length : 0;
    },
    enabled: !!grupoAtual?.id,
    staleTime: 120_000,
  });

  const { data: empresasCount = 0 } = useQuery({
    queryKey: ["empresas-count", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return 0;
      const emps = await base44.entities.Empresa.filter({ group_id: grupoAtual.id }, undefined, 500).catch(() => []);
      return Array.isArray(emps) ? emps.length : 0;
    },
    enabled: !!grupoAtual?.id,
    staleTime: 300_000,
  });

  const contextoLabel = estaNoGrupo
    ? (grupoAtual?.nome_do_grupo || "Grupo")
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa");

  const contextoTipo = estaNoGrupo ? "grupo" : "empresa";

  return (
    <div className="w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3 text-white text-xs">
      {/* Contexto */}
      <div className="flex items-center gap-1.5">
        {estaNoGrupo
          ? <Layers className="w-3.5 h-3.5 text-blue-300" />
          : <Building2 className="w-3.5 h-3.5 text-emerald-300" />
        }
        <span className="text-slate-300">Contexto:</span>
        <Badge className={`text-[10px] px-1.5 py-0 h-4 ${estaNoGrupo ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}`}>
          {contextoTipo === "grupo" ? "🏢 " : "🏭 "}{contextoLabel}
        </Badge>
      </div>

      <div className="h-3 w-px bg-slate-600" />

      {/* Empresas no grupo */}
      {grupoAtual?.id && (
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300">{empresasCount} empresa{empresasCount !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Sync Maps */}
      {grupoAtual?.id && (
        <div className="flex items-center gap-1.5">
          {syncCount > 0
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          }
          <span className="text-slate-300">
            {syncCount > 0 ? `${syncCount} sync maps ativos` : "Sem sync maps"}
          </span>
        </div>
      )}

      <div className="h-3 w-px bg-slate-600" />

      {/* RBAC */}
      <div className="flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-purple-300" />
        <span className="text-slate-300">RBAC</span>
        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-600 text-white">Ativo</Badge>
      </div>

      {/* Propagação */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Zap className="w-3.5 h-3.5 text-yellow-300" />
        <span className="text-slate-300">Propagação bidirecional</span>
        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500 text-slate-900">ON</Badge>
      </div>
    </div>
  );
}