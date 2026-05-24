/**
 * PropagacaoIndex — Aba dedicada à sincronização bidirecional Grupo ↔ Empresas.
 * Inclui painel de controle manual + status em tempo real + automações ativas.
 */
import React, { useState } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowDownUp, ArrowDown, ArrowUp, RefreshCw, CheckCircle2,
  AlertCircle, Building2, Layers, Clock, Activity
} from "lucide-react";
import { toast } from "sonner";
import PropagacaoBidirecionalPanel from "@/components/administracao-sistema/PropagacaoBidirecionalPanel";
import PropagacaoStatusWidget from "@/components/administracao-sistema/PropagacaoStatusWidget";

// Histórico de propagações recentes
function PropagacaoHistorico({ gId, eId }) {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["propagacao-historico", gId, eId],
    queryFn: async () => {
      const items = await base44.entities.AuditLog.filter(
        { entidade: "PropagacaoGrupo" },
        "-data_hora",
        20
      ).catch(() => []);
      return items || [];
    },
    staleTime: 60_000,
    enabled: !!(gId || eId),
  });

  const fmt = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
      });
    } catch { return "—"; }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Histórico Recente de Propagações
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => refetch()}>
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500 py-3 text-center">Nenhuma propagação registrada ainda.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {logs.map((log, i) => {
              const isError = /erro|error|failed/i.test(log?.descricao || "");
              const dados = log?.dados_novos || {};
              return (
                <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs ${
                  isError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                }`}>
                  {isError
                    ? <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    : <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">
                      {log?.descricao || "Propagação executada"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-0.5 text-slate-500">
                      <span>{fmt(log?.data_hora || log?.created_date)}</span>
                      {dados?.direction && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          {dados.direction === "grupo_to_empresas" ? "↓ Grupo→Emp" : "↑ Emp→Grupo"}
                        </Badge>
                      )}
                      {dados?.total_entidades && (
                        <span>{dados.total_entidades} entidades</span>
                      )}
                      {log?.usuario && <span>por {log.usuario}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Resumo das empresas do grupo e seu status de sync
function EmpresasSyncStatus({ gId }) {
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-sync-status", gId],
    queryFn: async () => {
      if (!gId) return [];
      return await base44.entities.Empresa.filter({ group_id: gId }, "-updated_date", 50).catch(() => []);
    },
    enabled: !!gId,
    staleTime: 120_000,
  });

  const { data: syncMaps = [] } = useQuery({
    queryKey: ["sync-maps-count", gId],
    queryFn: async () => {
      if (!gId) return [];
      return await base44.entities.SyncMap.filter({ group_id: gId }, "-last_sync_at", 500).catch(() => []);
    },
    enabled: !!gId,
    staleTime: 120_000,
  });

  if (!gId) return null;

  const countByEmpresa = (eId) => syncMaps.filter(m => m.empresa_id === eId).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Empresas do Grupo ({empresas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {empresas.map((emp) => {
              const cnt = countByEmpresa(emp.id);
              return (
                <div key={emp.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {emp.nome_fantasia || emp.razao_social || "Empresa"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">CNPJ: {emp.cnpj || "—"}</p>
                  <Badge variant="outline" className="text-[9px] mt-1 px-1.5">
                    <Activity className="w-2.5 h-2.5 mr-0.5" />
                    {cnt} sync maps
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PropagacaoIndex() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const gId = grupoAtual?.id;
  const eId = empresaAtual?.id;

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Status em tempo real */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-semibold text-blue-800">Status da Propagação em Tempo Real</span>
          {gId && (
            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 ml-auto">
              Grupo: {grupoAtual?.nome_do_grupo || gId}
            </Badge>
          )}
          {eId && !gId && (
            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 ml-auto">
              Empresa: {empresaAtual?.nome_fantasia || eId}
            </Badge>
          )}
        </div>
        <PropagacaoStatusWidget />
      </div>

      {/* Painel principal de controle */}
      <PropagacaoBidirecionalPanel />

      {/* Grid inferior: histórico + empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PropagacaoHistorico gId={gId} eId={eId} />
        <EmpresasSyncStatus gId={gId} />
      </div>

      {/* Info sobre automações */}
      <Card className="w-full bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            Automações de Propagação Ativas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span><strong>syncGroupCompany</strong> — Disparada em tempo real quando qualquer entidade muda (create/update/delete)</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span><strong>propagateGroupConfigs</strong> — Propagação em lote manual ou agendada para 27+ entidades</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span><strong>Anti-loop</strong> — Janela de 2.5s via SyncMap evita propagação circular infinita</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span><strong>conflictPolicy</strong> — Resolução inteligente de conflitos por estratégia (merge/override/skip)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}