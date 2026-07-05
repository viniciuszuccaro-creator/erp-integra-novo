import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, ExternalLink } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function EntregasList({ cliente }) {
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const { data: entregas = [] } = useQuery({
    queryKey: ['portal-entregas', cliente?.id, contextoKey],
    enabled: !!cliente?.id,
    queryFn: async () => {
      return filterInContext('Entrega', { cliente_id: cliente.id }, '-data_previsao', 50);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {entregas.map((e) => (
        <Card key={e.id} className="w-full">
          <CardContent className="p-4 flex items-start gap-3">
            <Truck className="w-5 h-5 mt-0.5 text-primary" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium truncate">Entrega do Pedido #{e.numero_pedido || '—'}</div>
                <Badge variant="secondary">{e.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Previsão: {e.data_previsao || '—'}</div>
              {e.link_publico_rastreamento && (
                <a className="text-xs text-primary inline-flex items-center gap-1 mt-1" href={e.link_publico_rastreamento} target="_blank" rel="noreferrer">
                  Acompanhar rastreamento <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {entregas.length === 0 && (
        <div className="text-sm text-muted-foreground">Sem entregas encontradas.</div>
      )}
    </div>
  );
}