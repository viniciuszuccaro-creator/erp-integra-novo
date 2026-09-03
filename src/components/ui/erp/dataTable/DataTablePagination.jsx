import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Paginação backend padronizada da ERPDataTable
 * Regra-Mãe 3: extraído de DataTable.jsx — renderiza apenas se controlada externamente
 */
export default function DataTablePagination({ page = 1, totalPages = 1, totalItems = 0, pageSize = 20, onPageChange, onPageSizeChange }) {
  if (!onPageChange || !(totalItems || 0) > 0) return null;

  return (
    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
      <div className="text-slate-600">
        Página {page} de {totalPages}{totalItems ? ` • ${totalItems} registros` : ''}
      </div>
      <div className="flex items-center gap-2">
        <select
          className="h-8 border rounded-sm px-2"
          value={pageSize}
          onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n}/página</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}