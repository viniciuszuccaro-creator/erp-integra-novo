// Repetir pedido: importa itens de um pedido anterior como base, com preço revalidado no cadastro de Produto
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { brl, dataCurta } from './negociacaoUtils';

const totalItens = (pedido) =>
  (pedido.itens_revenda?.length || 0) + (pedido.itens_armado_padrao?.length || 0) + (pedido.itens_corte_dobra?.length || 0);

export default function ImportarItensDialog({ aberto, onOpenChange, clienteId, onImportar, importando }) {
  const { data: pedidos = [], isLoading } = useRLSQuery(
    'Pedido',
    { cliente_id: clienteId },
    '-created_date',
    20,
    { enabled: aberto && !!clienteId, staleTime: 30000 }
  );

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar itens de pedido anterior</DialogTitle>
          <DialogDescription>
            Os itens entram como base da negociação e o preço é recalculado pelo cadastro oficial de Produto.
            Desconto, estoque, limite e condição são revalidados no fechamento.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-auto rounded-md border border-slate-200 divide-y divide-slate-100">
          {isLoading && <p className="px-3 py-4 text-center text-xs text-slate-500">Carregando pedidos…</p>}
          {!isLoading && !pedidos.length && (
            <p className="px-3 py-4 text-center text-xs text-slate-500">Nenhum pedido anterior deste cliente.</p>
          )}
          {pedidos.map((pedido) => (
            <button
              key={pedido.id}
              type="button"
              disabled={importando}
              onClick={() => onImportar(pedido)}
              className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-left text-xs hover:bg-slate-50 disabled:opacity-60"
            >
              <span className="font-semibold text-blue-700">{pedido.numero_pedido || 'Sem número'}</span>
              <span className="text-slate-500">{dataCurta(pedido.data_pedido || pedido.created_date)}</span>
              <span className="text-slate-500">{totalItens(pedido)} item(ns)</span>
              <span className="text-slate-500">{pedido.status || '—'}</span>
              <span className="ml-auto font-semibold text-slate-800">{brl(pedido.valor_total || 0)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}