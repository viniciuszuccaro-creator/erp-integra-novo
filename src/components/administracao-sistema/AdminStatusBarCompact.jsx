/**
 * AdminStatusBarCompact — barra de saúde compacta sem widgets aninhados.
 * Usado no topo das abas de Administração do Sistema.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { CheckCircle2, AlertCircle, XCircle, Wifi, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminStatusBarCompact() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const eId = empresaAtual?.id;
  const gId = grupoAtual?.id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();

  const { data: configs = [], isFetching, refetch } = useQuery({
    queryKey: ["admin-status-bar-compact", eId ?? "sem", gId ?? "sem"],
    queryFn: async () => {
      try {
        const orConds = [];
        if (gId) orConds.push({ group_id: gId });
        if (eId) orConds.push({ empresa_id: eId });
        const res = await base44.functions.invoke("getEntityRecord", {
          entityName: "ConfiguracaoSistema",
          filter: orConds.length > 1 ? { $or: orConds } : (orConds[0] || {}),
          limit: 100,
          sort: "-updated_date",
        });
        return Array.isArray(res?.data) ? res.data : [];
      } catch (_) { return []; }
    },
    enabled: !!(eId || gId),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const getToggle = (chave) => {
    const match = configs.find((c) => c.chave === chave && (
      (eId && c.empresa_id === eId) ||
      (gId && c.group_id === gId) ||
      (!c.empresa_id && !c.group_id)
    ));
    return match?.ativa === true;
  };

  const indicators = [
    { label: "NF-e",       ok: getToggle("integracao_nfe") },
    { label: "Boleto/PIX", ok: getToggle("integracao_boletos") },
    { label: "WhatsApp",   ok: getToggle("integracao_whatsapp") },
    { label: "IA Vendas",  ok: getToggle("ia_preditiva_vendas") },
    { label: "IA Finanças",ok: getToggle("ia_anomalia_financeira") },
  ];

  const okCount = indicators.filter((i) => i.ok).length;
  const healthPct = Math.round((okCount / indicators.length) * 100);
  const healthColor = healthPct >= 80 ? "text-green-600" : healthPct >= 50 ? "text-amber-600" : "text-red-600";
  const healthBg = healthPct >= 80 ? "bg-green-50 border-green-200" : healthPct >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  if (!eId && !gId) return null;

  return (
    <div className={`w-full border rounded-lg px-3 py-2 ${healthBg}`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          {isFetching
            ? <Wifi className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            : healthPct >= 80
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          }
          <span className={`font-semibold text-xs ${healthColor}`}>Saúde: {healthPct}%</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {indicators.map(({ label, ok }) => (
            <Badge
              key={label}
              className={`text-[10px] px-1.5 py-0 flex items-center gap-0.5 ${
                ok ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
              {label}
            </Badge>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={() => refetch()} title="Atualizar">
          <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}