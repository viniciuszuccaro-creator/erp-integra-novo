import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit, Trash2, RefreshCw, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { fmtValue, getDisplayValue } from "@/components/cadastros/utils/tableFormatters";

export default function VisualizadorTableBody({
  ENTITY, TITULO, COLUMNS, items, isFetching, isError, everLoadedRef, lastGoodData,
  debouncedSearch, sortField, sortDir, onSort,
  isItemSelected, handleItemCheck, allPageSelected, somePageSelected,
  handleToggleSelectPage, canDeleteCadastro,
  FormComponent, isLoadingEdit, canEditCadastro,
  onEdit, onDelete, invalidateAll, queryClient,
  extraColors,
}) {
  function getSortIcon(field) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-400" />;
    if (sortDir === "desc") return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
    return <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  }

  const isInitialLoad = isFetching && !everLoadedRef.current && lastGoodData.current.length === 0;

  if (isInitialLoad) {
    return (
      <div className="space-y-1.5 p-3">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className={"h-8 rounded-sm " + (i % 3 === 0 ? "w-3/4" : "w-full")} />)}
      </div>
    );
  }
  if (isError && items.length === 0 && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-red-500 gap-2">
        <AlertCircle className="w-7 h-7" />
        <span className="text-sm">Erro ao carregar dados.</span>
        <button className="text-xs underline text-red-400" onClick={() => { lastGoodData.current = []; everLoadedRef.current = false; if (invalidateAll && queryClient) invalidateAll(queryClient, ENTITY); }}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (items.length === 0 && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
        <Search className="w-7 h-7 opacity-30" />
        <span className="text-sm">{debouncedSearch ? `Nenhum resultado para "${debouncedSearch}"` : `Nenhum registro de ${TITULO}`}</span>
      </div>
    );
  }

  return (
    <table className="w-full text-sm table-auto">
      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
        <tr>
          <th className="px-3 py-2.5 text-center w-8">
            <input
              type="checkbox"
              ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
              checked={allPageSelected}
              onChange={handleToggleSelectPage}
              disabled={!canDeleteCadastro}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
          </th>
          {(COLUMNS || []).map(col => (
            <th
              key={col.field}
              className={"px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap select-none" + (col.sortable !== false ? " cursor-pointer hover:bg-slate-100" : "")}
              onClick={() => col.sortable !== false && onSort(col.field)}
            >
              <div className="flex items-center gap-1">
                <span>{col.label}</span>
                {col.sortable !== false && getSortIcon(col.field)}
              </div>
            </th>
          ))}
          <th className="px-3 py-2.5 text-center w-20 font-semibold text-slate-600">Ações</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map(item => {
          const checked = isItemSelected(item.id);
          return (
            <tr key={item.id} className={"transition-colors hover:bg-blue-50/30" + (checked ? " bg-blue-50/40" : "")}>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => handleItemCheck(item.id, e.target.checked)}
                  disabled={!canDeleteCadastro}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
              </td>
              {(COLUMNS || []).map((col, colIdx) => (
                <td key={col.field} className="px-3 py-2 text-slate-600 max-w-[240px] truncate">
                  {fmtValue(getDisplayValue(item, col, colIdx === 0), col, extraColors || {})}
                </td>
              ))}
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-1">
                  {FormComponent && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onEdit(item); }}
                      title="Editar"
                      disabled={isLoadingEdit || !canEditCadastro}
                      className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isLoadingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    title="Excluir"
                    disabled={!canDeleteCadastro}
                    className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}