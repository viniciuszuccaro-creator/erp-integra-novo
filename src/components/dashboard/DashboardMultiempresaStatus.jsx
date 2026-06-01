import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import {
  Building2, ArrowDownUp, CheckCircle2, AlertCircle,
  TrendingUp, RefreshCw, Zap, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * DashboardMultiempresaStatus v2 — Widget compacto de status multiempresa.
 * Mostra: grupo, empresas ativas, propagações 24h, ops, erros, score de integridade.
 */
export default function DashboardMultiempresaStatus() {
  const { grupoAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();

  const { data: stats = null, isFetching, refetch } = useQuery({
    queryKey: ["multiempresa-status-v2", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return null;
      const since = Date.now() - 24 * 60 * 60 * 1000;

      const [logs, empresas] = await Promise.allSettled([
        base44.entities.AuditLog.filter({ group_id: grupoAtual.id }, "-data_hora", 100),
        base44.entities.Empresa.filter({ group_id: grupoAtual.id }, "-created_date", 50),
      ]);

      const allLogs   = logs.status    === 'fulfilled' ? (logs.value    || []) : [];
      const allEmps   = empresas.status === 'fulfilled' ? (empresas.value || []) : [];

      const recent = allLogs.filter(l =>
        new Date(l?.data_hora || l?.created_date || 0).getTime() >= since
      );

      const propagacoes = recent.filter(l => /propag|sincroniz|syncBidirect/i.test(l?.descricao || '')).length;
      const erros       = recent.filter(l => /erro|error|failed/i.test(l?.descricao || '')).length;
      const operacoes   = recent.length;
      const ativas      = allEmps.filter(e => e.status === 'Ativa' || !e.status).length;
      const inativas    = allEmps.length - ativas;

      // Score de integridade (0-100)
      const maxScore = 100;
      const deductions = Math.min(erros * 5, 40);
      const integridade = Math.max(0, maxScore - deductions);

      return { propagacoes, erros, operacoes, ativas, inativas, total: allEmps.length, integridade };
    },
    enabled: !!grupoAtual?.id,
    staleTime: 300000,
    refetchInterval: 600000,
  });

  if (!grupoAtual?.id) return null;

  const s = stats;
  const intOk = !s || s.integridade >= 80;

  return (
    <Card className={`w-full border ${intOk ? 'border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50' : 'border-amber-200 bg-amber-50/40'}`}>
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Grupo */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">{grupoAtual.nome_do_grupo}</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Grupo</Badge>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 ml-auto">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-500" />
              <strong className="text-slate-900">{s?.ativas ?? empresasDoGrupo.length}</strong>&nbsp;ativa(s)
              {s?.inativas > 0 && <span className="text-amber-600">/ {s.inativas} inativa(s)</span>}
            </span>

            <span className="text-slate-300">·</span>

            <span className="flex items-center gap-1">
              <ArrowDownUp className="w-3 h-3 text-purple-500" />
              <strong className="text-slate-900">{s?.propagacoes ?? '–'}</strong>&nbsp;propag. 24h
            </span>

            <span className="text-slate-300">·</span>

            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <strong className="text-slate-900">{s?.operacoes ?? '–'}</strong>&nbsp;ops 24h
            </span>

            {/* Score de integridade */}
            {s && (
              <>
                <span className="text-slate-300">·</span>
                <span className={`flex items-center gap-1 font-semibold ${s.integridade >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                  <Zap className="w-3 h-3" />
                  {s.integridade}% íntegro
                </span>
              </>
            )}

            {/* Badge de erros / ok */}
            {s?.erros > 0 ? (
              <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] gap-1">
                <AlertCircle className="w-2.5 h-2.5" />{s.erros} erro(s)
              </Badge>
            ) : (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />OK
              </Badge>
            )}

            <button onClick={() => refetch()} className="p-0.5 rounded hover:bg-slate-100" title="Atualizar">
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}