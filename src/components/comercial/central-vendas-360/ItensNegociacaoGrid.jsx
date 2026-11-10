// Grade central de itens da negociação — revenda e fabricação, edição por teclado
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brl, totalizarItens } from './negociacaoUtils';

const classeInput = 'w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400';

function novoItem() {
  return {
    id: `novo-${Date.now()}`,
    produto_id: null,
    descricao: '',
    quantidade: 1,
    unidade: 'UN',
    valor_unitario: 0,
    desconto_percentual: 0,
    valor_total: 0,
    tipo: 'revenda',
  };
}

export default function ItensNegociacaoGrid({ itens, setItens, editavel }) {
  const alterar = (id, campo, valor) => {
    setItens((atual) => atual.map((item) => {
      if (item.id !== id) return item;
      const atualizado = { ...item, [campo]: valor };
      atualizado.valor_total =
        Number(atualizado.quantidade || 0) * Number(atualizado.valor_unitario || 0)
        * (1 - Number(atualizado.desconto_percentual || 0) / 100);
      return atualizado;
    }));
  };

  const incluir = () => setItens((atual) => [...atual, novoItem()]);
  const remover = (id) => setItens((atual) => atual.filter((item) => item.id !== id));
  const totais = totalizarItens(itens);

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-slate-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Itens do orçamento <span className="text-xs font-normal text-slate-500">({itens.length})</span>
        </h3>
        {editavel && (
          <Button type="button" size="sm" variant="outline" onClick={incluir} className="h-7 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Incluir item
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[1fr_70px_64px_100px_70px_100px_32px] gap-2 px-3 py-2 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <span>Item</span><span>Qtd</span><span>Un</span><span>Valor un.</span><span>Desc %</span><span className="text-right">Total</span><span />
          </div>

          {itens.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              Nenhum item nesta negociação. {editavel && 'Use “Incluir item” para começar.'}
            </div>
          )}

          {itens.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_70px_64px_100px_70px_100px_32px] gap-2 px-3 py-1.5 border-b border-slate-50 items-center text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold ${
                    item.tipo === 'fabricacao'
                      ? 'bg-purple-100 text-purple-700'
                      : item.tipo === 'servico'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.tipo === 'fabricacao' ? 'FAB' : item.tipo === 'servico' ? 'SER' : 'REV'}
                </span>
                {editavel ? (
                  <input
                    className={classeInput}
                    value={item.descricao}
                    placeholder="Descrição do item"
                    onChange={(e) => alterar(item.id, 'descricao', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') incluir(); }}
                  />
                ) : (
                  <span className="truncate text-slate-800">{item.descricao}</span>
                )}
              </div>

              {editavel ? (
                <>
                  <input type="number" min="0" className={classeInput} value={item.quantidade}
                    onChange={(e) => alterar(item.id, 'quantidade', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') incluir(); }} />
                  <input className={classeInput} value={item.unidade}
                    onChange={(e) => alterar(item.id, 'unidade', e.target.value)} />
                  <input type="number" min="0" step="0.01" className={classeInput} value={item.valor_unitario}
                    onChange={(e) => alterar(item.id, 'valor_unitario', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') incluir(); }} />
                  <input type="number" min="0" step="0.01" className={classeInput} value={item.desconto_percentual}
                    onChange={(e) => alterar(item.id, 'desconto_percentual', e.target.value)} />
                </>
              ) : (
                <>
                  <span className="text-slate-700">{item.quantidade}</span>
                  <span className="text-slate-700">{item.unidade}</span>
                  <span className="text-slate-700">{brl(item.valor_unitario)}</span>
                  <span className="text-slate-700">{item.desconto_percentual}%</span>
                </>
              )}

              <span className="text-right font-semibold text-slate-900">{brl(item.valor_total)}</span>

              {editavel ? (
                <button type="button" onClick={() => remover(item.id)} className="text-slate-400 hover:text-red-600" title="Remover item">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : <span />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
        <span>Produtos: <span className="font-semibold text-slate-800">{brl(totais.produtos)}</span></span>
        <span>Desconto: <span className="font-semibold text-slate-800">{brl(totais.desconto)}</span></span>
        <span className="ml-auto">Total dos itens: <span className="font-bold text-indigo-700">{brl(totais.total)}</span></span>
      </div>
    </div>
  );
}