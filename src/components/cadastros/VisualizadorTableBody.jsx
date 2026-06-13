import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, RefreshCw, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

const STATUS_COLORS = {
  Ativo:"bg-green-100 text-green-700 border-green-200",
  Ativa:"bg-green-100 text-green-700 border-green-200",
  Aprovado:"bg-green-100 text-green-700 border-green-200",
  OK:"bg-green-100 text-green-700 border-green-200",
  "Em Análise":"bg-blue-100 text-blue-700 border-blue-200",
  Pendente:"bg-yellow-100 text-yellow-700 border-yellow-200",
  Inativo:"bg-slate-100 text-slate-500 border-slate-200",
  Bloqueado:"bg-red-100 text-red-700 border-red-200",
  Cancelado:"bg-red-100 text-red-700 border-red-200",
};
const STATUS_FIELDS = new Set(["status","status_fornecedor","status_cliente","situacao","situacao_credito","status_fiscal_receita"]);
const BOOL_FIELDS   = new Set(["ativo","ativa","habilitado","compartilhado_grupo","principal"]);
const DATE_FIELDS   = new Set(["created_date","updated_date","data_admissao","data_nascimento","data_vencimento","data_validade","ultima_compra","cnh_validade"]);
const MONEY_FIELDS  = new Set(["salario","preco_venda","custo_aquisicao","custo_medio","limite_credito","valor_total","valor"]);

const LABEL_FALLBACKS = [
  'nome','nome_completo','razao_social','nome_fantasia','nome_banco','nome_cargo','nome_turno',
  'nome_grupo','nome_marca','nome_rota','nome_segmento','nome_regiao','nome_perfil',
  'descricao','titulo','sigla','codigo','codigo_banco','matricula','placa','cpf','cnpj',
];

function getDisplayValue(item, col, isFirstCol) {
  const v = item[col.field];
  if (v !== null && v !== undefined && v !== '') return v;
  if (isFirstCol) {
    for (const f of LABEL_FALLBACKS) {
      if (f !== col.field && item[f] != null && item[f] !== '') return item[f];
    }
  }
  return v;
}

function fmtValue(value, col, extraColors = {}) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-300 text-xs">—</span>;
  const allColors = { ...STATUS_COLORS, ...extraColors };
  if (BOOL_FIELDS.has(col.field))
    return value
      ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-200">Sim</Badge>
      : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-200">Não</Badge>;
  if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
    const cls = allColors[value] || "bg-slate-100 text-slate-600 border-slate-200";
    return <Badge variant="outline" className={"text-xs rounded-sm " + cls}>{value}</Badge>;
  }
  if (DATE_FIELDS.has(col.field) || col.type === "date") {
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR"); } catch (_) {}
  }
  if (MONEY_FIELDS.has(col.field) || col.type === "currency") {
    const n = Number(value); if (!isNaN(n)) return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (col.type === "number") { const n = Number(value); return isNaN(n) ? String(value) : n.toLocaleString("pt-BR"); }
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "object") return Array.isArray(value) ? "[" + value.length + "]" : "–";
  return String(value).substring(0, 130);
}

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
                      className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                    >
                      {isLoadingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    title="Excluir"
                    disabled={!canDeleteCadastro}
                    className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50"
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