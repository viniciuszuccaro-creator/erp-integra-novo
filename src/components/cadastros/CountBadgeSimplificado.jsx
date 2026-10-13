import React from "react";
import { Badge } from "@/components/ui/badge";
import useEntityCounts from '@/components/lib/useEntityCounts';

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
  const hasParentCounts = allCounts !== undefined || precomputedTotal !== undefined;
  const { counts, isLoading: ownLoading } = useEntityCounts(hasParentCounts ? [] : list);
  const source = allCounts ?? counts;
  const total = precomputedTotal !== undefined ? precomputedTotal :
    list.every(e => Number.isFinite(source[e])) ? list.reduce((sum, e) => sum + source[e], 0) : undefined;
  const isLoading = isLoadingProp ?? ownLoading;

  if (!list.length) return null;

  return (
    <Badge
      variant="outline"
      className={`ml-1 rounded-sm bg-slate-100 text-slate-600 border-slate-300 text-xs font-semibold tabular-nums shrink-0 ${className}`}
    >
      {Number.isFinite(total) ? total.toLocaleString('pt-BR') :
        isLoading ? <span className="animate-pulse opacity-60">···</span> : '—'}
    </Badge>
  );
}