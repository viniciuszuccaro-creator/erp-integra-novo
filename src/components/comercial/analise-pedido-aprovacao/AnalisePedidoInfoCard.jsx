import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AnalisePedidoInfoCard({ pedido, totais }) {
  return (
    <Card className="bg-slate-50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-600">Pedido</Label>
            <p className="font-semibold text-lg">{pedido.numero_pedido}</p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Cliente</Label>
            <p className="font-semibold">{pedido.cliente_nome}</p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Valor Original</Label>
            <p className="text-xl font-bold text-slate-700">
              R$ {totais.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Vendedor</Label>
            <p className="font-semibold">{pedido.vendedor || '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}