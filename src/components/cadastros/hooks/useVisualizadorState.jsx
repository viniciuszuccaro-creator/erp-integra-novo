import { useState, useEffect, useRef, useCallback } from "react";

export default function useVisualizadorState({ pageSizeProp = 20, startWithForm = false, FormComponent = null, ENTITY = "" }) {
  const [sortField, setSortField] = useState("updated_date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [search,    setSearch]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp);

  const [showForm,      setShowForm]      = useState(Boolean(startWithForm && FormComponent));
  const [editItem,      setEditItem]      = useState(null);
  const [formKey,       setFormKey]       = useState(0);
  // isLoadingEdit: reservado para futuro carregamento assíncrono de item — mantido na interface por compatibilidade
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editError,     setEditError]     = useState(null);
  const [isSaving,      setIsSaving]      = useState(false);
  const [nextCode,      setNextCode]      = useState(null);

  const [selectedIds,   setSelectedIds]   = useState(() => new Set());
  const [crossPageAll,  setCrossPageAll]  = useState(false);
  const [deselectedIds, setDeselectedIds] = useState(() => new Set());

  const lastGoodData  = useRef([]);
  const everLoadedRef = useRef(false);
  const debRef        = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const resetCache = useCallback(() => {
    lastGoodData.current = [];
    everLoadedRef.current = false;
    setPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    setSortDir(prev => sortField === field ? (prev === "desc" ? "asc" : "desc") : "asc");
    setSortField(field);
    setPage(1);
  }, [sortField]);

  const handleSortDropdown = useCallback((value) => {
    const idx = value.lastIndexOf("|");
    if (idx < 0) return;
    setSortField(value.slice(0, idx));
    setSortDir(value.slice(idx + 1));
    setPage(1);
  }, []);

  const isItemSelected = useCallback((id) => crossPageAll ? !deselectedIds.has(id) : selectedIds.has(id), [crossPageAll, deselectedIds, selectedIds]);

  const handleItemCheck = useCallback((id, checked) => {
    if (crossPageAll) {
      setDeselectedIds(prev => { const n = new Set(prev); checked ? n.delete(id) : n.add(id); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
    }
  }, [crossPageAll]);

  const handleActivateCrossPage = useCallback(() => { setCrossPageAll(true); setDeselectedIds(new Set()); setSelectedIds(new Set()); }, []);
  const handleCancelSelection   = useCallback(() => { setCrossPageAll(false); setDeselectedIds(new Set()); setSelectedIds(new Set()); }, []);

  return {
    sortField, setSortField, sortDir, setSortDir,
    search, setSearch, debouncedSearch,
    page, setPage, pageSize, setPageSize,
    showForm, setShowForm, editItem, setEditItem,
    formKey, setFormKey, isLoadingEdit, setIsLoadingEdit,
    editError, setEditError, isSaving, setIsSaving,
    nextCode, setNextCode,
    selectedIds, setSelectedIds, crossPageAll, setCrossPageAll,
    deselectedIds, setDeselectedIds,
    lastGoodData, everLoadedRef,
    resetCache, handleSort, handleSortDropdown,
    isItemSelected, handleItemCheck,
    handleActivateCrossPage, handleCancelSelection,
  };
}