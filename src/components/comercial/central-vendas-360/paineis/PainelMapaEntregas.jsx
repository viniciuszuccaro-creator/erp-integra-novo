// Mapa de entregas da Central 360° — coordenadas reais das Entregas e contadores por janela de entrega
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Truck } from 'lucide-react';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { FILTRO_RELACIONADO } from './paineisConfig';

const CENTRO_PADRAO = [-23.5505, -46.6333];

const janelaDe = (entrega) => {
  const inicio = String(entrega?.janela_entrega_inicio || '').trim();
  const hora = Number(inicio.slice(0, 2));
  if (!inicio || Number.isNaN(hora)) return 'Sem janela';
  if (hora < 12) return 'Manhã (até 12h)';
  if (hora < 18) return 'Tarde (12h–18h)';
  return 'Noite (após 18h)';
};

const coordenadasDe = (entrega) => {
  const endereco = entrega?.endereco_entrega_completo || {};
  const latitude = Number(endereco.latitude);
  const longitude = Number(endereco.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (!latitude && !longitude)) return null;
  return [latitude, longitude];
};

export default function PainelMapaEntregas({ negociacao }) {
  const { pedidoId, clienteId } = FILTRO_RELACIONADO(negociacao);
  const filtro = pedidoId ? { pedido_id: pedidoId } : { cliente_id: clienteId };

  const { data: entregas = [], isLoading } = useRLSQuery(
    'Entrega',
    filtro,
    '-created_date',
    100,
    { enabled: !!(pedidoId || clienteId), staleTime: 60000 }
  );

  const resumo = useMemo(() => {
    const lista = entregas || [];
    const janelas = lista.reduce((acc, entrega) => {
      const janela = janelaDe(entrega);
      acc[janela] = (acc[janela] || 0) + 1;
      return acc;
    }, {});

    const pontos = lista
      .map((entrega) => ({ entrega, coords: coordenadasDe(entrega) }))
      .filter((item) => item.coords);

    return {
      total: lista.length,
      emRota: lista.filter((e) => ['Saiu para Entrega', 'Em Trânsito', 'Pronto para Expedir'].includes(e.status)).length,
      entregues: lista.filter((e) => e.status === 'Entregue').length,
      frustradas: lista.filter((e) => e.status === 'Entrega Frustrada').length,
      janelas,
      pontos,
    };
  }, [entregas]);

  if (!pedidoId && !clienteId) {
    return <p className="text-[11px] text-slate-500">Selecione uma negociação para ver as entregas.</p>;
  }

  if (isLoading) {
    return <p className="text-[11px] text-slate-500">Carregando entregas…</p>;
  }

  if (resumo.total === 0) {
    return (
      <p className="text-[11px] text-slate-500 inline-flex items-center gap-1">
        <Truck className="w-3.5 h-3.5" /> Nenhuma entrega registrada para esta negociação/cliente.
      </p>
    );
  }

  const centro = resumo.pontos[0]?.coords || CENTRO_PADRAO;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded border border-slate-200 bg-white px-2 py-1">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Entregas</p>
          <p className="text-sm font-semibold text-slate-800">{resumo.total}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white px-2 py-1">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Em rota</p>
          <p className="text-sm font-semibold text-blue-700">{resumo.emRota}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white px-2 py-1">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Entregues</p>
          <p className="text-sm font-semibold text-emerald-700">{resumo.entregues}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white px-2 py-1">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Frustradas</p>
          <p className="text-sm font-semibold text-red-700">{resumo.frustradas}</p>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white p-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Janelas de entrega
        </p>
        <ul className="space-y-0.5">
          {Object.entries(resumo.janelas).map(([janela, quantidade]) => (
            <li key={janela} className="flex items-center justify-between text-[11px] text-slate-600">
              <span>{janela}</span>
              <span className="font-semibold text-slate-800">{quantidade}</span>
            </li>
          ))}
        </ul>
      </div>

      {resumo.pontos.length > 0 ? (
        <div className="rounded border border-slate-200 overflow-hidden" style={{ height: 200 }}>
          <MapContainer center={centro} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {resumo.pontos.map(({ entrega, coords }) => (
              <CircleMarker key={entrega.id} center={coords} radius={7} pathOptions={{ color: '#4f46e5', fillColor: '#818cf8', fillOpacity: 0.8 }}>
                <Popup>
                  <span className="text-xs font-semibold">{entrega.cliente_nome || entrega.numero_pedido}</span>
                  <br />
                  <span className="text-xs">{entrega.status}</span>
                  <br />
                  <span className="text-xs">
                    {entrega.janela_entrega_inicio || '--'} às {entrega.janela_entrega_fim || '--'}
                  </span>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Entregas sem coordenadas no endereço — mapa indisponível.
        </p>
      )}
    </div>
  );
}