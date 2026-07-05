import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Navigation, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Mapa de Rastreamento em Tempo Real
 * P2: Multi-tenant — usa filterInContext
 */
export default function MapaRastreamentoRealTime({ entregaId, empresaId }) {
  const [posicaoAtual, setPosicaoAtual] = useState(null);
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaId || empresaAtual?.id || 'sem-empresa'}`;

  const { data: posicoes = [], refetch } = useQuery({
    queryKey: ['posicoes-veiculo', entregaId, contextoKey],
    queryFn: () => filterInContext('PosicaoVeiculo',
      { entrega_id: entregaId },
      '-data_hora',
      100
    ),
    refetchInterval: 60000,
    enabled: !!entregaId && !!contextoKey
  });

  const { data: entrega } = useQuery({
    queryKey: ['entrega', entregaId, contextoKey],
    queryFn: async () => {
      const entregas = await filterInContext('Entrega', { id: entregaId });
      return entregas[0];
    },
    enabled: !!entregaId && !!contextoKey
  });

  useEffect(() => {
    if (posicoes.length > 0) {
      setPosicaoAtual(posicoes[0]); // Posição mais recente
    }
  }, [posicoes]);

  if (!entrega) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Selecione uma entrega para rastrear</p>
        </CardContent>
      </Card>
    );
  }

  const posicaoDestino = {
    lat: entrega.endereco_entrega_completo?.latitude,
    lng: entrega.endereco_entrega_completo?.longitude
  };

  const posicaoVeiculo = posicaoAtual ? {
    lat: posicaoAtual.latitude,
    lng: posicaoAtual.longitude
  } : null;

  const centerMap = posicaoVeiculo || posicaoDestino || { lat: -23.55, lng: -46.63 };

  return (
    <Card className="h-full">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Rastreamento em Tempo Real
          </div>
          {posicaoAtual && (
            <Badge className="bg-green-100 text-green-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
              Online
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] relative">
          <MapContainer
            center={[centerMap.lat, centerMap.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Marcador do Destino */}
            {posicaoDestino.lat && (
              <Marker position={[posicaoDestino.lat, posicaoDestino.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">Destino</p>
                    <p className="text-slate-600">{entrega.cliente_nome}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcador do Veículo */}
            {posicaoVeiculo && (
              <Marker position={[posicaoVeiculo.lat, posicaoVeiculo.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Veículo
                    </p>
                    <p className="text-slate-600">{posicaoAtual.motorista_nome}</p>
                    <p className="text-xs text-slate-500">
                      Velocidade: {posicaoAtual.velocidade_kmh?.toFixed(0)} km/h
                    </p>
                    <p className="text-xs text-slate-500">
                      Atualizado: {new Date(posicaoAtual.data_hora).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Linha da Rota */}
            {posicaoVeiculo && posicaoDestino.lat && (
              <Polyline
                positions={[
                  [posicaoVeiculo.lat, posicaoVeiculo.lng],
                  [posicaoDestino.lat, posicaoDestino.lng]
                ]}
                color="#3b82f6"
                dashArray="10, 10"
              />
            )}
          </MapContainer>

          {/* Info Overlay */}
          {posicaoAtual && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Distância Restante</p>
                  <p className="font-semibold text-blue-600">
                    {posicaoAtual.distancia_proxima_entrega_km?.toFixed(1) || '-'} km
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Tempo Estimado</p>
                  <p className="font-semibold text-orange-600">
                    {posicaoAtual.tempo_estimado_proxima_entrega_min || '-'} min
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Status</p>
                  <Badge className="bg-blue-100 text-blue-700">
                    {posicaoAtual.status_movimento}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}