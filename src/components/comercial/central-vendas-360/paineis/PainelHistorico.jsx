// Painel de histórico do Cliente 360° — linha do tempo do cliente e pedidos anteriores
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import TimelineCliente from '@/components/cliente/TimelineCliente';
import PainelRegistros from './PainelRegistros';

export default function PainelHistorico({ clienteId }) {
  const [verPedidos, setVerPedidos] = useState(false);

  if (!clienteId) {
    return <p className="text-sm text-slate-500">Negociação sem cliente vinculado para montar o histórico.</p>;
  }

  return (
    <div className="space-y-2">
      <TimelineCliente clienteId={clienteId} />

      <div className="rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setVerPedidos((v) => !v)}
          aria-expanded={verPedidos}
          className="w-full flex items-center gap-1.5 px-2.5 py-2 text-left hover:bg-slate-50"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">Pedidos anteriores</span>
          {verPedidos
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-auto" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto" />}
        </button>
        {verPedidos && (
          <div className="border-t border-slate-100 p-2">
            <PainelRegistros
              entity="Pedido"
              filter={{ cliente_id: clienteId }}
              ordenacao="-data_pedido"
              vazio="Nenhum pedido anterior localizado para este cliente."
              campos={[
                { key: 'numero_pedido', destaque: true },
                { key: 'status', label: 'Situação' },
                { key: 'valor_total', label: 'Valor', tipo: 'moeda' },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}