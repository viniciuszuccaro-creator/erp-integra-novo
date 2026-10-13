import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useEntityCounts from "@/components/lib/useEntityCounts";

/**
 * GroupCountBadge — badge de contagem para grupos de entidades (soma total)
 * Ideal para o header de cada bloco de Cadastros
 */
export default function GroupCountBadge({ entities = [], badgeClassName = "", colorClass = "bg-blue-50 text-blue-700 border-blue-200", precomputedTotal, isLoading: parentLoading }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [];
  // Se precomputedTotal é passado, usa ele (evita fetch extra)
  const skip = precomputedTotal !== undefined || list.length === 0;
  const { total: fetched, isLoading } = useEntityCounts(skip ? [] : list);
  const total = skip ? precomputedTotal : fetched;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs rounded-sm tabular-nums shrink-0 font-semibold", colorClass, badgeClassName)}
    >
      {Number.isFinite(total) ? total.toLocaleString('pt-BR') :
        (parentLoading ?? isLoading) ? <span className="animate-pulse opacity-60">···</span> : '—'}
    </Badge>
  );
}