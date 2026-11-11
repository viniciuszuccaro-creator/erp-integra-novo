// Desmembrar orçamento: os itens escolhidos passam para um novo orçamento do mesmo cliente
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { brl } from './negociacaoUtils';

export default function DesmembrarDialog({ aberto, onOpenChange, itens = [], onConfirmar, executando }) {
  const [marcados, setMarcados] = useState([]);

  useEffect(() => {
    if (aberto) setMarcados([]);
  }, [aberto]);

  const selecionados = useMemo(() => new Set(marcados), [marcados]);
  const totalMover = itens
    .filter((item) => selecionados.has(item.id))
    .reduce((soma, item) => soma + Number(item.valor_total || 0), 0);

  const alternar = (id) => {
    setMarcados((atual) => (atual.includes(id) ? atual.filter((valor) => valor !== id) : [...atual, id]));
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Desmembrar itens</DialogTitle>
          <DialogDescription>
            Os itens marcados saem deste orçamento e abrem um novo orçamento para o mesmo cliente, com o
            cadastro de produto e os preços atuais.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-auto rounded-md border border-slate-200 divide-y divide-slate-100">
          {itens.map((item) => (
            <label key={item.id} className="flex items-center gap-2 px-2.5 py-2 text-xs cursor-pointer hover:bg-slate-50">
              <Checkbox checked={selecionados.has(item.id)} onCheckedChange={() => alternar(item.id)} />
              <span className="flex-1 min-w-0 truncate text-slate-700">{item.descricao}</span>
              <span className="text-slate-500 whitespace-nowrap">{item.quantidade} {item.unidade}</span>
              <span className="font-semibold text-slate-800 whitespace-nowrap">{brl(item.valor_total)}</span>
            </label>
          ))}
          {!itens.length && (
            <p className="px-2.5 py-4 text-center text-xs text-slate-500">Nenhum item para desmembrar.</p>
          )}
        </div>

        <DialogFooter className="items-center justify-between gap-2">
          <span className="text-xs text-slate-500 mr-auto">
            {marcados.length} item(ns) · {brl(totalMover)}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={executando || marcados.length === 0}
            onClick={() => onConfirmar(marcados)}
          >
            {executando ? 'Desmembrando…' : 'Desmembrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}