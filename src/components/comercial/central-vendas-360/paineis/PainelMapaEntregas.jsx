// Mapa de entregas da Central 360° — coordenadas reais das Entregas e contadores por janela de entrega
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Navigation, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
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

  // Roteirização: reaproveita a otimização já existente da Expedição (optimizeDeliveryRoute)
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [otimizando, setOtimizando] = useState(false);
  const [rota, setRota] = useState(null);
  const [ordem, setOrdem] = useState([]);

  const pontosOrdenados = useMemo(() => {
    if (!ordem.length) return resumo.pontos;
    const posicao = new Map(ordem.map((id, indice) => [id, indice]));
    const peso = (item) => (posicao.has(item.entrega.id) ? posicao.get(item.entrega.id) : Number.MAX_SAFE_INTEGER);
    return [...resumo.pontos].sort((a, b) => peso(a) - peso(b));
  }, [resumo.pontos, ordem]);

  const otimizarRota = async () => {
    if (!empresaAtual?.id) {
      toast.error('Selecione uma empresa para otimizar a rota.');
      return;
    }
    setOtimizando(true);
    try {
      const resposta = await base44.functions.invoke('optimizeDeliveryRoute', {
        empresa_id: empresaAtual.id,
        group_id: grupoAtual?.id || null,
        entrega_ids: (entregas || []).map((entrega) => entrega.id),
      });
      const dados = resposta?.data || {};
      if (dados.error) throw new Error(dados.error);
      setRota({
        distancia: Number(dados.total_distance_m) || 0,
        duracao: Number(dados.total_duration_s) || 0,
      });
      setOrdem((dados.ordered || []).map((item) => item.entrega_id || item.id || item).filter(Boolean));
      toast.success('Rota otimizada para as entregas desta negociação.');
    } catch (erro) {
      toast.error(`Otimização indisponível agora: ${erro.message}`);
    } finally {
      setOtimizando(false);
    }
  };

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

      <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1">
        <button
          type="button"
          onClick={otimizarRota}
          disabled={otimizando}
          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
          title="Ordenar as entregas pela rota otimizada"
        >
          <Navigation className="w-3.5 h-3.5" /> {otimizando ? 'Otimizando…' : 'Otimizar rota'}
        </button>
        {rota && (
          <span className="text-[10px] text-slate-600">
            {(rota.distancia / 1000).toFixed(1)} km • {Math.round(rota.duracao / 60)} min
          </span>
        )}
      </div>

      {resumo.pontos.length > 0 ? (
        <div className="rounded border border-slate-200 overflow-hidden" style={{ height: 200 }}>
          <MapContainer center={centro} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {pontosOrdenados.map(({ entrega, coords }, indice) => (
              <CircleMarker key={entrega.id} center={coords} radius={7} pathOptions={{ color: '#4f46e5', fillColor: '#818cf8', fillOpacity: 0.8 }}>
                <Popup>
                  <span className="text-xs font-semibold">{indice + 1}. {entrega.cliente_nome || entrega.numero_pedido}</span>
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