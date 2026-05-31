/**
 * MaintenanceScheduleOptimizer v1.0
 * Otimização de cronograma de manutenção com IA
 * Passo 36: Agenda inteligente + minimiza paradas
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

const SCHEDULED_MAINTENANCE = [
  {
    id: 1,
    ativo: 'Compressor-D',
    tipo: 'Emergência',
    data: '2026-06-02',
    duracao: '4h',
    equipe: 'Equipe Emergência',
    prioridade: 'critical',
    custoEstimado: 'R$ 8.500',
    economiaEvitada: 'R$ 120.000 (parada produção)',
  },
  {
    id: 2,
    ativo: 'Bomba-B',
    tipo: 'Preventiva',
    data: '2026-06-08',
    duracao: '6h',
    equipe: 'Equipe Preventiva',
    prioridade: 'warning',
    custoEstimado: 'R$ 3.200',
    economiaEvitada: 'R$ 45.000 (redução eficiência)',
  },
  {
    id: 3,
    ativo: 'CNC-A',
    tipo: 'Preventiva',
    data: '2026-06-15',
    duracao: '2h',
    equipe: 'Equipe CNC',
    prioridade: 'low',
    custoEstimado: 'R$ 1.800',
    economiaEvitada: 'R$ 35.000 (falha não planejada)',
  },
  {
    id: 4,
    ativo: 'Transformador-C',
    tipo: 'Preventiva',
    data: '2026-07-10',
    duracao: '3h',
    equipe: 'Equipe Elétrica',
    prioridade: 'low',
    custoEstimado: 'R$ 2.100',
    economiaEvitada: 'R$ 28.000 (vida útil)',
  },
];

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-500/20 text-red-300', border: 'border-red-500/40' },
  warning: { color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
  low: { color: 'bg-green-500/20 text-green-300', border: 'border-green-500/40' },
};

export default function MaintenanceScheduleOptimizer({ empresa }) {
  const custoTotal = SCHEDULED_MAINTENANCE.reduce((acc, m) => {
    const valor = parseFloat(m.custoEstimado.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
    return acc + valor;
  }, 0);

  const economiaTotal = SCHEDULED_MAINTENANCE.reduce((acc, m) => {
    const valor = parseFloat(m.economiaEvitada.split('(')[0].replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
    return acc + valor;
  }, 0);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-orange-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Calendar className="w-6 h-6 text-orange-400" />
        Cronograma Otimizado
      </h2>

      {/* ROI Card */}
      <Card className="p-5 bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-400/40 rounded-lg">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400">Custo Manutenção</p>
            <p className="text-2xl font-black text-white">R$ {(custoTotal / 1000).toFixed(1)}k</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Economia Evitada</p>
            <p className="text-2xl font-black text-green-400">R$ {(economiaTotal / 1000).toFixed(0)}k</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">ROI</p>
            <p className="text-2xl font-black text-emerald-400">{((economiaTotal / custoTotal) * 100).toFixed(0)}x</p>
          </div>
        </div>
      </Card>

      {/* Schedule */}
      <div className="space-y-3">
        {SCHEDULED_MAINTENANCE.map((maint) => {
          const cfg = PRIORITY_CONFIG[maint.prioridade];
          return (
            <Card key={maint.id} className={`p-4 bg-white/5 border rounded-lg ${cfg.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{maint.ativo}</p>
                  <p className="text-xs text-slate-400">{maint.equipe}</p>
                </div>
                <Badge className={cfg.color}>{maint.tipo}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-slate-400">Data/Duração</p>
                  <p className="text-white font-semibold">{maint.data} • {maint.duracao}</p>
                </div>
                <div className="bg-white/10 p-2 rounded">
                  <p className="text-slate-400">Custo / Economia</p>
                  <p className="text-white font-semibold">{maint.custoEstimado} / {maint.economiaEvitada.split('(')[0].trim()}</p>
                </div>
              </div>

              <button className={`w-full px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                maint.prioridade === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' :
                maint.prioridade === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                'bg-green-600 hover:bg-green-700 text-white'
              }`}>
                ✓ Confirmar Agendamento
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}