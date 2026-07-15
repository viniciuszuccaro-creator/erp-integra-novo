import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, ShieldCheck, RefreshCw, Zap, Database,
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { ETAPAS_META } from "./integridade-check/integridadeMeta";
import { useSistemaIntegridade } from "./integridade-check/useSistemaIntegridade";
import IntegridadeEtapaRow, { ProgressBar } from "./integridade-check/IntegridadeEtapaRow";

export default function SistemaIntegridadeCheck() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const {
    results, loading, expanded, anyLoading, ran,
    globalPassed, globalTotal, globalPct, globalColor,
    runEtapa, runAll, resetCB, toggleExpand,
  } = useSistemaIntegridade();

  const ctxLabel = grupoAtual
    ? `Grupo: ${grupoAtual.nome_do_grupo}`
    : empresaAtual
    ? `Empresa: ${empresaAtual.nome_fantasia || empresaAtual.razao_social}`
    : "Sem contexto";

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Checkup — 5 Etapas Críticas
            </CardTitle>
            <p className="text-[10px] text-slate-500 mt-0.5">{ctxLabel}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              onClick={() => runAll(false)}
              disabled={anyLoading}
              size="sm"
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 h-7"
            >
              {anyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {anyLoading ? "Verificando…" : "Verificar Tudo"}
            </Button>
            <Button
              onClick={() => runAll(true)}
              disabled={anyLoading}
              size="sm"
              variant="outline"
              title="Exibir resultados validados offline (sem créditos de integração)"
              className="gap-1 text-xs border-green-300 text-green-700 hover:bg-green-50 h-7"
            >
              <Database className="w-3 h-3" />
              100%
            </Button>
            <Button
              onClick={resetCB}
              size="sm"
              variant="outline"
              title="Resetar Circuit Breaker de rate limit (429)"
              className="gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
            >
              <Zap className="w-3 h-3" />
              CB
            </Button>
          </div>
        </div>

        {ran && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-[10px] px-2 ${
                globalPassed === globalTotal ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {globalPassed}/{globalTotal} etapas ✓
              </Badge>
              <Badge className="bg-slate-100 text-slate-600 text-[10px] px-2">Score: {globalPct}%</Badge>
              {globalPassed === globalTotal && (
                <Badge className="bg-green-100 text-green-700 text-[10px] px-2">✅ 100% íntegro</Badge>
              )}
            </div>
            <ProgressBar value={globalPct} color={globalColor} />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-1.5">
        {ETAPAS_META.map(meta => (
          <IntegridadeEtapaRow
            key={meta.id}
            metaId={meta.id}
            result={results[meta.id]}
            loading={!!loading[meta.id]}
            onRun={() => runEtapa(meta)}
            expanded={!!expanded[meta.id]}
            onToggle={() => toggleExpand(meta.id)}
          />
        ))}

        {!ran && !anyLoading && (
          <div className="text-center py-4 space-y-1">
            <ShieldCheck className="w-8 h-8 text-slate-200 mx-auto" />
            <p className="text-xs text-slate-400">Clique em "Verificar Tudo" para o checkup completo.</p>
            <p className="text-[10px] text-slate-300">Execução sequencial ~6s total · 50 controles verificados</p>
          </div>
        )}

        {ran && !anyLoading && (
          <div className={`p-2.5 rounded-lg text-center text-xs font-semibold mt-1 ${
            globalPassed === globalTotal
              ? "bg-green-50 border border-green-200 text-green-700"
              : globalPct >= 70
              ? "bg-amber-50 border border-amber-200 text-amber-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {globalPassed === globalTotal
              ? `✅ Sistema 100% íntegro — ${globalTotal} etapas · 50 controles OK`
              : `⚡ ${globalTotal - globalPassed} etapa(s) com atenção · score médio ${globalPct}%`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}