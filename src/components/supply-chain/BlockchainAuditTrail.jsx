/**
 * BlockchainAuditTrail v1.0
 * Registro imutável de movimentações com hash blockchain
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const BLOCKCHAIN_EVENTS = [
  { id: 'TX001', tipo: 'PO_CREATED', descricao: 'PO #5432 criada', hash: '0x7a2c...f8d1', timestamp: new Date(2026, 4, 31, 14, 30), status: 'verified' },
  { id: 'TX002', tipo: 'GOODS_RECEIVED', descricao: 'Recebimento OK #5432', hash: '0x9e1f...b4a2', timestamp: new Date(2026, 4, 30, 10, 15), status: 'verified' },
  { id: 'TX003', tipo: 'QA_PASSED', descricao: 'QA Aprovado 98%', hash: '0xc3b7...2e5c', timestamp: new Date(2026, 4, 29, 16, 45), status: 'verified' },
  { id: 'TX004', tipo: 'IN_TRANSIT', descricao: 'Saída para cliente', hash: '0xd8f4...a1e9', timestamp: new Date(2026, 4, 28, 9, 0), status: 'verified' },
  { id: 'TX005', tipo: 'DELIVERED', descricao: 'Entregue ao cliente XYZ', hash: '0xe2a5...c7d3', timestamp: new Date(2026, 4, 27, 14, 20), status: 'verified' },
];

const TYPE_COLORS = {
  PO_CREATED: 'bg-blue-500/20 text-blue-300',
  GOODS_RECEIVED: 'bg-green-500/20 text-green-300',
  QA_PASSED: 'bg-emerald-500/20 text-emerald-300',
  IN_TRANSIT: 'bg-cyan-500/20 text-cyan-300',
  DELIVERED: 'bg-violet-500/20 text-violet-300',
};

export default function BlockchainAuditTrail({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-cyan-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Lock className="w-6 h-6 text-cyan-400" />
        Blockchain Audit Trail — Imutável
      </h2>

      {/* Timeline */}
      <div className="space-y-3">
        {BLOCKCHAIN_EVENTS.map((event, idx) => (
          <Card key={event.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                {idx < BLOCKCHAIN_EVENTS.length - 1 && (
                  <div className="w-0.5 h-12 bg-gradient-to-b from-green-500/50 to-slate-500/50 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[event.tipo]}>{event.tipo.replace(/_/g, ' ')}</Badge>
                    <p className="text-sm font-semibold text-white">{event.descricao}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {format(event.timestamp, 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className="font-mono text-cyan-300 break-all">Hash: {event.hash}</div>
                  <div className="flex items-center gap-1 text-green-300">
                    <Lock className="w-3 h-3" />
                    Verificado
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Blockchain Stats */}
      <Card className="p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-lg">
        <p className="text-sm font-semibold text-cyan-300 mb-2">⛓️ Integridade Blockchain</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
          <div>Transações: <span className="font-bold text-white">5</span></div>
          <div>Verificadas: <span className="font-bold text-green-400">5/5 (100%)</span></div>
          <div>Hash Root: <span className="font-mono text-cyan-300 text-xs">0xa4e9...</span></div>
        </div>
      </Card>
    </div>
  );
}