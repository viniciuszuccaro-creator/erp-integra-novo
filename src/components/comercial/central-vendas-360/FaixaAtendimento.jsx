// Faixa de atendimento — conversa/resumo do bot, responsável e próxima ação (recolhível)
import React from 'react';
import { ChevronDown, ChevronUp, Radio, User, Flag } from 'lucide-react';
import { proximaAcao } from './negociacaoUtils';

export default function FaixaAtendimento({ negociacao, aberta, onToggle }) {
  const resumo = negociacao.registro?.observacoes_internas
    || negociacao.registro?.observacoes
    || 'Sem resumo registrado nesta negociação.';
  const acao = proximaAcao(negociacao);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
        aria-expanded={aberta}
      >
        <Radio className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-slate-800">Atendimento</span>
        <span className="text-xs text-slate-500 truncate">{negociacao.canal}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-600">
          <Flag className="w-3.5 h-3.5 text-amber-500" />
          {acao}
        </span>
        {aberta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {aberta && (
        <div className="border-t border-slate-100 px-3 py-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Responsável: <span className="font-medium text-slate-800">{negociacao.vendedor}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            Canal: <span className="font-medium text-slate-800">{negociacao.canal}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Flag className="w-3.5 h-3.5 text-amber-500" />
            Próxima ação: <span className="font-medium text-slate-800">{acao}</span>
          </div>
          <p className="md:col-span-3 text-slate-500 leading-relaxed">{resumo}</p>
        </div>
      )}
    </div>
  );
}