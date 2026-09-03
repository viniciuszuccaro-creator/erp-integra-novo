import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SlidersHorizontal } from "lucide-react";

/**
 * Barra superior da ERPDataTable: configuração de colunas + busca global
 * Regra-Mãe 3: extraído de DataTable.jsx — comportamento preservado
 */
export default function DataTableToolbar({
  columns = [],
  hiddenColumns = new Set(),
  onHiddenColumnsChange,
  enableGlobalSearch = false,
  globalSearchValue = "",
  onGlobalSearchChange,
}) {
  return (
    <div className="flex items-center justify-between pb-2 gap-2 rounded-sm border bg-white/80 backdrop-blur-sm shadow-sm px-2 py-1 sticky top-0 z-10">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-sm" aria-label="Configurar colunas">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Configurar colunas</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          {columns.map((c) => (
            <DropdownMenuCheckboxItem
              key={c.key}
              checked={!hiddenColumns.has(c.key)}
              onCheckedChange={(checked) => {
                const next = new Set(hiddenColumns);
                if (!checked) next.add(c.key); else next.delete(c.key);
                onHiddenColumnsChange && onHiddenColumnsChange(next);
              }}
            >
              {c.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {enableGlobalSearch && (
        <input
          value={globalSearchValue}
          onChange={(e) => onGlobalSearchChange && onGlobalSearchChange(e.target.value)}
          className="h-8 w-full sm:w-64 border rounded-sm px-2 text-sm"
          placeholder="Busca global..."
        />
      )}
    </div>
  );
}