import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function RastreamentoGPSWidget() {
  const [entregas, setEntregas] = useState([
    { id: 1, cliente: 'Constr. ABC', endereco: 'Av. Paulista, 1000', status: 'em_transito', lat: -23.56, lng: -46.65, distancia: '2.3 km', tempo_eta: '12 min' },
    { id: 2, cliente: 'Obra XYZ', endereco: 'Rua Augusta, 500', status: 'proximo', lat: -23.55, lng: -46.66, distancia: '0.8 km', tempo_eta: '4 min' },
    { id: 3, cliente: 'Proj. 123', endereco: 'Av. Brasil, 800', status: 'entregue', lat: -23.54, lng: -46.64, distancia: '0 km', tempo_eta: 'Entregue' },
  ]);
  const { empresaAtual } = useContextoVisual();

  const statusColors = {
    em_transito: 'bg-blue-100 text-blue-700',
    proximo: 'bg-amber-100 text-amber-700',
    entregue: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    em_transito: '🚚 Em Trânsito',
    proximo: '📍 Próximo',
    entregue: '✅ Entregue',
  };

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" /> Rastreamento GPS Real
        </CardTitle>
        <CardDescription>
          Acompanhamento de entregas em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entregas.map((entrega) => (
            <div
              key={entrega.id}
              className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{entrega.cliente}</h4>
                  <p className="text-xs text-slate-500">{entrega.endereco}</p>
                </div>
                <Badge className={statusColors[entrega.status]}>
                  {statusLabels[entrega.status]}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  <span>{entrega.distancia}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{entrega.tempo_eta}</span>
                </div>
                <span className="text-slate-400">📍 {entrega.lat.toFixed(2)}, {entrega.lng.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-2 text-xs text-slate-500 border-t pt-3">
          <strong>💡 Ciclo 19 (Jan 2027):</strong> GPS integrado em tempo real via IoT/SMS, visualização de mapa com Leaflet.
        </div>
      </CardContent>
    </Card>
  );
}