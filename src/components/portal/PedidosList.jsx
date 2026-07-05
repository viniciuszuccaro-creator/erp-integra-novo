import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function PedidosList({ cliente }) {
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const { data: pedidos = [] } = useQuery({
    queryKey: ['portal-pedidos', cliente?.id, contextoKey],
    enabled: !!cliente?.id,
    queryFn: async () => {
      return filterInContext('Pedido', { cliente_id: cliente.id, pode_ver_no_portal: true }, '-data_pedido', 50);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {pedidos.map((p) => (
        <Card key={p.id} className="w-full">
          <CardContent className="p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 mt-0.5 text-primary" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium truncate">Pedido #{p.numero_pedido || p.id}</div>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Data: {p.data_pedido || '—'} • Valor: R$ {Number(p.valor_total || 0).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
      {pedidos.length === 0 && (
        <div className="text-sm text-muted-foreground">Sem pedidos visíveis no portal.</div>
      )}
    </div>
  );
}