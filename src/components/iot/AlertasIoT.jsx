import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Zap, TrendingUp } from 'lucide-react';

export default function AlertasIoT() {
  const alertas = [
    { id: 'A001', maquina: 'M003 - Dobragem', sensor: 'Temperatura', valor: '78°C', limite: '75°C', tipo: 'crítico', deteccao: '5 min atrás' },
    { id: 'A002', maquina: 'M003 - Dobragem', sensor: 'Vibração', valor: '0.8 mm/s', limite: '0.7 mm/s', tipo: 'aviso', deteccao: '3 min atrás' },
    { id: 'A003', maquina: 'M006 - Embalagem', sensor: 'Energia', valor: '0 kW', limite: '5 kW min', tipo: 'crítico', deteccao: '1h atrás' },
    { id: 'A004', maquina: 'M001 - Corte', sensor: 'Lubrificante', valor: '15%', limite: '20% min', tipo: 'aviso', deteccao: '30 min atrás' },
  ];

  const recomendacoes = [
    { id: 'R001', alerta: 'A001', recom: 'Verificar sistema de refrigeração M003 - manutenção preventiva recomendada', prioridade: 'Alta', ia: true },
    { id: 'R002', alerta: 'A003', recom: 'Verificar alimentação elétrica M006 - máquina parada há 1h', prioridade: 'Crítica', ia: true },
  ];

  const getTipoIcon = (tipo) => tipo === 'crítico' ? AlertTriangle : AlertCircle;
  const getTipoCor = (tipo) => tipo === 'crítico' ? 'text-red-400' : 'text-amber-400';
  const getTipoBg = (tipo) => tipo === 'crítico' ? 'bg-red-900/30 border-red-700' : 'bg-amber-900/30 border-amber-700';

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-3">
            <p className="text-xs text-red-400">Críticos</p>
            <p className="text-2xl font-bold text-red-400">2</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-900/20 border-amber-700">
          <CardContent className="p-3">
            <p className="text-xs text-amber-400">Avisos</p>
            <p className="text-2xl font-bold text-amber-400">2</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Previstos (IA)</p>
            <p className="text-2xl font-bold text-blue-400">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Ativos */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase">Alertas Ativos</p>
        {alertas.map(a => {
          const Icon = getTipoIcon(a.tipo);
          const cor = getTipoCor(a.tipo);
          const bg = getTipoBg(a.tipo);
          
          return (
            <Card key={a.id} className={`${bg} border-l-4`}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">{a.maquina}</p>
                      <span className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${cor}`}>
                        {a.tipo.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1">{a.sensor}: <span className={`font-bold ${cor}`}>{a.valor}</span> (limite: {a.limite})</p>
                    <p className="text-xs text-slate-500">{a.deteccao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recomendações IA */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase">Recomendações (IA)</p>
        {recomendacoes.map(r => (
          <Card key={r.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white mb-1">{r.recom}</p>
                  <div className="flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${r.prioridade === 'Crítica' ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'}`}>
                      {r.prioridade}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-900 text-blue-200">IA Preditiva</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}