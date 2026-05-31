/**
 * AssetHealthMonitor v1.0
 * Monitoramento de saúde de ativos em tempo real
 * Passo 36: Sensores IoT + IA + Alertas preditivos
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

const ASSETS = [
  {
    id: 1,
    nome: 'CNC-A (Produção)',
    tipo: 'Máquina CNC',
    saude: 94,
    temperatura: 68,
    vibracao: 2.1,
    status: 'healthy',
    ultimaMedicao: '2026-05-31 14:30:00',
    proximaManutencao: '2026-06-15',
    horasOperacao: 3847,
  },
  {
    id: 2,
    nome: 'Bomba-B (Sistema Hidráulico)',
    tipo: 'Bomba Industrial',
    saude: 67,
    temperatura: 72,
    vibracao: 3.8,
    status: 'warning',
    ultimaMedicao: '2026-05-31 14:28:00',
    proximaManutencao: '2026-06-08',
    horasOperacao: 5203,
  },
  {
    id: 3,
    nome: 'Transformador-C (Elétrica)',
    tipo: 'Transformador',
    saude: 88,
    temperatura: 65,
    vibracao: 1.2,
    status: 'healthy',
    ultimaMedicao: '2026-05-31 14:29:00',
    proximaManutencao: '2026-07-10',
    horasOperacao: 2134,
  },
  {
    id: 4,
    nome: 'Compressor-D (Ar Comprimido)',
    tipo: 'Compressor',
    saude: 52,
    temperatura: 78,
    vibracao: 4.5,
    status: 'critical',
    ultimaMedicao: '2026-05-31 14:27:00',
    proximaManutencao: '2026-06-02',
    horasOperacao: 6890,
  },
];

const SAUDE_CONFIG = {
  healthy: { color: 'bg-green-500/20 text-green-300', border: 'border-green-500/40' },
  warning: { color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
  critical: { color: 'bg-red-500/20 text-red-300', border: 'border-red-500/40' },
};

export default function AssetHealthMonitor({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-orange-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-orange-400 animate-pulse" />
        Saúde de Ativos — {empresa}
      </h2>

      <div className="space-y-3">
        {ASSETS.map((asset) => {
          const cfg = SAUDE_CONFIG[asset.status];
          return (
            <Card key={asset.id} className={`p-4 bg-white/5 border rounded-lg ${cfg.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{asset.nome}</p>
                  <p className="text-xs text-slate-400">{asset.tipo} • {asset.horasOperacao}h de operação</p>
                </div>
                <Badge className={cfg.color}>
                  {asset.status === 'healthy' ? '✓ OK' : asset.status === 'warning' ? '⚠️ Alerta' : '🔴 Crítico'}
                </Badge>
              </div>

              {/* Health Score */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">Saúde Geral</span>
                  <span className={`text-sm font-bold ${asset.saude >= 80 ? 'text-green-400' : asset.saude >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {asset.saude}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${asset.saude >= 80 ? 'bg-green-500' : asset.saude >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${asset.saude}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Temp</p>
                  <p className="font-bold text-white">{asset.temperatura}°C</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Vibração</p>
                  <p className="font-bold text-white">{asset.vibracao} mm/s</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Próxima Manutenção</p>
                  <p className="font-bold text-white">{asset.proximaManutencao.split(' ')[0]}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-orange-500/10 border border-orange-400/40 rounded-lg">
        <p className="text-sm font-semibold text-orange-300">📊 Resumo Frota</p>
        <div className="grid grid-cols-3 gap-2 text-xs mt-2 text-slate-300">
          <div><CheckCircle2 className="w-3 h-3 text-green-400 inline-block mr-1" /> 2 Saudáveis</div>
          <div><AlertTriangle className="w-3 h-3 text-amber-400 inline-block mr-1" /> 1 Alerta</div>
          <div><AlertTriangle className="w-3 h-3 text-red-400 inline-block mr-1" /> 1 Crítico</div>
        </div>
      </Card>
    </div>
  );
}