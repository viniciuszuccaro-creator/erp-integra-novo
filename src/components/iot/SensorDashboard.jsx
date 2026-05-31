import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Radio, AlertCircle } from 'lucide-react';

export default function SensorDashboard() {
  const sensores = [
    { id: 'S001', nome: 'Temperatura M001', valor: '65°C', status: 'ok', last: 'agora' },
    { id: 'S002', nome: 'Temperatura M002', valor: '68°C', status: 'ok', last: 'agora' },
    { id: 'S003', nome: 'Temperatura M003', valor: '78°C', status: 'alerta', last: 'agora' },
    { id: 'S004', nome: 'Vibração M001', valor: '0.3 mm/s', status: 'ok', last: 'agora' },
    { id: 'S005', nome: 'Vibração M003', valor: '0.8 mm/s', status: 'alerta', last: 'agora' },
    { id: 'S006', nome: 'Umidade Galpão', valor: '45%', status: 'ok', last: '2m atrás' },
    { id: 'S007', nome: 'Pressão Ar', valor: '6.2 bar', status: 'ok', last: 'agora' },
    { id: 'S008', nome: 'Energia M001', valor: '12.5 kW', status: 'ok', last: 'agora' },
  ];

  const getStatusIcon = (status) => status === 'ok' ? Activity : AlertCircle;
  const getStatusColor = (status) => status === 'ok' ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            142 Sensores Ativos • 99.8% Uptime
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-2">
        {sensores.map(s => {
          const Icon = getStatusIcon(s.status);
          const color = getStatusColor(s.status);
          
          return (
            <Card key={s.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{s.nome}</p>
                      <p className="text-xs text-slate-400">{s.id} • {s.last}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold shrink-0 ${color}`}>{s.valor}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}