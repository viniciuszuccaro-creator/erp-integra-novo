import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

export default function InventarioContagem({ itens = [], onChange, disabled = false }) {
  const atualizar = (idx, patch) => {
    const novo = itens.map((it, i) => i === idx ? { ...it, ...patch, ajuste: (Number((it.contagem ?? 0)) - Number((it.saldo_sistema ?? 0))) } : it);
    onChange(novo);
  };

  const adicionar = () => { if (!disabled) onChange([ ...itens, { produto_id: '', produto_descricao: '', unidade: 'UN', saldo_sistema: 0, contagem: 0, ajuste: 0 } ]); };
  const remover = (idx) => { if (!disabled) onChange(itens.filter((_, i) => i !== idx)); };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Itens do Inventário</h4>
        <Button size="sm" variant="outline" disabled={disabled} onClick={adicionar}><Plus className="w-3 h-3 mr-1"/>Adicionar</Button>
      </div>
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500">
        <div className="col-span-4">Produto (descrição)</div>
        <div>Unid</div>
        <div className="col-span-2">Saldo Sist.</div>
        <div className="col-span-2">Contagem</div>
        <div className="col-span-2">Ajuste</div>
        <div></div>
      </div>
      {itens.map((it, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
          <Input className="col-span-4" value={it.produto_descricao} disabled={disabled} onChange={(e)=>atualizar(idx,{ produto_descricao: e.target.value })} placeholder="Descrição do produto" />
          <Input className="col-span-1" value={it.unidade} disabled={disabled} onChange={(e)=>atualizar(idx,{ unidade: e.target.value })} />
          <Input className="col-span-2" type="number" value={it.saldo_sistema} disabled={disabled} onChange={(e)=>atualizar(idx,{ saldo_sistema: Number(e.target.value||0) })} />
          <Input className="col-span-2" type="number" value={it.contagem} disabled={disabled} onChange={(e)=>atualizar(idx,{ contagem: Number(e.target.value||0) })} />
          <Input className="col-span-2" type="number" value={Number(it.contagem||0)-Number(it.saldo_sistema||0)} readOnly />
          <div className="col-span-1 flex justify-end">
            <Button size="icon" variant="ghost" disabled={disabled} onClick={()=>remover(idx)}><Trash2 className="w-4 h-4"/></Button>
          </div>
        </div>
      ))}
    </div>
  );
}