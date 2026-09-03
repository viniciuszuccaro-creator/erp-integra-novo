import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Barra de operações em massa da ERPDataTable (exportar/excluir selecionados)
 * Regra-Mãe 3: extraído de DataTable.jsx — handlers já envelopados em auditoria
 */
export default function DataTableBulkBar({ selectedSet, onBulkExportSelected, onBulkDeleteSelected }) {
  return (
    <div className="sticky top-0 z-10 mb-2 rounded-lg border bg-yellow-50 text-yellow-900 px-3 py-2 flex items-center justify-between">
      <div className="text-sm font-medium">{selectedSet.size} selecionado(s)</div>
      <div className="flex items-center gap-2">
        {onBulkExportSelected && (
          <Button variant="outline" size="sm" onClick={() => onBulkExportSelected(Array.from(selectedSet))}>
            Exportar selecionados
          </Button>
        )}
        {onBulkDeleteSelected && (
          <Button variant="destructive" size="sm" onClick={() => onBulkDeleteSelected(Array.from(selectedSet))}>
            Excluir selecionados
          </Button>
        )}
      </div>
    </div>
  );
}