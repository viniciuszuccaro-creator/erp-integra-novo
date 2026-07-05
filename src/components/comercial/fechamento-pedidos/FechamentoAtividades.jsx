import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Zap } from 'lucide-react';

export default function FechamentoAtividades({ pedidosComAutomacao }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimos Pedidos Fechados Automaticamente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pedidosComAutomacao.slice(0, 5).map(pedido => (
            <div key={pedido.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{pedido.numero_pedido}</p>
                  <p className="text-xs text-slate-600">{pedido.cliente_nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(pedido.updated_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <Badge className="bg-green-600 text-white">{pedido.status}</Badge>
              </div>
            </div>
          ))}
          {pedidosComAutomacao.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum pedido fechado automaticamente ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}