/**
 * VisualizadorUniversalEntidadeV24 — V35 REFATORADO (Ciclo 22)
 * Regra-Mãe: arquivo > 600 linhas → refatorado em hooks + sub-componentes.
 * - useVisualizadorState    → estado e paginação
 * - useVisualizadorQuery    → query principal com placeholderData
 * - useVisualizadorCRUD     → create/update/delete + anti-duplicata + fetchNextCode
 * - VisualizadorToolbar     → barra de ferramentas
 * - VisualizadorTableBody   → tabela com ordenação e seleção
 * - VisualizadorModal       → modal de formulário
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";
import { AlertCircle } from "lucide-react";
import useVisualizadorState from "@/components/cadastros/hooks/useVisualizadorState";
import useVisualizadorQuery from "@/components/cadastros/hooks/useVisualizadorQuery";
import useVisualizadorCRUD from "@/components/cadastros/hooks/useVisualizadorCRUD";
import { ENTITY_CODE_FIELD } from "@/components/cadastros/config/entityCodeFields";
import VisualizadorBody from "@/components/cadastros/VisualizadorBody";
import {
  DEFAULT_FORM_COMPONENTS, SELF_MANAGED_NAMES, FORM_ALIASES,
  ENTITY_CONTEXT_FIELD, SHARED_ENTITIES,
} from "@/components/cadastros/config/visualizadorConfig";

function invalidateAll(qc, entity) {
  qc.invalidateQueries({ queryKey: ["viz-v33", entity] });
  qc.invalidateQueries({ queryKey: ["entityCounts_v5"] });
  qc.invalidateQueries({ queryKey: ["cadastros-all-counts-v5"] });
}

export default function VisualizadorUniversalEntidadeV24({
  nomeEntidade, tituloDisplay, icone: IconeProp,
  camposPrincipais, componenteEdicao: FormComponentProp,
  windowMode, entityName, columns,
  pageSize: pageSizeProp, statusColors: extraColors,
  startWithForm = false,
}) {
  const ENTITY = nomeEntidade || entityName || "";
  const TITULO = tituloDisplay || ENTITY;
  const FormComponent = FormComponentProp || DEFAULT_FORM_COMPONENTS[ENTITY] || null;
  const isSimple = SIMPLE_CATALOG.has(ENTITY);
  const _extraColors = extraColors || {};

  const isSelfManaged = useMemo(() => {
    if (!FormComponent) return false;
    return SELF_MANAGED_NAMES.has(FormComponent.displayName || FormComponent.name || "");
  }, [FormComponent]);

  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, empresasDoGrupo, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete, hasPermission } = usePermissions();
  const { user } = useUser();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;
  const contextoValido = !!(empresaId || groupId || isSimple);
  const canViewCadastro   = hasPermission("Cadastros", ENTITY, "visualizar") || hasPermission("Cadastros", null, "visualizar");
  const canCreateCadastro = canCreate("Cadastros", ENTITY) || canCreate("Cadastros", null);
  const canEditCadastro   = canEdit("Cadastros", ENTITY) || canEdit("Cadastros", null);
  const canDeleteCadastro = canDelete("Cadastros", ENTITY) || canDelete("Cadastros", null);

  const COLUMNS = useMemo(() => {
    if (columns?.length > 0) return columns;
    if (camposPrincipais?.length > 0)
      return camposPrincipais.map(c => ({
        field: c,
        label: c.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase()),
        sortable: true,
      }));
    return [{ field: "nome", label: "Nome", sortable: true }, { field: "status", label: "Status", sortable: false }];
  }, [JSON.stringify(columns), JSON.stringify(camposPrincipais)]); // eslint-disable-line

  // ── Estado ────────────────────────────────────────────────────────────────────
  const state = useVisualizadorState({ ENTITY, pageSizeProp: pageSizeProp || 20, startWithForm, FormComponent });
  const {
    sortField, sortDir, search, setSearch, debouncedSearch, page, setPage, pageSize, setPageSize,
    showForm, setShowForm, editItem, setEditItem, formKey, setFormKey,
    isLoadingEdit, editError, setEditError, isSaving, setIsSaving, nextCode, setNextCode,
    selectedIds, setSelectedIds, crossPageAll, setCrossPageAll, deselectedIds, setDeselectedIds,
    lastGoodData, everLoadedRef, resetCache, handleSort, handleSortDropdown,
    isItemSelected, handleItemCheck, handleActivateCrossPage, handleCancelSelection,
  } = state;

  // ── Filtro multiempresa ────────────────────────────────────────────────────────
  // PURE_CATALOG: catálogos globais sem escopo (Banco, UnidadeMedida, etc.) — não filtram
  const PURE_CATALOG = isSimple && (ENTITY === 'Banco' || ENTITY === 'FormaPagamento' || ENTITY === 'TipoDespesa' || ENTITY === 'MoedaIndice' || ENTITY === 'TipoFrete' || ENTITY === 'UnidadeMedida' || ENTITY === 'TabelaFiscal' || ENTITY === 'CentroOperacao');
  const readFilter = useMemo(() => {
    if (PURE_CATALOG) return {};
    if (isSimple && !groupId && !empresaId) return {};
    const ctxCampo = ENTITY_CONTEXT_FIELD[ENTITY] || "empresa_id";
    const orConds = [];
    if (empresaId) {
      orConds.push({ [ctxCampo]: empresaId });
      if (ENTITY === "Cliente") orConds.push({ empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
      else if (SHARED_ENTITIES.has(ENTITY)) orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
    }
    if (groupId) {
      orConds.push({ group_id: groupId });
      // Inclui registros órfãos (sem empresa_id E sem group_id) no contexto de grupo
      // Estes são registros legados criados antes da implementação multiempresa
      orConds.push({ empresa_id: null, group_id: null });
      if (!empresaId && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length) {
        const ids = empresasDoGrupo.map(e => e.id).filter(Boolean);
        if (ids.length) {
          if (ENTITY === "Cliente") orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } }, { empresas_compartilhadas_ids: { $in: ids } });
          else if (ENTITY === "Fornecedor" || ENTITY === "Transportadora") orConds.push({ empresa_dona_id: { $in: ids } }, { empresas_compartilhadas_ids: { $in: ids } });
          else if (ENTITY === "Colaborador") orConds.push({ empresa_alocada_id: { $in: ids } });
          else orConds.push({ [ctxCampo]: { $in: ids } });
        }
      }
    }
    return orConds.length ? { $or: orConds } : {};
  }, [ENTITY, isSimple, PURE_CATALOG, empresaId, groupId, empresasDoGrupo]);

  // ── Query principal ───────────────────────────────────────────────────────────
  const { items, isFetching, isError } = useVisualizadorQuery({
    ENTITY, readFilter, sortField, sortDir, page, pageSize,
    debouncedSearch, empresaId, groupId, contextoValido, canViewCadastro,
    lastGoodData, everLoadedRef,
  });

  // ── handleCloseForm centralizado ──────────────────────────────────────────────
  const handleCloseForm = useCallback((wasSaved) => {
    setShowForm(false); setEditItem(null); setEditError(null);
    if (wasSaved) { setPage(1); }
    setTimeout(() => invalidateAll(queryClient, ENTITY), 50);
  }, [ENTITY, queryClient]);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const { fetchNextCode, handlePersistSubmit } = useVisualizadorCRUD({
    ENTITY, editItem, empresaId, groupId, isSimple,
    canCreateCadastro, canEditCadastro, canDeleteCadastro,
    createInContext, updateInContext, deleteInContext,
    handleCloseForm,
    setIsSaving, readFilter, setNextCode,
  });

  // ── Contagem — usa o MESMO readFilter da tabela para garantir que bate ──────
  const readFilterKey = useMemo(() => JSON.stringify(readFilter), [readFilter]);
  const { data: accurateCount, isLoading: countsLoading } = useQuery({
    queryKey: ['viz-count-v2', ENTITY, readFilterKey],
    queryFn: async () => {
      if (!ENTITY || !contextoValido) return 0;
      try {
        const res = await base44.functions.invoke("countEntities", {
          entityName: ENTITY,
          filter: readFilter,
        });
        const n = res?.data?.count ?? res?.data?.total ?? res?.data;
        return typeof n === 'number' ? n : 0;
      } catch (_) {
        // Fallback: SDK direto com o mesmo readFilter
        try {
          const items = await base44.entities[ENTITY].filter(readFilter, '-created_date', 9999);
          return Array.isArray(items) ? items.length : 0;
        } catch { return 0; }
      }
    },
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!ENTITY && contextoValido && canViewCadastro,
  });
  const totalCount = Number(accurateCount || 0);

  // Efeitos
  useEffect(() => { resetCache(); }, [ENTITY, empresaId, groupId, debouncedSearch]);
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => invalidateAll(queryClient, ENTITY));
    return () => typeof unsub === "function" && unsub();
  }, [ENTITY, queryClient]);

  const handleNewItem = useCallback(() => {
    if (!canCreateCadastro) return; // botão já fica desabilitado sem permissão
    setEditItem(null); setEditError(null); setFormKey(k => k + 1);
    fetchNextCode(readFilter);
    setShowForm(true);
  }, [canCreateCadastro, fetchNextCode, readFilter]);

  const handleEditItem = useCallback((item) => {
    if (!item?.id || !canEditCadastro) return; // botão já fica desabilitado
    setEditItem(JSON.parse(JSON.stringify(item))); setEditError(null); setFormKey(k => k + 1); setShowForm(true);
  }, [canEditCadastro]);

  const [deleteTarget, setDeleteTarget] = React.useState(null);

  const handleDelete = useCallback((item) => {
    if (!canDeleteCadastro) return;
    setDeleteTarget(item);
  }, [canDeleteCadastro]);

  const confirmDelete = useCallback(async () => {
    const item = deleteTarget;
    if (!item) return;
    setDeleteTarget(null);
    try { await deleteInContext(ENTITY, item.id); }
    catch (e) { console.error("Erro ao excluir:", e); return; }
    lastGoodData.current = lastGoodData.current.filter(i => i.id !== item.id);
    setSelectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    if (items.length <= 1 && page > 1) setPage(p => Math.max(1, p - 1));
    invalidateAll(queryClient, ENTITY);
  }, [deleteTarget, ENTITY, queryClient, items.length, page, deleteInContext]);

  const handleDeleteSelected = useCallback(async () => {
    if (!canDeleteCadastro) return;
    const effCount = crossPageAll ? Math.max(0, totalCount - deselectedIds.size) : selectedIds.size;
    if (effCount === 0) return;
    // P3/P4: sem window.confirm — toolbar usa diálogo inline próprio que chama esta função após confirmação
    try {
      let idsToDelete = [];
      if (crossPageAll) {
        let skipAcc = 0;
        while (true) {
          const res = await base44.functions.invoke("entityListSorted", { entityName: ENTITY, filter: readFilter, sortField: "id", sortDirection: "asc", limit: 500, skip: skipAcc });
          const arr = Array.isArray(res?.data) ? res.data : [];
          if (!arr.length) break;
          arr.forEach(i => { if (i.id && !deselectedIds.has(i.id)) idsToDelete.push(i.id); });
          if (arr.length < 500) break;
          skipAcc += 500;
        }
      } else { idsToDelete = Array.from(selectedIds); }
      if (!idsToDelete.length) { console.warn("Nenhum registro encontrado para exclusão."); return; }
      for (let i = 0; i < idsToDelete.length; i += 20) {
        await Promise.all(idsToDelete.slice(i, i + 20).map(id => deleteInContext(ENTITY, id).catch(() => {})));
      }
      // P3/P5: AuditLog para exclusões em massa com usuario + multiempresa
      try {
        await base44.entities.AuditLog.create({
          acao: 'Exclusão', modulo: 'Cadastros', tipo_auditoria: 'entidade',
          entidade: ENTITY, descricao: `Exclusão em massa: ${idsToDelete.length} registro(s) de ${ENTITY}`,
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id || null,
          empresa_id: empresaId || null, group_id: groupId || null,
          data_hora: new Date().toISOString(),
          dados_novos: { ids_excluidos: idsToDelete.slice(0, 50), total: idsToDelete.length },
        });
      } catch { /* auditoria não bloqueia */ }
    } catch (e) { console.error("Erro ao excluir em massa:", e?.message || e); return; }
    setSelectedIds(new Set()); setDeselectedIds(new Set()); setCrossPageAll(false); setPage(1);
    invalidateAll(queryClient, ENTITY);
  }, [ENTITY, crossPageAll, totalCount, selectedIds, deselectedIds, readFilter, queryClient, deleteInContext, canDeleteCadastro]);

  const allPageSelected  = items.length > 0 && items.every(i => isItemSelected(i.id));
  const somePageSelected = items.some(i => isItemSelected(i.id));
  const effSelectedCount = crossPageAll ? Math.max(0, totalCount - deselectedIds.size) : selectedIds.size;
  const showCrossPageBanner = !crossPageAll && selectedIds.size > 0 && allPageSelected && totalCount > items.length;

  const handleToggleSelectPage = useCallback(() => {
    if (crossPageAll) {
      setDeselectedIds(prev => {
        const n = new Set(prev);
        if (allPageSelected) items.forEach(i => n.add(i.id)); else items.forEach(i => n.delete(i.id));
        return n;
      });
    } else if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); items.forEach(i => n.delete(i.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); items.forEach(i => n.add(i.id)); return n; });
    }
  }, [crossPageAll, allPageSelected, items]);

  const formProps = useMemo(() => {
    const base = { onClose: handleCloseForm, onSave: isSelfManaged ? handleCloseForm : (data) => { if (data && typeof data === 'object' && !data.target && !data.preventDefault && !data.nativeEvent) return handlePersistSubmit(data); handleCloseForm(false); }, onSuccess: handleCloseForm, onOpenChange: v => { if (!v) handleCloseForm(false); }, isOpen: showForm, open: showForm, windowMode: true, onSubmit: isSelfManaged ? handleCloseForm : handlePersistSubmit };
    const defaultValues = (!editItem && nextCode && ENTITY_CODE_FIELD[ENTITY]) ? { [ENTITY_CODE_FIELD[ENTITY]]: nextCode, codigo: nextCode } : {};
    if (!editItem) return { ...base, ...defaultValues, defaultValues };
    const aliases = {};
    FORM_ALIASES.forEach(a => { aliases[a] = editItem; });
    return { ...base, ...aliases, id: editItem.id };
  }, [editItem, handleCloseForm, isSelfManaged, handlePersistSubmit, nextCode, ENTITY, showForm]);

  if (!canViewCadastro) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Seu perfil não tem permissão para visualizar {TITULO}.
        </div>
      </div>
    );
  }

  const deleteLabel = deleteTarget ? (deleteTarget.nome || deleteTarget.razao_social || deleteTarget.nome_completo || deleteTarget.descricao || deleteTarget.id) : '';

  return (
    <>
      <VisualizadorBody
        ENTITY={ENTITY} TITULO={TITULO} COLUMNS={COLUMNS}
        IconeProp={IconeProp} FormComponent={FormComponent} windowMode={windowMode}
        items={items} isFetching={isFetching} isError={isError}
        everLoadedRef={everLoadedRef} lastGoodData={lastGoodData}
        totalCount={totalCount} countsLoading={countsLoading}
        page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize}
        search={search} setSearch={setSearch} debouncedSearch={debouncedSearch}
        sortField={sortField} sortDir={sortDir}
        handleSort={handleSort} handleSortDropdown={handleSortDropdown}
        allPageSelected={allPageSelected} somePageSelected={somePageSelected}
        effSelectedCount={effSelectedCount} showCrossPageBanner={showCrossPageBanner}
        crossPageAll={crossPageAll} selectedIds={selectedIds} deselectedIds={deselectedIds}
        isItemSelected={isItemSelected} handleItemCheck={handleItemCheck}
        handleToggleSelectPage={handleToggleSelectPage}
        handleActivateCrossPage={handleActivateCrossPage}
        handleCancelSelection={handleCancelSelection}
        canCreateCadastro={canCreateCadastro} canEditCadastro={canEditCadastro}
        canDeleteCadastro={canDeleteCadastro} contextoValido={contextoValido}
        onRefresh={() => { lastGoodData.current = []; everLoadedRef.current = false; invalidateAll(queryClient, ENTITY); }}
        onNew={handleNewItem} onEdit={handleEditItem}
        onDelete={handleDelete} onDeleteSelected={handleDeleteSelected}
        showForm={showForm} formProps={formProps} formKey={formKey}
        editItem={editItem} editError={editError} isSaving={isSaving}
        onClose={handleCloseForm}
        extraColors={_extraColors} queryClient={queryClient} invalidateAll={invalidateAll}
      />

      {/* Diálogo de confirmação de exclusão individual — sem window.confirm (P3/P4) */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-[1199] bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm pointer-events-auto p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Confirmar exclusão</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Excluir <span className="font-medium text-slate-700">"{deleteLabel}"</span> de <span className="font-medium">{TITULO}</span>?
                    Esta ação será auditada e não pode ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button onClick={confirmDelete} className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}