import React from 'react';
import { Trash2 } from 'lucide-react';
import { brl } from '@/components/comercial/central-vendas-360/negociacaoUtils';

const input = 'w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary';
export default function ItemNegociacaoLinha({ item, editavel, permiteDesconto, alterar, incluir, remover }) {
  return (
    <div className="grid grid-cols-[1fr_70px_64px_100px_70px_100px_32px] gap-2 px-3 py-1.5 border-b border-border items-center text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="shrink-0 rounded bg-secondary text-secondary-foreground px-1 py-0.5 text-[10px] font-semibold">{item.tipo === 'fabricacao' ? 'FAB' : item.tipo === 'servico' ? 'SER' : 'REV'}</span>
        {editavel ? <input aria-label="Descrição do item" className={input} value={item.descricao} placeholder="Descrição do item" onChange={(e) => alterar(item.id, 'descricao', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') incluir(); }} /> : <span className="truncate text-foreground" title={item.descricao}>{item.descricao}</span>}
      </div>
      {editavel ? <>
        <input aria-label="Quantidade" type="number" min="0" className={input} value={item.quantidade} onChange={(e) => alterar(item.id, 'quantidade', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') incluir(); }} />
        <input aria-label="Unidade" className={input} value={item.unidade} onChange={(e) => alterar(item.id, 'unidade', e.target.value)} />
        <input aria-label="Valor unitário" type="number" min="0" step="0.01" className={input} value={item.valor_unitario} onChange={(e) => alterar(item.id, 'valor_unitario', e.target.value)} />
        <input aria-label="Desconto percentual" type="number" min="0" max={permiteDesconto ? 100 : 15} step="0.01" className={input} value={item.desconto_percentual} title={permiteDesconto ? 'Desconto do item' : 'Limite de 15%. É permitido reduzir um desconto anterior.'} onChange={(e) => alterar(item.id, 'desconto_percentual', Math.max(0, Math.min(permiteDesconto ? 100 : 15, Number(e.target.value))))} />
      </> : <>
        <span>{item.quantidade}</span><span>{item.unidade}</span><span>{brl(item.valor_unitario)}</span><span>{item.desconto_percentual}%</span>
      </>}
      <span className="text-right font-semibold text-foreground">{brl(item.valor_total)}</span>
      {editavel ? <button type="button" onClick={() => remover(item.id)} className="text-muted-foreground hover:text-destructive" title="Remover item" aria-label={`Remover ${item.descricao || 'item'}`}><Trash2 className="w-3.5 h-3.5" /></button> : <span />}
    </div>
  );
}