/**
 * ProcessOrchestrator v1.0
 * Orquestrador de processos autônomo em tempo real
 * Passo 36: IA coordena múltiplos fluxos paralelos
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, Clock, Zap } from 'lucide-react';

const ORCHESTRATED_PROCESSES = [
  {
    id: 1,
    nome: 'Ciclo PO → Recebimento → QA → Estoque',
    status: 'executing',
    progresso: 67,
    tempo: '2h 14m',
    transacoes: 47,
    eficiencia: 94,
  },
  {
    id: 2,
    nome: 'Fluxo Pedido → Produção → NF → Entrega',
    status: 'executing',
    progresso: 82,
    tempo: '5h 32m',
    transacoes: 156,
    eficiencia: 98,
  },
  {
    id: 3,
    nome: 'Reconciliação Financeira → DRE → Relatórios',
    status: 'executing',
    progresso: 45,
    tempo: '1h 08m',
    transacoes: 2341,
    eficiencia: 96,
  },
  {
    id: 4,
    nome: 'Revisão de Estoque Crítico + Sugestão Compra',
    status: 'pending',
    progresso: 0,
    tempo: 'Aguardando',
    transacoes: 0,
    eficiencia: 0,
  },
];

export default function ProcessOrchestrator({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-orange-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-orange-400 animate-pulse" />
        Orquestrador de Processos — {empresa}
      </h2>

      <div className="space-y-3">
        {ORCHESTRATED_PROCESSES.map((proc) => (
          <Card key={proc.id} className="p-4 bg-white/5 border border-orange-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{proc.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  {proc.status === 'executing' ? (
                    <Badge className="bg-green-500/20 text-green-300">🔄 Executando</Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-300">⏳ Aguardando</Badge>
                  )}
                  <span className="text-xs text-slate-400">{proc.tempo}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                  style={{ width: `${proc.progresso}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white min-w-[40px]">{proc.progresso}%</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white/5 rounded">
                <span className="text-slate-400">Transações</span>
                <p className="text-orange-300 font-bold">{proc.transacoes}</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <span className="text-slate-400">Eficiência</span>
                <p className="text-green-400 font-bold">{proc.eficiencia}%</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <span className="text-slate-400">Status</span>
                <p className="text-white font-bold">{proc.status === 'executing' ? 'Ativo' : 'Fila'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-orange-500/10 border border-orange-400/40 rounded-lg">
        <p className="text-sm font-semibold text-orange-300 mb-1">⚙️ Orquestração em Tempo Real</p>
        <p className="text-xs text-slate-300">4 processos executados simultaneamente • 2.544 transações processadas • 96% eficiência média</p>
      </Card>
    </div>
  );
}