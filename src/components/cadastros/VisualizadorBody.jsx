/**
 * VisualizadorBody — Ciclo 25 (c25-04)
 * Extração do bloco de renderização principal de VisualizadorUniversalEntidadeV24.
 * Recebe todas as props já computadas; sem lógica de negócio própria.
 */
import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import VisualizadorToolbar from "@/components/cadastros/VisualizadorToolbar";
import VisualizadorTableBody from "@/components/cadastros/VisualizadorTableBody";
import VisualizadorModal from "@/components/cadastros/VisualizadorModal";

export default function VisualizadorBody({
  // identidade
  ENTITY, TITULO, COLUMNS, IconeProp, windowMode,
  // toolbar
  totalCount, countsLoading, search, setSearch,
  pageSize, setPageSize, setPage,
  sortField, sortDir, handleSortDropdown,
  isFetching, items, onRefresh,
  FormComponent, onNew, contextoValido, canCreateCadastro,
  effSelectedCount, onDeleteSelected, canDeleteCadastro,
  // banners
  showCrossPageBanner, crossPageAll, selectedIds,
  deselectedIds, handleActivateCrossPage, handleCancelSelection,
  // tabela
  isError, everLoadedRef, lastGoodData,
  debouncedSearch, handleSort,
  isItemSelected, handleItemCheck,
  allPageSelected, somePageSelected, handleToggleSelectPage,
  canEditCadastro, onEdit, onDelete,
  queryClient, invalidateAll, extraColors,
  // paginação
  page,
  // modal — editError agora exibido inline no modal via formProps
  formProps, formKey, editItem, editError, isSaving, onClose,
}) {
  const content = (
    <div className="flex flex-col h-full gap-2 min-h-0 w-full">
      <VisualizadorToolbar
        ENTITY={ENTITY} TITULO={TITULO} COLUMNS={COLUMNS}
        totalCount={totalCount} countsLoading={countsLoading}
        search={search} setSearch={setSearch}
        pageSize={pageSize} setPageSize={setPageSize} setPage={setPage}
        sortField={sortField} sortDir={sortDir} handleSortDropdown={handleSortDropdown}
        isFetching={isFetching} items={items}
        onRefresh={onRefresh}
        FormComponent={FormComponent} onNew={onNew}
        contextoValido={contextoValido} canCreateCadastro={canCreateCadastro}
        effSelectedCount={effSelectedCount}
        onDeleteSelected={onDeleteSelected} canDeleteCadastro={canDeleteCadastro}
      />

      {/* Banner seleção parcial */}
      {showCrossPageBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-1.5 text-xs text-amber-800 flex items-center gap-2 flex-wrap shrink-0">
          <span className="font-medium">{selectedIds.size} selecionados nesta página.</span>
          <button onClick={handleActivateCrossPage} className="text-blue-600 hover:text-blue-800 underline font-semibold">
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={handleCancelSelection} className="ml-auto text-slate-500 underline">Cancelar</button>
        </div>
      )}
      {/* Banner seleção total */}
      {crossPageAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-1.5 text-xs text-blue-700 flex items-center gap-2 flex-wrap shrink-0">
          <span>{deselectedIds.size > 0
            ? `✓ ${Math.max(0, totalCount - deselectedIds.size)} de ${totalCount} selecionados (${deselectedIds.size} desmarcado${deselectedIds.size > 1 ? 's' : ''})`
            : `✓ Todos os ${totalCount} registros selecionados`}
          </span>
          <button onClick={handleCancelSelection} className="ml-auto text-blue-500 underline">Cancelar seleção</button>
        </div>
      )}

      {/* Tabela */}
      <div className="flex-1 overflow-auto rounded-sm border border-slate-200 bg-white min-h-0 relative">
        {isFetching && items.length > 0 && (
          <div className="absolute top-0 right-0 z-20 bg-blue-500/10 text-blue-600 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded-bl">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> atualizando…
          </div>
        )}
        {isError && items.length > 0 && (
          <div className="absolute top-0 right-0 z-20 bg-red-500/10 text-red-600 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded-bl">
            <AlertCircle className="w-2.5 h-2.5" /> erro — exibindo cache
          </div>
        )}
        <VisualizadorTableBody
          ENTITY={ENTITY} TITULO={TITULO} COLUMNS={COLUMNS} items={items}
          isFetching={isFetching} isError={isError} everLoadedRef={everLoadedRef} lastGoodData={lastGoodData}
          debouncedSearch={debouncedSearch} sortField={sortField} sortDir={sortDir} onSort={handleSort}
          isItemSelected={isItemSelected} handleItemCheck={handleItemCheck}
          allPageSelected={allPageSelected} somePageSelected={somePageSelected}
          handleToggleSelectPage={handleToggleSelectPage} canDeleteCadastro={canDeleteCadastro}
          FormComponent={FormComponent} isLoadingEdit={false} canEditCadastro={canEditCadastro}
          onEdit={onEdit} onDelete={onDelete}
          queryClient={queryClient} invalidateAll={invalidateAll}
          extraColors={extraColors}
        />
      </div>

      {/* Paginação */}
      {(() => {
        const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
        const hasNext = items.length >= pageSize && page < totalPages;
        return (
          <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-1">
            <span className="tabular-nums">
              {items.length} de {totalCount.toLocaleString('pt-BR')} registros
              {totalPages > 1 ? ` · pág. ${page} / ${totalPages}` : ''}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1 || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" title="Primeira página">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹ Ant.</button>
              <span className="flex items-center justify-center h-7 px-2 border border-blue-300 rounded-sm bg-blue-50 font-semibold text-blue-700 tabular-nums">{page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!hasNext || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">Próx. ›</button>
              {totalPages > 1 && (
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" title="Última página">»</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {FormComponent && onClose && formProps?.isOpen && (
        <VisualizadorModal
          ENTITY={ENTITY} TITULO={TITULO} FormComponent={FormComponent}
          formProps={formProps} formKey={formKey}
          editItem={editItem} editError={editError} isSaving={isSaving} isLoadingEdit={false}
          onClose={onClose}
        />
      )}
    </div>
  );

  if (windowMode) {
    const IconComp = IconeProp;
    return (
      <div className="w-full h-full flex flex-col p-4 bg-white overflow-hidden">
        {IconComp && (
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <IconComp className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">{TITULO}</h2>
          </div>
        )}
        <div className="flex-1 min-h-0">{content}</div>
      </div>
    );
  }
  return <div className="flex flex-col flex-1 min-h-0 h-full w-full">{content}</div>;
}