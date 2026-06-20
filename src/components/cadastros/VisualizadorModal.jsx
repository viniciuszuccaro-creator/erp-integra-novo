/**
 * VisualizadorModal — Ciclo 26
 * P3: captura erros inline do onSubmit (duplicata, validação) e exibe no header.
 * P4: fecha com Escape, sem bloquear o formulário.
 */
import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";

export default function VisualizadorModal({
  ENTITY, TITULO, FormComponent, formProps, formKey,
  editItem, editError: editErrorProp, isSaving, isLoadingEdit,
  onClose,
}) {
  const [inlineError, setInlineError] = useState(null);

  // Reseta o erro inline ao abrir um novo form
  useEffect(() => { setInlineError(null); }, [formKey]);

  // P3: wrapper do onSubmit que captura exceções e exibe inline
  const wrappedOnSubmit = useCallback(async (data) => {
    setInlineError(null);
    try {
      if (formProps?.onSubmit) await formProps.onSubmit(data);
    } catch (e) {
      setInlineError(e?.message || "Erro ao salvar. Tente novamente.");
    }
  }, [formProps?.onSubmit]); // eslint-disable-line

  // P4: fechar com Escape
  useEffect(() => {
    if (!FormComponent) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [FormComponent, onClose]);

  if (!FormComponent) return null;

  const displayError = inlineError || editErrorProp;

  const enhancedFormProps = {
    ...formProps,
    onSubmit: wrappedOnSubmit,
  };

  return (
    <>
      <div className="fixed inset-0 z-[1099] bg-black/50" onClick={() => onClose(false)} />
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl pointer-events-auto flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header sticky */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0 z-10">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-800">
                {editItem?.id ? `Editar ${TITULO}` : `Novo ${TITULO}`}
              </h2>
              {displayError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1 break-words">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{displayError}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {(isSaving) && (
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
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Corpo do formulário */}
          <div className="p-6 flex-1 overflow-auto">
            <FormComponent
              key={"form-" + ENTITY + "-" + (editItem?.id || "new") + "-" + formKey}
              {...enhancedFormProps}
            />
          </div>
        </div>
      </div>
    </>
  );
}