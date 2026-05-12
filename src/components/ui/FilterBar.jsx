import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Componente reutilizável de barra de filtros
 * 
 * @param {Array} filters - Array de filtros com formato: [{name, label, options: [{value, label}], value, onChange}]
 * @param {number} activeFiltersCount - Quantidade de filtros ativos (para badge)
 * @param {function} onClearAll - Callback para limpar todos os filtros
 * @param {string} className - Classes CSS adicionais
 * 
 * @example
 * <FilterBar
 *   filters={[
 *     {
 *       name: 'status',
 *       label: 'Status',
 *       value: statusFilter,
 *       onChange: setStatusFilter,
 *       options: [{value: 'todos', label: 'Todos'}, {value: 'ativo', label: 'Ativos'}]
 *     }
 *   ]}
 *   activeFiltersCount={2}
 *   onClearAll={() => resetFilters()}
 * />
 */
export default function FilterBar({ 
  filters = [], 
  activeFiltersCount = 0,
  onClearAll,
  className = "" 
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filtros:</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {filters.map((filter, index) => (
        <Select
          key={filter.name || index}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onClearAll && activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-slate-600 hover:text-slate-900"
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}