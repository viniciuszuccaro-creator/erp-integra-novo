import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";

export default function VisualizadorModal({
  ENTITY, TITULO, FormComponent, formProps, formKey,
  editItem, editError, isSaving, isLoadingEdit,
  onClose,
}) {
  // P3/P4: fechar com Escape (hook antes do early return)
  useEffect(() => {
    if (!FormComponent) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [FormComponent, onClose]);

  if (!FormComponent) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1099] bg-black/50" onClick={() => onClose(false)} />
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl pointer-events-auto flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0 z-10">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {editItem?.id ? `Editar ${TITULO}` : `Novo ${TITULO}`}
              </h2>
              {editError && (
                <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {editError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Salvando…
                </span>
              )}
              {isLoadingEdit && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Carregando…
                </span>
              )}
              <button
                type="button"
                onClick={() => onClose(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 flex-1 overflow-auto">
            <FormComponent
              key={"form-" + ENTITY + "-" + (editItem?.id || "new") + "-" + formKey}
              {...formProps}
            />
          </div>
        </div>
      </div>
    </>
  );
}