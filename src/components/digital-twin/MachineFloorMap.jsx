import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MachineFloorMap({ onSelectMachine }) {
  const machines = [
    { id: 'M001', nome: 'Corte A1', x: 10, y: 20, status: 'operando', oee: 92, temp: 65 },
    { id: 'M002', nome: 'Corte A2', x: 30, y: 20, status: 'operando', oee: 88, temp: 68 },
    { id: 'M003', nome: 'Dobragem B1', x: 50, y: 20, status: 'alerta', oee: 72, temp: 78 },
    { id: 'M004', nome: 'Solda C1', x: 70, y: 20, status: 'operando', oee: 85, temp: 72 },
    { id: 'M005', nome: 'Pinturas D1', x: 10, y: 60, status: 'operando', oee: 90, temp: 55 },
    { id: 'M006', nome: 'Embalagem E1', x: 30, y: 60, status: 'parado', oee: 0, temp: 25 },
    { id: 'M007', nome: 'CNC Avançado', x: 50, y: 60, status: 'operando', oee: 94, temp: 62 },
    { id: 'M008', nome: 'Robô Montagem', x: 70, y: 60, status: 'operando', oee: 91, temp: 48 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'operando': return '#10b981';
      case 'alerta': return '#f59e0b';
      case 'parado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'operando': return CheckCircle2;
      case 'alerta': return AlertCircle;
      default: return Zap;
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      <Card className="bg-slate-800 border-slate-700 h-full">
        <CardContent className="p-6 h-full">
          <div className="relative bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg h-96 w-full">
            {/* Grid Background */}
            <svg className="absolute inset-0 w-full h-full opacity-10" style={{ pointerEvents: 'none' }}>
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#94a3b8" />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#94a3b8" />
              ))}
            </svg>

            {/* Máquinas */}
            {machines.map(m => {
              const StatusIcon = getStatusIcon(m.status);
              const color = getStatusColor(m.status);
              
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                >
                  <div className="relative">
                    {/* Glow pulse */}
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: color,
                        opacity: 0.2,
                        marginLeft: '-25px',
                        marginTop: '-25px',
                      }}
                    />
                    
                    {/* Machine node */}
                    <div
                      className="relative w-12 h-12 rounded-lg border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                      style={{ borderColor: color, background: `${color}15` }}
                    >
                      <StatusIcon className="w-6 h-6" style={{ color }} />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p className="font-semibold">{m.nome}</p>
                      <p className="text-slate-300">OEE: {m.oee}% | Temp: {m.temp}°C</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-300">Operando</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-300">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-xs text-slate-300">Parado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}