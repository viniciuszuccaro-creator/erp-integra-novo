import React from "react";

/**
 * Rodapé de totais numéricos da ERPDataTable
 * Regra-Mãe 3: extraído de DataTable.jsx — comportamento preservado
 */
export default function DataTableFooterTotals({ totals = {}, columns = [] }) {
  if (Object.keys(totals).length === 0) return null;

  return (
    <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-4">
      {Object.entries(totals).map(([k, v]) => (
        <div key={k}><span className="font-medium">Total {columns.find(c => c.key === k)?.label}:</span> {v.toLocaleString('pt-BR')}</div>
      ))}
    </div>
  );
}