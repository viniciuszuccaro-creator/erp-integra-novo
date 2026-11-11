// Fechamento → direcionamento operacional: Produção, Entrega ou Retira (sem salto de etapas)
import React from 'react';
import { Factory, Store, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const DESTINOS_PEDIDO = [
  {
    id: 'producao',
    label: 'Produção',
    descricao: 'Itens fabricados seguem para a produção antes de entrega ou retirada.',
    icon: Factory,
  },
  {
    id: 'entrega',
    label: 'Entrega',
    descricao: 'Mercadoria de revenda disponível segue para separação, conferência e rota.',
    icon: Truck,
  },
  {
    id: 'retira',
    label: 'Retira',
    descricao: 'Cliente retira no balcão depois da separação e conferência.',
    icon: Store,
  },
];

export default function DestinoPedidoDialog({ aberto, onOpenChange, onConfirmar, numero, salvando }) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Direcionar o pedido {numero}</DialogTitle>
          <DialogDescription>
            Escolha o destino operacional do pedido fechado. A etapa escolhida fica registrada no pedido
            e o módulo responsável (Produção, Expedição ou Retira) assume o acompanhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {DESTINOS_PEDIDO.map((destino) => {
            const Icon = destino.icon;
            return (
              <button
                key={destino.id}
                type="button"
                disabled={salvando}
                onClick={() => onConfirmar(destino.id)}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-blue-400 hover:bg-blue-50 disabled:opacity-60"
              >
                <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">{destino.label}</span>
                  <span className="block text-[11px] text-slate-500">{destino.descricao}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}