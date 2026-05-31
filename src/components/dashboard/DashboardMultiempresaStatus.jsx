import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Building2, ArrowDownUp, CheckCircle2, AlertCircle, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * DashboardMultiempresaStatus — Widget compacto de status multiempresa.
 * Mostra: empresas ativas, propagação, usuários, alertas.
 * Apenas exibe quando há grupo configurado.
 */
export default function DashboardMultiempresaStatus() {
  const { grupoAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();

  const { data: auditRecent = [] } = useQuery({
    queryKey: ["multiempresa-status", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return [];
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog.filter(
        { group_id: grupoAtual.id }, "-data_hora", 50
      ).catch(() => []);
      return (logs || []).filter(l =>
        new Date(l?.data_hora || l?.created_date || 0).getTime() >= since
      );
    },
    enabled: !!grupoAtual?.id,
    staleTime: 300000,
    refetchInterval: 600000,
  });

  // Exibe em modo grupo OU quando há grupo configurado (mesmo em empresa específica)
  if (!grupoAtual?.id) return null;

  const empresasAtivas = empresasDoGrupo.filter(e => e.status === "Ativa" || !e.status).length;
  const propagacoes = auditRecent.filter(l => /propag|sincroniz/i.test(l?.descricao || "")).length;
  const erros = auditRecent.filter(l => /erro|error|failed/i.test(l?.descricao || "")).length;
  const operacoes = auditRecent.length;

  return (
    <Card className="w-full border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">{grupoAtual.nome_do_grupo}</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Grupo</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 ml-auto">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-500" />
              <strong className="text-slate-900">{empresasAtivas}</strong>&nbsp;empresa(s)
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <ArrowDownUp className="w-3 h-3 text-purple-500" />
              <strong className="text-slate-900">{propagacoes}</strong>&nbsp;propag. 24h
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <strong className="text-slate-900">{operacoes}</strong>&nbsp;ops 24h
            </span>
            {erros > 0 ? (
              <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1">
                <AlertCircle className="w-2.5 h-2.5" />{erros} erro(s)
              </Badge>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />OK
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}