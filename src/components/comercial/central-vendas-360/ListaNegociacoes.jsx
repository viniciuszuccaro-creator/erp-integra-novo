// Lista de negociações — localiza abertos, aguardando, em aprovação, em execução, fechados e cancelados
import React from 'react';
import { Search } from 'lucide-react';
import { GRUPOS_NEGOCIACAO, SITUACAO_ESTILO, brl, dataCurta } from './negociacaoUtils';

export default function ListaNegociacoes({
  negociacoes, selecionada, onSelect, busca, setBusca, grupo, setGrupo, carregando,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white flex flex-col min-h-0 w-full">
      <div className="p-2 border-b border-slate-100 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Cliente, número ou vendedor"
            className="w-full rounded-md border border-slate-200 pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {GRUPOS_NEGOCIACAO.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setGrupo(opcao.id)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                grupo === opcao.id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {carregando && <p className="px-3 py-4 text-xs text-slate-500">Carregando negociações…</p>}
        {!carregando && negociacoes.length === 0 && (
          <p className="px-3 py-6 text-xs text-slate-500">Nenhuma negociação encontrada com esses filtros.</p>
        )}
        {negociacoes.map((negociacao) => {
          const ativa = selecionada?.chave === negociacao.chave;
          return (
            <button
              key={negociacao.chave}
              type="button"
              onClick={() => onSelect(negociacao)}
              className={`w-full text-left px-3 py-2 border-b border-slate-50 transition-colors ${
                ativa ? 'bg-indigo-50 border-l-2 border-l-indigo-600' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 truncate">{negociacao.cliente_nome}</span>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${SITUACAO_ESTILO[negociacao.grupo]}`}>
                  {negociacao.situacao}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="truncate">
                  {negociacao.origem === 'orcamento' ? 'Orçamento' : 'Pedido'} {negociacao.numero} · {dataCurta(negociacao.data)}
                </span>
                <span className="font-semibold text-slate-700 shrink-0">{brl(negociacao.totais.total)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}