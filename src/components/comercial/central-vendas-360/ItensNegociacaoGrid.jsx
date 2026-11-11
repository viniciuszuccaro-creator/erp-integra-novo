// Duas grades simultâneas da V6; cada uma mantém sua própria rolagem, sem abas.
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useSaldosItensPedido from '@/components/comercial/central-vendas-360/useSaldosItensPedido';
import SaldoItemNegociacao from '@/components/comercial/central-vendas-360/SaldoItemNegociacao';
import { Button } from '@/components/ui/button';
import ItemNegociacaoLinha from '@/components/comercial/central-vendas-360/ItemNegociacaoLinha';
import { brl, totalizarItens } from '@/components/comercial/central-vendas-360/negociacaoUtils';

export default function ItensNegociacaoGrid({ itens = [], setItens, editavel, permiteDesconto = true, pedido }) {
  const [mostrarSaldos, setMostrarSaldos] = useState(false);
  const saldos = useSaldosItensPedido(pedido, mostrarSaldos);
  const alterar = (id, campo, valor) => setItens((atual) => atual.map((item) => {
    if (item.id !== id) return item;
    const novo = { ...item, [campo]: valor };
    return { ...novo, valor_total: Number(novo.quantidade || 0) * Number(novo.valor_unitario || 0) * (1 - Number(novo.desconto_percentual || 0) / 100) };
  }));
  const novoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const incluir = (tipo) => setItens((atual) => [...atual, { id: `novo-${novoId()}`, produto_id: null, descricao: '', quantidade: 1, unidade: 'UN', valor_unitario: 0, desconto_percentual: 0, valor_total: 0, tipo }]);
  const remover = (id) => setItens((atual) => atual.filter((item) => item.id !== id));
  return (
    <div className="w-full h-full flex-1 min-h-0 min-w-0 flex flex-col gap-2">
      {mostrarSaldos && saldos.permitido && <div className="shrink-0 text-xs text-muted-foreground" role={saldos.isError ? 'alert' : 'status'}>{saldos.isFetching ? 'Consultando saldos oficiais…' : saldos.isError ? (saldos.error?.message) : 'Saldos oficiais por item. Sem vínculo verificável não significa zero. Estoque, faturamento e cobranças não são alterados aqui.'}{!saldos.isFetching && <button type="button" className="ml-2 font-medium text-primary" onClick={() => saldos.refetch()}>Atualizar saldos</button>}</div>}
      {[{ tipo: 'fabricacao', titulo: 'Corte e Dobra / Montagem' }, { tipo: 'revenda', titulo: 'Materiais de Revenda / Serviços' }].map(({ tipo, titulo }) => {
        const lista = itens.filter((item) => tipo === 'fabricacao' ? item.tipo === 'fabricacao' : item.tipo !== 'fabricacao');
        const totais = totalizarItens(lista);
        return (
          <section key={tipo} aria-label={titulo} className="w-full h-full flex-1 min-h-[145px] min-w-0 rounded-lg border border-border bg-card flex flex-col overflow-hidden resize-y">
            <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground">{titulo} <span className="font-normal text-muted-foreground">({lista.length})</span></h3>
              <div className="flex flex-wrap justify-end gap-1">{pedido && saldos.permitido && <button type="button" aria-expanded={mostrarSaldos} onClick={() => setMostrarSaldos((v) => !v)} className="h-7 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">{mostrarSaldos ? 'Ocultar saldos' : 'Saldos por item'}</button>}{editavel && <Button type="button" size="sm" variant="outline" onClick={() => incluir(tipo)} className="h-7 text-xs"><Plus className="w-3.5 h-3.5 mr-1" /> Incluir item</Button>}</div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="min-w-[720px]">
                <div className="sticky top-0 z-10 grid grid-cols-[1fr_70px_64px_100px_70px_100px_32px] gap-2 px-3 py-1.5 bg-muted text-[11px] font-semibold text-muted-foreground border-b border-border"><span>Item</span><span>Qtd</span><span>Un</span><span>Valor un.</span><span>Desc %</span><span className="text-right">Total</span><span /></div>
                {!lista.length && <p className="px-3 py-4 text-xs text-muted-foreground">Nenhum item neste grupo.{editavel ? ' Use Incluir item para começar.' : ''}</p>}
                {lista.map((item) => <React.Fragment key={item.id}><ItemNegociacaoLinha item={item} editavel={editavel} permiteDesconto={permiteDesconto} alterar={alterar} incluir={() => incluir(tipo)} remover={remover} />{mostrarSaldos && saldos.permitido && saldos.data && !saldos.isError && <SaldoItemNegociacao saldo={saldos.porChave.get(item.chave_saldo)} permissoes={saldos.data.permissoes} fabricacao={item.tipo === 'fabricacao'} />}</React.Fragment>)}
              </div>
            </div>
            <div className="shrink-0 px-3 py-1.5 border-t border-border flex flex-wrap gap-x-4 text-xs text-muted-foreground"><span>Produtos: {brl(totais.produtos)}</span><span>Desconto: {brl(totais.desconto)}</span><span className="ml-auto font-semibold text-primary">Total: {brl(totais.total)}</span></div>
          </section>
        );
      })}
    </div>
  );
}