// Desmembrar orçamento: os itens escolhidos passam para um novo orçamento do mesmo cliente
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { brl } from './negociacaoUtils';

export default function DesmembrarDialog({ aberto, onOpenChange, itens = [], onConfirmar, executando, modo = 'desmembrar', erro, controle }) {
  const [marcados, setMarcados] = useState([]);
  const [revisado, setRevisado] = useState(false);
  const duplicar = modo === 'duplicar';
  const retomando = controle && controle.fase !== 'concluida';
  const acaoCorreta = !retomando || controle.acao === modo;

  useEffect(() => {
    if (aberto) {
      setMarcados(itens.filter((_, i) => duplicar || (retomando && controle.indices?.includes(i))).map((i) => i.id));
      setRevisado(false);
    }
  }, [aberto, modo, controle?.operacao_id]);

  const selecionados = useMemo(() => new Set(marcados), [marcados]);
  const totalMover = itens
    .filter((item) => selecionados.has(item.id))
    .reduce((soma, item) => soma + Number(item.valor_total || 0), 0);

  const alternar = (id) => {
    setMarcados((atual) => (atual.includes(id) ? atual.filter((valor) => valor !== id) : [...atual, id]));
  };

  return (
    <Dialog open={aberto} onOpenChange={(valor) => { if (!executando) onOpenChange(valor); }}>
      <DialogContent className="w-full h-full max-w-xl max-h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{duplicar ? 'Duplicar orçamento' : 'Desmembrar itens'}</DialogTitle>
          <DialogDescription>
            {duplicar ? 'Copia os itens salvos para uma nova proposta pendente, sem alterar a origem.' : 'Move os itens marcados para uma nova proposta pendente do mesmo cliente e empresa.'}
            {' '}Preços e descontos vêm da origem e serão revalidados no fechamento; aprovações e assinaturas não são copiadas.
          </DialogDescription>
        </DialogHeader>

        {controle?.fase === 'vinculada' && <p className="text-xs text-muted-foreground">Os itens já foram transferidos. A confirmação abaixo apenas conclui os vínculos, sem mover novamente.</p>}
        <div className="max-h-72 overflow-auto rounded-md border border-slate-200 divide-y divide-slate-100">
          {itens.map((item) => (
            <label key={item.id} className="flex items-center gap-2 px-2.5 py-2 text-xs cursor-pointer hover:bg-slate-50">
              <Checkbox checked={selecionados.has(item.id)} disabled={duplicar || retomando || executando} onCheckedChange={() => { alternar(item.id); setRevisado(false); }} />
              <span className="flex-1 min-w-0 truncate text-slate-700">{item.descricao}</span>
              <span className="text-slate-500 whitespace-nowrap">{item.quantidade} {item.unidade}</span>
              <span className="font-semibold text-slate-800 whitespace-nowrap">{brl(item.valor_total)}</span>
            </label>
          ))}
          {!itens.length && (
            <p className="px-2.5 py-4 text-center text-xs text-slate-500">Nenhum item para desmembrar.</p>
          )}
        </div>

        {retomando && <p className="text-xs text-muted-foreground" role="status">{acaoCorreta ? 'Retomando a operação original, sem reenviar uma criação já iniciada.' : `Existe ${controle.acao} pendente. Feche e escolha a ação correspondente.`}</p>}
        <label className="flex items-start gap-2 text-xs"><Checkbox checked={revisado} disabled={executando || !acaoCorreta} onCheckedChange={(v) => setRevisado(v === true)} /><span>Conferi os itens, o cliente e a empresa desta operação.</span></label>
        {erro && <p role="alert" className="text-xs text-destructive">{erro}</p>}
        <DialogFooter className="items-center justify-between gap-2">
          <span className="text-xs text-slate-500 mr-auto">
            {marcados.length} item(ns) · {brl(totalMover)}
          </span>
          <Button type="button" variant="outline" size="sm" disabled={executando} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={executando || (!retomando && marcados.length === 0) || !revisado || !acaoCorreta}
            onClick={() => onConfirmar(marcados, revisado)}
          >
            {executando ? 'Processando…' : retomando ? 'Retomar operação' : duplicar ? 'Duplicar' : 'Desmembrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}