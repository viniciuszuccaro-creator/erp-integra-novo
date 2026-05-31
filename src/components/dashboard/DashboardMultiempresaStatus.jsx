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

  if (!grupoAtual?.id || !estaNoGrupo) return null;

  const empresasAtivas = empresasDoGrupo.filter(e => e.status === "Ativa" || !e.status).length;
  const propagacoes = auditRecent.filter(l => /propag/i.test(l?.descricao || "")).length;
  const erros = auditRecent.filter(l => /erro|error/i.test(l?.descricao || "")).length;
  const operacoes = auditRecent.length;

  return (
    <Card className="w-full border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">{grupoAtual.nome_do_grupo}</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Grupo</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 ml-auto">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span><strong className="text-slate-900">{empresasAtivas}</strong> empresas ativas</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-purple-500" />
              <span><strong className="text-slate-900">{propagacoes}</strong> propagações (24h)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span><strong className="text-slate-900">{operacoes}</strong> operações (24h)</span>
            </div>

            {erros > 0 ? (
              <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {erros} erro(s)
              </Badge>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sistema OK
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}