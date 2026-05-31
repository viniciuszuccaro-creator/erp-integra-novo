/**
 * AutonomousActionExecutor v1.0
 * Executor de ações autônomas da IA
 * Passo 36: IA executa decisões automaticamente com aprovação mínima
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const AUTONOMOUS_ACTIONS = [
  {
    id: 1,
    acao: 'Escalamento automático de recursos AWS',
    status: 'executed',
    timestamp: '14:32:47',
    impacto: 'Latência reduzida de 3.2s → 0.9s',
    economia: 'R$ 2.3k em SLA penalties evitado',
    confianca: 99,
  },
  {
    id: 2,
    acao: 'Gerar OC Emergência para Fornecedor D (7 SKUs)',
    status: 'executed',
    timestamp: '14:28:15',
    impacto: 'Garantiu abastecimento em 24h',
    economia: 'R$ 47k em perda de vendas evitada',
    confianca: 96,
  },
  {
    id: 3,
    acao: 'Ajustar preço produto XYZ -8% (anomalia demanda)',
    status: 'pending_approval',
    timestamp: '14:25:32',
    impacto: 'Recompor conversão estimada',
    economia: 'R$ 180k em potencial revenue',
    confianca: 92,
  },
  {
    id: 4,
    acao: 'Contatar Fornecedor X sobre 140 POs canceladas',
    status: 'executed',
    timestamp: '14:20:00',
    impacto: 'Identificou problema: delay produção',
    economia: 'Evitar ruptura de relacionamento',
    confianca: 94,
  },
];

const STATUS_CONFIG = {
  executed: { icon: CheckCircle2, color: 'bg-green-500/20 text-green-300', label: '✓ Executada' },
  pending_approval: { icon: Clock, color: 'bg-amber-500/20 text-amber-300', label: '⏳ Aguardando Aprovação' },
};

export default function AutonomousActionExecutor({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-orange-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-orange-400 animate-pulse" />
        Executor de Ações Autônomas
      </h2>

      <div className="space-y-3">
        {AUTONOMOUS_ACTIONS.map((action) => {
          const cfg = STATUS_CONFIG[action.status];
          const Icon = cfg.icon;

          return (
            <Card key={action.id} className={`p-4 border rounded-lg ${cfg.color}`}>
              <div className="flex items-start gap-3 mb-2">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{action.acao}</p>
                  <p className="text-xs text-slate-400 mt-1">{action.timestamp}</p>
                </div>
                <Badge className={cfg.color}>{cfg.label}</Badge>
              </div>

              {/* Impact */}
              <div className="grid grid-cols-2 gap-2 text-xs ml-8 mb-2">
                <div className="p-2 bg-white/5 rounded">
                  <span className="text-slate-400">Impacto</span>
                  <p className="text-white font-semibold">{action.impacto}</p>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <span className="text-slate-400">Economia</span>
                  <p className="text-green-400 font-semibold">{action.economia}</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2 ml-8">
                <span className="text-xs text-slate-400">Confiança IA:</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                  <div className="h-full bg-orange-500" style={{ width: `${action.confianca}%` }} />
                </div>
                <span className="text-xs font-bold text-white">{action.confianca}%</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPIs */}
      <Card className="p-4 bg-orange-500/10 border border-orange-400/40 rounded-lg">
        <p className="text-sm font-semibold text-orange-300 mb-2">🤖 Performance de Autonomia</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
          <div>Ações Executadas: <span className="font-bold text-white">3</span></div>
          <div>Valor Gerado: <span className="font-bold text-green-400">R$ 229k</span></div>
          <div>Taxa Sucesso: <span className="font-bold text-green-400">97.1%</span></div>
        </div>
      </Card>
    </div>
  );
}