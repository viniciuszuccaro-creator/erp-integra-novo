/**
 * CadastrosGroupCountBadge — contagem de grupo usando fonte única de verdade
 * Usa getGroupEntities de CadastrosConfig (Regra-Mãe: não duplicar configuração)
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { getGroupEntities } from "./CadastrosConfig";

function buildFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  const CAMPO_MAP = {
    Fornecedor: "empresa_dona_id",
    Transportadora: "empresa_dona_id",
    Colaborador: "empresa_alocada_id",
    NotaFiscal: "empresa_faturamento_id",
    TransferenciaFilial: "empresa_origem_id",
  };
  const SHARED = new Set(["Cliente", "Fornecedor", "Transportadora", "Servico"]);
  const campo = CAMPO_MAP[entityName] || "empresa_id";
  const orConds = [];
  const allIds = new Set();
  if (empresaId) allIds.add(empresaId);
  if (Array.isArray(empresasDoGrupo)) empresasDoGrupo.forEach(e => { if (e?.id) allIds.add(e.id); });
  const ids = Array.from(allIds);

  if (ids.length === 1) {
    const id = ids[0];
    if (entityName === "Cliente") orConds.push({ empresa_id: id }, { empresa_dona_id: id });
    else orConds.push({ [campo]: id });
    if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: [id] } });
  } else if (ids.length > 1) {
    if (entityName === "Cliente") orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
    else orConds.push({ [campo]: { $in: ids } });
    if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
  }
  if (groupId) orConds.push({ group_id: groupId });
  return orConds.length ? { $or: orConds } : {};
}

export default function CadastrosGroupCountBadge({ groupName }) {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;
  const entityList = getGroupEntities(groupName);
  const grupoEmpIds = (empresasDoGrupo || []).map(e => e.id).filter(Boolean).sort().join(",");

  const { data: totalCount = 0, isLoading } = useQuery({
    queryKey: ["CadastrosGroupCountBadge", groupName, empresaId || null, groupId || null, grupoEmpIds, entityList.join(",")],
    queryFn: async () => {
      if (!empresaId && !groupId) return 0;
      if (entityList.length === 0) return 0;
      try {
        const res = await base44.functions.invoke("countEntities", {
          entities: entityList.map(eName => ({
            entityName: eName,
            filter: buildFilter(eName, empresaId, groupId, empresasDoGrupo),
          })),
        });
        const counts = res?.data?.counts || {};
        return Object.values(counts).reduce((sum, c) => sum + (c || 0), 0);
      } catch {
        return 0;
      }
    },
    staleTime: 180_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'stale',
    retry: 1,
    enabled: !!(empresaId || groupId) && entityList.length > 0,
  });

  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs rounded-sm tabular-nums">
      {isLoading && totalCount === 0 ? "…" : totalCount.toLocaleString("pt-BR")}
    </Badge>
  );
}