import React from "react";
import { Badge } from "@/components/ui/badge";
import useCountEntitiesOptimized from "@/components/lib/useCountEntitiesOptimized";

/**
 * CountBadgeSimplificado — badge de contagem para uma ou mais entidades
 * Usa useEntityCounts V5 (asServiceRole + filtro multiempresa correto)
 */
/**
 * REGRA: se allCounts foi passado (mesmo como {}), NUNCA fazer fetch próprio.
 * Só faz fetch interno quando allCounts NÃO foi fornecido pelo pai.
 * isLoading (prop do pai) controla o estado de carregamento visual.
 */
export default function CountBadgeSimplificado({ entities = [], className = "", precomputedTotal, allCounts, isLoading: isLoadingProp }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [entities].filter(Boolean);

  // Se allCounts foi fornecido pelo pai, não faz fetch próprio (evita burst de 429s)
  const hasParentCounts = allCounts !== undefined;
  const { counts, circuitState } = useCountEntitiesOptimized(hasParentCounts ? [] : list);

  let total;
  if (precomputedTotal !== undefined) {
    total = precomputedTotal;
  } else if (hasParentCounts) {
    total = list.reduce((s, e) => s + (Number(allCounts[e]) || 0), 0);
  } else {
    total = list.reduce((s, e) => s + (counts[e] || 0), 0);
  }

  const isLoading = isLoadingProp || circuitState === 'LOADING';

  if (!list.length) return null;

  return (
    <Badge
      variant="outline"
      className={`ml-1 rounded-sm bg-slate-100 text-slate-600 border-slate-300 text-xs font-semibold tabular-nums shrink-0 ${className}`}
    >
      {(isLoading && total === 0) ? (
        <span className="animate-pulse opacity-60">···</span>
      ) : (
        total.toLocaleString("pt-BR")
      )}
    </Badge>
  );
}