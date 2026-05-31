/**
 * DigitalTwinAlerts v1.0
 * Alertas e eventos do Gêmeo Digital
 * Regra-Mãe: real-time, multi-empresa, RBAC
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const ALERTAS = [
  { nivel: 'critico', zona: 'Manutenção', mensagem: 'CNC-B: vibração 8.9mm/s — máquina parada', hora: '11:50', resolvido: false },
  { nivel: 'alerta', zona: 'Estoque', mensagem: 'SKU-001 abaixo do mínimo — 45 un restantes', hora: '11:42', resolvido: false },
  { nivel: 'info', zona: 'Produção', mensagem: 'Lote #LT-0890 concluído: 500 peças', hora: '11:35', resolvido: true },
  { nivel: 'alerta', zona: 'Expedição', mensagem: 'Romaneio #R-445 aguardando motorista', hora: '11:20', resolvido: false },
  { nivel: 'info', zona: 'Escritório', mensagem: 'Reunião agendada: 14h Sala A', hora: '11:00', resolvido: true },
];

const niveisConfig = {
  critico: { color: 'bg-red-500/10 border-red-500', badge: 'bg-red-500/20 text-red-300', icon: AlertTriangle, iconColor: 'text-red-400' },
  alerta: { color: 'bg-amber-500/10 border-amber-500', badge: 'bg-amber-500/20 text-amber-300', icon: AlertTriangle, iconColor: 'text-amber-400' },
  info: { color: 'bg-blue-500/10 border-blue-500', badge: 'bg-blue-500/20 text-blue-300', icon: Info, iconColor: 'text-blue-400' },
};

export default function DigitalTwinAlerts({ empresa }) {
  const [alertas] = useState(ALERTAS);
  const [filtro, setFiltro] = useState('todos');

  const filtrados = filtro === 'todos' ? alertas : alertas.filter((a) => a.nivel === filtro);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-red-950 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">Alertas Twin — {empresa}</h2>
        <div className="flex gap-2">
          {['todos', 'critico', 'alerta', 'info'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filtro === f ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {filtrados.map((alerta, idx) => {
          const cfg = niveisConfig[alerta.nivel];
          const Icon = cfg.icon;
          return (
            <Card key={idx} className={`p-4 rounded-lg border ${cfg.color}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cfg.badge}>{alerta.nivel.toUpperCase()}</Badge>
                      <span className="text-xs text-slate-400">{alerta.zona}</span>
                    </div>
                    <span className="text-xs text-slate-500">{alerta.hora}</span>
                  </div>
                  <p className="text-sm text-white">{alerta.mensagem}</p>
                  {alerta.resolvido && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Resolvido</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-3">
        {[
          { label: 'Críticos', count: alertas.filter((a) => a.nivel === 'critico' && !a.resolvido).length, color: 'text-red-400' },
          { label: 'Alertas', count: alertas.filter((a) => a.nivel === 'alerta' && !a.resolvido).length, color: 'text-amber-400' },
          { label: 'Info', count: alertas.filter((a) => a.nivel === 'info').length, color: 'text-blue-400' },
        ].map((r) => (
          <Card key={r.label} className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-xs text-slate-400">{r.label}</p>
            <p className={`text-2xl font-bold ${r.color}`}>{r.count}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}