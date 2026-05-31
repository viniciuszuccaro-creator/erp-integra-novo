/**
 * PropagacaoResumoStatus — Widget compacto de status da propagação
 * Mostra quantas entidades estão sincronizadas e permite acesso rápido
 * Usado no Dashboard e na aba de Configurações Gerais
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { ArrowDownUp, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PropagacaoResumoStatus() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();

  const { data } = useQuery({
    queryKey: ["prop-resumo", grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return null;
      // Verifica config de propagação
      const cfgs = await base44.entities.ConfiguracaoSistema
        .filter({ group_id: grupoAtual.id }, null, 100)
        .catch(() => []);

      const propAtiva = cfgs.find(c => c.chave === "propagacao_grupo_empresas_ativa")?.ativa === true;
      const empresas = empresasDoGrupo?.length || 0;

      // Contar registros replicados (usando SyncMap como proxy)
      const syncMaps = await base44.entities.SyncMap
        .filter({ group_id: grupoAtual.id }, "-created_date", 50)
        .catch(() => []);

      const ultimaSync = syncMaps?.[0]?.created_date || null;

      return { propAtiva, empresas, totalSyncs: syncMaps.length, ultimaSync };
    },
    enabled: !!grupoAtual?.id,
    staleTime: 120000,
  });

  if (!grupoAtual?.id) return null;

  const propAtiva = data?.propAtiva ?? false;
  const empresas = data?.empresas ?? 0;
  const ultimaSync = data?.ultimaSync
    ? new Date(data.ultimaSync).toLocaleString("pt-BR")
    : "Nunca";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${propAtiva ? "bg-blue-100" : "bg-slate-100"}`}>
          <ArrowDownUp className={`w-4 h-4 ${propAtiva ? "text-blue-600" : "text-slate-400"}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900">Propagação Grupo ↔ Empresas</span>
            <Badge className={propAtiva
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
            }>
              {propAtiva
                ? <><CheckCircle2 className="w-3 h-3 mr-1" />Ativa</>
                : <><AlertCircle className="w-3 h-3 mr-1" />Pausada</>}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {empresas} empresa(s)
            </span>
            <span>Última sync: {ultimaSync}</span>
          </div>
        </div>
      </div>

      <Link
        to={createPageUrl("AdministracaoSistema?tab=propagacao")}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors whitespace-nowrap"
      >
        Gerenciar Propagação →
      </Link>
    </div>
  );
}