/**
 * ERPHealthBanner — Banner compacto de saúde do ERP no Dashboard.
 * Mostra: contexto ativo, integrações críticas, propagação e alertas.
 * Substitui múltiplos banners redundantes por um único widget informativo.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import {
  CheckCircle2, AlertCircle, Building2, ArrowDownUp, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Pill({ label, ok }) {
  const PillIcon = ok ? CheckCircle2 : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
      ok ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-500 border-slate-200"
    }`}>
      <PillIcon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export default function ERPHealthBanner() {
  const { empresaAtual, grupoAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();
  const eId = empresaAtual?.id;
  const gId = grupoAtual?.id;

  const { data: configs = [] } = useQuery({
    queryKey: ["erp-health-banner", eId ?? "sem", gId ?? "sem"],
    queryFn: async () => {
      if (!eId && !gId) return [];
      const orConds = [];
      if (gId) orConds.push({ group_id: gId });
      if (eId) orConds.push({ empresa_id: eId });
      const res = await base44.functions.invoke("getEntityRecord", {
        entityName: "ConfiguracaoSistema",
        filter: orConds.length > 1 ? { $or: orConds } : (orConds[0] || {}),
        limit: 50,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!(eId || gId),
    staleTime: 600000,
    refetchInterval: 900000,
  });

  const getToggle = (chave) =>
    configs.some((c) => c.chave === chave && c.ativa === true);

  if (!eId && !gId) return null;

  const nomeContexto = estaNoGrupo
    ? (grupoAtual?.nome_do_grupo || "Grupo")
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa");

  const integracoes = [
    { label: "NF-e",   ok: getToggle("integracao_nfe")      },
    { label: "Boleto", ok: getToggle("integracao_boletos")  },
    { label: "WPP",    ok: getToggle("integracao_whatsapp") },
  ];
  const totalOk = integracoes.filter((i) => i.ok).length;

  return (
    <div className="w-full flex flex-wrap items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm text-xs">
      {/* Contexto ativo */}
      <div className="flex items-center gap-1.5 font-medium text-slate-700">
        <Building2 className="w-3.5 h-3.5 text-blue-500" />
        <span>{nomeContexto}</span>
        {estaNoGrupo && (
          <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 px-1.5">
            Grupo · {empresasDoGrupo.length} emp.
          </Badge>
        )}
      </div>

      <span className="text-slate-300">|</span>

      {/* Integrações */}
      <div className="flex items-center gap-1">
        <span className="text-slate-400">Integr.:</span>
        {integracoes.map(({ label, ok }) => (
          <Pill key={label} label={label} ok={ok} />
        ))}
      </div>

      <span className="text-slate-300">|</span>

      {/* Propagação */}
      <Link to={createPageUrl("AdministracaoSistema") + "?tab=propagacao"} className="flex items-center gap-1 text-blue-600 hover:underline">
        <ArrowDownUp className="w-3 h-3" />
        Propagação
      </Link>

      {/* Alerta integrações pendentes */}
      {totalOk < integracoes.length && (
        <Badge className="ml-auto bg-amber-50 text-amber-700 border-amber-200 text-[10px] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {integracoes.length - totalOk} integr. pendente(s)
        </Badge>
      )}
    </div>
  );
}