import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, AlertCircle } from 'lucide-react';

function useRealtimeData(base, noise = 5, interval = 2000) {
  const [data, setData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      t: `${i * 5}s`,
      v1: base + Math.random() * noise,
      v2: base * 0.85 + Math.random() * noise,
    }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), {
          t: 'agora',
          v1: base + Math.random() * noise,
          v2: base * 0.85 + Math.random() * noise,
        }];
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [base, noise, interval]);
  return data;
}

const anomalias = [
  { area: 'Produção', msg: 'Máquina A: temperatura +8°C acima do normal', sev: 'Alto', t: '2min' },
  { area: 'Logística', msg: 'Rota SP-RJ: trânsito crítico, desvio sugerido', sev: 'Médio', t: '5min' },
  { area: 'Estoque', msg: 'Bitola 10mm: abaixo do estoque mínimo (48kg)', sev: 'Alto', t: '12min' },
  { area: 'Financeiro', msg: 'Inadimplência: 2 títulos vencidos há 5+ dias', sev: 'Médio', t: '18min' },
];

export default function RealtimeOpsMonitor() {
  const prodData = useRealtimeData(87, 6);
  const logData = useRealtimeData(91, 5);

  const sevColor = (s) =>
    s === 'Alto' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200';

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Produção Realtime */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              OEE Produção — Tempo Real
            </CardTitle>
            <Badge className="bg-emerald-900 text-emerald-200 animate-pulse">● LIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" domain={[70, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Area type="monotone" dataKey="v1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="OEE %" />
              <Area type="monotone" dataKey="v2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Meta" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Logística Realtime */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Entregas no Prazo — Tempo Real
            </CardTitle>
            <Badge className="bg-blue-900 text-blue-200 animate-pulse">● LIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" domain={[75, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="v1" stroke="#3b82f6" strokeWidth={2} name="Real %" dot={false} />
              <Line type="monotone" dataKey="v2" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="Meta %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalias Detectadas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            Anomalias Detectadas pela IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {anomalias.map((a, idx) => (
            <div key={idx} className={`p-3 rounded-lg border flex justify-between items-start ${a.sev === 'Alto' ? 'bg-red-900/20 border-red-700' : 'bg-yellow-900/20 border-yellow-700'}`}>
              <div>
                <p className="text-xs font-semibold text-slate-300">{a.area}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.msg}</p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-3">
                <Badge className={sevColor(a.sev)}>{a.sev}</Badge>
                <p className="text-xs text-slate-500">{a.t}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}