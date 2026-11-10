// Painel lateral da Central 360 — resumo simples de campos da negociação
import React from 'react';

export default function PainelResumo({ linhas = [], nota, bloco }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        {linhas.map((linha) => (
          <div key={linha.label} className="flex items-start justify-between gap-3 px-3 py-2">
            <span className="text-xs text-slate-500">{linha.label}</span>
            <span className="text-xs font-medium text-slate-800 text-right">{linha.valor ?? '—'}</span>
          </div>
        ))}
      </div>
      {bloco}
      {nota && <p className="text-xs text-slate-500 leading-relaxed">{nota}</p>}
    </div>
  );
}