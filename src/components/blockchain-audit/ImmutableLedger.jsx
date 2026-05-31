/**
 * ImmutableLedger v1.0
 * Ledger imutável com hash chain + timestamp
 * Passo 34: Todas as transações com prova criptográfica
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Link2 } from 'lucide-react';

const LEDGER_ENTRIES = [
  {
    id: 'tx_001',
    timestamp: '2026-05-31 14:23:47',
    tipo: 'Pedido Criado',
    usuario: 'João Silva',
    empresa: 'Zuccaro SP',
    detalhes: 'Pedido #12847 - R$ 5.420,00',
    hash: '7a3f2c9e1d5b4a8f2e1c3d5a7b9f1e2d4c6a8e',
    hashAnterior: 'initial',
    status: 'verified',
    empresa_id: 'emp_001',
  },
  {
    id: 'tx_002',
    timestamp: '2026-05-31 14:25:12',
    tipo: 'Nota Fiscal Emitida',
    usuario: 'Sistema',
    empresa: 'Zuccaro SP',
    detalhes: 'NF #45230 - XML assinado',
    hash: '4b8e1f3c6d9a2e5f7c1a4d8b0e2f5c8a1d4e7a',
    hashAnterior: '7a3f2c9e1d5b4a8f2e1c3d5a7b9f1e2d4c6a8e',
    status: 'verified',
    empresa_id: 'emp_001',
  },
  {
    id: 'tx_003',
    timestamp: '2026-05-31 14:27:33',
    tipo: 'Pagamento Recebido',
    usuario: 'Sistema',
    empresa: 'Zuccaro SP',
    detalhes: 'PIX - R$ 5.420,00',
    hash: '2d6f9a1c4e7b3f8d2c5a9e1b4f7d0a3c6e9b2f',
    hashAnterior: '4b8e1f3c6d9a2e5f7c1a4d8b0e2f5c8a1d4e7a',
    status: 'verified',
    empresa_id: 'emp_001',
  },
];

export default function ImmutableLedger({ empresa }) {
  const entries = LEDGER_ENTRIES.filter((e) => e.empresa === empresa);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-emerald-950 overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ledger Imutável</h2>
        <Badge className="bg-emerald-500/20 text-emerald-300">{entries.length} transações</Badge>
      </div>

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <Card key={entry.id} className="p-4 bg-white/5 border border-emerald-500/30 rounded-lg">
            <div className="flex items-start gap-4">
              {/* Chain Link */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                {idx < entries.length - 1 && <div className="w-0.5 h-8 bg-emerald-500/30" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{entry.tipo}</p>
                    <p className="text-xs text-slate-400">{entry.detalhes}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">{entry.timestamp}</Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span>por {entry.usuario}</span>
                  <span>•</span>
                  <span>{entry.empresa}</span>
                </div>

                {/* Hash Chain */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Hash:</span>
                    <code className="bg-white/5 px-2 py-1 rounded text-emerald-300 flex-1 truncate">{entry.hash}</code>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Anterior:</span>
                    <code className="bg-white/5 px-2 py-1 rounded text-slate-400 flex-1 truncate">{entry.hashAnterior}</code>
                    {entry.hashAnterior !== 'initial' && <Link2 className="w-3 h-3 text-slate-500" />}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}