// Ações rápidas contextuais da Central 360° — exibidas sob a identificação do Cliente 360°
import React from 'react';

export default function AcoesRapidas360({ acoes = [] }) {
  if (!acoes.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mr-0.5">Ações rápidas</span>
      {acoes.map(({ id, label, icon: Icone, onClick, disabled, title, destaque }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
          disabled={disabled}
          title={title || label}
          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            destaque
              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {Icone && <Icone className="w-3 h-3" />}
          {label}
        </button>
      ))}
    </div>
  );
}