// Rodapé fixo — totais, condição e ações da etapa
import React from 'react';
import { Button } from '@/components/ui/button';
import { brl } from './negociacaoUtils';

export default function RodapeNegociacao({
  totais, condicaoPagamento, prazo,
  editavel, sujo, salvando,
  acaoLabel, acaoDescricao, acaoDesabilitada,
  onSalvar, onVoltar, onAvancar,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        <span>Produtos: <span className="font-semibold text-slate-800">{brl(totais.produtos)}</span></span>
        <span>Desconto: <span className="font-semibold text-slate-800">{brl(totais.desconto)}</span></span>
        <span>Frete: <span className="font-semibold text-slate-800">{brl(totais.frete)}</span></span>
        <span>Condição: <span className="font-semibold text-slate-800">{condicaoPagamento}</span></span>
        <span>Prazo: <span className="font-semibold text-slate-800">{prazo}</span></span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Total da negociação</p>
          <p className="text-lg font-bold text-indigo-700 leading-none">{brl(totais.total)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onVoltar}>Voltar</Button>
          {editavel && (
            <Button type="button" variant="secondary" size="sm" onClick={onSalvar} disabled={!sujo || salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={onAvancar}
            disabled={acaoDesabilitada}
            title={acaoDescricao}
          >
            {acaoLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}