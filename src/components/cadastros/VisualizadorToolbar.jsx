import React, { useCallback } from "react";
import { Search, RefreshCw, Plus, Trash2, X, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZES = [10, 20, 50, 100];

export default function VisualizadorToolbar({
  ENTITY, TITULO, COLUMNS,
  totalCount, countsLoading,
  search, setSearch,
  pageSize, setPageSize, setPage,
  sortField, sortDir, handleSortDropdown,
  isFetching, onRefresh,
  FormComponent, onNew, contextoValido, canCreateCadastro,
  effSelectedCount, onDeleteSelected, canDeleteCadastro,
  items,
}) {
  const handleExportCSV = useCallback(() => {
    if (!items?.length || !COLUMNS?.length) return;
    const header = COLUMNS.map(c => c.label).join(";");
    const rows = items.map(item =>
      COLUMNS.map(c => {
        const v = item[c.field];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return Array.isArray(v) ? v.length : "";
        return String(v).replace(/;/g, ",");
      }).join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${TITULO || ENTITY}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [items, COLUMNS, TITULO, ENTITY]);
  return (
    <div className="flex items-center gap-2 flex-wrap shrink-0">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-sm font-semibold text-slate-700 truncate max-w-[160px]">{TITULO}:</span>
        <Badge variant="outline" className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 font-bold tabular-nums min-w-[32px] text-center">
          {(countsLoading && totalCount === 0)
            ? <span className="animate-pulse text-[10px]">···</span>
            : totalCount.toLocaleString("pt-BR")}
        </Badge>
      </div>

      <div className="relative flex-1 min-w-[120px]">
        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 h-9 rounded-sm text-sm bg-white border-slate-200"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <select
        value={pageSize}
        onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
        className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer shrink-0"
      >
        {PAGE_SIZES.map(ps => <option key={ps} value={ps}>{ps}/pág</option>)}
      </select>

      <select
        value={sortField + "|" + sortDir}
        onChange={e => handleSortDropdown(e.target.value)}
        className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer shrink-0"
      >
        <option value="updated_date|desc">↓ Mais Recentes</option>
        <option value="updated_date|asc">↑ Mais Antigos</option>
        <option value="created_date|desc">↓ Criação (novo)</option>
        <option value="created_date|asc">↑ Criação (antigo)</option>
        {(COLUMNS || []).filter(c => c.sortable !== false && c.field !== "updated_date" && c.field !== "created_date")
          .flatMap(c => [
            <option key={c.field + "|asc"}  value={c.field + "|asc"}>{c.label} ↑</option>,
            <option key={c.field + "|desc"} value={c.field + "|desc"}>{c.label} ↓</option>,
          ])}
      </select>

      <button
        type="button"
        onClick={onRefresh}
        className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-sm bg-white hover:bg-slate-50 shrink-0"
        title="Recarregar"
      >
        <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin text-blue-500" : "text-slate-500")} />
      </button>

      {items?.length > 0 && (
        <button
          type="button"
          onClick={handleExportCSV}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-sm bg-white hover:bg-slate-50 shrink-0"
          title="Exportar CSV"
        >
          <Download className="w-4 h-4 text-slate-500" />
        </button>
      )}

      {FormComponent && canCreateCadastro && (
        <Button
          size="sm"
          onClick={onNew}
          disabled={!contextoValido}
          data-permission="Cadastros.criar"
          className="h-9 rounded-sm gap-1 shrink-0"
          title={!contextoValido ? "Selecione uma empresa ou grupo primeiro" : undefined}
        >
          <Plus className="w-4 h-4" /> Novo
        </Button>
      )}

      {effSelectedCount > 0 && canDeleteCadastro && (
        <Button
          size="sm"
          variant="destructive"
          data-permission="Cadastros.Visualizador.excluir"
          onClick={onDeleteSelected}
          data-permission="Cadastros.excluir"
          className="h-9 rounded-sm gap-1 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          Excluir {(effSelectedCount >= totalCount && totalCount > 0) ? "TODOS" : effSelectedCount}
        </Button>
      )}
    </div>
  );
}