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
import React, { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import useEntityCounts, { SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";
import { RefreshCw, AlertCircle } from "lucide-react";
import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";
import TransportadoraForm from "@/components/cadastros/TransportadoraForm";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import RepresentanteFormCompleto from "@/components/cadastros/RepresentanteFormCompleto";
import ContatoB2BForm from "@/components/cadastros/ContatoB2BForm";
import SegmentoClienteForm from "@/components/cadastros/SegmentoClienteForm";
import RegiaoAtendimentoForm from "@/components/cadastros/RegiaoAtendimentoForm";

import useVisualizadorState from "./hooks/useVisualizadorState";
import useVisualizadorQuery from "./hooks/useVisualizadorQuery";
import useVisualizadorCRUD, { ENTITY_CODE_FIELD } from "./hooks/useVisualizadorCRUD";
import VisualizadorToolbar from "@/components/cadastros/VisualizadorToolbar";
import VisualizadorTableBody from "@/components/cadastros/VisualizadorTableBody";
import VisualizadorModal from "@/components/cadastros/VisualizadorModal";

const ENTITY_CONTEXT_FIELD = { Fornecedor: "empresa_dona_id", Transportadora: "empresa_dona_id", Colaborador: "empresa_alocada_id" };
const SHARED_ENTITIES = new Set(["Cliente", "Fornecedor", "Transportadora"]);
const SELF_MANAGED_NAMES = new Set(["CadastroClienteCompleto","CadastroFornecedorCompleto","RepresentanteFormCompleto","ProdutoFormV22_Completo","ProdutoFormCompleto","ProdutoForm"]);
const FORM_ALIASES = [
  "item","data","initialData","defaultValues","record","entity","value",
  "cliente","fornecedor","colaborador","transportadora","representante",
  "contato","contatoB2B","segmento","segmentoCliente","regiao","regiaoAtendimento",
  "produto","servico","banco","conta","formaPagamento","centroCusto","planoContas",
  "planoDeContas","veiculo","motorista","departamento","cargo","turno",
  "empresa","grupo","grupoEmpresarial","grupoProduto","marca","kitProduto",
  "catalogoWeb","unidade","unidadeMedida","setor","setorAtividade","tabelaPreco",
  "tipoDespesa","moedaIndice","moeda","operadorCaixa","operador",
  "tabelaFiscal","condicaoComercial","centroResultado","centro",
  "localEstoque","local","tipoFrete","rotaPadrao","rota",
  "gateway","gatewayPagamento","configuracaoDespesaRecorrente","despesaRecorrente",
  "perfilAcesso","perfil","modeloDocumento","apiExterna",
  "webhook","chatbotIntent","chatbotCanal","jobAgendado","eventoNotificacao",
  "evento","tabela","condicao","apiExternaForm","webhookForm",
];
const DEFAULT_FORM_COMPONENTS = {
  Cliente: CadastroClienteCompleto, Fornecedor: CadastroFornecedorCompleto,
  Transportadora: TransportadoraForm, Colaborador: ColaboradorForm,
  Representante: RepresentanteFormCompleto, ContatoB2B: ContatoB2BForm,
  SegmentoCliente: SegmentoClienteForm, RegiaoAtendimento: RegiaoAtendimentoForm,
};

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
  const readFilter = useMemo(() => {
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
  }, [ENTITY, isSimple, empresaId, groupId, empresasDoGrupo]);

  // ── Query principal ───────────────────────────────────────────────────────────
  const { items, isFetching, isError } = useVisualizadorQuery({
    ENTITY, readFilter, sortField, sortDir, page, pageSize,
    debouncedSearch, empresaId, groupId, contextoValido, canViewCadastro,
    lastGoodData, everLoadedRef,
  });

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const { fetchNextCode, handlePersistSubmit } = useVisualizadorCRUD({
    ENTITY, editItem, empresaId, groupId, isSimple,
    canCreateCadastro, canEditCadastro, canDeleteCadastro,
    createInContext, updateInContext, deleteInContext,
    handleCloseForm: useCallback((wasSaved) => {
      setShowForm(false); setEditItem(null); setEditError(null);
      if (wasSaved) { state.setSortField?.("updated_date"); state.setSortDir?.("desc"); setPage(1); }
      setTimeout(() => invalidateAll(queryClient, ENTITY), 50);
    }, [ENTITY, queryClient]),
    setIsSaving, readFilter, setNextCode,
  });

  // ── Contagem ──────────────────────────────────────────────────────────────────
  const { counts, isLoading: countsLoading } = useEntityCounts(ENTITY ? [ENTITY] : []);
  const totalCount = Number(counts?.[ENTITY] || 0);
  const skip = (page - 1) * pageSize;

  // Efeitos
  useEffect(() => { resetCache(); }, [ENTITY, empresaId, groupId, debouncedSearch]);
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => invalidateAll(queryClient, ENTITY));
    return () => typeof unsub === "function" && unsub();
  }, [ENTITY, queryClient]);

  const handleCloseForm = useCallback((wasSaved) => {
    setShowForm(false); setEditItem(null); setEditError(null);
    if (wasSaved) { setPage(1); }
    setTimeout(() => invalidateAll(queryClient, ENTITY), 50);
  }, [ENTITY, queryClient]);

  const handleNewItem = useCallback(() => {
    if (!canCreateCadastro) { alert("Sem permissão para criar."); return; }
    setEditItem(null); setEditError(null); setFormKey(k => k + 1);
    fetchNextCode(readFilter);
    setShowForm(true);
  }, [canCreateCadastro, fetchNextCode, readFilter]);

  const handleEditItem = useCallback((item) => {
    if (!item?.id) return;
    if (!canEditCadastro) { alert("Sem permissão para editar."); return; }
    setEditItem(JSON.parse(JSON.stringify(item))); setEditError(null); setFormKey(k => k + 1); setShowForm(true);
  }, [canEditCadastro]);

  const handleDelete = useCallback(async (item) => {
    const label = item.nome || item.razao_social || item.nome_completo || item.descricao || item.id;
    if (!window.confirm(`Confirma excluir "${label}" de ${TITULO}? Esta ação será auditada.`)) return;
    if (!canDeleteCadastro) { alert("Sem permissão para excluir."); return; }
    try { await deleteInContext(ENTITY, item.id); }
    catch (e) { alert("Erro: " + (e?.message || String(e))); return; }
    lastGoodData.current = lastGoodData.current.filter(i => i.id !== item.id);
    setSelectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    if (items.length <= 1 && page > 1) setPage(p => Math.max(1, p - 1));
    invalidateAll(queryClient, ENTITY);
  }, [ENTITY, queryClient, items.length, page, canDeleteCadastro, deleteInContext]);

  const handleDeleteSelected = useCallback(async () => {
    if (!canDeleteCadastro) { alert("Sem permissão para excluir."); return; }
    const effCount = crossPageAll ? Math.max(0, totalCount - deselectedIds.size) : selectedIds.size;
    if (effCount === 0) return;
    if (!window.confirm(`Confirmar exclusão de ${effCount} registro(s) de ${TITULO}? Esta ação será auditada.`)) return;
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
      if (!idsToDelete.length) { alert("Nenhum registro encontrado."); return; }
      for (let i = 0; i < idsToDelete.length; i += 20) {
        await Promise.all(idsToDelete.slice(i, i + 20).map(id => deleteInContext(ENTITY, id).catch(() => {})));
      }
    } catch (e) { alert("Erro: " + (e?.message || String(e))); return; }
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
    const base = { onClose: handleCloseForm, onSave: handleCloseForm, onSuccess: handleCloseForm, onOpenChange: v => { if (!v) handleCloseForm(false); }, isOpen: true, open: true, windowMode: true, onSubmit: isSelfManaged ? handleCloseForm : handlePersistSubmit };
    const defaultValues = (!editItem && nextCode && ENTITY_CODE_FIELD[ENTITY]) ? { [ENTITY_CODE_FIELD[ENTITY]]: nextCode, codigo: nextCode } : {};
    if (!editItem) return { ...base, ...defaultValues, defaultValues };
    const aliases = {};
    FORM_ALIASES.forEach(a => { aliases[a] = editItem; });
    return { ...base, ...aliases, id: editItem.id };
  }, [editItem, handleCloseForm, isSelfManaged, handlePersistSubmit, nextCode, ENTITY]);

  if (!canViewCadastro) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Seu perfil não tem permissão para visualizar {TITULO}.
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col h-full gap-2 min-h-0 w-full">
      <VisualizadorToolbar
        ENTITY={ENTITY} TITULO={TITULO} COLUMNS={COLUMNS}
        totalCount={totalCount} countsLoading={countsLoading}
        search={search} setSearch={setSearch}
        pageSize={pageSize} setPageSize={setPageSize} setPage={setPage}
        sortField={sortField} sortDir={sortDir} handleSortDropdown={handleSortDropdown}
        isFetching={isFetching}
        onRefresh={() => { lastGoodData.current = []; everLoadedRef.current = false; invalidateAll(queryClient, ENTITY); }}
        FormComponent={FormComponent} onNew={handleNewItem}
        contextoValido={contextoValido} canCreateCadastro={canCreateCadastro}
        effSelectedCount={effSelectedCount} totalCountAll={totalCount}
        onDeleteSelected={handleDeleteSelected} canDeleteCadastro={canDeleteCadastro}
      />

      {/* Banners de seleção cross-page */}
      {showCrossPageBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-1.5 text-xs text-amber-800 flex items-center gap-2 flex-wrap shrink-0">
          <span className="font-medium">{selectedIds.size} selecionados nesta página.</span>
          <button onClick={handleActivateCrossPage} className="text-blue-600 hover:text-blue-800 underline font-semibold">
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={handleCancelSelection} className="ml-auto text-slate-500 underline">Cancelar</button>
        </div>
      )}
      {crossPageAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-1.5 text-xs text-blue-700 flex items-center gap-2 flex-wrap shrink-0">
          <span>{deselectedIds.size > 0 ? `✓ ${effSelectedCount} de ${totalCount} selecionados (${deselectedIds.size} desmarcado${deselectedIds.size > 1 ? 's' : ''})` : `✓ Todos os ${totalCount} registros selecionados`}</span>
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
          onEdit={handleEditItem} onDelete={handleDelete}
          queryClient={queryClient} invalidateAll={invalidateAll}
          extraColors={_extraColors}
        />
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-1">
        <span>Pág. {page} · {items.length} exibidos · {totalCount} total</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1 || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">← Ant.</button>
          <span className="flex items-center justify-center h-7 px-2 border border-slate-200 rounded-sm bg-white font-semibold text-slate-700">{page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={items.length < pageSize || isFetching} className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">Próx. →</button>
        </div>
      </div>

      {/* Modal */}
      {FormComponent && showForm && (
        <VisualizadorModal
          ENTITY={ENTITY} TITULO={TITULO} FormComponent={FormComponent}
          formProps={formProps} formKey={formKey}
          editItem={editItem} editError={editError} isSaving={isSaving} isLoadingEdit={false}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col p-4 bg-white overflow-hidden">
        {IconeProp && (
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <IconeProp className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">{TITULO}</h2>
          </div>
        )}
        <div className="flex-1 min-h-0">{content}</div>
      </div>
    );
  }
  return <div className="flex flex-col flex-1 min-h-0 h-full w-full">{content}</div>;
}