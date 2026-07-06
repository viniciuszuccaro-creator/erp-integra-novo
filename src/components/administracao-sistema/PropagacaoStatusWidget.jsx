/**
 * PropagacaoStatusWidget — Mostra status em tempo real das propagações Grupo↔Empresas.
 * Compacto para uso em barras de status ou dashboards administrativos.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, AlertCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropagacaoStatusWidget() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const gId = grupoAtual?.id;
  const eId = empresaAtual?.id;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["propagacao-status", gId, eId],
    queryFn: async () => {
      const since = Date.now() - 4 * 60 * 60 * 1000; // últimas 4h
      const logs = await base44.entities.AuditLog.filter(
        { entidade: "PropagacaoGrupo" },
        "-data_hora",
        50
      ).catch(() => []);

      const recent = (logs || []).filter(
        (l) => new Date(l?.data_hora || l?.created_date || 0).getTime() >= since
      );
      const erros = recent.filter((l) =>
        /erro|error|failed/i.test(l?.descricao || "")
      );
      const ok = recent.filter((l) =>
        /sucesso|success|ok|conclu/i.test(l?.descricao || "")
      );

      return {
        total: recent.length,
        ok: ok.length,
        erros: erros.length,
        ultima: recent[0]?.data_hora || recent[0]?.created_date || null,
      };
    },
    staleTime: 120_000,
    refetchInterval: 120_000,
    enabled: !!(gId || eId),
  });

  const hasErros = (data?.erros ?? 0) > 0;
  const statusColor = isLoading || isFetching
    ? "bg-slate-50 border-slate-200"
    : hasErros
    ? "bg-red-50 border-red-200"
    : "bg-green-50 border-green-200";

  const formatTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${statusColor}`}>
      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span className="font-medium text-slate-700">Propagação Grupo↔Empresas</span>

      {isLoading || isFetching ? (
        <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
      ) : (
        <>
          <Badge className={`text-[10px] px-1.5 ${hasErros ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {hasErros ? (
              <><AlertCircle className="w-2.5 h-2.5 mr-0.5" />{data?.erros} erro(s)</>
            ) : (
              <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />OK</>
            )}
          </Badge>
          {data?.total > 0 && (
            <span className="text-slate-400">{data?.total} eventos (4h) • {formatTime(data?.ultima)}</span>
          )}
        </>
      )}

      <Button data-permission="Sistema.PropagacaoStatusWidget.atualizar"
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 ml-auto"
        onClick={() => refetch()}
        title="Atualizar"
      >
        <RefreshCw className="w-2.5 h-2.5" />
      </Button>
    </div>
  );
}