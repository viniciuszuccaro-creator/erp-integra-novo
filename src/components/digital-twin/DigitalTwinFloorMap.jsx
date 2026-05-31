/**
 * DigitalTwinFloorMap v1.0
 * Planta baixa 2D/3D interativa da empresa
 * Visualização CSS pura (sem dependências 3D extras)
 * Regra-Mãe: w-full, h-full, real-time, responsivo
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ZONAS = [
  { id: 'producao', label: 'Produção', x: 5, y: 5, w: 38, h: 40, status: 'ok', operadores: 12, eficiencia: 94 },
  { id: 'estoque', label: 'Estoque', x: 48, y: 5, w: 25, h: 40, status: 'alerta', operadores: 4, eficiencia: 78 },
  { id: 'expedicao', label: 'Expedição', x: 78, y: 5, w: 18, h: 40, status: 'ok', operadores: 6, eficiencia: 91 },
  { id: 'escritorio', label: 'Escritório', x: 5, y: 52, w: 40, h: 30, status: 'ok', operadores: 18, eficiencia: 97 },
  { id: 'manutencao', label: 'Manutenção', x: 50, y: 52, w: 20, h: 30, status: 'critico', operadores: 2, eficiencia: 60 },
  { id: 'refeitorio', label: 'Refeitório', x: 75, y: 52, w: 21, h: 30, status: 'ok', operadores: 0, eficiencia: 100 },
];

const getZonaColor = (status) => ({
  ok: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', pulse: 'rgba(34,197,94,0.3)' },
  alerta: { bg: 'rgba(234,179,8,0.15)', border: '#eab308', pulse: 'rgba(234,179,8,0.3)' },
  critico: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', pulse: 'rgba(239,68,68,0.3)' },
}[status]);

export default function DigitalTwinFloorMap({ empresa }) {
  const [selectedZona, setSelectedZona] = useState(null);
  const [tick, setTick] = useState(0);

  // Simula "pulso" ao vivo nas zonas
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const zona = ZONAS.find((z) => z.id === selectedZona);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-6 overflow-auto">
      {/* Planta */}
      <div className="flex-1 min-h-[320px] relative">
        <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-widest">
          {empresa} — Planta Interativa (clique em uma zona)
        </p>
        <div
          className="relative w-full rounded-xl border border-cyan-500/30 bg-slate-900/80"
          style={{ paddingTop: '70%' }}
        >
          <div className="absolute inset-0 p-2">
            {ZONAS.map((zona) => {
              const c = getZonaColor(zona.status);
              const isSelected = selectedZona === zona.id;
              return (
                <div
                  key={zona.id}
                  onClick={() => setSelectedZona(zona.id === selectedZona ? null : zona.id)}
                  className="absolute cursor-pointer rounded-lg transition-all hover:opacity-90"
                  style={{
                    left: `${zona.x}%`,
                    top: `${zona.y}%`,
                    width: `${zona.w}%`,
                    height: `${zona.h}%`,
                    background: c.bg,
                    border: `2px solid ${isSelected ? '#ffffff' : c.border}`,
                    boxShadow: isSelected ? `0 0 20px ${c.pulse}` : `0 0 6px ${c.pulse}`,
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="p-2">
                    <p className="text-white font-bold text-xs truncate">{zona.label}</p>
                    <p className="text-slate-300 text-xs">{zona.operadores} ops</p>
                    <div
                      className="w-2 h-2 rounded-full mt-1 animate-pulse"
                      style={{ background: c.border }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Painel lateral de detalhes */}
      <div className="w-full md:w-64 flex flex-col gap-3">
        {zona ? (
          <Card className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
            <h3 className="font-bold text-white text-lg mb-1">{zona.label}</h3>
            <Badge
              className={
                zona.status === 'ok'
                  ? 'bg-green-500/20 text-green-300'
                  : zona.status === 'alerta'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-red-500/20 text-red-300'
              }
            >
              {zona.status.toUpperCase()}
            </Badge>

            <div className="space-y-3 mt-4">
              <div>
                <p className="text-xs text-slate-400">Operadores</p>
                <p className="text-2xl font-bold text-white">{zona.operadores}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Eficiência</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${zona.eficiencia}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm">{zona.eficiencia}%</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-slate-400 text-sm">Clique em uma zona para ver detalhes</p>
          </div>
        )}

        {/* Legenda */}
        <Card className="p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-slate-400 mb-2 font-semibold">Legenda</p>
          {[
            { label: 'Operacional', color: '#22c55e' },
            { label: 'Alerta', color: '#eab308' },
            { label: 'Crítico', color: '#ef4444' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              <p className="text-xs text-slate-300">{l.label}</p>
            </div>
          ))}
        </Card>

        {/* Stats Globais */}
        {ZONAS.map((z) => (
          <div
            key={z.id}
            onClick={() => setSelectedZona(z.id)}
            className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-white font-semibold">{z.label}</p>
              <span className="text-xs" style={{ color: getZonaColor(z.status).border }}>●</span>
            </div>
            <p className="text-xs text-slate-400">{z.operadores} ops · {z.eficiencia}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}