/**
 * AutonomousActionLog v1.0
 * Log de todas as ações autônomas do sistema
 * Passo 28: Rastreabilidade completa de agentes
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Search } from 'lucide-react';

const ACTION_LOG = [
  { id: 1, agente: 'MaintenanceBot-A', empresa: 'Zuccaro SP', acao: 'Parou CNC-B por vibração crítica', tipo: 'manutenção', status: 'concluído', timestamp: '11:50:23' },
  { id: 2, agente: 'InventoryBot-B', empresa: 'Zuccaro MG', acao: 'Gerou OC #5847 (500 un SKU-001)', tipo: 'estoque', status: 'concluído', timestamp: '11:45:11' },
  { id: 3, agente: 'QualityBot-C', empresa: 'Zuccaro SP', acao: 'Rejeitou lote #L2024 (12 defeituosos)', tipo: 'qualidade', status: 'concluído', timestamp: '11:40:58' },
  { id: 4, agente: 'LogisticsBot-D', empresa: 'Zuccaro Brasil', acao: 'Otimizou rotas SP-MG (−23km)', tipo: 'logística', status: 'concluído', timestamp: '11:35:45' },
  { id: 5, agente: 'SelfHealingBot', empresa: 'Sistema', acao: 'Reiniciou container API (era 0s downtime)', tipo: 'sistema', status: 'concluído', timestamp: '11:30:02' },
  { id: 6, agente: 'InventoryBot-B', empresa: 'Zuccaro MG', acao: 'Transferiu 150 un do CD Principal → Filial MG', tipo: 'estoque', status: 'concluído', timestamp: '11:25:17' },
];

const TIPO_COLORS = {
  manutenção: 'bg-purple-100 text-purple-800',
  estoque: 'bg-blue-100 text-blue-800',
  qualidade: 'bg-green-100 text-green-800',
  logística: 'bg-cyan-100 text-cyan-800',
  sistema: 'bg-slate-100 text-slate-800',
};

export default function AutonomousActionLog() {
  const [busca, setBusca] = useState('');

  const logFiltrado = ACTION_LOG.filter(
    (l) =>
      l.acao.toLowerCase().includes(busca.toLowerCase()) ||
      l.agente.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Zap className="w-6 h-6 text-purple-600" />
        Autonomous Action Log
      </h2>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar ações, agentes..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Log */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {logFiltrado.map((log) => (
          <Card key={log.id} className="p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={TIPO_COLORS[log.tipo]}>{log.tipo}</Badge>
                <p className="font-bold text-slate-900 text-sm">{log.agente}</p>
                <p className="text-xs text-slate-500">{log.empresa}</p>
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</p>
            </div>
            <p className="text-sm text-slate-700">{log.acao}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-600 text-xs">✓</span>
              <span className="text-xs text-slate-500">{log.status}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center text-sm text-purple-800">
        {logFiltrado.length} ações autônomas executadas hoje
      </div>
    </div>
  );
}